const fs = require('fs');
const path = require('path');

const filesToClean = [
    path.join(__dirname, 'src/app/admin/layout.tsx'),
    path.join(__dirname, 'src/app/admin/page.tsx'),
    path.join(__dirname, 'src/app/page.tsx'),
    path.join(__dirname, 'src/components/layout/navbar.tsx'),
    path.join(__dirname, 'src/components/shared/ReviewDialog.tsx'),
];

function removeComments(content) {
    // 1. Remove JSX comments block like {/* ... */}
    let str = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');

    // 2. Remove standard multi-line comments
    str = str.replace(/\/\*[\s\S]*?\*\//g, '');

    // 3. Remove inline comments not preceded by a colon
    str = str.replace(/(?<!:)\/\/.*$/gm, '');

    return str;
}

for (const fullPath of filesToClean) {
    if (fs.existsSync(fullPath)) {
        const originalContent = fs.readFileSync(fullPath, 'utf8');
        const cleanedContent = removeComments(originalContent);

        if (originalContent !== cleanedContent) {
            fs.writeFileSync(fullPath, cleanedContent, 'utf8');
            console.log(`Cleaned safely: ${fullPath}`);
        }
    }
}
