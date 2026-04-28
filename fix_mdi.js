const fs = require('fs');
let css = fs.readFileSync('styles/materialdesignicons.min.css', 'utf8');
css = css.replace(/url\("\.\.\/fonts\//g, 'url("fonts/');
fs.writeFileSync('styles/materialdesignicons.min.css', css);
