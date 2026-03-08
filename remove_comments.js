const fs = require('fs');
const path = require('path');

const dirsToClean = [
    path.join(__dirname, 'src', 'app'),
    path.join(__dirname, 'src', 'components'),
    path.join(__dirname, 'src', 'lib'),
    path.join(__dirname, 'src', 'utils'),
];

// Regex explanations:
// 1. \/\*[\s\S]*?\*\/ : Matches /* ... */ block comments
// 2. (?<!https?:|["'\`])\/\/.* : Matches // comments, avoiding http://, https://, and strings that end right before //
function removeComments(content) {
    // It's tricky with regex to perfectly avoid strings. 
    // We'll use a slightly safer regex for // that tries to ensure it's not inside a URL or a string.
    // Replace /* ... */
    let str = content.replace(/\/\*[\s\S]*?\*\//g, '');

    // Replace // ... but not http:// or https://
    // Regex: Match // not preceded by a colon. 
    // This is a common heuristic since Next.js JSX URLs often have 'https://'.
    str = str.replace(/(?<!:)\/\/.*$/gm, '');

    return str;
}

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const originalContent = fs.readFileSync(fullPath, 'utf8');
            const cleanedContent = removeComments(originalContent);

            if (originalContent !== cleanedContent) {
                // Format it slightly to remove empty lines left by comment removal
                const lines = cleanedContent.split('\n');
                const noEmptyLines = lines.filter(line => line.trim().length > 0 || line === '\r');
                fs.writeFileSync(fullPath, cleanedContent, 'utf8');
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    }
}

for (const dir of dirsToClean) {
    console.log(`Processing directory: ${dir}`);
    processDirectory(dir);
}
console.log('Finished cleaning comments.');
