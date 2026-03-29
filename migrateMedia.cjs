const fs = require('fs');

function migrateFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/imageUrl:\s*('[^']+'|`[^`]+`|"[^"]+"),/g, (match, url) => {
    return 'media: [{ id: "m_" + Math.random().toString(36).substr(2, 9), url: ' + url + ', type: "image", format: "portrait" }],';
  });
  fs.writeFileSync(file, content);
}

migrateFile('src/data/mockData.ts');
migrateFile('src/data/vilaCariocaPosts.ts');
console.log('Migrated mock data');
