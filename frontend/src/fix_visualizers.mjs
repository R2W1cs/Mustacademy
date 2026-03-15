import fs from 'fs';

const files = [
    'c:/Users/rayen/cs-roadmap-platform/frontend/src/components/MethodologyVisualizer.jsx',
    'c:/Users/rayen/cs-roadmap-platform/frontend/src/components/UMLDiagramVisualizer.jsx'
];

files.forEach(f => {
    let s = fs.readFileSync(f, 'utf8');
    s = s.replace(/\\`/g, '`');
    s = s.replace(/\\\$/g, '$');
    fs.writeFileSync(f, s);
    console.log('Fixed ' + f);
});
