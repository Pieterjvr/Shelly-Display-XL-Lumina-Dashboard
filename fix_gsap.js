const fs = require('fs');
let code = fs.readFileSync('scripts/lumina-card.js', 'utf8');

const regex = /const ensureLuminaGoogleFontsInDocument_ = \(\) => \{[\s\S]*?\} catch \(e\) \{ \/\* ignore \*\/ \}\r?\n\};/;
const newFonts = `const ensureLuminaGoogleFontsInDocument_ = () => { /* Disabled for offline mode */ };`;

code = code.replace(regex, newFonts);

fs.writeFileSync('scripts/lumina-card.js', code);
