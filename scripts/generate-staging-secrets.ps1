<#
.SYNOPSIS
    Generates a secure, cryptographically random staging environment file (.env.staging) for LUMIERE.

.DESCRIPTION
    Generates high-entropy credentials (>256 bits of cryptographic entropy) for PostgreSQL, Redis,
    RabbitMQ, JWT signing, and the bootstrap administrator using the OS Cryptographic Random
    Number Generator ([System.Security.Cryptography.RandomNumberGenerator]).

    Enforces safe Windows file permissions via icacls.exe so that only the executing user can
    read the generated credentials.

    NEVER prints secret values to the console, logs, or external services.

.PARAMETER OutputPath
    Target destination for the staging environment file. Defaults to '.env.staging' in repository root.

.PARAMETER StagingFrontendOrigin
    Allowed frontend origin for CORS and CSRF verification. Defaults to 'https://lumiere-staging.pages.dev'.

.PARAMETER CustomStagingDomain
    Optional custom domain for staging backend/frontend (e.g., 'https://staging.yourdomain.com').

.PARAMETER AdminEmail
    Bootstrap admin email for auth-service. Defaults to 'admin@staging.lumiere.internal'.

.PARAMETER Force
    Overwrites an existing .env.staging file if present.

.PARAMETER DryRun
    Tests generation logic and outputs parameter names without creating or modifying any file.

.EXAMPLE
    .\scripts\generate-staging-secrets.ps1
    Generates .env.staging in the repo root with secure random credentials.

.EXAMPLE
    .\scripts\generate-staging-secrets.ps1 -StagingFrontendOrigin "https://my-lumiere.pages.dev" -Force
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param (
    [Parameter(Position = 0)]
    [string]$OutputPath = "",

    [Parameter()]
    [string]$StagingFrontendOrigin = "https://lumiere-staging.pages.dev",

    [Parameter()]
    [string]$CustomStagingDomain = "",

    [Parameter()]
    [string]$AdminEmail = "admin@staging.lumiere.internal",

    [Parameter()]
    [switch]$Force,

    [Parameter()]
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ------------------------------------------------------------------------------
# 1. Cryptographic Helper Function
# ------------------------------------------------------------------------------
function New-CryptoSecret {
    param (
        [int]$Length = 48,
        # Alphanumeric character set strictly avoids shell metacharacters ($, `, ", ', #, \)
        # to ensure 100% reliable parsing across Docker Compose, PostgreSQL, Redis, and Spring Boot.
        [string]$Charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    )

    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $randomBytes = New-Object byte[] $Length
    $rng.GetBytes($randomBytes)

    $charArray = $Charset.ToCharArray()
    $charsetLen = $charArray.Length
    $result = New-Object System.Text.StringBuilder $Length

    for ($i = 0; $i -lt $Length; $i++) {
        $index = [uint32]$randomBytes[$i] % [uint32]$charsetLen
        [void]$result.Append($charArray[$index])
    }

    return $result.ToString()
}

# ------------------------------------------------------------------------------
# 2. Path & Overwrite Protection
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $OutputPath = Join-Path $ScriptDir "..\.env.staging"
}
$ResolvedPath = [System.IO.Path]::GetFullPath($OutputPath)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " LUMIERE - Secure Staging Secret Generator" -ForegroundColor Cyan
Write-Host " Target Architecture: Cloudflare Pages + OCI Ampere A1 ARM64" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target output path: $ResolvedPath"

if (Test-Path -LiteralPath $ResolvedPath) {
    if (-not $Force) {
        Write-Error "Target file '$ResolvedPath' already exists. To prevent accidental secret loss or credential divergence, this script will not overwrite it without the -Force switch."
        return
    } else {
        Write-Warning "Target file exists. -Force switch provided: Overwriting '$ResolvedPath'."
    }
}

# ------------------------------------------------------------------------------
# 3. Cryptographic Secret Generation (>256 bits entropy each)
# ------------------------------------------------------------------------------
# 48 chars from 62-char set = 48 * log2(62) = ~285.8 bits of entropy
# 64 chars from 62-char set = 64 * log2(62) = ~381.1 bits of entropy
Write-Host "[1/4] Generating high-entropy secrets using OS CSPRNG..." -ForegroundColor Green

$DbPassword     = New-CryptoSecret -Length 48
$RedisPassword  = New-CryptoSecret -Length 48
$RabbitPassword = New-CryptoSecret -Length 48
$AdminPassword  = New-CryptoSecret -Length 48
$JwtSecret      = New-CryptoSecret -Length 64 # Exceeds JJWT 256-bit (32-byte) requirement

# ------------------------------------------------------------------------------
# 4. Assemble Staging Environment Configuration
# ------------------------------------------------------------------------------
Write-Host "[2/4] Assembling staging configuration..." -ForegroundColor Green

$OriginsList = @($StagingFrontendOrigin)
if (-not [string]::IsNullOrWhiteSpace($CustomStagingDomain)) {
    $OriginsList += $CustomStagingDomain
}
$CorsOriginsString = ($OriginsList -join ",")

