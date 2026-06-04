const https = require('https');

const paths = [
  '/', '/about', '/services', '/blog', '/contact', '/offer', 
  '/my-booking', '/admin', '/portfolio', '/gallery', '/pricing', 
  '/checkout', '/invoice', '/booking-confirmation'
];

function checkPath(path) {
  return new Promise((resolve) => {
    https.get('https://dreamwedstories.co.in' + path, (res) => {
      resolve({ path, status: res.statusCode });
    }).on('error', () => {
      resolve({ path, status: 'ERROR' });
    });
  });
}

async function main() {
  console.log('Probing live website paths...');
  const results = await Promise.all(paths.map(checkPath));
  results.forEach(r => {
    console.log(`Path ${r.path}: ${r.status}`);
  });
}

main();
