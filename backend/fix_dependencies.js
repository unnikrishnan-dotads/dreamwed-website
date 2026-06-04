/**
 * Self-healing dependency fixer for DreamwedBot
 * Checks all installed packages, finds any missing sub-dependencies,
 * downloads and extracts them from the npm registry.
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
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
      }
      let data = [];
      res.on('data', c => data.push(c));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getPackageInfo(name, version = 'latest') {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const data = await fetch(url);
  const pkgInfo = JSON.parse(data.toString());
  
  if (version === 'latest') {
    const latestVersion = pkgInfo['dist-tags'].latest;
    return pkgInfo.versions[latestVersion];
  }
  
  // If version is an exact match (e.g. "4.1.1")
  if (pkgInfo.versions[version]) {
    return pkgInfo.versions[version];
  }
  
  // If it's a major version or prefix (like "4" or "6")
  const versions = Object.keys(pkgInfo.versions);
  const matching = versions.filter(v => v.startsWith(version + '.'));
  if (matching.length > 0) {
    // Sort versions to get the highest one
    matching.sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (partsA[i] !== partsB[i]) return partsB[i] - partsA[i];
      }
      return 0;
    });
    return pkgInfo.versions[matching[0]];
  }
  
  // Fallback to latest
  const latestVersion = pkgInfo['dist-tags'].latest;
  return pkgInfo.versions[latestVersion];
}

function extractTarball(buffer, destDir) {
  return new Promise((resolve, reject) => {
    const gunzip = zlib.createGunzip();
    const chunks = [];
    
    gunzip.on('data', chunk => chunks.push(chunk));
    gunzip.on('end', () => {
      const tarData = Buffer.concat(chunks);
      try {
        parseTar(tarData, destDir);
        resolve();
      } catch (err) {
        reject(err);
      }
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

async function downloadAndInstall(name, version = 'latest') {
  console.log(`📦 Downloading missing package: ${name}@${version}...`);
  try {
    const info = await getPackageInfo(name, version);
    const destDir = path.join(NODE_MODULES, name);
    
    const tarball = await fetch(info.dist.tarball);
    fs.mkdirSync(destDir, { recursive: true });
    await extractTarball(tarball, destDir);
    console.log(`   ✅ Successfully installed ${name}@${info.version}`);
    return true;
  } catch (err) {
    console.error(`   ❌ Failed to install ${name}: ${err.message}`);
    return false;
  }
}

async function fixDependencies() {
  console.log('🔍 Scanning node_modules for missing dependencies...');
  
  let newlyInstalledCount = 0;
  
  // Read all folders in node_modules
  const folders = fs.readdirSync(NODE_MODULES);
  
  for (const folder of folders) {
    const folderPath = path.join(NODE_MODULES, folder);
    
    // Skip non-directories or hidden/scoped folders (like @types)
    if (!fs.statSync(folderPath).isDirectory() || folder.startsWith('.')) continue;
    
    const pkgJsonPath = path.join(folderPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      const deps = pkgJson.dependencies || {};
      
      for (const [depName, depVersion] of Object.entries(deps)) {
        const depPath = path.join(NODE_MODULES, depName);
        if (!fs.existsSync(depPath)) {
          const cleanVersion = depVersion.replace(/[\^~>=<]/g, '').split(' ')[0] || 'latest';
          const success = await downloadAndInstall(depName, cleanVersion);
          if (success) {
            newlyInstalledCount++;
          }
        }
      }
    } catch (e) {
      // Ignore reading errors for malformed folders
    }
  }
  
  return newlyInstalledCount;
}

async function main() {
  let loops = 0;
  while (loops < 10) {
    console.log(`\n--- Pass ${loops + 1} ---`);
    const installed = await fixDependencies();
    if (installed === 0) {
      console.log('\n🎉 No more missing dependencies found!');
      break;
    }
    loops++;
  }
  console.log('\n🚀 Done! Running test verification...');
}

main().catch(console.error);
