const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const dirs = ['app', 'lib', 'components'];
dirs.forEach(d => {
  const fullDir = path.join(__dirname, '..', d);
  if (fs.existsSync(fullDir)) {
    const files = walk(fullDir);
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('@/app/api/auth/[...nextauth]/route')) {
        console.log('Fixing:', file);
        content = content.replace(/['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"]/g, "'@/lib/auth'");
        fs.writeFileSync(file, content, 'utf8');
      }
    });
  }
});
console.log('Done fixing auth imports.');