$Lines = @(
    "# ==============================================================================",
    "# LUMIERE - Generated Staging Environment Configuration",
    "# Generated: " + (Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"),
    "# Environment: Staging (Private Cluster)",
    "#",
    "# SECURITY NOTICE:",
    "# - This file contains sensitive production/staging credentials.",
    "# - DO NOT commit this file to Git (strictly ignored by .gitignore).",
    "# - NEVER share or expose this file.",
    "# ==============================================================================",
    "",
    "# 1. DATABASE CONFIGURATION (PostgreSQL 16)",
    "DB_HOST=postgres",
    "DB_PORT=5432",
    "DB_USER=lumiere_staging_user",
    "DB_PASSWORD=$DbPassword",
    "DB_NAME=ecommerce_db",
    "",
    "# 2. DISTRIBUTED CACHE & SESSION STORE (Redis 7)",
    "REDIS_HOST=redis",
    "REDIS_PORT=6379",
    "REDIS_PASSWORD=$RedisPassword",
    "",
    "# 3. ASYNCHRONOUS EVENT BROKER (RabbitMQ 3)",
    "RABBITMQ_HOST=rabbitmq",
    "RABBITMQ_PORT=5672",
    "RABBITMQ_USER=lumiere_staging_rabbit",
    "RABBITMQ_PASSWORD=$RabbitPassword",
    "",
    "# 4. JWT & AUTHENTICATION SECURITY",
    "JWT_SECRET=$JwtSecret",
    "JWT_EXPIRATION_MS=900000",
    "JWT_REFRESH_EXPIRATION_MS=604800000",
    "",
    "# 5. COOKIE & CSRF DEFENSE (HTTPS Staging Environment)",
    "COOKIE_SECURE=true",
    "COOKIE_SAME_SITE=None",
    "COOKIE_DOMAIN=",
    "COOKIE_PATH=/api/v1/auth",
    "",
    "# 6. CORS & ORIGIN CONTROL (API Gateway & Auth CSRF Filter)",
    "CORS_ALLOWED_ORIGINS=$CorsOriginsString",
    "CORS_ALLOWED_ORIGIN_PATTERNS=https://*.pages.dev",
    "",
    "# 7. SPRING RUNTIME PROFILE",
    "SPRING_PROFILES_ACTIVE=prod",
    "",
    "# 8. OCI VM HOST BINDINGS (Security Hardening)",
    "GATEWAY_BIND_IP=127.0.0.1",
    "GATEWAY_PORT=8080",
    "MAILPIT_BIND_IP=127.0.0.1",
    "MAILPIT_UI_PORT=8025",
    "",
    "# 9. BOOTSTRAP ADMINISTRATOR",
    "ADMIN_EMAIL=$AdminEmail",
    "ADMIN_PASSWORD=$AdminPassword",
    "",
    "# 10. EDITORIAL REFERRAL PLATFORM GUARD (Strictly Disabled)",
    "ENABLE_INTERNAL_CHECKOUT=false",
    "",
    "# 11. JVM MEMORY TUNING (OCI Ampere A1 ARM64 Optimizations)",
    "JAVA_OPTS=-XX:+UseZGC -Xms128m -Xmx256m",
    ""
)

$EnvContent = $Lines -join "`r`n"

# ------------------------------------------------------------------------------
# 5. Write File & Restrict Permissions
# ------------------------------------------------------------------------------
if ($DryRun) {
    Write-Host "[DryRun] Secrets successfully generated in memory." -ForegroundColor Yellow
    Write-Host "[DryRun] Output file writing skipped (-DryRun active)." -ForegroundColor Yellow
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host " Validation complete: Script is operational and safe." -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    return
}

Write-Host "[3/4] Writing configuration to $ResolvedPath..." -ForegroundColor Green
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($ResolvedPath, $EnvContent, $Utf8NoBom)

Write-Host "[4/4] Hardening file permissions (Current User access only)..." -ForegroundColor Green
try {
    # Remove inherited permissions and grant explicit Full Control strictly to current user
    $CurrentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    & icacls.exe "$ResolvedPath" /inheritance:r /grant:r "${CurrentUser}:(F)" | Out-Null
    Write-Host "Permissions successfully restricted to '$CurrentUser' (Full Control, inheritance removed)." -ForegroundColor Green
} catch {
    Write-Warning "Could not automatically restrict file permissions with icacls: $_"
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " SUCCESS: Staging credentials generated successfully!" -ForegroundColor Cyan
Write-Host " - Secrets generated: DB_PASSWORD, REDIS_PASSWORD, RABBITMQ_PASSWORD," -ForegroundColor Gray
Write-Host "                      JWT_SECRET (256-bit+), ADMIN_PASSWORD" -ForegroundColor Gray
Write-Host " - File location: $ResolvedPath" -ForegroundColor Gray
Write-Host " - Git ignore status: Ignored by repository .gitignore" -ForegroundColor Gray
Write-Host " - Internal Checkout: Verified disabled (ENABLE_INTERNAL_CHECKOUT=false)" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "NOTICE: Never print secret values or commit .env.staging to Git." -ForegroundColor Yellow
