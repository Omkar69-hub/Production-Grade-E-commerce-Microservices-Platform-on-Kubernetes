import { BRANDS_DATA } from '../src/data/brandsData';
import { CLOTHING_CATALOG } from '../src/data/clothingCatalogData';
import { verifyBrandDomain } from '../src/utils/domainVerifier';

async function probeUrl(url: string, timeoutMs = 3500): Promise<{ reachable: boolean; status?: number; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);
    return { reachable: res.status < 500, status: res.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { reachable: false, error: err.name === 'AbortError' ? 'TIMEOUT' : (err.message || 'NET_ERR') };
  }
}

async function runAudit() {
  console.log('=== LUMIÈRE STAGE 4 BRAND & CATALOG DATASET AUDIT ===\n');

  let brandsVerifiedDomain = 0;
  let brandsDomainMismatch = 0;
  let brandsInsecure = 0;
  let brandsReachable = 0;
  let brandsBlockedOrTimeout = 0;

  console.log('--- 1. AUDITING 58 BRANDS DIRECTORY ---');
  for (const brand of BRANDS_DATA) {
    const check = verifyBrandDomain(brand.website, brand.slug);
    if (check.isVerifiedOfficial) {
      brandsVerifiedDomain++;
    } else if (check.securityStatus === 'INSECURE_PROTOCOL') {
      brandsInsecure++;
    } else {
      brandsDomainMismatch++;
    }
  }

  console.log(`Brands Verified Official Domain Config: ${brandsVerifiedDomain} / ${BRANDS_DATA.length}`);
  console.log(`Brands Insecure Protocol: ${brandsInsecure}`);
  console.log(`Brands Domain Mismatch/Other: ${brandsDomainMismatch}`);

  console.log('\n--- 2. PROBING SAMPLE BRAND WEBSITES (Network Reachability Check) ---');
  const sampleBrands = BRANDS_DATA.slice(0, 15);
  for (const b of sampleBrands) {
    const probe = await probeUrl(b.website);
    const reachableLabel = probe.reachable ? `HTTP ${probe.status} (Reachable)` : `Blocked/Inaccessible (${probe.error || probe.status})`;
    console.log(`  [${b.origin}] ${b.name.padEnd(25)} -> ${b.website.padEnd(35)} | ${reachableLabel}`);
    if (probe.reachable) brandsReachable++;
    else brandsBlockedOrTimeout++;
  }

  console.log('\n--- 3. AUDITING CLOTHING CATALOG (14 ITEMS) ---');
  let productsVerifiedOfficial = 0;
  let productsCategoryDestinations = 0;
  let productsExactPages = 0;
  let productsVerifiedPrice = 0;
  let productsPriceInquiry = 0;

  for (const item of CLOTHING_CATALOG) {
    const check = verifyBrandDomain(item.destinationUrl, item.brandSlug);
    if (check.isVerifiedOfficial) productsVerifiedOfficial++;

    if (item.destinationType === 'OFFICIAL_CATEGORY_DESTINATION') productsCategoryDestinations++;
    if (item.destinationType === 'EXACT_PRODUCT_PAGE') productsExactPages++;

    if (item.priceVerificationStatus === 'VERIFIED_ATELIER_PRICE') productsVerifiedPrice++;
    else if (item.priceVerificationStatus === 'PRICE_UPON_INQUIRY') productsPriceInquiry++;

    console.log(`  [${item.brandName}] ${item.name.padEnd(30)} | INR ${item.priceINR ? '₹' + item.priceINR.toLocaleString('en-IN') : 'Inquiry'} | Dest: ${item.destinationType} | Domain: ${check.securityStatus}`);
  }

  console.log(`\nCatalog Destination Breakdown:`);
  console.log(`  Total Products: ${CLOTHING_CATALOG.length}`);
  console.log(`  Verified Official Destinations: ${productsVerifiedOfficial} / ${CLOTHING_CATALOG.length}`);
  console.log(`  Exact Product Pages: ${productsExactPages}`);
  console.log(`  Official Category/Search Destinations: ${productsCategoryDestinations}`);
  console.log(`  Verified Atelier INR Prices: ${productsVerifiedPrice}`);
  console.log(`  Price Upon Inquiry: ${productsPriceInquiry}`);
  console.log(`\nAudit completed successfully.`);
}

runAudit();
