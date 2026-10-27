import { BRANDS_DATA, ALL_VERIFIED_BRANDS, type Brand } from '../data/brandsData';

const BRAND_REGISTRY = ALL_VERIFIED_BRANDS || BRANDS_DATA;

export type SecurityValidationStatus =
  | 'VERIFIED_OFFICIAL'          // Matches brand's approved official domain via secure HTTPS
  | 'CROSS_BRAND_MISMATCH'       // Matches Brand B when Brand A was expected
  | 'INSECURE_PROTOCOL'          // Uses http: or non-standard insecure protocol
  | 'UNAPPROVED_SUBDOMAIN'       // Subdomain is unapproved or suspicious
  | 'THIRD_PARTY_UNVERIFIED'     // Valid external URL, but not an approved brand portal
  | 'DECEPTIVE_HOSTNAME'         // Hostname attempt mimicking brand (e.g. brand.com.attacker.test)
  | 'MALFORMED_OR_UNSAFE';       // Invalid URL, javascript/data protocol, credentials, or malicious pattern

export interface DomainVerificationResult {
  isValid: boolean;
  isVerifiedOfficial: boolean;
  securityStatus: SecurityValidationStatus;
  badgeLabel: string;
  badgeSeverity: 'success' | 'warning' | 'error' | 'info';
  hostname: string;
  protocol: string;
  matchedBrandName?: string;
  matchedBrandSlug?: string;
  approvedDomain?: string;
  reason?: string;
}

// Approved official e-commerce & regional subdomains commonly used by fashion houses
const PERMITTED_STANDARD_SUBDOMAINS = new Set([
  'www',
  'www2',
  'shop',
  'store',
  'in',
  'en-in',
  'eu',
  'us',
  'uk',
  'fr',
  'couture',
  'boutique',
  'collection',
  'collections',
  'fashion',
  'm',
  'mobile',
  'secure',
  'checkout',
  'buy',
]);

// Suspicious URL redirect query parameters that could leak open redirects
const SUSPICIOUS_REDIRECT_PARAMS = ['redirect', 'redirect_uri', 'url', 'dest', 'destination', 'next', 'r', 'link', 'target'];

/**
 * Validates whether a target URL strictly corresponds to an authentic,
 * approved official brand destination using domain-boundary matching,
 * HTTPS protocol enforcement, and cross-brand verification.
 */
