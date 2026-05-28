const fs = require('fs');
const content = fs.readFileSync('src/pages/TrivandrumOffer.jsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('fetch(') || line.includes('API_') || line.includes('localhost:') || line.includes('lhr.life')) {
    console.log(`${idx + 1}: ${line.trim().substring(0, 120)}`);
  }
});
