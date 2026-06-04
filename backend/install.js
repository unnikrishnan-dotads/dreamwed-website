/**
 * Direct npm package installer using Node.js built-ins only
 * Downloads packages from registry.npmjs.org and extracts them
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const NODE_MODULES = path.join(__dirname, 'node_modules');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json' } }, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = [];
      res.on('data', c => data.push(c));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getPackageInfo(name, version = 'latest') {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`;
  const data = await fetch(url);
  return JSON.parse(data.toString());
}

function extractTarball(buffer, destDir) {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    const chunks = [];
    
    gunzip.on('data', chunk => chunks.push(chunk));
    gunzip.on('end', () => {
      const tarData = Buffer.concat(chunks);
      parseTar(tarData, destDir);
      resolve();
    });
    gunzip.on('error', reject);
    
    gunzip.write(buffer);
    gunzip.end();
  });
}

function parseTar(buffer, destDir) {
  let offset = 0;
  while (offset < buffer.length - 512) {
    const header = buffer.slice(offset, offset + 512);
    const name = header.slice(0, 100).toString('utf8').replace(/\0/g, '');
    if (!name) break;
    
    const sizeStr = header.slice(124, 136).toString('utf8').replace(/\0/g, '').trim();
    const size = parseInt(sizeStr, 8) || 0;
    const typeFlag = header.slice(156, 157).toString();
    
    offset += 512;
    
    // Strip "package/" prefix
    const cleanName = name.replace(/^package\//, '');
    const fullPath = path.join(destDir, cleanName);
    
    if (typeFlag === '5' || name.endsWith('/')) {
      fs.mkdirSync(fullPath, { recursive: true });
    } else if (typeFlag === '0' || typeFlag === '' || typeFlag === '\0') {
      const dir = path.dirname(fullPath);
      fs.mkdirSync(dir, { recursive: true });
      if (size > 0) {
        fs.writeFileSync(fullPath, buffer.slice(offset, offset + size));
      }
    }
    
    offset += Math.ceil(size / 512) * 512;
  }
}

const installed = new Set();

async function installPackage(name, version = 'latest', depth = 0) {
  const key = `${name}@${version}`;
  if (installed.has(name)) return;
  installed.add(name);
  
  const indent = '  '.repeat(depth);
  process.stdout.write(`${indent}📦 Installing ${name}...`);
  
  try {
    const info = await getPackageInfo(name, version);
    const destDir = path.join(NODE_MODULES, name.includes('/') ? name : name);
    
    if (fs.existsSync(path.join(destDir, 'package.json'))) {
      console.log(` (already installed)`);
      return;
    }
    
    const tarball = await fetch(info.dist.tarball);
    fs.mkdirSync(destDir, { recursive: true });
    await extractTarball(tarball, destDir);
    console.log(` ✅ ${info.version}`);
    
    // Install dependencies
    const deps = info.dependencies || {};
    for (const [depName, depVersion] of Object.entries(deps)) {
      const cleanVersion = depVersion.replace(/[\^~>=<]/g, '').split(' ')[0] || 'latest';
      await installPackage(depName, cleanVersion, depth + 1);
    }
  } catch (err) {
    console.log(` ❌ Error: ${err.message}`);
  }
}

async function main() {
  console.log('🚀 Dreamwed Bot — Installing packages...\n');
  fs.mkdirSync(NODE_MODULES, { recursive: true });
  
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const deps = { ...pkg.dependencies };
  
  // Install one by one
  for (const [name, version] of Object.entries(deps)) {
    const cleanVersion = version.replace(/[\^~>=<]/g, '').split(' ')[0] || 'latest';
    await installPackage(name, cleanVersion);
  }
  
  console.log('\n✅ All packages installed!');
  console.log('▶️  Run: node server.js\n');
}

main().catch(console.error);
