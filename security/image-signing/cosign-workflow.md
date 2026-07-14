# Supply Chain Security with Cosign and SBOMs

This document outlines the workflow for securing the software supply chain for the E-Commerce Platform.

## 1. SBOM Generation

We use **CycloneDX** or **Syft** to generate a Software Bill of Materials (SBOM) for each container image during the CI/CD pipeline.

### Command Example (using Syft)
```bash
syft <registry>/<image>:<tag> -o cyclonedx-json=sbom.json
```

## 2. Container Image Signing

We use **Cosign** (part of the Sigstore project) to sign container images before pushing them to the production registry.

### Keyless Signing (Recommended for OIDC-enabled CI like GitHub Actions)
```bash
cosign sign --yes <registry>/<image>:<tag>
```

### Key-based Signing (Alternative)
Generate a keypair:
```bash
cosign generate-key-pair
```
Sign the image:
```bash
cosign sign --key cosign.key <registry>/<image>:<tag>
```

## 3. Attaching SBOM to Image
```bash
cosign attach sbom --sbom sbom.json <registry>/<image>:<tag>
```

## 4. Verification

Before deploying to the Kubernetes cluster, a policy engine (like Kyverno or OPA Gatekeeper) or an admission controller must verify the signature.

### Manual Verification
```bash
cosign verify --key cosign.pub <registry>/<image>:<tag>
```

## 5. CI/CD Integration

1. **Build**: Docker builds the image.
2. **Scan**: Trivy scans the image for vulnerabilities.
3. **SBOM**: Syft generates the SBOM.
4. **Sign**: Cosign signs the image and attaches the SBOM.
5. **Push**: Image, signature, and SBOM are pushed to the registry.
6. **Deploy**: Kubernetes Admission Controller verifies the signature before allowing the Pod to start.
