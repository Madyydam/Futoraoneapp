const fs = require('fs');
const content = fs.readFileSync('debug-output.txt', 'utf8');

const matches = content.matchAll(/- models\/([^\s]+) \[Gen: true\]/g);
console.log("WORKING GENERATIVE MODELS:");
for (const match of matches) {
    console.log(match[1]);
}
