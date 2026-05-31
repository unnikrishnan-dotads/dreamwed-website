const fs = require('fs');

const content = fs.readFileSync('src/pages/Services.jsx', 'utf8');

const idx = content.indexOf('const packages = [');
if (idx !== -1) {
  const endIdx = content.indexOf('];', idx);
  console.log(content.substring(idx, endIdx + 2));
} else {
  console.log('Not found');
}
