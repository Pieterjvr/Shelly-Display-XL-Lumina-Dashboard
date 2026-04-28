const fs = require('fs');
const https = require('https');

const cssPath = 'styles/fonts/inter.css';
let css = fs.readFileSync(cssPath, 'utf8');

const regex = /url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g;
let match;
const downloads = [];

while ((match = regex.exec(css)) !== null) {
  const url = match[1];
  const filename = url.split('/').pop();
  css = css.replace(url, filename);
  downloads.push({ url, filename });
}

fs.writeFileSync('styles/fonts/inter.css', css);

let pending = downloads.length;
downloads.forEach(dl => {
  const file = fs.createWriteStream('styles/fonts/' + dl.filename);
  https.get(dl.url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      pending--;
      if (pending === 0) console.log('All downloads finished');
    });
  });
});
