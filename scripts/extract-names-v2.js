const fs = require('fs');

try {
    const content = fs.readFileSync('list-models-output.txt', 'utf8');
    const regex = /"name":\s*"models\/([^"]+)"/g;
    let match;
    console.log("Found Models:");
    while ((match = regex.exec(content)) !== null) {
        console.log(match[1]);
    }
} catch (e) {
    console.log("Error reading output:", e.message);
}
