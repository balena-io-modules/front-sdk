const fs = require('fs');
const content = fs.readFileSync(process.argv[2]).toString();
const object = JSON.parse(content);
const output = JSON.stringify(object);
const encoded = Buffer.from(output).toString('base64');
console.log(encoded);
