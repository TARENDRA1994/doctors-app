const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/HealthNuero/g, 'HealthNuero')
            .replace(/healthnuero/g, 'healthnuero')
            .replace(/Healthnuero/g, 'Healthnuero');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (e) {
        // ignore binary files or unreadable files
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.git', '.next', '.gemini', 'package-lock.json'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            const ext = path.extname(fullPath);
            if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sh', '.yml', '.html', '.css', '.prisma'].includes(ext)) {
                replaceInFile(fullPath);
            }
        }
    }
}

walk(__dirname);
console.log('Renaming complete.');
