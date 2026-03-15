import fs from 'fs';

let p = 'c:/Users/rayen/cs-roadmap-platform/frontend/src/components/UMLDiagramChallenge.jsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(p, s);
console.log('Fixed Challenge Syntax');
