/* Motor de planeación diaria: calendario + proyectos + plantillas de actividades.
   Determinista: la misma fecha produce siempre las mismas actividades (todo el grupo trabaja lo mismo). */
(function (root) {
  'use strict';
  const CAL = root.CAL, CURR = root.CURR, G = root.GRADE, B = root.GEN_BANKS;
  /* ---------- utilidades ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const monday = s => { const d = parse(s); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return iso(d); };
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = hash(String(seed)); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = r => ({
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    pick: arr => arr[Math.floor(r() * arr.length)],
    shuffle: arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  });
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fechaLarga = s => { const d = parse(s); return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(); };
  const fechaCorta = s => { const d = parse(s); return d.getDate() + ' de ' + MESES[d.getMonth()]; };
  const NUM = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];
  const sp = s => { const [e, w, x] = s.split('|'); return { e, w, x }; };
  const voc = s => { const [e, w, pl] = s.split('|'); const art = (w.split(' ')[0] || '').toLowerCase(); const g = (art === 'la' || art === 'las') ? 'f' : 'm'; const base = w.replace(/^(el|la|los|las|un|una)\s+/i, ''); return { e, w, pl: pl || base, g, base, count: !!pl && pl !== base && !/^(el|la) (color|carita)/.test(w) }; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- campos y PDA ---------- */
  const PDA = {}, CONT = {}, CAMPO = {};
  CURR.campos.forEach(c => { CAMPO[c.id] = c; c.contenidos.forEach(x => { CONT[x.id] = Object.assign({ campo: c.id }, x); x.pda.forEach(p => { PDA[p.id] = { id: p.id, texto: p.texto, contenido: x.id, campo: c.id }; }); }); });
  const CAMPO_INFO = {
    LEN: { nombre: 'Lenguajes', corto: 'Lenguajes', color: '#FF7A59', e: '🗣️' },
    SPC: { nombre: 'Saberes y Pensamiento Científico', corto: 'Saberes', color: '#2E86DE', e: '🔬' },
    ENS: { nombre: 'Ética, Naturaleza y Sociedades', corto: 'Ética y Naturaleza', color: '#20BF6B', e: '🌎' },
    HUC: { nombre: 'De lo Humano y lo Comunitario', corto: 'Humano y Comunitario', color: '#8854D0', e: '🤝' },
  };

  /* ---------- calendario ---------- */
  const vacDe = s => CAL.vacaciones.find(v => s >= v.de && s <= v.a);
  function tipoDia(s) {
    const d = parse(s), wd = d.getDay();
    if (s < CAL.inicio) return { tipo: 'antes', nombre: 'El ciclo escolar ' + CAL.ciclo + ' empieza el ' + fechaLarga(CAL.inicio) };
    if (s > CAL.fin) return { tipo: 'despues', nombre: 'Terminó el ciclo escolar ' + CAL.ciclo + '. ¡Felices vacaciones!' };
    if (wd === 0 || wd === 6) return { tipo: 'finde', nombre: 'Fin de semana' };
    const v = vacDe(s); if (v) return { tipo: 'vacaciones', nombre: v.nombre };
    if (CAL.suspension[s]) return { tipo: 'festivo', nombre: CAL.suspension[s] };
    if (CAL.cte.includes(s)) return { tipo: 'cte', nombre: 'Consejo Técnico Escolar (sin clases)' };
    if (CAL.registro.includes(s)) return { tipo: 'registro', nombre: 'Registro de calificaciones (sin clases)' };
    return { tipo: 'clase', nombre: 'Día de clases' };
  }
  const DAYS = []; const IDX = {};
  (function build() { let s = CAL.inicio, n = 0; while (s <= CAL.fin) { const t = tipoDia(s); if (t.tipo === 'clase') { n++; IDX[s] = n; DAYS.push(s); } s = addDays(s, 1); } })();
  const trimestreDe = s => { const t = CAL.trimestres.find(t => s >= t.de && s <= t.a); if (t) return t.n; if (s < CAL.trimestres[0].de) return 1; return s < CAL.trimestres[2].de ? 2 : 3; };
  const proyectoDe = s => { const m = monday(s); let p = G.proyectos[0]; for (const x of G.proyectos) if (x.semana <= m) p = x; return p; };
  const diaSemanaProyecto = s => { const m = monday(s); let k = 0; for (let i = 0; i < 5; i++) { const x = addDays(m, i); if (x === s) return k; if (IDX[x]) k++; } return k; };
  const nextSchoolDay = s => DAYS.find(x => x >= s) || null;
  const prevSchoolDay = s => { let r = null; for (const x of DAYS) { if (x <= s) r = x; else break; } return r; };
  function info(s) {
    const t = tipoDia(s);
    return Object.assign({ fecha: s, fechaLarga: fechaLarga(s), n: IDX[s] || 0, total: DAYS.length, trimestre: trimestreDe(s), proyecto: proyectoDe(s), efemeride: CAL.efemerides[s] || null }, t);
  }

  /* ---------- plantillas de actividades ---------- */
  const LETRA = { a: 'a', b: 'be', c: 'ce', d: 'de', e: 'e', f: 'efe', g: 'ge', h: 'hache', i: 'i', j: 'jota', k: 'ka', l: 'ele', m: 'eme', n: 'ene', 'ñ': 'eñe', o: 'o', p: 'pe', q: 'cu', r: 'erre', s: 'ese', t: 'te', u: 'u', v: 'uve', w: 'doble uve', x: 'equis', y: 'ye', z: 'zeta' };
  const SAY = {
    tocaContar: 'Toca cada uno para contarlo.',
    mas: '¿Dónde hay más?', menos: '¿Dónde hay menos?',
    juntar: 'Junta los dos grupos. ¿Cuántos hay en total?', quitar: 'Algunos se van. ¿Cuántos quedan?',
    queForma: '¿Qué forma tiene?', patron: '¿Qué sigue? Completa el patrón.',
    pesaMas: '¿Cuál pesa más?', pesaMenos: '¿Cuál pesa menos?', masAlto: '¿Cuál es más alto?', masBajo: '¿Cuál es más bajito?',
    masLargo: '¿Cuál es más largo?', masCorto: '¿Cuál es más corto?', masAgua: '¿Cuál tiene más agua?', menosAgua: '¿Cuál tiene menos agua?',
    aplausos: '¿Cuántos aplausos tiene esta palabra?', ordenPrimero: 'Toca lo que pasó primero.', ordenDespues: '¿Y después?', ordenFinal: '¿Y al final?',
    memorama: 'Memorama. Encuentra las parejas iguales.', cuantoDinero: '¿Cuánto dinero hay?', clasifica: 'Toca un dibujo y luego toca su grupo.',
    saludo: '¡Hola! ¿Cómo te sientes hoy?', fuera: 'Ahora, una actividad sin pantalla.', fueraFin: 'Cuando termines, pide a un adulto que toque Listo.',
    pausa: '¡Pausa activa! Vamos a mover el cuerpo.', respira: 'Vamos a respirar y a calmarnos.', canto: 'Escucha la canción de la semana y repite conmigo.',
    cantoAplaude: 'Ahora aplaude al ritmo. Toca las palmas ocho veces.', nombre1: 'Busca la primera letra de tu nombre.', nombre2: 'Ahora arma tu nombre. Toca las letras en orden.',
    vocab: 'Escucha y toca el dibujo correcto.', quiz: 'Escucha la pregunta y toca la respuesta.', emociones: '¿Cómo se siente? Toca la carita.',
    tiempo: 'Piensa en lo que hacemos cada día.', sonido: 'Escucha el sonido del principio.', rima: 'Las palabras que riman suenan igual al final.',
    formas: 'Busca la forma.',
    hola: '¡Hola! Vamos a aprender juntos.', hoy: 'Estas son las actividades de hoy. Toca la primera para empezar.', empezar: 'Toca para empezar',
    probar: 'Probando el sonido. ¿Me escuchas bien?', sinClase: 'Hoy no hay clases.', practica: 'Práctica libre. Elige una actividad.',
    bien1: '¡Muy bien!', bien2: '¡Excelente!', bien3: '¡Lo lograste!', bien4: '¡Bravo!', bien5: '¡Súper!', bien6: '¡Eres genial!',
    otra1: '¡Casi! Intenta otra vez.', otra2: 'Tú puedes, inténtalo de nuevo.', otra3: 'Mira bien y prueba otra vez.',
    terminado: '¡Terminaste la actividad! Ganaste estrellas.', diaCompleto: '¡Completaste todas las actividades de hoy! Ahora a jugar sin pantalla.',
    pareja: '¡Pareja!', listo: '¡Listo!', siguiente: 'Siguiente', quienEres: '¿Quién eres? Toca tu nombre.', elige: 'Elige tu personaje.',
    medalla: '¡Ganaste una medalla!', grupoBien: '¡Muy bien! Va en ese grupo.', grupoMal: 'Ese no va ahí. Prueba el otro grupo.',
    teco: '¡Hola! Soy Teco, el tecolote.', luna: '¡Hola! Soy Luna.', leo: '¡Hola! Soy Leo.', axi: '¡Hola! Soy Axi, el ajolote.',
    escucha: 'Escucha con atención.', muySeguido: 'Ya llevas un buen rato con la pantalla. ¡Vamos a jugar afuera!', numeral: 'Busca el número.', posicion: '¿Dónde está? Mira la caja.', medir: 'Compara y elige.', monedas: 'Vamos a jugar con monedas.',
  };
  const tri = s => trimestreDe(s);
  function optsNum(r, ok, lo, hi, k) { const set = new Set([ok]); let guard = 0; while (set.size < k && guard++ < 50) { const v = Math.max(lo, Math.min(hi, ok + r.int(-3, 3))); set.add(v); } for (let v = lo; set.size < k && v <= hi; v++) set.add(v); return r.shuffle([...set]).map(n => ({ num: n, ok: n === ok })); }
  const T = {};
  T.vocab = (c) => { const r = c.R, items = r.shuffle(c.p.vocab.map(voc)); const k = c.t === 1 ? 3 : 4;
    return { tipo: 'choice', key: 'vocab', titulo: 'Palabras de la semana', e: '🔤', campo: 'LEN', pda: ['LEN3.3', 'LEN1.2'], intro: SAY.vocab,
      rounds: items.slice(0, 4).map((it, i) => { const others = r.shuffle(items.filter(x => x !== it)).slice(0, k - 1); return { say: ['Toca ' + it.w + '.'], opts: r.shuffle([it, ...others]).map(o => ({ e: o.e, label: o.base, ok: o === it })), okSay: it.w }; }) }; };
  T.sonido = (c) => { const r = c.R, L = c.t === 1 ? B.letrasPorTrimestre[1] : B.letrasPorTrimestre[c.t]; const k = c.t === 1 ? 3 : 4; const rounds = []; const letters = r.shuffle(L);
    for (let i = 0; i < 4; i++) { const l = letters[i % letters.length]; const [ref, ok] = r.shuffle(B.sonidos[l]).map(sp); const otherL = r.shuffle(Object.keys(B.sonidos).filter(x => x !== l)).slice(0, k - 1); const dis = otherL.map(x => sp(r.pick(B.sonidos[x])));
      rounds.push({ say: ['¿Cuál empieza igual que ' + ref.w + '?'], show: { type: 'big', e: ref.e, label: ref.w, first: true }, opts: r.shuffle([ok, ...dis]).map(o => ({ e: o.e, label: o.w, first: true, ok: o === ok })), okSay: ok.w }); }
    return { tipo: 'choice', key: 'sonido', titulo: 'Sonidos del principio', e: '👂', campo: 'LEN', pda: ['LEN7.4', 'LEN3.1'], intro: SAY.sonido, rounds }; };
  T.silabas = (c) => { const r = c.R; const pool = B.silabas.map(sp).filter(w => c.t === 1 ? w.x.split('-').length <= 3 : true); const items = r.shuffle(pool).slice(0, 4);
    return { tipo: 'choice', key: 'silabas', titulo: 'Aplausos de palabras', e: '👏', campo: 'LEN', pda: ['LEN3.1', 'LEN3.2'], intro: SAY.aplausos,
      rounds: items.map(w => { const n = w.x.split('-').length; return { say: [SAY.aplausos, w.x.split('-').join(', ')], show: { type: 'big', e: w.e, label: w.w, clap: w.x.split('-') }, opts: [1, 2, 3, 4].map(k => ({ num: k, ok: k === n })), okSay: w.x.split('-').join(', ') }; }) }; };
  T.rima = (c) => { const r = c.R; const items = r.shuffle(B.rimas).slice(0, 4);
    return { tipo: 'choice', key: 'rima', titulo: 'Palabras que riman', e: '🎶', campo: 'LEN', pda: ['LEN3.2', 'LEN3.1'], intro: SAY.rima,
      rounds: items.map(([a, b]) => { const ref = sp(a), ok = sp(b); const dis = r.shuffle(B.distractoresRima).slice(0, 2).map(sp); return { say: ['¿Qué palabra rima con ' + ref.w + '?'], show: { type: 'big', e: ref.e, label: ref.w }, readOpts: true, opts: r.shuffle([ok, ...dis]).map(o => ({ e: o.e, label: o.w, ok: o === ok, say: o.w })) }; }) }; };
  T.canto = (c) => ({ tipo: 'canto', key: 'canto', titulo: 'Canción de la semana', e: '🎵', campo: 'LEN', pda: ['LEN3.1', 'LEN3.2'], intro: SAY.canto, lines: c.p.canto.slice(), proyectoE: c.p.e });
  T.cuento = (c) => { const r = c.R; const st = c.t === 3 && r.int(0, 1) ? r.pick(B.cuentos4) : r.pick(B.cuentos);
    return { tipo: 'orden', key: 'cuento', titulo: 'Ordena el cuento: ' + st.t, e: '📖', campo: 'LEN', pda: ['LEN2.2', 'SPC6.5'], intro: 'Vamos a ordenar el cuento: ' + st.t + '.', steps: st.p.map(sp).map(x => ({ e: x.e, t: x.w })) }; };
  T.memorama = (c) => { const r = c.R; const n = c.t === 1 ? 3 : c.t === 2 ? 4 : 6; const items = r.shuffle(c.p.vocab.map(voc)).slice(0, n);
    return { tipo: 'memory', key: 'memorama', titulo: 'Memorama de la semana', e: '🃏', campo: 'LEN', pda: ['LEN3.3', 'HUC3.3'], intro: SAY.memorama, cards: r.shuffle([...items, ...items].map((x, i) => ({ e: x.e, w: x.w, id: x.e }))) }; };
  T.nombre = () => ({ tipo: 'nombre', key: 'nombre', titulo: 'Las letras de mi nombre', e: '✍️', campo: 'LEN', pda: ['LEN7.3', 'LEN7.4'], intro: SAY.nombre1 });
  T.contar = (c) => { const r = c.R; const hi = c.t === 1 ? 5 : c.t === 2 ? 8 : 10, lo = c.t === 1 ? 1 : c.t === 2 ? 2 : 3; let pool = c.p.vocab.map(voc).filter(v => v.count); if (pool.length < 2) pool = G.proyectos[7].vocab.map(voc);
    const items = r.shuffle(pool); const rounds = [];
    for (let i = 0; i < 4; i++) { const it = items[i % items.length], n = r.int(lo, hi); rounds.push({ say: [(it.g === 'f' ? '¿Cuántas ' : '¿Cuántos ') + it.pl + ' hay?'].concat(i === 0 ? [SAY.tocaContar] : []), show: { type: 'count', e: it.e, n }, opts: optsNum(r, n, 1, Math.max(hi, n + 1), 3), okSay: NUM[n] }); }
    return { tipo: 'choice', key: 'contar', titulo: 'A contar', e: '🔢', campo: 'SPC', pda: ['SPC4.3', 'SPC4.2'], intro: null, rounds }; };
  T.numeral = (c) => { const r = c.R; const hi = c.t === 1 ? 5 : c.t === 2 ? 9 : 10; const k = c.t === 1 ? 3 : 4; const ns = r.shuffle(Array.from({ length: hi }, (_, i) => i + 1)).slice(0, 4);
    return { tipo: 'choice', key: 'numeral', titulo: 'Busca el número', e: '🔟', campo: 'SPC', pda: ['SPC4.1', 'SPC4.2'], intro: SAY.numeral,
      rounds: ns.map(n => { const o = new Set([n]); while (o.size < k) o.add(r.int(1, hi)); return { say: ['Toca el número ' + NUM[n] + '.'], opts: r.shuffle([...o]).map(x => ({ num: x, big: true, ok: x === n })), okSay: NUM[n] }; }) }; };
  T.comparar = (c) => { const r = c.R; const hi = c.t === 1 ? 5 : c.t === 2 ? 8 : 10; let pool = c.p.vocab.map(voc).filter(v => v.count); if (pool.length < 2) pool = G.proyectos[7].vocab.map(voc); const rounds = [];
    for (let i = 0; i < 4; i++) { const it = r.pick(pool); let a = r.int(1, hi), b = r.int(1, hi); while (Math.abs(a - b) < (c.t === 1 ? 2 : 1)) b = r.int(1, hi); const menos = c.t > 1 && r.int(0, 1) === 1; const okN = menos ? Math.min(a, b) : Math.max(a, b);
      rounds.push({ say: [menos ? SAY.menos : SAY.mas], opts: [a, b].map(n => ({ e: it.e, n, ok: n === okN })), wide: true }); }
    return { tipo: 'choice', key: 'comparar', titulo: '¿Dónde hay más?', e: '⚖️', campo: 'SPC', pda: ['SPC4.4', 'SPC4.3'], intro: null, rounds }; };
  T.juntar = (c) => { const r = c.R; let pool = c.p.vocab.map(voc).filter(v => v.count); if (pool.length < 2) pool = G.proyectos[7].vocab.map(voc); const rounds = []; const hi = c.t === 3 ? 10 : 6;
    for (let i = 0; i < 4; i++) { const it = r.pick(pool); const quitar = c.t === 3 && i % 2 === 1; if (quitar) { const a = r.int(3, hi), b = r.int(1, a - 1); rounds.push({ say: [SAY.quitar], show: { type: 'sub', e: it.e, a, b }, opts: optsNum(r, a - b, 0, hi, 3), okSay: NUM[a - b] }); }
      else { const a = r.int(1, Math.floor(hi / 2)), b = r.int(1, hi - a); rounds.push({ say: [SAY.juntar], show: { type: 'add', e: it.e, a, b }, opts: optsNum(r, a + b, 1, hi, 3), okSay: NUM[a + b] }); } }
    return { tipo: 'choice', key: 'juntar', titulo: c.t === 3 ? 'Juntar y quitar' : 'Juntamos', e: '➕', campo: 'SPC', pda: ['SPC4.6', 'SPC4.3'], intro: null, rounds }; };
  T.formas = (c) => { const r = c.R; const F = B.formas[c.t]; const k = c.t === 1 ? 3 : 4; const rounds = [];
    for (let i = 0; i < 4; i++) { const objeto = c.t > 1 && i >= 2; if (objeto) { const [e, f] = r.pick(B.objetosForma.filter(o => B.formas[3].includes(o[1]) && (c.t === 3 || F.includes(o[1])))); const others = r.shuffle(F.filter(x => x !== f)).slice(0, k - 1);
        rounds.push({ say: [SAY.queForma], show: { type: 'big', e }, opts: r.shuffle([f, ...others]).map(x => ({ shape: x, color: r.pick(B.colores)[1], label: x, ok: x === f })), okSay: x2(f) }); }
      else { const f = r.pick(F); const others = r.shuffle(F.filter(x => x !== f)).slice(0, k - 1); rounds.push({ say: ['Toca ' + x2(f) + '.'], opts: r.shuffle([f, ...others]).map(x => ({ shape: x, color: r.pick(B.colores)[1], ok: x === f })), okSay: x2(f) }); } }
    return { tipo: 'choice', key: 'formas', titulo: 'Las formas', e: '🔷', campo: 'SPC', pda: ['SPC5.6', 'SPC5.5'], intro: SAY.formas, rounds }; };
  const x2 = f => (f === 'estrella' ? 'la ' : 'el ') + f;
  T.patron = (c) => { const r = c.R; const rounds = []; const kinds = c.t === 1 ? ['AB'] : c.t === 2 ? ['AB', 'AAB', 'ABB'] : ['AAB', 'ABB', 'ABC', 'AABB'];
    let pool = c.p.vocab.map(voc).map(v => ({ e: v.e }));
    for (let i = 0; i < 4; i++) { const kind = r.pick(kinds); const useColor = i % 2 === 0; const syms = useColor ? r.shuffle(B.colores).slice(0, 3).map(([n, col]) => ({ dot: col })) : r.shuffle(pool).slice(0, 3);
      const unit = kind.split('').map(ch => syms[ch.charCodeAt(0) - 65]); const len = Math.max(5, unit.length * 2 + 1); const seq = Array.from({ length: len + 1 }, (_, j) => unit[j % unit.length]); const ans = seq.pop();
      const others = syms.filter(s => s !== ans); if (others.length < 2) others.push(useColor ? { dot: r.pick(B.colores.filter(cc => !syms.some(s => s.dot === cc[1])))[1] } : r.pick(pool.filter(p => !syms.includes(p))));
      rounds.push({ say: [SAY.patron], show: { type: 'pattern', seq }, opts: r.shuffle([ans, ...others.slice(0, 2)]).map(o => Object.assign({}, o, { ok: o === ans })) }); }
    return { tipo: 'choice', key: 'patron', titulo: 'Patrones', e: '🔁', campo: 'SPC', pda: ['SPC5.7'], intro: null, rounds }; };
  T.medir = (c) => { const r = c.R; const kinds = r.shuffle(['peso', 'alto', 'largo', 'agua']); const rounds = kinds.map(k => {
      if (k === 'peso') { const [a, b] = r.pick(B.pesos).map(sp); const mas = r.int(0, 1) === 1; return { say: [mas ? SAY.pesaMas : SAY.pesaMenos], opts: r.shuffle([{ e: a.e, label: a.w, ok: mas }, { e: b.e, label: b.w, ok: !mas }]), wide: true }; }
      if (k === 'alto') { const [a, b] = r.pick(B.altos).map(sp); const mas = r.int(0, 1) === 1; return { say: [mas ? SAY.masAlto : SAY.masBajo], opts: r.shuffle([{ e: a.e, label: a.w, scale: 1.5, ok: mas }, { e: b.e, label: b.w, scale: 0.8, ok: !mas }]), wide: true }; }
      if (k === 'largo') { const col = r.pick(B.colores)[1]; let L = r.shuffle([30, 55, 90]).slice(0, c.t === 1 ? 2 : 3); const mas = r.int(0, 1) === 1; const okL = mas ? Math.max(...L) : Math.min(...L); return { say: [mas ? SAY.masLargo : SAY.masCorto], opts: L.map(x => ({ bar: x, color: col, ok: x === okL })), wide: true }; }
      const lv = r.shuffle([20, 50, 85]).slice(0, c.t === 1 ? 2 : 3); const mas = r.int(0, 1) === 1; const okV = mas ? Math.max(...lv) : Math.min(...lv); return { say: [mas ? SAY.masAgua : SAY.menosAgua], opts: lv.map(x => ({ glass: x, ok: x === okV })), wide: true }; });
    return { tipo: 'choice', key: 'medir', titulo: 'Medimos y comparamos', e: '📏', campo: 'SPC', pda: ['SPC6.1', 'SPC6.3'], intro: SAY.medir, rounds }; };
  T.posicion = (c) => { const r = c.R; const rounds = []; for (let i = 0; i < 4; i++) { const [e, w] = r.pick(B.posObjs); const pos = r.pick(B.posiciones); const others = r.shuffle(B.posiciones.filter(p => p !== pos)).slice(0, 2);
      rounds.push({ say: ['Toca donde ' + w + ' está ' + (pos === 'al lado' ? 'al lado de' : pos === 'dentro' ? 'dentro de' : pos + ' de') + ' la caja.'], opts: r.shuffle([pos, ...others]).map(p => ({ scene: { e, pos: p }, ok: p === pos })) }); }
    return { tipo: 'choice', key: 'posicion', titulo: 'Arriba, abajo, dentro', e: '📦', campo: 'SPC', pda: ['SPC5.2', 'SPC5.1'], intro: SAY.posicion, rounds }; };
  T.clasificar = (c) => { const s = c.R.pick(B.clasifica); return sortAct(s, 'clasificar', 'Clasifica', '🗂️', 'SPC', ['SPC7.1', 'SPC7.2'], c.R); };
  T.tiempo = (c) => { const r = c.R; const items = r.shuffle(B.tiempo).slice(0, 4);
    return { tipo: 'choice', key: 'tiempo', titulo: 'Mañana, tarde y noche', e: '🕒', campo: 'SPC', pda: ['SPC6.5', 'SPC6.4'], intro: SAY.tiempo, rounds: items.map(q => quizRound(q, r)) }; };
  T.monedas = (c) => { const r = c.R; const rounds = []; for (let i = 0; i < 4; i++) { if (i < 2 || c.t < 3) { const v = r.pick([1, 2, 5, 10]); rounds.push({ say: ['Toca la moneda de ' + NUM[v] + (v === 1 ? ' peso.' : ' pesos.')], opts: r.shuffle([1, 2, 5, 10]).slice(0, 3).concat([]).filter((x, j, a) => a.indexOf(x) === j).map(x => ({ coin: x })).concat([]), okSay: NUM[v] + (v === 1 ? ' peso' : ' pesos'), _v: v }); }
      else { const coins = []; let tot = 0; const n = r.int(2, 3); for (let j = 0; j < n; j++) { const v = r.pick(tot + 5 <= 10 ? [1, 2, 5] : [1, 2]); if (tot + v > 10) break; coins.push(v); tot += v; } rounds.push({ say: [SAY.cuantoDinero], show: { type: 'coins', coins }, opts: optsNum(r, tot, 1, 10, 3), okSay: NUM[tot] + (tot === 1 ? ' peso' : ' pesos') }); } }
    rounds.forEach(rd => { if (rd._v) { if (!rd.opts.some(o => o.coin === rd._v)) rd.opts[0] = { coin: rd._v }; rd.opts.forEach(o => { o.ok = o.coin === rd._v; }); delete rd._v; } });
    return { tipo: 'choice', key: 'monedas', titulo: 'Las monedas', e: '🪙', campo: 'SPC', pda: ['SPC4.7', 'SPC4.6'], intro: SAY.monedas, rounds }; };
  function quizRound(q, r) { const ok = sp(q.ok); const no = q.no.map(sp); return { say: [q.q], readOpts: true, opts: r.shuffle([ok, ...no]).map(o => ({ e: o.e, label: o.w, ok: o === ok, say: o.w })) }; }
  function sortAct(s, key, titulo, e, campo, pda, r) { const [an, ae] = s.a.split('|'), [bn, be] = s.b.split('|'); return { tipo: 'sort', key, titulo: titulo + ': ' + an.toLowerCase() + ' o ' + bn.toLowerCase(), e, campo, pda, intro: SAY.clasifica, groups: [{ id: 'a', name: an, e: ae }, { id: 'b', name: bn, e: be }], items: r.shuffle(s.items.map(sp).map(x => ({ e: x.e, w: x.w, g: x.x }))), say: [an + ', o ' + bn.toLowerCase() + '.'] }; }
  T.quiz = (c) => ({ tipo: 'choice', key: 'quiz', titulo: c.p.titulo, e: c.p.e, campo: c.p.campo, pda: c.p.pda.slice(0, 2), intro: SAY.quiz, rounds: c.R.shuffle(c.p.quiz).map(q => quizRound(q, c.R)), proyecto: true });
  T.psort = (c) => Object.assign(sortAct(c.p.sort, 'psort', 'Clasifica', c.p.e, c.p.campo, c.p.pda.slice(1, 3).length ? c.p.pda.slice(1, 3) : c.p.pda.slice(0, 1), c.R), { proyecto: true });
  T.situaciones = (c) => { const r = c.R; const items = r.shuffle(B.situaciones).slice(0, 4);
    return { tipo: 'choice', key: 'situaciones', titulo: '¿Cómo se siente?', e: '🎭', campo: 'HUC', pda: ['HUC4.1', 'HUC4.4'], intro: SAY.emociones,
      rounds: items.map(s => { const others = r.shuffle(B.emociones.filter(x => x.id !== s.ok)).slice(0, 2); const ok = B.emociones.find(x => x.id === s.ok); return { say: [s.q], opts: r.shuffle([ok, ...others]).map(o => ({ face: o.id, label: o.w, ok: o === ok })), okSay: ok.w }; }) }; };
  T.saludo = (c) => ({ tipo: 'saludo', key: 'saludo', titulo: 'Saludo: ¿cómo me siento?', e: '👋', campo: 'HUC', pda: ['HUC4.1', 'LEN1.1'], intro: SAY.saludo, emociones: B.emociones.map(x => ({ id: x.id, e: x.e, w: x.w, say: x.say })), proyectoIntro: c.d === 0 ? c.p.intro : null, pregunta: c.d === 0 ? c.p.pregunta : null });
  T.pausa = (c) => { const p = c.R.pick(B.pausas); return { tipo: 'move', key: 'pausa', titulo: 'Pausa activa', e: p.e, campo: 'HUC', pda: ['HUC2.2', 'HUC6.4'], intro: SAY.pausa, t: p.t, secs: 25 }; };
  T.respira = (c) => { const p = c.R.pick(B.respira); return { tipo: 'move', key: 'respira', titulo: 'Respiro y me calmo', e: p.e, campo: 'HUC', pda: ['HUC4.1'], intro: SAY.respira, t: p.t, secs: 20, breathe: true }; };
  T.fuera = (c) => ({ tipo: 'fuera', key: 'fuera', titulo: 'Sin pantalla', e: '🖐️', campo: c.p.campo, pda: c.p.pda.length > 3 ? [...new Set([c.p.pda[3 + ((2 * c.d) % (c.p.pda.length - 3))], c.p.pda[3 + ((2 * c.d + 1) % (c.p.pda.length - 3))]])] : c.p.pda.slice(-1), intro: SAY.fuera, t: c.p.fuera[c.d % c.p.fuera.length], proyecto: true });
  T.monedas = (c) => { const r = c.R; const rounds = [];
    for (let i = 0; i < 4; i++) {
      if (i < 2 || c.t < 3) { const set = r.shuffle([1, 2, 5, 10]).slice(0, 3); const v = r.pick(set); rounds.push({ say: ['Toca la moneda de ' + NUM[v] + (v === 1 ? ' peso.' : ' pesos.')], opts: set.map(x => ({ coin: x, ok: x === v })), okSay: NUM[v] + (v === 1 ? ' peso' : ' pesos') }); }
      else { const coins = []; let tot = 0; const n = r.int(2, 3); for (let j = 0; j < n; j++) { const v = r.pick(tot + 5 <= 10 ? [1, 2, 5] : [1, 2]); if (tot + v > 10) break; coins.push(v); tot += v; } rounds.push({ say: [SAY.cuantoDinero], show: { type: 'coins', coins }, opts: optsNum(r, tot, 1, 10, 3), okSay: NUM[tot] + (tot === 1 ? ' peso' : ' pesos') }); }
    }
    return { tipo: 'choice', key: 'monedas', titulo: 'Las monedas', e: '🪙', campo: 'SPC', pda: ['SPC4.7', 'SPC4.6'], intro: SAY.monedas, rounds }; };

  /* ---------- composición del día ---------- */
  const LEN_LIST = { 1: ['vocab', 'sonido', 'cuento', 'memorama', 'nombre'], 2: ['vocab', 'sonido', 'silabas', 'cuento', 'rima', 'memorama', 'nombre'], 3: ['sonido', 'silabas', 'vocab', 'rima', 'cuento', 'nombre', 'memorama'] };
  const SPC_LIST = { 1: ['contar', 'comparar', 'formas', 'patron', 'numeral', 'posicion', 'clasificar', 'medir', 'tiempo'], 2: ['contar', 'juntar', 'formas', 'patron', 'comparar', 'numeral', 'posicion', 'medir', 'clasificar', 'tiempo'], 3: ['juntar', 'contar', 'patron', 'formas', 'monedas', 'comparar', 'medir', 'posicion', 'numeral', 'clasificar', 'tiempo'] };
  const SPC_PREF = { numeros: ['contar', 'numeral'], formas: ['formas', 'patron'], medimos: ['medir', 'comparar'], tiendita: ['monedas', 'juntar'], experimentos: ['clasificar', 'medir'], plantas: ['clasificar', 'contar'], repaso: ['juntar', 'formas'] };
  const PROJ_SLOT = ['quiz', 'psort', 'quiz', 'memo', 'psort'];
  /* contadores de rotación: avanzan solo en los días que usan la rotación, para repartir parejo las plantillas */
  const CNT = {};
  (function () { let len = 0, spc = 0; for (const s of DAYS) { const d = diaSemanaProyecto(s), p = proyectoDe(s); CNT[s] = { len, spc }; if (d !== 0) len++; if (!(SPC_PREF[p.id] && (d === 1 || d === 3))) spc++; } })();
  function plan(s) {
    const inf = info(s);
    if (inf.tipo !== 'clase') return Object.assign({ acts: [] }, inf);
    const t = tri(s), p = inf.proyecto, d = diaSemanaProyecto(s), n = inf.n;
    const mk = (key, salt) => { const c = { p, t, d, n, s, R: R(rng(s + '|' + salt)) }; const a = T[key](c); a.id = s + '-' + salt; return a; };
    const acts = [];
    acts.push(mk('saludo', 'saludo'));
    const L = LEN_LIST[t]; let lk = d === 0 ? 'canto' : L[CNT[s].len % L.length];
    let pk = PROJ_SLOT[Math.min(d, 4)];
    if (pk === 'memo') pk = (lk === 'memorama' || lk === 'vocab') ? 'quiz' : (n % 2 ? 'memorama' : 'vocab');
    if (p.id === 'emociones' && (d === 2 || d === 4)) pk = 'situaciones';
    acts.push(mk(lk, 'len'));
    const S = SPC_LIST[t]; let sk = S[CNT[s].spc % S.length];
    if (SPC_PREF[p.id] && (d === 1 || d === 3)) sk = SPC_PREF[p.id][d === 1 ? 0 : 1];
    if (sk === 'monedas' && t < 3 && p.id !== 'tiendita') sk = 'contar';
    acts.push(mk(sk, 'spc'));
    acts.push(mk(pk, 'proj'));
    acts.push(mk(d === 2 || d === 4 ? 'respira' : 'pausa', 'move'));
    acts.push(mk('fuera', 'fuera'));
    const casa = p.casa[d % p.casa.length];
    return Object.assign({ acts, casa, dia: d, trimestre: t, minutos: estMin(acts) }, inf);
  }
  function estMin(acts) { let m = 0; acts.forEach(a => { m += a.tipo === 'fuera' ? 0 : a.tipo === 'saludo' ? 1 : a.tipo === 'move' ? 1 : a.tipo === 'canto' ? 2 : a.tipo === 'memory' ? 3 : 3; }); return m; }

  /* ---------- ficha de planeación para la maestra ---------- */
  function ficha(s) {
    const pl = plan(s); if (pl.tipo !== 'clase') return null; const p = pl.proyecto;
    const pdaIds = []; const add = id => { if (PDA[id] && !pdaIds.includes(id)) pdaIds.push(id); };
    p.pda.forEach(add); pl.acts.forEach(a => (a.pda || []).forEach(add));
    const porCampo = {}; pdaIds.forEach(id => { const x = PDA[id]; (porCampo[x.campo] = porCampo[x.campo] || {}); (porCampo[x.campo][x.contenido] = porCampo[x.campo][x.contenido] || []).push(x); });
    const campos = Object.keys(CAMPO_INFO).filter(c => porCampo[c]).map(c => ({ id: c, nombre: CAMPO_INFO[c].nombre, contenidos: Object.keys(porCampo[c]).map(k => ({ id: k, texto: CONT[k].contenido, pda: porCampo[c][k].map(x => ({ id: x.id, texto: x.texto })) })) }));
    const dig = pl.acts.filter(a => a.tipo !== 'fuera');
    return {
      fecha: s, fechaLarga: pl.fechaLarga, n: pl.n, total: pl.total, trimestre: pl.trimestre, efemeride: pl.efemeride,
      proyecto: { titulo: p.titulo, e: p.e, proposito: p.proposito, pregunta: p.pregunta, materiales: p.materiales, ejes: p.ejes, campo: CAMPO_INFO[p.campo].nombre, semana: p.semana },
      campos,
      inicio: ['Saludo y registro de emociones en la app (¿cómo me siento hoy?).', pl.dia === 0 ? 'Presentar el proyecto de la semana: "' + p.titulo + '". Pregunta detonadora: ' + p.pregunta : 'Recuperar lo trabajado ayer en el proyecto "' + p.titulo + '". Pregunta: ' + p.pregunta, 'Canción de la semana: "' + p.canto[0].replace(/[,;]$/, '') + '…"'],
      desarrollo: dig.filter(a => a.tipo !== 'saludo').map(a => ({ titulo: a.titulo, campo: CAMPO_INFO[a.campo].corto, pda: (a.pda || []).filter(id => PDA[id]), tipo: a.tipo })).concat([{ titulo: 'Actividad sin pantalla: ' + pl.acts[pl.acts.length - 1].t, campo: CAMPO_INFO[p.campo].corto, pda: [], tipo: 'fuera' }]),
      cierre: ['Asamblea: ¿qué aprendimos hoy? ¿Qué fue lo más fácil y lo más difícil?', 'Para casa: ' + pl.casa],
      evaluacion: pdaIds.slice(0, 5).map(id => 'Observar si ' + lowerFirst(PDA[id].texto)),
      minutosPantalla: pl.minutos,
    };
  }
  const lowerFirst = s => s.charAt(0).toLowerCase() + s.slice(1);

  /* ---------- frases para grabar voz (todas las del ciclo) ---------- */
  function allPhrases() {
    const set = new Set(); const addS = x => { if (x && typeof x === 'string') set.add(x.trim()); };
    Object.values(SAY).forEach(addS); Object.values(LETRA).forEach(addS); NUM.forEach(addS);
    B.emociones.forEach(e => { addS(e.say); addS(e.w); }); B.pausas.forEach(p => addS(p.t)); B.respira.forEach(p => addS(p.t));
    G.proyectos.forEach(p => { addS(p.intro); addS(p.pregunta); p.canto.forEach(addS); p.fuera.forEach(addS); });
    const walk = a => { addS(a.intro); (a.say || []).forEach(addS); if (a.t) addS(a.t); if (a.proyectoIntro) addS(a.proyectoIntro); if (a.pregunta) addS(a.pregunta);
      (a.rounds || []).forEach(r => { r.say.forEach(addS); addS(r.okSay); (r.opts || []).forEach(o => addS(o.say)); });
      (a.steps || []).forEach(s => addS(s.t)); (a.cards || []).forEach(c => addS(c.w)); (a.lines || []).forEach(addS); (a.items || []).forEach(i => addS(i.w)); (a.groups || []).forEach(g => addS(g.name)); };
    DAYS.forEach(s => plan(s).acts.forEach(walk));
    // todas las variantes posibles de cada plantilla y trimestre (práctica libre)
    for (const s of [DAYS[0], DAYS[90], DAYS[DAYS.length - 1]]) for (const p of G.proyectos) for (let t = 1; t <= 3; t++) for (const k of Object.keys(T)) { if (k === 'nombre') continue; for (let sd = 0; sd < 3; sd++) { const c = { p, t, d: 1, n: 1, s, R: R(rng(s + k + p.id + t + sd)) }; walk(T[k](c)); } }
    return [...set];
  }

  const API = { plan, ficha, info, tipoDia, DAYS, IDX, CAMPO_INFO, PDA, CONT, CAMPO, SAY, LETRA, NUM, allPhrases, iso, parse, addDays, monday, fechaLarga, fechaCorta, nextSchoolDay, prevSchoolDay, trimestreDe, rng, R, T, MESES, DIAS };
  root.GEN = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
