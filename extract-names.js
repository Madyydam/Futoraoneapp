const fs = require('fs');

try {
    const content = fs.readFileSync('list-models-output.txt', 'utf8');
    const jsonStart = content.indexOf('{');
    if (jsonStart === -1) {
        console.log("No JSON found in file.");
        process.exit(1);
    }
    const jsonStr = content.substring(jsonStart);
    const data = JSON.parse(jsonStr);
    if (data.models) {
        console.log("Found Models:");
        data.models.forEach(m => console.log(m.name));
    } else {
        console.log("No models found in output.");
    }
} catch (e) {
    console.log("Error parsing output:", e.message);
    console.log("Partial content:", fs.readFileSync('list-models-output.txt', 'utf8').substring(0, 100));
}
