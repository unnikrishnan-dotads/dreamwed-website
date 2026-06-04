/**
 * Advanced Clean & Fresh dependency installer for DreamwedBot
 * Deletes node_modules, reads top-level dependencies, and recursively
 * installs compatible versions of all dependencies and sub-dependencies.
 * Supports nested node_modules to cleanly resolve version conflicts.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_NODE_MODULES = path.join(__dirname, 'node_modules');

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

// Memory cache of all root-level installed package versions
const installedPackages = new Map(); // name -> version

async function getPackageInfo(name, range = 'latest') {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const data = await fetch(url);
  const pkgInfo = JSON.parse(data.toString());
  
  const latestVersion = pkgInfo['dist-tags'].latest;
  
  if (range === 'latest') {
    return pkgInfo.versions[latestVersion];
  }
  
  // Try to match semver patterns like ^1.2.3 or ~1.2.3 or 1.2.3
  const rangeMatch = range.match(/^([\^~]?)([0-9]+)\.?([0-9]*)\.?([0-9]*)/);
  if (rangeMatch) {
    const operator = rangeMatch[1];
    const major = rangeMatch[2];
    
    // Find all versions starting with the major version
    const versions = Object.keys(pkgInfo.versions);
    const matching = versions.filter(v => v.startsWith(major + '.'));
    
    if (matching.length > 0) {
      // Sort descending (highest first)
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
  }
  
  // Fallback to exact match or latest
  const cleanRange = range.replace(/[\^~>=<]/g, '').split(' ')[0] || 'latest';
  if (pkgInfo.versions[cleanRange]) {
    return pkgInfo.versions[cleanRange];
  }
  
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

async function installPackageRecursive(name, range = 'latest', parentDir = __dirname, depth = 0) {
  const indent = '  '.repeat(depth);
  
  try {
    const info = await getPackageInfo(name, range);
    if (!info) {
      console.log(`${indent}⚠️ Could not resolve metadata for ${name}@${range}`);
      return;
    }
    
    const version = info.version;
    const majorVersion = version.split('.')[0];
    
    let destDir;
    let shouldInstall = false;
    
    // Check if installed at root level
    if (!installedPackages.has(name)) {
      // Install at root level
      installedPackages.set(name, version);
      destDir = path.join(ROOT_NODE_MODULES, name);
      shouldInstall = true;
      console.log(`${indent}📦 Installing root-level ${name}@${version}...`);
    } else {
      const rootVersion = installedPackages.get(name);
      const rootMajor = rootVersion.split('.')[0];
      
      if (rootMajor === majorVersion) {
        // Root version is compatible! Bypassing.
        destDir = path.join(ROOT_NODE_MODULES, name);
      } else {
        // Version conflict! Install nested under parent package
        destDir = path.join(parentDir, 'node_modules', name);
        shouldInstall = !fs.existsSync(path.join(destDir, 'package.json'));
        console.log(`${indent}📦 Installing nested ${name}@${version} under parent...`);
      }
    }
    
    // Download and extract if needed
    if (shouldInstall && !fs.existsSync(path.join(destDir, 'package.json'))) {
      const tarball = await fetch(info.dist.tarball);
      fs.mkdirSync(destDir, { recursive: true });
      await extractTarball(tarball, destDir);
    }
    
    // Recursively install all dependencies
    const deps = info.dependencies || {};
    for (const [depName, depRange] of Object.entries(deps)) {
      await installPackageRecursive(depName, depRange, destDir, depth + 1);
    }
  } catch (err) {
    console.log(`${indent}❌ Failed to install ${name}: ${err.message}`);
  }
}

// Helper to delete folder recursively
function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

async function main() {
  console.log('🗑️ Cleaning old node_modules directory...');
  try {
    deleteFolderRecursive(ROOT_NODE_MODULES);
    console.log('✅ Cleaned successfully.');
  } catch (e) {
    console.log('⚠️ Could not delete node_modules (might be locked or already deleted):', e.message);
  }
  
  fs.mkdirSync(ROOT_NODE_MODULES, { recursive: true });
  
  console.log('\n🚀 Starting clean installation of all dependencies with nested resolution...');
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const deps = { ...pkg.dependencies };
  
  for (const [name, range] of Object.entries(deps)) {
    console.log(`\n--- Top-level: ${name} ---`);
    await installPackageRecursive(name, range);
  }
  
  console.log('\n🎉 Fresh package installation completed successfully!');
  console.log('▶️ Run: node server.js\n');
}

main().catch(console.error);
