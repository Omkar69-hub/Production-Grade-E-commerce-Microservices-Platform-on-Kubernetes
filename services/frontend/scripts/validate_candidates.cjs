const https = require('https');

const candidates = [
  // Men's gymwear candidates
  'photo-1581009146145-b5ef050c2e1e', // Nike compression top
  'photo-1534438327276-14e5300c3a48', // stringer / gym
  'photo-1583454110551-21f2fa2afe61', // muscular athlete training
  'photo-1567013127542-490d757e51fc', // male activewear training
  'photo-1571019614242-c5c5dee9f50b', // male athletic outdoor
  'photo-1526506118085-60ce8714f8c5', // male gym workout
  'photo-1549476464-37392f717541', // male running track
  'photo-1574680096145-d05b474e2155', // male cardio tee
  'photo-1584863265045-f9d10ca7fa61', // male workout runner
  'photo-1517838277536-f5f99be501cd', // female leggings
  'photo-1518611012118-696072aa579a', // female yoga / sports bra
  'photo-1506126613408-eca07ce68773', // female athletic stretch
  'photo-1571731956672-f2b94d7dd0cb', // female gym set
  'photo-1518310383802-640c2de311b2', // female runner
  'photo-1574680178050-55c6a6a96e0a', // female studio workout
  'photo-1540420773420-3366772f4999', // healthy athletic food/workout
  'photo-1541534741688-6078c6bfb5c5', // gym equipment
  
  // Streetwear candidates
  'photo-1509967419530-da38b4704bc6', // urban portrait
  'photo-1523398002811-999ca8dec234', // vintage jacket
  'photo-1552374196-1ab2a1c593e8', // sneakers / joggers
  'photo-1503342217505-b0a15ec3261c', // graphic t-shirt
  'photo-1556905055-8f358a7a47b2', // fleece hoodie
  'photo-1596755094514-f87e34085b2c', // cuban collar shirt
  'photo-1512436991641-6745cdb1723f', // streetwear coat
  'photo-1496747611176-843222e1e57c', // streetwear woman
  'photo-1506794778202-cad84cf45f1d', // streetwear portrait man
  'photo-1483985988355-763728e1935b', // shopping fashion
  'photo-1485968579580-b6d095142e6e', // trench streetwear

  // Casualwear candidates
  'photo-1521572267360-ee0c2909d518', // basic white tee
  'photo-1489987707025-afc232f7ea0f', // twill overshirt
  'photo-1541099649105-f69ad21f3246', // denim jeans
  'photo-1602810318383-e386cc2a3ccf', // dobby casual shirt
  'photo-1576995853123-5a10305d93c0', // casual denim jacket
  'photo-1479064555552-3ef4979f8908', // casual fashion flatlay

  // Ethnicwear candidates
  'photo-1609357605129-26f69add5d6e', // dabu kurta
  'photo-1617627143750-d86bc21e42bb', // fusion kurti
  'photo-1610030469983-98e550d6193c', // handloom saree
  'photo-1583391733956-3750e0ff4e8b', // pichhwai silk
  'photo-1507679799987-c73779587ccf', // sherwani / bandhgala
  'photo-1566737236500-c8ac43014a67', // bridal lehenga / gown
  
  // Editorial Lookbook & Hero candidates
  'photo-1539109136881-3be0616acf4b', // haute outerwear
  'photo-1509631179647-0177331693ae', // campaign hero
  'photo-1515886657613-9f3515b0c78f', // femme couture
  'photo-1594938298603-c8148c4dae35', // sartorial suiting
  'photo-1544441893-675973e31985', // enfant heritage
  'photo-1503919545889-aef636e10ad4', // boys suit
  'photo-1519689680058-324335c77eba', // baby romper
  'photo-1522771930-78848d9293e8', // toddler set
  'photo-1490481651871-ab68de25d43d', // summer resort linen
  'photo-1529139574466-a303027c1d8b', // gala velvet evening
  'photo-1469334031218-e382a71b716b', // haute couture drape
];

function checkId(id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=600`;
    https.get(url, { method: 'HEAD' }, (res) => {
      resolve({ id, status: res.statusCode });
    }).on('error', (err) => resolve({ id, status: err.message }));
  });
}

(async () => {
  const results = await Promise.all(candidates.map(checkId));
  const valid = results.filter(r => r.status === 200);
  const invalid = results.filter(r => r.status !== 200);
  console.log(`Validated ${valid.length}/${results.length} images.`);
  if (invalid.length) {
    console.log('Invalid IDs:', invalid);
  }
  console.log('Valid IDs:', valid.map(v => v.id));
})();
