const fs = require('fs');

const files = [
    'c:/Users/rayen/cs-roadmap-platform/frontend/src/components/MethodologyVisualizer.jsx',
    'c:/Users/rayen/cs-roadmap-platform/frontend/src/components/UMLDiagramVisualizer.jsx'
];

files.forEach(f => {
    let s = fs.readFileSync(f, 'utf8');
    // Replace all literal backslashes followed by backtick with just backtick
    s = s.replace(/\\`/g, '`');
    // Replace all literal backslashes followed by dollar sign with just dollar sign
    s = s.replace(/\\\$/g, '$');
    fs.writeFileSync(f, s);
    console.log('Fixed ' + f);
});
