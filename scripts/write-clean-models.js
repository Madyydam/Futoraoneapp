const fs = require('fs');
try {
    const content = fs.readFileSync('debug-output-utf8.txt', 'utf8');
    const regex = /- models\/([^\s]+) \[Gen: true\]/g;
    let match;
    let models = [];
    while ((match = regex.exec(content)) !== null) {
        models.push(match[1]);
    }
    fs.writeFileSync('clean-models.txt', models.join('\n'));
    console.log("Written " + models.length + " models.");
} catch (e) {
    console.log(e.message);
}
