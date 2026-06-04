const fs = require('fs');

const bundle = fs.readFileSync('live_bundle.js', 'utf8');

// Let's find all occurrences of prices (e.g. ₹ or Rs. or numbers like 99999, 110000, 150000, 180000, 9999)
const prices = bundle.match(/₹\d{1,3}(?:,\d{3})*/g) || [];
console.log('Prices found in live bundle:', [...new Set(prices)]);

// Let's check for any new sections like "wedding gallery" or "pricing" or "features"
const navLinksMatch = bundle.match(/path:"\/[^"]+"/g);
console.log('Nav Links found:', navLinksMatch ? [...new Set(navLinksMatch)] : 'None');

// Let's print out all snippets matching packages
const pkgKeywords = ['Silver', 'Gold', 'Platinum', 'Elite', 'Candid', 'Traditional'];
pkgKeywords.forEach(key => {
  let idx = 0;
  while ((idx = bundle.indexOf(key, idx)) !== -1) {
    const snippet = bundle.substring(Math.max(0, idx - 50), Math.min(bundle.length, idx + 150));
    console.log(`Keyword "${key}" snippet:`, snippet.trim().replace(/\s+/g, ' '));
    idx += key.length;
    break; // only print first occurrence for briefness
  }
});
