const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'dreamwed_bot_db.json');
if (!fs.existsSync(dbPath)) {
  console.error("Database not found!");
  process.exit(1);
}

try {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let count = 0;

  if (db.projects) {
    db.projects.forEach(project => {
      if (project.gallery_images) {
        project.gallery_images.forEach(img => {
          if (img.url && img.url.includes("lh3.googleusercontent.com/d/")) {
            const match = img.url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
              img.url = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
              count++;
            }
          }
        });
      }
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ Successfully migrated ${count} Google Drive image URLs in dreamwed_bot_db.json!`);
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
}
