const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = [
  path.join(root, 'src/data/clothingCatalogData.ts'),
  path.join(root, 'src/data/lifestyleCatalogData.ts'),
  path.join(root, 'src/data/brandsData.ts'),
  path.join(root, 'src/pages/home/HomePage.tsx'),
  path.join(root, 'src/components/editorial/ExpandableLookbookAccordion.tsx'),
  path.join(root, 'src/components/editorial/CuratedOccasionPanels.tsx'),
];

const urlRegex = /https:\/\/[^\s'"`,)]+/g;
const imageMap = new Map();

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0];
    if (url.includes('images.unsplash.com') || url.includes('.jpg') || url.includes('.png') || url.includes('.webp')) {
      const cleanUrl = url.split('?')[0];
      const relPath = path.relative(root, file);
      if (!imageMap.has(cleanUrl)) {
        imageMap.set(cleanUrl, []);
      }
      imageMap.get(cleanUrl).push(relPath);
    }
  }
}

console.log('--- LUMIÈRE IMAGE AUDIT ---');
console.log('Total unique image keys:', imageMap.size);

let duplicates = 0;
for (const [url, locs] of imageMap.entries()) {
  if (locs.length > 1) {
    duplicates++;
    console.log(`DUPLICATE (${locs.length}x): ${url}`);
    locs.forEach(l => console.log(`   - ${l}`));
  }
}
console.log('Total duplicate occurrences:', duplicates);
