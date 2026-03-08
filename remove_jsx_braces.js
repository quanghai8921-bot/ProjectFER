const fs = require('fs');
const path = require('path');

const dirsToClean = [
    path.join(__dirname, 'src', 'app'),
    path.join(__dirname, 'src', 'components'),
    path.join(__dirname, 'src', 'lib'),
    path.join(__dirname, 'src', 'utils'),
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Remove empty JSX comment expressions {} that are often left behind
            const regex = /\{\s*\}/g;
            const newContent = content.replace(regex, '');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Cleaned empty braces from: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirsToClean) {
    processDirectory(dir);
}
