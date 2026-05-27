/**
 * Self-Installing GitHub Pusher for Dreamwed Website
 * Downloads 'isomorphic-git' recursively if missing, stages all files,
 * commits, and pushes the website to the unnikrishnan-dotads repository.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const NODE_MODULES = path.join(__dirname, 'node_modules');
const REPO_URL = 'https://github.com/unnikrishnan-dotads/dreamwed-website.git';

// Helper to fetch JSON or files from npm registry
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

// Memory cache of all resolved package versions to prevent duplicate downloads
const installedPackages = new Map();

async function getPackageInfo(name, range = 'latest') {
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const data = await fetch(url);
  const pkgInfo = JSON.parse(data.toString());
  
  const latestVersion = pkgInfo['dist-tags'].latest;
  if (range === 'latest') return pkgInfo.versions[latestVersion];
  
  // Try to match semver patterns
  const rangeMatch = range.match(/^([\^~]?)([0-9]+)\.?([0-9]*)\.?([0-9]*)/);
  if (rangeMatch) {
    const major = rangeMatch[2];
    const versions = Object.keys(pkgInfo.versions);
    const matching = versions.filter(v => v.startsWith(major + '.'));
    if (matching.length > 0) {
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
  
  const cleanRange = range.replace(/[\^~>=<]/g, '').split(' ')[0] || 'latest';
  return pkgInfo.versions[cleanRange] || pkgInfo.versions[latestVersion];
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

async function installPackageRecursive(name, range = 'latest', depth = 0) {
  if (installedPackages.has(name)) return;
  const indent = '  '.repeat(depth);
  try {
    const info = await getPackageInfo(name, range);
    if (!info) return;
    const version = info.version;
    installedPackages.set(name, version);
    
    const destDir = path.join(NODE_MODULES, name);
    if (!fs.existsSync(path.join(destDir, 'package.json'))) {
      console.log(`${indent}📦 Installing dependency: ${name}@${version}...`);
      const tarball = await fetch(info.dist.tarball);
      fs.mkdirSync(destDir, { recursive: true });
      await extractTarball(tarball, destDir);
    }
    
    const deps = info.dependencies || {};
    for (const [depName, depRange] of Object.entries(deps)) {
      await installPackageRecursive(depName, depRange, depth + 1);
    }
  } catch (err) {
    console.log(`${indent}❌ Failed to install ${name}: ${err.message}`);
  }
}

// Ask question in console
function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function runGitPush(token) {
  console.log('\n🚀 Starting Git operations using isomorphic-git...');
  const git = require('isomorphic-git');
  const http = require('isomorphic-git/http/node');
  
  const dir = __dirname;
  
  // 1. Stage all files
  console.log('📝 Staging all modified files...');
  const repoFiles = await git.listFiles({ fs, dir });
  for (const file of repoFiles) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      await git.add({ fs, dir, filepath: file });
    } else {
      await git.remove({ fs, dir, filepath: file });
    }
  }
  
  // Stage any new files (excluding node_modules or ignored paths)
  const globby = (d) => {
    let results = [];
    const list = fs.readdirSync(d);
    list.forEach(file => {
      const fullPath = path.join(d, file);
      const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');
      if (relPath.startsWith('node_modules') || relPath.startsWith('.git') || relPath.startsWith('dist')) return;
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(globby(fullPath));
      } else {
        results.push(relPath);
      }
    });
    return results;
  };
  
  const allFiles = globby(dir);
  for (const file of allFiles) {
    await git.add({ fs, dir, filepath: file });
  }
  console.log('✅ Staged successfully.');
  
  // 2. Commit
  console.log('💾 Committing changes...');
  const commitId = await git.commit({
    fs,
    dir,
    author: {
      name: 'Dreamwed Bot',
      email: 'dreamwed@bot.local'
    },
    message: 'Configure high-end packages and remove redundant pre-wedding add-ons'
  });
  console.log(`✅ Committed successfully! Commit Hash: ${commitId}`);
  
  // 3. Push
  console.log(`📤 Pushing code to ${REPO_URL}...`);
  await git.push({
    fs,
    http,
    dir,
    url: REPO_URL,
    ref: 'main',
    onAuth: () => ({ username: token }), // GitHub treats PAT as username or password
    force: true // Push to your new repository cleanly
  });
  console.log('\n🎉 SUCCESS! Your website has been pushed successfully to your GitHub repository! 🚀');
}

async function main() {
  console.log('🔍 Checking for required git libraries...');
  if (!fs.existsSync(path.join(NODE_MODULES, 'isomorphic-git'))) {
    console.log('📦 Library "isomorphic-git" is missing. Downloading recursively now...\n');
    await installPackageRecursive('isomorphic-git', 'latest');
    console.log('\n✅ Libraries fully loaded.');
  }
  
  // Get token
  let token = process.env.GITHUB_TOKEN;
  if (!token) {
    token = await askQuestion('\n🔑 Please enter your GitHub Personal Access Token (PAT): ');
    token = token.trim();
  }
  
  if (!token) {
    console.error('❌ Error: GitHub Token is required to push to the repository.');
    process.exit(1);
  }
  
  await runGitPush(token);
}

main().catch(err => {
  console.error('\n❌ Execution Error:', err);
  process.exit(1);
});
