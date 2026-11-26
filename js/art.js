/* Ilustraciones SVG (de Mundo de Habilidades, reutilizadas en Mi Día en el Kínder) SVG (todas dibujadas en código, sin recursos externos) */
(function () {
  'use strict';
  const D = '#2D3436';
  const starPts = (cx, cy, R, r, n = 5) => {
    const p = [];
    for (let i = 0; i < n * 2; i++) {
      const a = Math.PI / n * i - Math.PI / 2, rr = i % 2 ? r : R;
      p.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
    }
    return p.join(' ');
  };
  const heartPath = 'M50 88 C 18 66, 6 44, 20 26 C 32 12, 48 20, 50 32 C 52 20, 68 12, 80 26 C 94 44, 82 66, 50 88Z';
  const svg = (vb, body, cls = '') => `<svg viewBox="${vb}" class="art ${cls}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  function owl(mood = 'normal', acc = '') {
    const wings = mood === 'cheer'
      ? '<ellipse cx="18" cy="56" rx="10" ry="24" fill="#8B5E3C" transform="rotate(-40 18 56)"/><ellipse cx="102" cy="56" rx="10" ry="24" fill="#8B5E3C" transform="rotate(40 102 56)"/>'
      : '<ellipse cx="22" cy="82" rx="10" ry="24" fill="#8B5E3C" transform="rotate(12 22 82)"/><ellipse cx="98" cy="82" rx="10" ry="24" fill="#8B5E3C" transform="rotate(-12 98 82)"/>';
    let eyes;
    if (mood === 'happy' || mood === 'cheer') {
      eyes = `<path d="M36 55 q8 -11 16 0" stroke="${D}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M68 55 q8 -11 16 0" stroke="${D}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    } else {
      const dy = mood === 'think' ? -5 : 1, dx = mood === 'think' ? 3 : 1;
      eyes = `<circle cx="${44 + dx}" cy="${53 + dy}" r="7.5" fill="${D}"/><circle cx="${76 + dx}" cy="${53 + dy}" r="7.5" fill="${D}"/><circle cx="${47 + dx}" cy="${50 + dy}" r="2.6" fill="#fff"/><circle cx="${79 + dx}" cy="${50 + dy}" r="2.6" fill="#fff"/>`;
    }
    const mouth = mood === 'cheer' ? '<path d="M53 64 L67 64 L60 78 Z" fill="#FF9F43"/><path d="M55 70 L65 70 L60 76Z" fill="#E1663A"/>' : '<path d="M54 64 L66 64 L60 74 Z" fill="#FF9F43"/>';
    let extra = '';
    if (acc === 'cap') extra = `<path d="M28 24 L60 11 L92 24 L60 37 Z" fill="${D}"/><path d="M46 31 v9 q14 6 28 0 v-9" fill="${D}"/><path d="M90 24 v15" stroke="#FFC312" stroke-width="3"/><circle cx="90" cy="41" r="3.5" fill="#FFC312"/>`;
    if (acc === 'egg') extra = '<path d="M20 104 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l10 9 V128 H20 Z" fill="#FFFDF6" stroke="#E7DCC8" stroke-width="2"/>';
    return svg('0 0 120 130', `
      <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
      <path d="M30 40 L22 12 L46 30 Z" fill="#8B5E3C"/><path d="M90 40 L98 12 L74 30 Z" fill="#8B5E3C"/>
      ${wings}
      <ellipse cx="60" cy="74" rx="40" ry="48" fill="#A9743F"/>
      <ellipse cx="60" cy="90" rx="26" ry="30" fill="#F6D7A7"/>
      <path d="M48 84 q4 4 8 0 M62 84 q4 4 8 0 M55 96 q4 4 8 0 M48 108 q4 4 8 0 M62 108 q4 4 8 0" stroke="#DDB27C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="53" r="17" fill="#fff" stroke="#F6D7A7" stroke-width="4"/><circle cx="76" cy="53" r="17" fill="#fff" stroke="#F6D7A7" stroke-width="4"/>
      ${eyes}${mouth}
      <circle cx="31" cy="70" r="5" fill="#FF8A80" opacity=".55"/><circle cx="89" cy="70" r="5" fill="#FF8A80" opacity=".55"/>
      <ellipse cx="48" cy="121" rx="8" ry="4" fill="#FF9F43"/><ellipse cx="72" cy="121" rx="8" ry="4" fill="#FF9F43"/>
      ${extra}`, 'owl owl-' + mood);
  }

  function face(e) {
    const fills = { feliz: '#FFD93D', triste: '#FFE57F', enojado: '#FF8A65', miedo: '#D6ECFA', sorprendido: '#FFD93D', cansado: '#FFE9A8' };
    const M = '#5D4037';
    const st = `stroke="${M}" stroke-width="5" fill="none" stroke-linecap="round"`;
    const eyes = (r = 5) => `<ellipse cx="35" cy="42" rx="${r}" ry="${r + 2}" fill="${M}"/><ellipse cx="65" cy="42" rx="${r}" ry="${r + 2}" fill="${M}"/>`;
    const parts = {
      feliz: eyes() + `<path d="M28 60 q22 26 44 0" ${st}/><circle cx="24" cy="58" r="6" fill="#FF8A80" opacity=".5"/><circle cx="76" cy="58" r="6" fill="#FF8A80" opacity=".5"/>`,
      triste: eyes() + `<path d="M24 30 l14 -6 M76 30 l-14 -6" ${st}/><path d="M32 74 q18 -16 36 0" ${st}/><path d="M66 50 q-6 10 0 14 q6 -4 0 -14z" fill="#4FC3F7"/>`,
      enojado: eyes() + `<path d="M24 26 l18 10 M76 26 l-18 10" ${st}/><path d="M32 72 q18 -12 36 0" ${st}/>`,
      miedo: `<circle cx="35" cy="42" r="10" fill="#fff" stroke="${M}" stroke-width="2"/><circle cx="65" cy="42" r="10" fill="#fff" stroke="${M}" stroke-width="2"/><circle cx="35" cy="44" r="4" fill="${M}"/><circle cx="65" cy="44" r="4" fill="${M}"/><path d="M24 24 q10 -6 18 0 M58 24 q10 -6 18 0" ${st}/><path d="M30 72 q5 -7 10 0 q5 7 10 0 q5 -7 10 0 q5 7 10 0" ${st}/>`,
      sorprendido: `<circle cx="35" cy="42" r="6" fill="${M}"/><circle cx="65" cy="42" r="6" fill="${M}"/><path d="M24 26 q10 -9 20 0 M56 26 q10 -9 20 0" ${st}/><ellipse cx="50" cy="70" rx="9" ry="12" fill="${M}"/>`,
      cansado: `<path d="M27 44 q8 6 16 0 M57 44 q8 6 16 0" ${st}/><ellipse cx="50" cy="70" rx="7" ry="5" fill="${M}"/><text x="72" y="24" font-size="18" font-weight="900" fill="#6C5CE7" font-family="sans-serif">z</text><text x="84" y="12" font-size="12" font-weight="900" fill="#6C5CE7" font-family="sans-serif">z</text>`,
    };
    return svg('0 0 100 100', `<circle cx="50" cy="52" r="44" fill="${fills[e]}" stroke="rgba(0,0,0,.12)" stroke-width="3"/>${parts[e]}`, 'face');
  }

  function obj(name, color) {
    const b = {
      manzana: `<path d="M50 30 C 20 16, 4 58, 28 84 C 38 96, 46 90, 50 88 C 54 90, 62 96, 72 84 C 96 58, 80 16, 50 30Z" fill="${color || '#FF5A5F'}"/><path d="M50 30 q2 -12 8 -18" stroke="#6D4C41" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M56 20 q14 -12 24 -2 q-12 10 -24 2z" fill="#20BF6B"/><ellipse cx="34" cy="46" rx="6" ry="10" fill="#fff" opacity=".35"/>`,
      estrella: `<polygon points="${starPts(50, 54, 44, 19)}" fill="${color || '#FFC312'}" stroke="rgba(0,0,0,.12)" stroke-width="3" stroke-linejoin="round"/>`,
      pez: `<path d="M70 50 L96 30 L92 50 L96 70Z" fill="#0984E3"/><ellipse cx="44" cy="50" rx="34" ry="22" fill="${color || '#4FC3F7'}"/><path d="M40 30 q10 -12 22 -2" fill="#0984E3"/><circle cx="24" cy="46" r="5" fill="#fff"/><circle cx="23" cy="46" r="2.6" fill="${D}"/><path d="M44 40 q6 10 0 20 M54 40 q6 10 0 20" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`,
      flor: `<path d="M50 56 V96" stroke="#20BF6B" stroke-width="6"/><path d="M50 82 q-16 -10 -22 2 q12 6 22 -2z" fill="#20BF6B"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="22" rx="12" ry="18" fill="${color || '#E84393'}" transform="rotate(${a} 50 42)"/>`).join('')}<circle cx="50" cy="42" r="12" fill="#FFC312"/>`,
      pelota: `<circle cx="50" cy="52" r="42" fill="${color || '#2E86DE'}"/><path d="M8 52 h84" stroke="#fff" stroke-width="8"/><path d="M50 10 q-26 42 0 84" stroke="#FFC312" stroke-width="8" fill="none"/><ellipse cx="34" cy="32" rx="8" ry="5" fill="#fff" opacity=".4"/>`,
      corazon: `<path d="${heartPath}" fill="${color || '#FF4D6D'}"/><ellipse cx="32" cy="36" rx="6" ry="9" fill="#fff" opacity=".35" transform="rotate(-30 32 36)"/>`,
    };
    return svg('0 0 100 100', b[name], 'obj');
  }

  function shape(kind, color, rot = 0) {
    const s = 'stroke="rgba(0,0,0,.15)" stroke-width="3" stroke-linejoin="round"';
    const b = {
      'círculo': `<circle cx="50" cy="50" r="40" fill="${color}" ${s}/>`,
      'cuadrado': `<rect x="12" y="12" width="76" height="76" rx="6" fill="${color}" ${s}/>`,
      'triángulo': `<polygon points="50,10 92,86 8,86" fill="${color}" ${s}/>`,
      'estrella': `<polygon points="${starPts(50, 53, 44, 19)}" fill="${color}" ${s}/>`,
      'corazón': `<path d="${heartPath}" fill="${color}" ${s}/>`,
      'óvalo': `<ellipse cx="50" cy="50" rx="44" ry="30" fill="${color}" ${s}/>`,
      'rombo': `<polygon points="50,6 92,50 50,94 8,50" fill="${color}" ${s}/>`,
      'rectángulo': `<rect x="4" y="26" width="92" height="48" rx="6" fill="${color}" ${s}/>`,
    };
    return svg('0 0 100 100', `<g transform="rotate(${rot} 50 50)">${b[kind]}</g>`, 'shape');
  }

  function animal(n) {
    const eye = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${D}"/><circle cx="${x + 1.6}" cy="${y - 1.8}" r="${r / 2.8}" fill="#fff"/>`;
    const b = {
      gato: `<polygon points="18,40 24,8 44,26" fill="#F39C12"/><polygon points="82,40 76,8 56,26" fill="#F39C12"/><circle cx="50" cy="56" r="38" fill="#FFB74D"/>${eye(36, 52)}${eye(64, 52)}<path d="M46 64 h8 l-4 5z" fill="#FF6F91"/><path d="M50 69 q-6 8 -12 2 M50 69 q6 8 12 2" stroke="${D}" stroke-width="3" fill="none"/><path d="M16 62 h18 M16 70 h18 M66 62 h18 M66 70 h18" stroke="${D}" stroke-width="2"/>`,
      perro: `<circle cx="50" cy="54" r="36" fill="#BCAAA4"/><ellipse cx="16" cy="50" rx="11" ry="24" fill="#6D4C41"/><ellipse cx="84" cy="50" rx="11" ry="24" fill="#6D4C41"/>${eye(38, 48)}${eye(62, 48)}<ellipse cx="50" cy="68" rx="16" ry="12" fill="#EFEBE9"/><ellipse cx="50" cy="62" rx="7" ry="5" fill="${D}"/><path d="M46 76 q4 10 8 0z" fill="#FF6F91"/>`,
      rana: `<circle cx="32" cy="30" r="14" fill="#4CAF50"/><circle cx="68" cy="30" r="14" fill="#4CAF50"/><ellipse cx="50" cy="60" rx="44" ry="32" fill="#66BB6A"/><circle cx="32" cy="30" r="9" fill="#fff"/><circle cx="68" cy="30" r="9" fill="#fff"/>${eye(32, 31, 4.5)}${eye(68, 31, 4.5)}<path d="M24 64 q26 20 52 0" stroke="#1B5E20" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="22" cy="58" r="5" fill="#FF8A80" opacity=".6"/><circle cx="78" cy="58" r="5" fill="#FF8A80" opacity=".6"/>`,
      oso: `<circle cx="20" cy="24" r="14" fill="#8D6E63"/><circle cx="80" cy="24" r="14" fill="#8D6E63"/><circle cx="20" cy="24" r="7" fill="#D7CCC8"/><circle cx="80" cy="24" r="7" fill="#D7CCC8"/><circle cx="50" cy="56" r="38" fill="#8D6E63"/>${eye(36, 48)}${eye(64, 48)}<ellipse cx="50" cy="70" rx="17" ry="13" fill="#D7CCC8"/><ellipse cx="50" cy="64" rx="7" ry="5" fill="${D}"/><path d="M50 69 v6 M44 77 q6 4 12 0" stroke="${D}" stroke-width="3" fill="none"/>`,
      cerdito: `<polygon points="18,34 22,8 42,24" fill="#F48FB1"/><polygon points="82,34 78,8 58,24" fill="#F48FB1"/><circle cx="50" cy="56" r="38" fill="#F8BBD0"/>${eye(34, 46)}${eye(66, 46)}<ellipse cx="50" cy="66" rx="16" ry="11" fill="#F48FB1"/><ellipse cx="44" cy="66" rx="3" ry="5" fill="#AD1457"/><ellipse cx="56" cy="66" rx="3" ry="5" fill="#AD1457"/>`,
      'león': `${Array.from({ length: 12 }, (_, i) => `<circle cx="${(50 + 38 * Math.cos(i * Math.PI / 6)).toFixed(1)}" cy="${(54 + 38 * Math.sin(i * Math.PI / 6)).toFixed(1)}" r="13" fill="#E67E22"/>`).join('')}<circle cx="50" cy="54" r="32" fill="#FFD180"/>${eye(38, 48)}${eye(62, 48)}<path d="M44 60 h12 l-6 7z" fill="#6D4C41"/><path d="M50 67 q-6 7 -11 2 M50 67 q6 7 11 2" stroke="${D}" stroke-width="3" fill="none"/>`,
      pollito: `<path d="M50 14 q-6 -10 0 -10 q6 0 0 10z" fill="#FBC02D"/><circle cx="50" cy="54" r="38" fill="#FFEB3B"/>${eye(38, 48)}${eye(62, 48)}<polygon points="42,60 58,60 50,72" fill="#FF9800"/><circle cx="28" cy="62" r="5" fill="#FF8A80" opacity=".6"/><circle cx="72" cy="62" r="5" fill="#FF8A80" opacity=".6"/>`,
      conejo: `<ellipse cx="34" cy="20" rx="9" ry="22" fill="#ECEFF1"/><ellipse cx="66" cy="20" rx="9" ry="22" fill="#ECEFF1"/><ellipse cx="34" cy="20" rx="4" ry="15" fill="#F8BBD0"/><ellipse cx="66" cy="20" rx="4" ry="15" fill="#F8BBD0"/><circle cx="50" cy="60" r="34" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="2"/>${eye(38, 54)}${eye(62, 54)}<ellipse cx="50" cy="66" rx="5" ry="4" fill="#F06292"/><path d="M50 70 q-6 7 -11 2 M50 70 q6 7 11 2" stroke="${D}" stroke-width="3" fill="none"/>`,
    };
    return svg('0 0 100 100', b[n], 'animal');
  }

  function balloon(color = '#FF5A5F') {
    return svg('0 0 100 150', `<path d="M50 104 q-9 12 0 22 q9 9 0 22" stroke="#636E72" stroke-width="2.5" fill="none"/><path d="M50 6 C 18 6, 8 40, 17 62 C 26 86, 42 98, 50 100 C 58 98, 74 86, 83 62 C 92 40, 82 6, 50 6Z" fill="${color}"/><path d="M45 100 L55 100 L50 107Z" fill="${color}"/><ellipse cx="34" cy="32" rx="8" ry="15" fill="#fff" opacity=".35" transform="rotate(20 34 32)"/>`, 'balloon');
  }

  function turtle() {
    return svg('0 0 100 100', `<ellipse cx="50" cy="82" rx="38" ry="5" fill="rgba(0,0,0,.12)"/><circle cx="84" cy="58" r="11" fill="#7BC67E"/><circle cx="87" cy="55" r="2.5" fill="${D}"/><ellipse cx="24" cy="76" rx="8" ry="6" fill="#7BC67E"/><ellipse cx="70" cy="76" rx="8" ry="6" fill="#7BC67E"/><path d="M12 70 Q 14 26 48 24 Q 80 26 80 70 Z" fill="#2E8B57"/><path d="M30 68 L36 44 L60 44 L66 68 M36 44 L48 30 L60 44" stroke="#A5D6A7" stroke-width="3" fill="none"/><rect x="10" y="66" width="72" height="7" rx="3" fill="#1E6B43"/>`, 'turtle');
  }

  const icon = {
    home: '<svg viewBox="0 0 24 24" class="ico"><path d="M3 11 L12 3 L21 11 V21 H14 V15 H10 V21 H3Z" fill="currentColor"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" class="ico"><path d="M3 9 H7 L12 5 V19 L7 15 H3Z" fill="currentColor"/><path d="M15.5 8.5 q3 3.5 0 7 M18 6 q5 6 0 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" class="ico"><rect x="5" y="10" width="14" height="11" rx="2" fill="currentColor"/><path d="M8 10 V7 a4 4 0 0 1 8 0 V10" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>',
    star: `<svg viewBox="0 0 100 100" class="ico star-ico"><polygon points="${starPts(50, 54, 46, 20)}" fill="#FFC312" stroke="#E1A400" stroke-width="5" stroke-linejoin="round"/></svg>`,
    back: '<svg viewBox="0 0 24 24" class="ico"><path d="M15 4 L7 12 L15 20" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trophy: svg('0 0 100 100', '<path d="M30 14 H70 V40 a20 20 0 0 1 -40 0Z" fill="#FFC312"/><path d="M30 20 H16 q0 22 18 24 M70 20 H84 q0 22 -18 24" stroke="#FFC312" stroke-width="6" fill="none"/><rect x="44" y="58" width="12" height="16" fill="#E1A400"/><rect x="30" y="74" width="40" height="12" rx="3" fill="#8B5E3C"/><polygon points="' + starPts(50, 36, 12, 5) + '" fill="#fff" opacity=".8"/>', 'trophy'),
  };

  const gameIcon = {
    globo: () => balloon('#FF5A5F'),
    calma: () => turtle(),
    emociones: () => face('feliz'),
    formas: () => svg('0 0 100 100', '<circle cx="30" cy="34" r="20" fill="#FF5A5F"/><rect x="54" y="16" width="36" height="36" rx="5" fill="#2E86DE"/><polygon points="50,52 78,92 22,92" fill="#FFC312"/>'),
    contar: () => svg('0 0 100 100', '<text x="50" y="66" text-anchor="middle" font-size="44" font-weight="900" font-family="system-ui,sans-serif"><tspan fill="#FF5A5F">1</tspan><tspan fill="#20BF6B">2</tspan><tspan fill="#2E86DE">3</tspan></text>'),
    memoria: () => svg('0 0 100 100', '<rect x="10" y="20" width="40" height="56" rx="8" fill="#8854D0" transform="rotate(-10 30 48)"/><rect x="48" y="22" width="40" height="56" rx="8" fill="#fff" stroke="#8854D0" stroke-width="4" transform="rotate(8 68 50)"/><text x="68" y="60" text-anchor="middle" font-size="26" font-weight="900" fill="#8854D0" font-family="sans-serif" transform="rotate(8 68 50)">?</text>'),
    secuencias: () => svg('0 0 100 100', '<circle cx="18" cy="50" r="12" fill="#FF5A5F"/><rect x="38" y="38" width="24" height="24" rx="4" fill="#2E86DE"/><circle cx="82" cy="50" r="12" fill="#FF5A5F"/><path d="M20 80 q30 14 60 0" stroke="#8B5E3C" stroke-width="4" fill="none" stroke-dasharray="5 5"/>'),
    atencion: () => svg('0 0 100 100', '<circle cx="42" cy="42" r="26" fill="#D6ECFA" stroke="#2D3436" stroke-width="8"/><path d="M62 62 L88 88" stroke="#2D3436" stroke-width="12" stroke-linecap="round"/><ellipse cx="34" cy="34" rx="6" ry="9" fill="#fff"/>'),
    letras: () => svg('0 0 100 100', '<text x="50" y="68" text-anchor="middle" font-size="52" font-weight="900" font-family="system-ui,sans-serif"><tspan fill="#E84393">A</tspan><tspan fill="#0984E3">a</tspan></text>'),
    sumas: () => svg('0 0 100 100', '<circle cx="50" cy="50" r="40" fill="#20BF6B"/><path d="M30 38 h16 M38 30 v16 M56 62 h16" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'),
    reto: () => icon.trophy,
  };

  function charEyes(mood, lx, ly, rx, ry, r = 6.5) {
    if (mood === 'happy' || mood === 'cheer') {
      return `<path d="M${lx - 8} ${ly} q8 -10 16 0" stroke="${D}" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="M${rx - 8} ${ry} q8 -10 16 0" stroke="${D}" stroke-width="4.2" fill="none" stroke-linecap="round"/>`;
    }
    const dy = mood === 'think' ? -5 : 0, dx = mood === 'think' ? 3 : 0;
    return `<circle cx="${lx + dx}" cy="${ly + dy}" r="${r}" fill="${D}"/><circle cx="${rx + dx}" cy="${ry + dy}" r="${r}" fill="${D}"/><circle cx="${lx + 2.2 + dx}" cy="${ly - 2 + dy}" r="${r * 0.35}" fill="#fff"/><circle cx="${rx + 2.2 + dx}" cy="${ry - 2 + dy}" r="${r * 0.35}" fill="#fff"/>`;
  }
  function charAcc(acc) {
    if (acc === 'cap') return `<path d="M28 18 L60 4 L92 18 L60 30 Z" fill="${D}"/><path d="M46 24 v8 q14 5 28 0 v-8" fill="${D}"/><path d="M90 18 v14" stroke="#FFC312" stroke-width="3"/><circle cx="90" cy="34" r="3.5" fill="#FFC312"/>`;
    if (acc === 'egg') return '<path d="M20 104 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l9 9 l9 -9 l10 9 V128 H20 Z" fill="#FFFDF6" stroke="#E7DCC8" stroke-width="2"/>';
    return '';
  }
  /* Leo: niño de cabello rizado, playera azul, sonrisa amplia */
  function boy(mood = 'normal', acc = '') {
    const mouth = mood === 'cheer'
      ? `<path d="M48 78 q12 14 24 0" fill="#C0392B"/><path d="M52 80 q8 8 16 0" fill="#fff"/>`
      : mood === 'think' ? `<path d="M54 84 q8 2 16 -4" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
      : `<path d="M52 80 q10 10 20 0" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const arms = mood === 'cheer'
      ? `<ellipse cx="22" cy="96" rx="9" ry="16" fill="#F1C27D" transform="rotate(-40 22 96)"/><ellipse cx="98" cy="96" rx="9" ry="16" fill="#F1C27D" transform="rotate(40 98 96)"/>`
      : `<ellipse cx="24" cy="112" rx="9" ry="14" fill="#F1C27D"/><ellipse cx="96" cy="112" rx="9" ry="14" fill="#F1C27D"/>`;
    return svg('0 0 120 130', `
      <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
      ${arms}
      <ellipse cx="60" cy="116" rx="28" ry="16" fill="#2E86DE"/>
      <circle cx="60" cy="58" r="36" fill="#F1C27D"/>
      <path d="M28 50 Q 24 14 44 18 Q 52 4 62 16 Q 74 2 84 18 Q 100 12 92 48 Q 88 28 60 26 Q 34 28 28 50 Z" fill="#4E342E"/>
      <circle cx="38" cy="70" r="7" fill="#E89B8D" opacity=".7"/><circle cx="82" cy="70" r="7" fill="#E89B8D" opacity=".7"/>
      ${charEyes(mood, 46, 58, 74, 58)}
      ${mouth}
      ${charAcc(acc)}`, 'char char-leo owl-' + mood);
  }
  /* Luna: niña con dos chongos y estrellas, vestido lila */
  function girl(mood = 'normal', acc = '') {
    const mouth = mood === 'cheer'
      ? `<path d="M48 76 q12 14 24 0" fill="#C0392B"/><path d="M52 78 q8 8 16 0" fill="#fff"/>`
      : mood === 'think' ? `<path d="M54 82 q8 2 16 -4" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
      : `<path d="M52 78 q10 10 20 0" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const arms = mood === 'cheer'
      ? `<ellipse cx="22" cy="96" rx="9" ry="16" fill="#F8C8A8" transform="rotate(-40 22 96)"/><ellipse cx="98" cy="96" rx="9" ry="16" fill="#F8C8A8" transform="rotate(40 98 96)"/>`
      : `<ellipse cx="24" cy="112" rx="9" ry="14" fill="#F8C8A8"/><ellipse cx="96" cy="112" rx="9" ry="14" fill="#F8C8A8"/>`;
    return svg('0 0 120 130', `
      <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
      ${arms}
      <path d="M32 108 Q 32 86 60 86 Q 88 86 88 108 L 88 122 Q 60 128 32 122 Z" fill="#8854D0"/>
      <circle cx="60" cy="56" r="34" fill="#F8C8A8"/>
      <path d="M30 48 Q 28 16 48 22 Q 60 8 72 22 Q 92 16 90 48 Q 80 30 60 28 Q 40 30 30 48 Z" fill="#5D4037"/>
      <circle cx="30" cy="30" r="12" fill="#5D4037"/><circle cx="90" cy="30" r="12" fill="#5D4037"/>
      <polygon points="30,16 33,24 42,24 35,29 38,38 30,32 22,38 25,29 18,24 27,24" fill="#FFC312"/>
      <polygon points="90,16 93,24 102,24 95,29 98,38 90,32 82,38 85,29 78,24 87,24" fill="#FFC312"/>
      <circle cx="40" cy="68" r="6.5" fill="#F4A9A0" opacity=".8"/><circle cx="80" cy="68" r="6.5" fill="#F4A9A0" opacity=".8"/>
      ${charEyes(mood, 46, 56, 74, 56)}
      ${mouth}
      ${charAcc(acc)}`, 'char char-luna owl-' + mood);
  }
  /* Axi: ajolote rosa, branquias en flor, muy mexicano y tierno */
  function axolotl(mood = 'normal', acc = '') {
    const mouth = mood === 'cheer'
      ? `<path d="M48 78 q12 12 24 0" fill="#C0392B"/><path d="M52 80 q8 6 16 0" fill="#fff"/>`
      : mood === 'think' ? `<ellipse cx="60" cy="80" rx="6" ry="4" fill="#E91E63"/>`
      : `<path d="M50 78 q10 8 20 0" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    const arms = mood === 'cheer'
      ? `<ellipse cx="18" cy="88" rx="12" ry="8" fill="#F8A5B8" transform="rotate(-30 18 88)"/><ellipse cx="102" cy="88" rx="12" ry="8" fill="#F8A5B8" transform="rotate(30 102 88)"/>`
      : `<ellipse cx="22" cy="108" rx="12" ry="8" fill="#F8A5B8"/><ellipse cx="98" cy="108" rx="12" ry="8" fill="#F8A5B8"/>`;
    const gill = (x, rot, k) => `<g transform="translate(${x} 44) rotate(${rot})">
      <ellipse cx="0" cy="-16" rx="6" ry="16" fill="${k}"/><ellipse cx="-9" cy="-12" rx="5" ry="13" fill="${k}"/><ellipse cx="9" cy="-12" rx="5" ry="13" fill="${k}"/>
      <circle cx="0" cy="-28" r="3.2" fill="#E84393"/><circle cx="-9" cy="-22" r="2.6" fill="#E84393"/><circle cx="9" cy="-22" r="2.6" fill="#E84393"/></g>`;
    return svg('0 0 120 130', `
      <ellipse cx="60" cy="124" rx="34" ry="5" fill="rgba(0,0,0,.12)"/>
      ${gill(28, -18, '#F48FB1')}${gill(92, 18, '#F48FB1')}
      ${arms}
      <ellipse cx="60" cy="72" rx="36" ry="40" fill="#F8A5B8"/>
      <ellipse cx="60" cy="86" rx="24" ry="22" fill="#FFD6E0"/>
      <circle cx="38" cy="74" r="6" fill="#FF8A80" opacity=".55"/><circle cx="82" cy="74" r="6" fill="#FF8A80" opacity=".55"/>
      ${charEyes(mood, 46, 64, 74, 64, 7)}
      ${mouth}
      <ellipse cx="36" cy="118" rx="10" ry="6" fill="#F48FB1"/><ellipse cx="84" cy="118" rx="10" ry="6" fill="#F48FB1"/>
      ${charAcc(acc)}`, 'char char-axi owl-' + mood);
  }
  const CHARS = { teco: owl, leo: boy, luna: girl, axi: axolotl };
  function character(id, mood = 'normal', acc = '') { return (CHARS[id] || owl)(mood, acc); }

  const AVATARS = [
    { id: 'teco', draw: () => owl('happy', '') },
    { id: 'leo', draw: () => boy('happy', '') },
    { id: 'luna', draw: () => girl('happy', '') },
    { id: 'axi', draw: () => axolotl('happy', '') },
    { id: 'star', draw: () => icon.star },
    { id: 'sun', draw: () => svg('0 0 100 100', '<circle cx="50" cy="50" r="22" fill="#FFC312"/>' + Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;const x1=50+28*Math.cos(a),y1=50+28*Math.sin(a),x2=50+44*Math.cos(a),y2=50+44*Math.sin(a);return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FA8231" stroke-width="6" stroke-linecap="round"/>`;}).join('')) },
    { id: 'flower', draw: () => svg('0 0 100 100', '<circle cx="50" cy="50" r="14" fill="#FFC312"/>' + [0,60,120,180,240,300].map(a=>`<ellipse cx="${(50+22*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(50+22*Math.sin(a*Math.PI/180)).toFixed(1)}" rx="12" ry="16" fill="#E84393" transform="rotate(${a} ${(50+22*Math.cos(a*Math.PI/180)).toFixed(1)} ${(50+22*Math.sin(a*Math.PI/180)).toFixed(1)})"/>`).join('')) },
    { id: 'rocket', draw: () => svg('0 0 100 100', '<polygon points="50,8 72,70 28,70" fill="#2E86DE"/><rect x="40" y="70" width="20" height="10" fill="#636E72"/><polygon points="28,70 20,88 36,70" fill="#FF5A5F"/><polygon points="72,70 80,88 64,70" fill="#FF5A5F"/><polygon points="44,80 50,100 56,80" fill="#FA8231"/><circle cx="50" cy="40" r="8" fill="#D9F3FF"/>') },
  ];

  window.ART = { owl, boy, girl, axolotl, character, AVATARS, face, obj, shape, animal, balloon, turtle, icon, gameIcon, starPts };

})();