export const verifyBrandDomain = (
  targetUrl: string,
  expectedBrandSlugOrId?: string
): DomainVerificationResult => {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return {
      isValid: false,
      isVerifiedOfficial: false,
      securityStatus: 'MALFORMED_OR_UNSAFE',
      badgeLabel: 'Empty or Invalid Link',
      badgeSeverity: 'error',
      hostname: '',
      protocol: '',
      reason: 'No URL provided',
    };
  }

  // 1. Safe URL Parsing
  let parsedUrl: URL;
  try {
    // Trim and sanitize basic whitespace
    const cleanUrl = targetUrl.trim();
    if (cleanUrl.toLowerCase().startsWith('javascript:') || 
        cleanUrl.toLowerCase().startsWith('data:') || 
        cleanUrl.toLowerCase().startsWith('file:') ||
        cleanUrl.toLowerCase().startsWith('vbscript:')) {
      return {
        isValid: false,
        isVerifiedOfficial: false,
        securityStatus: 'MALFORMED_OR_UNSAFE',
        badgeLabel: 'Dangerous Protocol Blocked',
        badgeSeverity: 'error',
        hostname: '',
        protocol: cleanUrl.split(':')[0] || '',
        reason: 'Execution-capable protocols (javascript, data, file) are strictly prohibited',
      };
    }

    parsedUrl = new URL(cleanUrl);
  } catch {
    return {
      isValid: false,
      isVerifiedOfficial: false,
      securityStatus: 'MALFORMED_OR_UNSAFE',
      badgeLabel: 'Malformed URL',
      badgeSeverity: 'error',
      hostname: '',
      protocol: '',
      reason: 'URL parsing failed due to illegal formatting',
    };
  }

  const protocol = parsedUrl.protocol.toLowerCase();
  const rawHostname = parsedUrl.hostname.toLowerCase();

  // 2. Reject embedded credentials (e.g. https://user:pass@brand.com)
  if (parsedUrl.username || parsedUrl.password) {
    return {
      isValid: false,
      isVerifiedOfficial: false,
      securityStatus: 'MALFORMED_OR_UNSAFE',
      badgeLabel: 'Unsafe Credentials Embedded',
      badgeSeverity: 'error',
      hostname: rawHostname,
      protocol,
      reason: 'Embedded usernames/passwords in URLs are deceptive and disallowed',
    };
  }

  // 3. Protocol Enforcement: Production destinations must use secure HTTPS
  if (protocol !== 'https:') {
    return {
      isValid: false,
      isVerifiedOfficial: false,
      securityStatus: 'INSECURE_PROTOCOL',
      badgeLabel: 'Insecure Connection (HTTP)',
      badgeSeverity: 'warning',
      hostname: rawHostname,
      protocol,
      reason: 'Production brand referrals strictly require secure HTTPS encryption',
    };
  }

  // 4. Inspect query parameters for unverified open redirects
  for (const param of SUSPICIOUS_REDIRECT_PARAMS) {
    const redirectVal = parsedUrl.searchParams.get(param);
    if (redirectVal && (redirectVal.startsWith('http://') || redirectVal.startsWith('https://') || redirectVal.startsWith('//'))) {
      try {
        const destObj = new URL(redirectVal.startsWith('//') ? `https:${redirectVal}` : redirectVal);
        const destHost = destObj.hostname.toLowerCase();
        // If the redirect goes to an external, untrusted domain, flag as unsafe
        if (destHost !== rawHostname && !destHost.endsWith(`.${rawHostname}`)) {
          return {
            isValid: false,
            isVerifiedOfficial: false,
            securityStatus: 'DECEPTIVE_HOSTNAME',
            badgeLabel: 'Unsafe Open Redirect Detected',
            badgeSeverity: 'error',
            hostname: rawHostname,
            protocol,
            reason: `Query parameter "${param}" redirects to unverified destination ${destHost}`,
          };
        }
      } catch {
        // Ignored if not a valid URL
      }
    }
  }

  // 5. Retrieve target brand if expected
  let targetBrand: Brand | undefined;
  if (expectedBrandSlugOrId) {
    const query = expectedBrandSlugOrId.toLowerCase().trim();
    targetBrand = BRAND_REGISTRY.find(
      (b) =>
        b.slug.toLowerCase() === query ||
        b.id.toLowerCase() === query ||
        b.name.toLowerCase() === query
    );
  }

  // Helper: test hostname against a specific brand with strict domain-boundary checks
  const checkBrandDomainMatch = (brand: Brand, host: string): { isMatch: boolean; isSubdomainApproved: boolean } => {
    const approvedList = [
      brand.verifiedDomain.toLowerCase(),
      ...(brand.approvedDomains || []).map((d) => d.toLowerCase()),
    ];

    for (const approved of approvedList) {
      // Exact match
      if (host === approved) {
        return { isMatch: true, isSubdomainApproved: true };
      }

      // Proper boundary check: host must end with .approved
      const suffix = `.${approved}`;
      if (host.endsWith(suffix)) {
        // Extract the subdomain prefix
        const subdomainPrefix = host.substring(0, host.length - suffix.length);
        
        // Disallow deceptive suffix matching (e.g. host is attacker.test.approved.something)
        // Since we checked host.endsWith(suffix), host ends right at the approved domain boundary.
        // Check if the subdomain contains multiple nested dots or unapproved prefixes
        const subParts = subdomainPrefix.split('.');
        const primarySub = subParts[subParts.length - 1];

        // Is it explicitly approved or in our standard e-commerce subdomain list?
        const isSubdomainApproved = 
          PERMITTED_STANDARD_SUBDOMAINS.has(primarySub) ||
          PERMITTED_STANDARD_SUBDOMAINS.has(subdomainPrefix) ||
          Boolean(brand.approvedDomains && brand.approvedDomains.includes(host));

        return { isMatch: true, isSubdomainApproved };
      }
    }

    return { isMatch: false, isSubdomainApproved: false };
  };

  // 6. If an expected brand was requested, test against it
  if (targetBrand) {
    const { isMatch, isSubdomainApproved } = checkBrandDomainMatch(targetBrand, rawHostname);

    if (isMatch) {
      if (!isSubdomainApproved) {
        return {
          isValid: true,
          isVerifiedOfficial: false,
          securityStatus: 'UNAPPROVED_SUBDOMAIN',
          badgeLabel: `Unverified Subdomain (${rawHostname})`,
          badgeSeverity: 'warning',
          hostname: rawHostname,
          protocol,
          matchedBrandName: targetBrand.name,
          matchedBrandSlug: targetBrand.slug,
          approvedDomain: targetBrand.verifiedDomain,
          reason: `Subdomain "${rawHostname}" is not an authorized sales portal for ${targetBrand.name}`,
        };
      }

      return {
        isValid: true,
        isVerifiedOfficial: true,
        securityStatus: 'VERIFIED_OFFICIAL',
        badgeLabel: `Verified Maison (${targetBrand.verifiedDomain})`,
        badgeSeverity: 'success',
        hostname: rawHostname,
        protocol,
        matchedBrandName: targetBrand.name,
        matchedBrandSlug: targetBrand.slug,
        approvedDomain: targetBrand.verifiedDomain,
      };
    }

    // Did the URL match another brand in the directory? (Cross-brand mismatch)
    const otherBrand = BRAND_REGISTRY.find((b) => checkBrandDomainMatch(b, rawHostname).isMatch);
    if (otherBrand) {
      return {
        isValid: true,
        isVerifiedOfficial: false,
        securityStatus: 'CROSS_BRAND_MISMATCH',
        badgeLabel: `Cross-Brand Mismatch (${otherBrand.name})`,
        badgeSeverity: 'error',
        hostname: rawHostname,
        protocol,
        matchedBrandName: otherBrand.name,
        matchedBrandSlug: otherBrand.slug,
        approvedDomain: otherBrand.verifiedDomain,
        reason: `Product belongs to ${targetBrand.name}, but destination directs to ${otherBrand.name}`,
      };
    }

    // Check for deceptive brand substring in external domain (e.g. sabyasachi.com.attacker.test)
    if (rawHostname.includes(targetBrand.verifiedDomain) && !rawHostname.endsWith(`.${targetBrand.verifiedDomain}`) && rawHostname !== targetBrand.verifiedDomain) {
      return {
        isValid: false,
        isVerifiedOfficial: false,
        securityStatus: 'DECEPTIVE_HOSTNAME',
        badgeLabel: 'Deceptive Hostname Suffix',
        badgeSeverity: 'error',
        hostname: rawHostname,
        protocol,
        reason: `Domain ${rawHostname} deceptively incorporates ${targetBrand.verifiedDomain} but does not terminate at its boundary`,
      };
    }

    return {
      isValid: true,
      isVerifiedOfficial: false,
      securityStatus: 'THIRD_PARTY_UNVERIFIED',
      badgeLabel: `External Store (${rawHostname})`,
      badgeSeverity: 'info',
      hostname: rawHostname,
      protocol,
      reason: `Destination does not match verified official domains of ${targetBrand.name}`,
    };
  }

  // 7. General verification across all brands when no specific brand was expected
  for (const brand of BRAND_REGISTRY) {
    const { isMatch, isSubdomainApproved } = checkBrandDomainMatch(brand, rawHostname);
    if (isMatch) {
      if (!isSubdomainApproved) {
        return {
          isValid: true,
          isVerifiedOfficial: false,
          securityStatus: 'UNAPPROVED_SUBDOMAIN',
          badgeLabel: `Unverified Subdomain (${rawHostname})`,
          badgeSeverity: 'warning',
          hostname: rawHostname,
          protocol,
          matchedBrandName: brand.name,
          matchedBrandSlug: brand.slug,
          approvedDomain: brand.verifiedDomain,
          reason: `Subdomain "${rawHostname}" is not an approved portal for ${brand.name}`,
        };
      }

      return {
        isValid: true,
        isVerifiedOfficial: true,
        securityStatus: 'VERIFIED_OFFICIAL',
        badgeLabel: `Verified Maison (${brand.verifiedDomain})`,
        badgeSeverity: 'success',
        hostname: rawHostname,
        protocol,
        matchedBrandName: brand.name,
        matchedBrandSlug: brand.slug,
        approvedDomain: brand.verifiedDomain,
      };
    }
  }

  // 8. Safe external non-brand destination
  return {
    isValid: true,
    isVerifiedOfficial: false,
    securityStatus: 'THIRD_PARTY_UNVERIFIED',
    badgeLabel: `External Domain (${rawHostname})`,
    badgeSeverity: 'info',
    hostname: rawHostname,
    protocol,
  };
};

/**
 * Convenience helper returning safe target/rel attributes for external anchor elements.
 */
export const getSafeExternalLinkAttributes = () => ({
  target: '_blank' as const,
  rel: 'noopener noreferrer' as const,
});
