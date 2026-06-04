const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading live JS bundle...');
  try {
    await download('https://dreamwedstories.co.in/assets/index-kmhyJ7_I.js', 'live_bundle.js');
    console.log('Downloaded successfully! Searching for routes and keywords...');
    const content = fs.readFileSync('live_bundle.js', 'utf8');
    
    // Search for Route paths
    const routeRegex = /path:"([^"]+)"/g;
    let match;
    const routes = new Set();
    while ((match = routeRegex.exec(content)) !== null) {
      routes.add(match[1]);
    }
    console.log('Found routes in live bundle:', Array.from(routes));

    // Search for any customized text or links in package details
    const keywords = ['9999', 'offer', 'package', 'pre-wedding', 'prewedding', 'milestone', 'payment', 'booking', 'admin', 'client'];
    keywords.forEach(word => {
      const idx = content.indexOf(word);
      if (idx !== -1) {
        console.log(`Keyword "${word}" found at index ${idx}!`);
        // print snippet around index
        const snippet = content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200));
        console.log(`  Snippet: ${snippet.trim().replace(/\s+/g, ' ')}\n`);
      }
    });

  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main();
