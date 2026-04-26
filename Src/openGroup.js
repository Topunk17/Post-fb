const { exec } = require('child_process');
const fs = require('fs');

const url = process.argv[2];
const caption = fs.readFileSync('./data/caption.txt', 'utf-8');

// copy caption (Termux)
exec(`echo "${caption}" | termux-clipboard-set`);

// buka browser
exec(`termux-open-url "${url}"`);
