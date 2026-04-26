const { exec } = require('child_process');
const clipboardy = require('clipboardy');
const fs = require('fs');

const url = process.argv[2];
const caption = fs.readFileSync('./data/caption.txt', 'utf-8');

// copy caption
clipboardy.writeSync(caption);

// buka browser via termux
exec(`termux-open-url "${url}"`);
