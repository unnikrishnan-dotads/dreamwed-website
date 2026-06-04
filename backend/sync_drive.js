const fs = require('fs');
const path = require('path');
const https = require('https');

const DB_PATH = path.join(__dirname, 'dreamwed_bot_db.json');

function fetchDrivePage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log("🔄 Starting live Google Drive photo synchronization...");
  const driveUrl = "https://drive.google.com/drive/folders/19mUd9IudALVI6Sa41Q2htmXkfJm0uSU4?usp=sharing";
  
  try {
    const html = await fetchDrivePage(driveUrl);
    
    // Extract IDs in JSON arrays
    const idSet = new Set();
    const regex = /"([a-zA-Z0-9_-]{33})"/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      // Google Drive file IDs are typically 33 characters starting with '1' or '0' or 'A'
      if (id.startsWith('1') && !id.includes("closure") && !id.includes("google") && !id.includes("Roboto")) {
        idSet.add(id);
      }
    }

    const driveFolderId = "19mUd9IudALVI6Sa41Q2htmXkfJm0uSU4";
    idSet.delete(driveFolderId); // Remove the folder ID itself

    const fileIds = Array.from(idSet);
    console.log(`Parsed ${fileIds.length} file IDs from Google Drive folder:`);
    console.log(fileIds);

    if (fileIds.length === 0) {
      console.log("⚠️ No file IDs parsed from Google Drive folder. Using default mock list.");
      return;
    }

    // Load Database JSON
    if (!fs.existsSync(DB_PATH)) {
      console.log("DB not found at:", DB_PATH);
      return;
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    // Construct gallery_images list from parsed file IDs
    const newImages = fileIds.map((id, index) => {
      return {
        id: index + 1,
        // Highly stable Google Drive thumbnail server URL with high quality w1000
        url: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
        favorited: false,
        categories: [],
        comment: ""
      };
    });

    console.log(`Syncing ${newImages.length} real Google Drive images into projects...`);

    // Update Project ID 1, 2, and 3 gallery_images
    db.projects.forEach(project => {
      project.gallery_images = newImages;
      project.deliveries = project.deliveries || {};
      project.deliveries.raw_photos_url = driveUrl;
    });

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log("✅ Database successfully updated with real Google Drive live images!");

  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  }
}

run();
