const fs = require('fs');

const content = fs.readFileSync('src/pages/Services.jsx', 'utf8');

// Let's find package structures or arrays (usually starts with packagesInfo or packages)
const idx = content.indexOf('packages = [');
if (idx !== -1) {
  console.log('Found packages array locally in Services.jsx:');
  console.log(content.substring(idx, idx + 1000).trim().replace(/\s+/g, ' '));
} else {
  console.log('Could not find packages array in Services.jsx. Let us search for prices.');
  const prices = content.match(/₹\d{1,3}(?:,\d{3})*/g) || [];
  console.log('Local prices in Services.jsx:', [...new Set(prices)]);
}
