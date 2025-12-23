const fs = require('fs');
const content = fs.readFileSync('debug-output-utf8.txt', 'utf8');
const lines = content.split('\n');

console.log("WORKING MODELS:");
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('[Gen: true]')) {
        // Look for the model name in the line or the previous line
        if (lines[i].includes('- models/')) {
            console.log(lines[i].trim());
        } else if (i > 0 && lines[i - 1].includes('- models/')) {
            console.log(lines[i - 1].trim() + " " + lines[i].trim());
        }
    }
}
