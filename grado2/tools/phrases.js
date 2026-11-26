// Junta todas las frases que la app puede decir en voz alta → tools/phrases.json
const GEN = require('./load.js'); const fs = require('fs');
const set = new Set(GEN.allPhrases());
let s = '2026-08-01'; while (s <= '2027-08-31') { const t = GEN.tipoDia(s); if (t.nombre) set.add(t.nombre.trim()); s = GEN.addDays(s, 1); }
const arr = [...set].filter(Boolean).sort();
fs.writeFileSync(__dirname + '/phrases.json', JSON.stringify(arr, null, 0));
console.log(arr.length, 'frases;', arr.reduce((a, x) => a + x.length, 0), 'caracteres');
