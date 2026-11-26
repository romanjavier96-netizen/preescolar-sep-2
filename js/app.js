/* Mi Día en el Kínder — app (sin red, sin anuncios, sin recolección de datos; todo se guarda en este aparato) */
(function () {
  'use strict';
  const A = window.ART, GEN = window.GEN, GRADE = window.GRADE, CAL = window.CAL, SAY = GEN.SAY;
  const app = document.getElementById('app');
  const APP_NAME = 'Mi Día en el Kínder';
  /* ---------- utilidades ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v; else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) { if (c == null || c === false) continue; el.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return el;
  }
  const svgNode = m => { const t = document.createElement('template'); t.innerHTML = m.trim(); return t.content.firstChild; };
  const T = { ids: new Set(), set(fn, ms) { const id = setTimeout(() => { T.ids.delete(id); try { fn(); } catch (e) { console.error(e); } }, ms); T.ids.add(id); return id; }, every(fn, ms) { const id = setInterval(fn, ms); T.ids.add(id); return id; }, clear() { T.ids.forEach(id => { clearTimeout(id); clearInterval(id); }); T.ids.clear(); } };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const todayISO = () => { const q = new URLSearchParams(location.search).get('fecha'); return q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : GEN.iso(new Date()); };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function toast(msg) { const t = h('div', { class: 'toast', role: 'status' }, msg); document.body.append(t); setTimeout(() => t.remove(), 2600); }
  const CI = GEN.CAMPO_INFO;

  /* ---------- estado local ---------- */
  const KEY = 'mdk2_v1';
  const CHARS = [
    { id: 'teco', name: 'Teco', who: 'el tecolote', color: '#A9743F', pitch: 1.0, rate: 0.9 },
    { id: 'luna', name: 'Luna', who: 'una niña', color: '#8854D0', pitch: 1.35, rate: 0.95 },
    { id: 'leo', name: 'Leo', who: 'un niño', color: '#2E86DE', pitch: 1.15, rate: 0.95 },
    { id: 'axi', name: 'Axi', who: 'el ajolote', color: '#E84393', pitch: 1.45, rate: 1.0 },
  ];
  const charOf = id => CHARS.find(c => c.id === id) || CHARS[0];
  const AVATARS = ['🦊', '🐻', '🐰', '🐼', '🐯', '🦁', '🐸', '🐵', '🐨', '🐶', '🐱', '🦄', '🐢', '🐙', '🦋', '🐞', '🌻', '⚽', '🚀', '🌈'];
  let S = load();
  function blank() { return { v: 1, mode: null, settings: { voice: true, sound: true, character: 'teco', school: '', cct: '', teacher: '', group: '2° A', screenLimit: 20 }, students: {}, current: null, done: {}, feelings: {}, screen: {} }; }
  function load() { try { const x = JSON.parse(localStorage.getItem(KEY) || 'null'); if (x && x.v === 1) { const b = blank(); x.settings = Object.assign(b.settings, x.settings || {}); ['students', 'done', 'feelings', 'screen'].forEach(k => { x[k] = x[k] || {}; }); return x; } } catch (e) {} return blank(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('No se pudo guardar en este aparato.'); } }
  const ST = () => S.students[S.current] || null;
  const uid = () => 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const cleanName = n => String(n || '').replace(/[<>]/g, '').trim().slice(0, 18);
  function addStudent(name, avatar, character) { const id = uid(); S.students[id] = { id, name: cleanName(name) || 'Niña o niño', avatar: avatar || pick(AVATARS), character: character || S.settings.character || 'teco', created: Date.now() }; if (!S.current) S.current = id; save(); return S.students[id]; }
  function removeStudent(id) { delete S.students[id]; delete S.done[id]; delete S.feelings[id]; delete S.screen[id]; if (S.current === id) S.current = Object.keys(S.students)[0] || null; save(); }
  const doneOf = (sid, actId) => ((S.done[sid] || {})[actId]) || null;
  function markDone(act, stars, date) { const st = ST(); if (!st) return; const d = (S.done[st.id] = S.done[st.id] || {}); const prev = d[act.id]; if (!prev || prev.stars < stars) d[act.id] = { stars, date, key: act.key, campo: act.campo, pda: act.pda || [], t: Date.now() }; save(); }
  const totalStars = sid => Object.values(S.done[sid] || {}).reduce((a, x) => a + (x.stars || 0), 0);
  function addScreen(secs, date) { const st = ST(); if (!st) return; const m = (S.screen[st.id] = S.screen[st.id] || {}); m[date] = (m[date] || 0) + secs; save(); }
  let previewChar = null;
  const charId = () => previewChar || (ST() && ST().character) || S.settings.character || 'teco';

  /* ---------- sonidos (Web Audio) ---------- */
  let actx = null;
  function ac() { if (!S.settings.sound) return null; try { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; actx = new C(); } if (actx.state === 'suspended') actx.resume(); return actx; } catch (e) { return null; } }
  function tone(f, st, dur, type = 'sine', vol = 0.14) { const a = ac(); if (!a) return; try { const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + st; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05); } catch (e) {} }
  const SFX = { tap() { tone(700, 0, 0.07, 'triangle', 0.08); }, good() { [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.26, 'triangle')); }, bad() { tone(330, 0, 0.18, 'sine', 0.1); tone(262, 0.13, 0.25, 'sine', 0.08); }, win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.13)); }, clap() { const a = ac(); if (!a) return; try { const len = a.sampleRate * 0.08, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); const s = a.createBufferSource(), g = a.createGain(); g.gain.value = 0.5; s.buffer = buf; s.connect(g); g.connect(a.destination); s.start(); } catch (e) {} } };

  /* ---------- voz: audio pregrabado por personaje + respaldo con la voz del sistema ---------- */
  let ttsNative = null;
  try { const Cap = window.Capacitor; if (Cap && Cap.isNativePlatform && Cap.isNativePlatform()) ttsNative = (Cap.Plugins && Cap.Plugins.TextToSpeech) || null; } catch (e) {}
  const V = { gen: 0, q: [], busy: false, hl: null };
  let CLIPS = null, AU = null, started = false; const CLIPS_CACHE = {};
  function loadClips(cid, cb) { cid = cid || charId(); if (CLIPS_CACHE[cid]) { CLIPS = CLIPS_CACHE[cid]; cb && cb(); return; } fetch('audio/' + cid + '/manifest.json').then(r => { if (!r.ok) throw 0; return r.json(); }).then(m => { CLIPS_CACHE[cid] = m; if (charId() === cid) CLIPS = m; cb && cb(); }).catch(() => cb && cb()); }
  loadClips(charId());
  let VOICES = []; const loadVoices = () => { try { VOICES = (window.speechSynthesis && speechSynthesis.getVoices()) || []; } catch (e) { VOICES = []; } };
  try { loadVoices(); window.speechSynthesis && speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch (e) {}
  const emit = (text, via) => { try { document.dispatchEvent(new CustomEvent('mh-say', { detail: { text, via } })); } catch (e) {} };
  function unhl() { if (V.hl) { try { V.hl.classList.remove('reading'); } catch (e) {} V.hl = null; } }
  function engineCancel() { try { if (AU) { AU.onended = AU.onerror = AU.onloadedmetadata = null; AU.pause(); } } catch (e) {} try { if (ttsNative) ttsNative.stop().catch(() => {}); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }
  function stopSpeech() { V.gen++; V.q = []; V.busy = false; unhl(); engineCancel(); }
  function say(items, opt) { const list = [].concat(items).filter(Boolean).map(x => typeof x === 'string' ? { text: x } : x).filter(x => x.text); if (!(opt && opt.queue)) stopSpeech(); if (!started || !S.settings.voice || !list.length) return; V.q.push(...list); if (!V.busy) pump(); }
  const isSpeaking = () => V.busy;
  function pump() {
    unhl(); const it = V.q.shift(); if (!it) { V.busy = false; return; }
    V.busy = true; const g = V.gen; let fin = false, failed = false, safety = null;
    const next = () => { if (fin || g !== V.gen) return; fin = true; clearTimeout(safety); pump(); };
    const arm = ms => { clearTimeout(safety); safety = setTimeout(next, ms); };
    if (it.el) { V.hl = it.el; try { it.el.classList.add('reading'); } catch (e) {} }
    const file = CLIPS && CLIPS[it.text.trim()];
    const fallback = () => { if (failed || fin || g !== V.gen) return; failed = true; tts(it.text, next, arm, g); };
    if (!file) return tts(it.text, next, arm, g);
    emit(it.text, 'clip'); arm(15000);
    try { if (!AU) AU = new Audio(); AU.onended = next; AU.onerror = fallback; AU.onloadedmetadata = () => { if (isFinite(AU.duration)) arm(AU.duration * 1000 + 2500); }; AU.src = 'audio/' + charId() + '/' + file; const pr = AU.play(); if (pr && pr.catch) pr.catch(fallback); } catch (e) { fallback(); }
  }
  function tts(text, next, arm, g) {
    emit(text, 'tts'); arm(4000 + text.length * 150);
    try { const ch = charOf(charId());
      if (ttsNative) { Promise.resolve(ttsNative.speak({ text, lang: 'es-MX', rate: ch.rate, pitch: ch.pitch, volume: 1, category: 'playback', queueStrategy: 0 })).then(next, next); return; }
      const ss = window.speechSynthesis; if (!ss || !window.SpeechSynthesisUtterance) return setTimeout(next, 0);
      if (!VOICES.length) loadVoices(); const u = new SpeechSynthesisUtterance(text);
      const v = VOICES.find(x => /^es[-_]MX/i.test(x.lang)) || VOICES.find(x => /^es[-_](US|419)/i.test(x.lang)) || VOICES.find(x => /^es/i.test(x.lang));
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'es-MX'; u.rate = ch.rate; u.pitch = ch.pitch; u.onend = next; u.onerror = next; V.u = u;
      const go = () => { if (g !== V.gen) return; try { ss.resume(); ss.speak(u); } catch (e) { next(); } }; if (ss.speaking || ss.pending) setTimeout(go, 60); else go();
    } catch (e) { setTimeout(next, 0); }
  }
  function afterSpeech(fn, minMs) { let w = 0; const chk = () => { if (isSpeaking() && w < 12000) { w += 200; T.set(chk, 200); } else fn(); }; T.set(chk, minMs || 300); }
  function unlockAudio() { started = true; ac(); try { if (!AU) AU = new Audio(); } catch (e) {} try { if (!ttsNative && window.speechSynthesis && window.SpeechSynthesisUtterance) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {} }
  function testSound() { unlockAudio(); SFX.good(); say([SAY.probar]); }

  /* ---------- navegación ---------- */
  let CUR_DATE = todayISO(), repeatFn = null, actStart = 0, actDate = null;
  function go(fn, ...args) { if (previewChar) { previewChar = null; CLIPS = null; loadClips(); } T.clear(); stopSpeech(); closeOverlays(); flushScreen(); repeatFn = null; app.innerHTML = ''; window.scrollTo(0, 0); fn(...args); }
  function flushScreen() { if (actStart && actDate) { addScreen(Math.round((Date.now() - actStart) / 1000), actDate); } actStart = 0; actDate = null; }
  function closeOverlays() { document.querySelectorAll('.overlay').forEach(o => o.remove()); }
  const starIcon = () => svgNode(A.icon.star);
  function header(opts) {
    const st = ST(); const school = S.settings.school;
    const top = h('div', { class: 'top' },
      h('div', { class: 'brand' }, h('div', { class: 'logo', html: A.character(charId(), 'happy') }), h('div', { style: 'min-width:0' }, h('b', { 'data-testid': 'brand' }, school ? '🏫 ' + school : APP_NAME), h('small', {}, (school ? APP_NAME + ' · ' : '') + GRADE.nombreGrado + (S.settings.group && S.mode === 'escuela' ? ' · Grupo ' + S.settings.group : '')))),
      st ? h('button', { class: 'chip', 'data-testid': 'student-chip', 'aria-label': 'Cambiar de niña o niño', onclick: () => { SFX.tap(); go(pickStudent); } }, h('div', { class: 'av', style: 'display:grid;place-items:center;font-size:28px' }, st.avatar), h('span', {}, st.name)) : null,
      st ? h('div', { class: 'stars glass', 'data-testid': 'total' }, starIcon(), h('b', {}, totalStars(st.id))) : null,
      h('button', { class: 'adult', 'data-testid': 'adult-btn', onclick: () => gate(() => { adultTab = null; go(adultPanel); }) }, S.mode === 'casa' ? '👪 Papás' : '👩‍🏫 Maestra'));
    if (opts && opts.back) top.prepend(h('button', { class: 'btn-round', 'aria-label': 'Regresar', 'data-testid': 'back', onclick: () => { SFX.tap(); go(opts.back); } }, svgNode(A.icon.back)));
    return top;
  }
  /* ---------- puerta para adultos ---------- */
  function gate(onOk) {
    const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 5); let typed = '';
    const shown = h('div', { style: 'font-size:34px;font-weight:900;min-height:44px', 'data-testid': 'gate-typed' }, '');
    const ov = h('div', { class: 'overlay', 'data-testid': 'gate' }, h('div', { class: 'gate-card' },
      h('div', { style: 'font-size:40px' }, '🔒'), h('b', { style: 'font-size:20px' }, 'Solo para adultos'), h('div', { class: 'muted' }, 'Escribe el resultado:'),
      h('div', { style: 'font-size:30px;font-weight:900', 'data-testid': 'gate-q', 'data-answer': String(a + b) }, a + ' + ' + b + ' = ?'), shown,
      h('div', { class: 'keypad' }, ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => h('button', { 'data-k': n, onclick: () => { typed += n; shown.textContent = typed; if (typed.length >= String(a + b).length) { if (+typed === a + b) { ov.remove(); onOk(); } else { typed = ''; shown.textContent = '✗'; SFX.bad(); } } } }, n))),
      h('button', { class: 'btn ghost', onclick: () => ov.remove() }, 'Cancelar')));
    document.body.append(ov);
  }
  /* ---------- pantalla de inicio (desbloquea el audio) ---------- */
  function startScreen() {
    const el = h('div', { class: 'start-screen', 'data-testid': 'start-screen' },
      h('div', { class: 'start-owl', html: A.character(charId(), 'happy') }),
      h('h1', {}, 'Mi Día en el ', h('span', {}, 'Kínder')),
      h('div', { class: 'sub' }, GRADE.nombreGrado + ' · Actividades para cada día del ciclo ' + CAL.ciclo + ', alineadas al programa de la SEP (Nueva Escuela Mexicana).'),
      h('button', { class: 'btn primary start-btn', 'data-testid': 'start', onclick: () => { unlockAudio(); el.remove(); SFX.tap(); if (!S.mode) go(setupMode); else if (!ST()) go(S.mode === 'escuela' ? pickStudent : setupStudent); else { go(home); } } }, '🔊 ' + SAY.empezar),
      h('button', { class: 'btn small', 'data-testid': 'test-sound', onclick: e => { e.stopPropagation(); testSound(); } }, '🔈 Probar sonido'));
    document.body.append(el);
  }
  /* ---------- configuración inicial ---------- */
  function setupMode() {
    app.append(h('div', { class: 'screen' }, h('div', { class: 'panel', style: 'max-width:640px;margin:4vh auto;text-align:center' },
      h('div', { style: 'width:120px;height:130px;margin:0 auto', html: A.character('teco', 'cheer') }),
      h('h2', {}, '¿Dónde vas a usar la app?'),
      h('p', { class: 'muted' }, 'Puedes cambiarlo después en Ajustes.'),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn primary', 'data-testid': 'mode-escuela', style: '--c:#2E86DE', onclick: () => { S.mode = 'escuela'; save(); go(setupSchool); } }, '🏫 En la escuela'),
        h('button', { class: 'btn primary', 'data-testid': 'mode-casa', style: '--c:#20BF6B', onclick: () => { S.mode = 'casa'; save(); go(setupStudent); } }, '🏠 En casa')))));
    say([SAY.hola]);
  }
  function setupSchool() {
    const f = (id, label, val, ph) => h('div', { class: 'field' }, h('label', { for: id }, label), h('input', { id, value: val || '', placeholder: ph || '', maxlength: 60 }));
    app.append(h('div', { class: 'screen' }, h('div', { class: 'panel', style: 'max-width:640px;margin:2vh auto' },
      h('h2', {}, '🏫 Datos de la escuela'), h('p', { class: 'muted' }, 'Se guardan solo en este aparato. El nombre de la escuela aparece arriba en la app.'),
      f('f-school', 'Nombre de la escuela (licencia)', S.settings.school, 'Jardín de Niños …'), f('f-teacher', 'Maestra o maestro', S.settings.teacher, ''), f('f-group', 'Grupo', S.settings.group, '2° A'),
      h('div', { class: 'row' }, h('button', { class: 'btn primary', 'data-testid': 'school-save', onclick: () => { S.settings.school = cleanName2(document.getElementById('f-school').value); S.settings.teacher = cleanName2(document.getElementById('f-teacher').value); S.settings.group = cleanName2(document.getElementById('f-group').value) || '2° A'; save(); go(setupStudent, true); } }, 'Guardar y agregar alumnos')))));
  }
  const cleanName2 = s => String(s || '').replace(/[<>]/g, '').trim().slice(0, 60);
  function setupStudent(fromSchool) {
    let avatar = pick(AVATARS), character = S.settings.character || 'teco';
    const list = h('div', { class: 'row', style: 'margin:8px 0' });
    const refresh = () => { list.innerHTML = ''; Object.values(S.students).forEach(s => list.append(h('span', { class: 'chip', style: 'padding:6px 12px' }, s.avatar + ' ' + s.name))); };
    const avRow = h('div', { class: 'row' }, ...AVATARS.map(a => h('button', { class: 'btn-round', 'data-av': a, onclick: e => { avatar = a; avRow.querySelectorAll('button').forEach(b => b.style.outline = ''); e.currentTarget.style.outline = '4px solid #FFC312'; SFX.tap(); } }, a)));
    const chRow = h('div', { class: 'char-row' }, ...CHARS.map(c => h('button', { class: 'char-card' + (c.id === character ? ' sel' : ''), style: '--c:' + c.color, 'data-char': c.id, onclick: e => { character = c.id; chRow.querySelectorAll('.char-card').forEach(b => b.classList.remove('sel')); e.currentTarget.classList.add('sel'); previewChar = c.id; CLIPS = null; loadClips(c.id, () => { if (previewChar === c.id) say([SAY[c.id]]); }); } }, h('div', { class: 'cv', html: A.character(c.id, 'happy') }), c.name)));
    const school = S.mode === 'escuela';
    app.append(h('div', { class: 'screen' }, h('div', { class: 'panel', style: 'max-width:760px;margin:2vh auto' },
      h('h2', {}, school ? '👧👦 Alumnos del grupo' : '👧👦 ¿Quién va a jugar?'),
      h('p', { class: 'muted' }, school ? 'Agrega a cada niña y niño. Puedes usar solo el nombre o un apodo. No se envía nada a internet.' : 'Escribe el nombre o apodo de tu hija o hijo.'),
      list,
      h('div', { class: 'field' }, h('label', { for: 'f-name' }, 'Nombre o apodo'), h('input', { id: 'f-name', maxlength: 18, placeholder: 'Ej. Sofi', 'data-testid': 'student-name' })),
      h('div', { class: 'field' }, h('label', {}, 'Avatar'), avRow),
      h('div', { class: 'field' }, h('label', {}, 'Personaje que le habla'), chRow),
      h('div', { class: 'row', style: 'margin-top:10px' },
        h('button', { class: 'btn primary', 'data-testid': 'student-add', onclick: () => { const n = document.getElementById('f-name').value; if (!cleanName(n)) { toast('Escribe un nombre'); return; } previewChar = null; const s = addStudent(n, avatar, character); S.current = s.id; CLIPS = null; loadClips(character); S.settings.character = character; save(); document.getElementById('f-name').value = ''; refresh(); toast('Agregado: ' + s.name); SFX.good(); } }, '＋ Agregar'),
        h('button', { class: 'btn', 'data-testid': 'student-done', onclick: () => { if (!Object.keys(S.students).length) { toast('Agrega al menos una niña o niño'); return; } go(school ? pickStudent : home); } }, 'Listo ✓')))));
    refresh();
  }
  function pickStudent() {
    const sts = Object.values(S.students);
    if (!sts.length) return setupStudent();
    app.append(h('div', { class: 'screen' }, header({ back: home }),
      h('div', { class: 'panel' }, h('h2', {}, '¿Quién eres?'), h('div', { class: 'students' }, ...sts.map(s => h('button', { class: 'student', 'data-testid': 'student-' + s.id, onclick: () => { S.current = s.id; save(); loadClips(s.character); SFX.good(); go(home); } }, h('div', { class: 'av', style: 'display:grid;place-items:center;font-size:48px' }, s.avatar), s.name, h('small', { class: 'muted' }, '⭐ ' + totalStars(s.id))))))));
    say([SAY.quienEres]);
  }

  /* ---------- HOY ---------- */
  const triName = n => ['', 'primer', 'segundo', 'tercer'][n] + ' trimestre';
  function home(practiceOf) {
    if (!ST()) return go(S.mode === 'escuela' ? pickStudent : setupStudent);
    const date = practiceOf || CUR_DATE; const pl = GEN.plan(date); const st = ST();
    const isToday = date === todayISO();
    const scr = h('div', { class: 'screen' }, header());
    if (pl.tipo !== 'clase') { scr.append(noClass(pl)); app.append(scr); return; }
    const p = pl.proyecto;
    const acts = pl.acts; const doneIdx = acts.map(a => !!doneOf(st.id, a.id)); const nextI = doneIdx.indexOf(false);
    const left = h('div', { class: 'card daycard', 'data-testid': 'daycard' },
      h('div', { class: 'date', 'data-testid': 'date' }, (practiceOf ? '🔁 Práctica · ' + pl.fechaLarga : isToday ? 'Hoy, ' + pl.fechaLarga : cap(pl.fechaLarga))),
      h('div', { class: 'meta' }, 'Día ' + pl.n + ' de ' + pl.total + ' · ' + cap(triName(pl.trimestre)) + ' · ⏱️ ~' + pl.minutos + ' min de pantalla'),
      h('div', { class: 'proj' }, h('div', { class: 'pe' }, p.e), h('div', {}, h('div', { class: 'muted', style: 'font-size:13px' }, 'Proyecto de la semana'), h('h2', { 'data-testid': 'project' }, p.titulo), h('p', {}, p.pregunta))),
      pl.efemeride ? h('div', { class: 'efem', 'data-testid': 'efemeride' }, '📅 ' + pl.efemeride) : null,
      h('div', { class: 'mascot' }, h('div', { class: 'm', html: A.character(charId(), nextI === -1 ? 'cheer' : 'happy') }), h('div', { class: 'bubble' }, nextI === -1 ? '¡Terminaste todo! Ahora a jugar afuera.' : '¡Hola, ' + st.name + '! ' + (nextI === 0 ? 'Empecemos.' : 'Sigue con la actividad ' + (nextI + 1) + '.'))),
      nextI === -1 ? null : h('button', { class: 'btn primary go', 'data-testid': 'go', style: '--c:#FF7A59', onclick: () => { SFX.tap(); go(runAct, date, nextI); } }, '▶ ' + (nextI === 0 ? 'Empezar' : 'Seguir')),
      h('div', { class: 'row', style: 'margin-top:10px' },
        h('button', { class: 'btn small', 'data-testid': 'open-cal', onclick: () => go(calendar, date) }, '📅 Calendario'),
        !isToday ? h('button', { class: 'btn small', onclick: () => { CUR_DATE = todayISO(); go(home); } }, '⤺ Hoy') : null,
        h('button', { class: 'btn small', 'data-testid': 'practice', onclick: () => go(practice) }, '🎲 Práctica libre')));
    const path = h('div', { class: 'path', 'data-testid': 'path' }, ...acts.map((a, i) => { const d = doneOf(st.id, a.id); const c = CI[a.campo].color;
      return h('button', { class: 'tile' + (d ? ' is-done' : '') + (i === nextI ? ' next' : ''), style: '--c:' + c, 'data-testid': 'act-' + i, 'data-key': a.key, onclick: () => { SFX.tap(); go(runAct, date, i); } },
        h('span', { class: 'num' }, i + 1), d ? h('span', { class: 'done' }, '★'.repeat(d.stars)) : null, h('div', { class: 'te' }, a.e), h('div', { class: 'tt' }, a.titulo), h('div', { class: 'tc' }, CI[a.campo].corto)); }));
    scr.append(h('div', { class: 'today' }, left, h('div', {}, path)));
    app.append(scr);
    repeatFn = () => say([nextI === -1 ? SAY.diaCompleto : SAY.hoy]);
    if (started) repeatFn();
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function noClass(pl) {
    const nx = GEN.nextSchoolDay(pl.fecha > CAL.fin ? CAL.inicio : pl.fecha);
    const icon = { finde: '🛝', vacaciones: '🏖️', festivo: '🎉', cte: '👩‍🏫', registro: '📋', antes: '🎒', despues: '🏖️' }[pl.tipo] || '📅';
    const el = h('div', { class: 'card', style: 'max-width:720px;margin:0 auto;text-align:center', 'data-testid': 'noclass' },
      h('div', { style: 'font-size:80px' }, icon), h('h2', { 'data-testid': 'noclass-title' }, 'Hoy no hay clases'), h('p', { style: 'font-size:20px;font-weight:900' }, pl.nombre), pl.efemeride ? h('div', { class: 'efem' }, '📅 ' + pl.efemeride) : null,
      h('p', { class: 'muted' }, cap(pl.fechaLarga)),
      h('div', { class: 'row', style: 'justify-content:center;margin-top:12px' },
        h('button', { class: 'btn primary', 'data-testid': 'practice', style: '--c:#20BF6B', onclick: () => go(practice) }, '🎲 Práctica libre'),
        nx ? h('button', { class: 'btn', 'data-testid': 'next-day', onclick: () => { CUR_DATE = nx; go(home); } }, '➡️ Próximo día de clases: ' + GEN.fechaCorta(nx)) : null,
        h('button', { class: 'btn', onclick: () => go(calendar, pl.fecha) }, '📅 Calendario')));
    say([SAY.sinClase, pl.nombre]);
    return el;
  }
  function practice() { const base = GEN.prevSchoolDay(CUR_DATE) || GEN.DAYS[0]; const pool = GEN.DAYS.filter(d => d <= base); const d = pool.length > 3 ? pick(pool.slice(-25)) : pick(GEN.DAYS.slice(0, 10)); go(home, d); say([SAY.practica]); }

  /* ---------- CALENDARIO ---------- */
  function calendar(focus) {
    focus = focus || CUR_DATE; const d0 = GEN.parse(focus); let y = d0.getFullYear(), m = d0.getMonth();
    const scr = h('div', { class: 'screen' }, header({ back: home })); const box = h('div', { class: 'panel', 'data-testid': 'calendar' }); scr.append(box); app.append(scr);
    const st = ST();
    function draw() {
      box.innerHTML = ''; const first = new Date(y, m, 1, 12); const offset = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate();
      box.append(h('div', { class: 'cal-head' }, h('button', { class: 'btn-round', 'aria-label': 'Mes anterior', 'data-testid': 'cal-prev', onclick: () => { m--; if (m < 0) { m = 11; y--; } draw(); } }, '◀'), h('h2', { 'data-testid': 'cal-month' }, GEN.MESES[m] + ' ' + y), h('button', { class: 'btn-round', 'aria-label': 'Mes siguiente', 'data-testid': 'cal-next', onclick: () => { m++; if (m > 11) { m = 0; y++; } draw(); } }, '▶')));
      const grid = h('div', { class: 'cal' }, ...['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => h('div', { class: 'wd' }, x)));
      for (let i = 0; i < offset; i++) grid.append(h('div'));
      for (let dd = 1; dd <= days; dd++) { const s = GEN.iso(new Date(y, m, dd, 12)); const inf = GEN.info(s); const pl = inf.tipo === 'clase' ? GEN.plan(s) : null; const nDone = pl && st ? pl.acts.filter(a => doneOf(st.id, a.id)).length : 0;
        grid.append(h('button', { class: 'cal-day ' + inf.tipo + (s === todayISO() ? ' today' : '') + (s === CUR_DATE ? ' sel' : ''), 'data-date': s, title: inf.nombre + (inf.efemeride ? ' · ' + inf.efemeride : ''), onclick: () => { CUR_DATE = s; SFX.tap(); go(home); } }, dd, h('small', {}, inf.tipo === 'clase' ? inf.proyecto.e : inf.tipo === 'festivo' ? '🎉' : inf.tipo === 'vacaciones' ? '🏖️' : inf.tipo === 'cte' ? '👩‍🏫' : inf.tipo === 'registro' ? '📋' : ''), pl && nDone ? h('span', { class: 'ck' }, nDone === pl.acts.length ? '✔✔' : '✔') : null)); }
      box.append(grid, h('div', { class: 'legend' }, h('span', {}, h('i', { style: 'background:#2E86DE' }), 'Clases'), h('span', {}, h('i', { style: 'background:#FFD6D6' }), 'Suspensión de labores'), h('span', {}, h('i', { style: 'background:#F5D0E0' }), 'Consejo Técnico'), h('span', {}, h('i', { style: 'background:#CFE8FF' }), 'Registro de calificaciones'), h('span', {}, h('i', { style: 'background:#E2E2E2' }), 'Vacaciones')),
        h('p', { class: 'muted', style: 'font-size:13px' }, 'Calendario escolar oficial ' + CAL.ciclo + ' (SEP, DOF 15-jul-2026): ' + GEN.DAYS.length + ' días de clase, del ' + GEN.fechaCorta(CAL.inicio) + ' de 2026 al ' + GEN.fechaCorta(CAL.fin) + ' de 2027.'));
    }
    draw();
  }

  /* ---------- ACTIVIDADES ---------- */
  const praise = () => SAY['bien' + (1 + Math.floor(Math.random() * 6))];
  const retry = () => SAY['otra' + (1 + Math.floor(Math.random() * 3))];
  let warnedScreen = false;
  function screenToday() { const st = ST(); return st ? ((S.screen[st.id] || {})[todayISO()] || 0) : 0; }
  function runAct(date, i) {
    const pl = GEN.plan(date); const act = pl.acts[i]; if (!act) return go(home);
    const practiceOf = date === CUR_DATE ? undefined : date;
    const ctx = { date, i, act, pl, errors: 0, back: () => go(home, practiceOf) };
    const dots = h('div', { class: 'dots', 'data-testid': 'dots' });
    const stage = h('div', { class: 'stage', 'data-testid': 'stage', 'data-act': act.key, 'data-tipo': act.tipo });
    const top = h('div', { class: 'act-top' },
      h('button', { class: 'btn-round', 'aria-label': 'Regresar', 'data-testid': 'back', onclick: () => { SFX.tap(); ctx.back(); } }, svgNode(A.icon.back)),
      h('div', { class: 'act-title' }, h('span', { style: 'font-size:30px' }, act.e), h('div', {}, h('b', {}, act.titulo), h('small', { class: 'muted', style: 'display:block;color:' + CI[act.campo].color }, CI[act.campo].nombre + ' · ' + (i + 1) + ' de ' + pl.acts.length))),
      dots,
      h('button', { class: 'btn-round', 'aria-label': 'Escuchar otra vez', 'data-testid': 'repeat', onclick: () => { SFX.tap(); repeatFn && repeatFn(); } }, svgNode(A.icon.speaker)));
    app.append(h('div', { class: 'screen act' }, top, stage));
    ctx.stage = stage; ctx.dots = dots;
    ctx.setDots = (n, k) => { dots.innerHTML = ''; for (let j = 0; j < n; j++) dots.append(h('i', { class: j < k ? 'on' : j === k ? 'cur' : '' })); };
    ctx.finish = (stars) => finishAct(ctx, stars == null ? (ctx.errors === 0 ? 3 : ctx.errors <= 2 ? 2 : 1) : stars);
    ctx.bad = () => { ctx.errors++; SFX.bad(); say([retry()]); };
    if (act.tipo !== 'fuera') { actStart = Date.now(); actDate = todayISO(); }
    const R = RENDER[act.tipo] || RENDER.choice; R(ctx);
    if (!warnedScreen && act.tipo !== 'fuera' && screenToday() > (S.settings.screenLimit || 20) * 60) { warnedScreen = true; T.set(() => screenWarn(), 400); }
  }
  function screenWarn() {
    const ov = h('div', { class: 'overlay', 'data-testid': 'screen-warn' }, h('div', { class: 'reward-card' }, h('div', { style: 'width:120px;height:130px', html: A.character(charId(), 'happy') }), h('b', { style: 'font-size:22px' }, '¡Hora de descansar los ojos!'), h('p', {}, SAY.muySeguido),
      h('button', { class: 'btn primary', onclick: () => { ov.remove(); go(home); } }, '🏃 Ir a jugar'), h('button', { class: 'btn small ghost', onclick: () => gate(() => ov.remove()) }, 'Un adulto permite seguir')));
    document.body.append(ov); say([SAY.muySeguido]);
  }
  function finishAct(ctx, stars) {
    const { act, pl, i, date } = ctx; markDone(act, stars, date); flushScreen();
    const last = i >= pl.acts.length - 1; const st = ST();
    const allDone = pl.acts.every(a => doneOf(st.id, a.id));
    if (allDone) SFX.win(); else SFX.good();
    const ov = h('div', { class: 'overlay', 'data-testid': 'reward' }, h('div', { class: 'reward-card' },
      h('div', { style: 'width:130px;height:140px', html: A.character(charId(), 'cheer') }),
      h('div', { class: 'reward-stars', 'data-testid': 'reward-stars', 'data-stars': stars }, ...[1, 2, 3].map(k => h('span', { style: 'width:52px;height:52px;display:inline-block;opacity:' + (k <= stars ? 1 : .2) }, svgNode(A.icon.star)))),
      h('b', { style: 'font-size:22px' }, allDone ? '¡Día completo! 🎉' : '¡Muy bien, ' + st.name + '!'),
      allDone ? h('p', {}, 'Para casa: ' + pl.casa) : null,
      h('div', { class: 'row', style: 'justify-content:center' },
        !last ? h('button', { class: 'btn primary', 'data-testid': 'next', style: '--c:#FF7A59', onclick: () => go(runAct, date, i + 1) }, 'Siguiente ▶') : null,
        h('button', { class: 'btn', 'data-testid': 'to-home', onclick: () => go(home, date === CUR_DATE ? undefined : date) }, '🏠 Inicio'))));
    document.body.append(ov);
    say([allDone ? SAY.diaCompleto : SAY.terminado]);
  }
  const RENDER = {};
  /* opción múltiple genérica */
  function optNode(o) {
    const kids = [];
    if (o.face) kids.push(h('div', { class: 'fs', style: 'width:clamp(70px,18vw,100px);height:clamp(70px,18vw,100px)', html: A.face(o.face) }));
    else if (o.shape) kids.push(h('div', { class: 'os', html: A.shape(o.shape, o.color || '#2E86DE') }));
    else if (o.coin) kids.push(h('div', { class: 'coin', html: coinSvg(o.coin) }));
    else if (o.glass != null) kids.push(h('div', { class: 'glassv', html: glassSvg(o.glass) }));
    else if (o.bar != null) kids.push(h('div', { class: 'barbox' }, h('div', { class: 'bar', style: 'width:' + o.bar + '%;background:' + (o.color || '#FFC312') })));
    else if (o.scene) kids.push(sceneNode(o.scene));
    else if (o.dot) kids.push(h('span', { class: 'dot', style: 'background:' + o.dot + ';width:70px;height:70px' }));
    else if (o.n) kids.push(h('div', { class: 'grp' }, ...Array.from({ length: o.n }, () => h('span', {}, o.e))));
    else if (o.num != null) kids.push(h('span', { class: 'on' }, String(o.num)));
    else if (o.e) kids.push(h('span', { class: 'oe', style: o.scale ? 'font-size:' + Math.round(70 * o.scale) + 'px' : '' }, o.e));
    if (o.label && !o.shape) kids.push(o.first ? h('span', { class: 'ol word', style: 'font-size:clamp(18px,3.4vw,24px)' }, h('span', { class: 'f' }, o.label.charAt(0)), o.label.slice(1)) : h('span', { class: 'ol' }, o.label));
    return kids;
  }
  function coinSvg(v) { const big = v >= 5; const fill = v === 10 ? '#E0C068' : v === 5 ? '#C9CCD1' : '#D9B26A'; return '<svg viewBox="0 0 100 100" class="art"><circle cx="50" cy="50" r="46" fill="' + (v === 10 ? '#C9CCD1' : fill) + '" stroke="#8A7348" stroke-width="4"/>' + (v === 10 ? '<circle cx="50" cy="50" r="31" fill="#E0C068" stroke="#8A7348" stroke-width="2"/>' : '') + '<text x="50" y="' + (big ? 64 : 66) + '" text-anchor="middle" font-size="' + (v === 10 ? 36 : 44) + '" font-weight="900" fill="#5D4037" font-family="sans-serif">$' + v + '</text></svg>'; }
  function glassSvg(p) { const y = 100 - p; return '<svg viewBox="0 0 80 110" class="art"><path d="M8 6 L72 6 L64 104 L16 104 Z" fill="rgba(255,255,255,.7)" stroke="#5D7A8C" stroke-width="4"/><clipPath id="gc' + p + '"><path d="M8 6 L72 6 L64 104 L16 104 Z"/></clipPath><rect x="0" y="' + (6 + y * 0.98) + '" width="80" height="110" fill="#4FC3F7" clip-path="url(#gc' + p + ')"/></svg>'; }
  function sceneNode(sc) { const P = { arriba: 'left:51px;top:-4px', abajo: 'left:51px;top:92px', dentro: 'left:51px;top:46px', 'al lado': 'left:100px;top:50px' };
    return h('div', { class: 'scene', style: 'width:150px;height:132px' }, h('div', { class: 'box', style: 'left:40px;top:40px;width:66px;height:50px' }), h('span', { class: 'ob', style: P[sc.pos] + (sc.pos === 'dentro' ? ';font-size:30px' : '') }, sc.e)); }
  function showNode(sh, ctx) {
    if (!sh) return null;
    if (sh.type === 'big') { const lbl = sh.clap ? h('div', { class: 'word' }, sh.clap.join(' · ')) : sh.first ? h('div', { class: 'word' }, h('span', { class: 'f' }, sh.label.charAt(0)), sh.label.slice(1)) : sh.label ? h('div', { class: 'word' }, sh.label) : null;
      const box = h('div', { class: 'show', style: 'flex-direction:column' }, h('div', { class: 'big' }, sh.e), lbl);
      if (sh.clap) box.append(h('button', { class: 'btn clapbtn', 'data-testid': 'clap-demo', onclick: () => { sh.clap.forEach((s, k) => T.set(() => SFX.clap(), k * 450)); say([sh.clap.join(', ')]); } }, '👏 Aplaudir'));
      return box; }
    if (sh.type === 'count') { let k = 0; const grid = h('div', { class: 'count-grid' }); for (let j = 0; j < sh.n; j++) { const b = h('button', { class: 'cnt', 'aria-label': 'contar', onclick: () => { if (b.classList.contains('tapped')) return; k++; b.classList.add('tapped'); b.append(h('b', {}, k)); SFX.tap(); say([GEN.NUM[k] || String(k)]); } }, sh.e); grid.append(b); } return grid; }
    if (sh.type === 'add' || sh.type === 'sub') { const g = n => h('div', { class: 'grp glass', style: 'padding:10px;border-radius:20px' }, ...Array.from({ length: n }, () => h('span', {}, sh.e)));
      if (sh.type === 'add') return h('div', { class: 'show' }, g(sh.a), h('span', { class: 'plus' }, '+'), g(sh.b));
      return h('div', { class: 'show' }, h('div', { class: 'grp glass', style: 'padding:10px;border-radius:20px' }, ...Array.from({ length: sh.a }, (_, j) => h('span', { style: j >= sh.a - sh.b ? 'opacity:.25;text-decoration:line-through' : '' }, sh.e))), h('span', { class: 'plus' }, '−' + sh.b)); }
    if (sh.type === 'pattern') return h('div', { class: 'seq' }, ...sh.seq.map(x => x.dot ? h('span', { class: 'dot', style: 'background:' + x.dot }) : h('span', { class: 'it' }, x.e)), h('span', { class: 'q' }, '?'));
    if (sh.type === 'coins') return h('div', { class: 'show' }, ...sh.coins.map(v => h('div', { class: 'coin', html: coinSvg(v) })));
    return null;
  }
  RENDER.choice = (ctx) => {
    const { act, stage } = ctx; const rounds = act.rounds || []; let r = 0;
    const next = () => { if (r >= rounds.length) return ctx.finish(); draw(rounds[r]); };
    function draw(rd) {
      stage.innerHTML = ''; ctx.setDots(rounds.length, r); let locked = false;
      const prompt = h('div', { class: 'prompt', 'data-testid': 'prompt' }, rd.say[0]);
      const opts = h('div', { class: 'opts' + (rd.wide ? ' wide' : ''), style: 'grid-template-columns:repeat(' + Math.min(rd.opts.length, rd.opts.length === 4 ? 2 : rd.opts.length) + ',minmax(0,1fr))' });
      const nodes = rd.opts.map((o, k) => { const b = h('button', { class: 'opt glass', 'data-ok': o.ok ? '1' : '0', 'data-testid': 'opt-' + k, onclick: () => {
        if (locked || b.classList.contains('bad')) return;
        if (o.ok) { locked = true; b.classList.add('good'); SFX.good(); say([rd.okSay, praise()].filter(Boolean)); r++; afterSpeech(next, 900); }
        else { b.classList.add('bad'); ctx.bad(); }
      } }, ...optNode(o)); opts.append(b); return b; });
      stage.append(prompt, showNode(rd.show, ctx) || '', opts);
      const items = (r === 0 && act.intro ? [act.intro] : []).concat(rd.say);
      const speak = () => { say(items); if (rd.readOpts) rd.opts.forEach((o, k) => o.say && say([{ text: o.say, el: nodes[k] }], { queue: true })); };
      repeatFn = () => { say(rd.say); if (rd.readOpts) rd.opts.forEach((o, k) => o.say && say([{ text: o.say, el: nodes[k] }], { queue: true })); };
      speak();
    }
    next();
  };
  /* ordenar un cuento */
  RENDER.orden = (ctx) => {
    const { act, stage } = ctx; const steps = act.steps; let k = 0;
    const slots = h('div', { class: 'slots' }, ...steps.map((_, j) => h('div', { class: 'slot', 'data-slot': j }, j + 1)));
    const prompt = h('div', { class: 'prompt', 'data-testid': 'prompt' }, SAY.ordenPrimero);
    const cards = h('div', { class: 'opts', style: 'grid-template-columns:repeat(' + Math.min(steps.length, 4) + ',minmax(0,1fr))' });
    const order = shuffle(steps.map((s, j) => j)); if (order.every((x, j) => x === j)) order.reverse();
    order.forEach(j => { const s = steps[j]; const b = h('button', { class: 'opt glass', 'data-ok': '0', 'data-step': j, 'data-testid': 'step-' + j, onclick: () => {
      if (b.classList.contains('gone')) return;
      if (j === k) { const sl = slots.children[k]; sl.innerHTML = ''; sl.classList.add('filled'); sl.append(h('span', { class: 'se' }, s.e), h('small', {}, s.t)); b.classList.add('gone'); b.style.visibility = 'hidden'; SFX.good(); k++;
        if (k >= steps.length) { prompt.textContent = '¡Así pasó el cuento!'; say([praise()].concat(steps.map(x => x.t))); afterSpeech(() => ctx.finish(), 600); }
        else { const q = k === steps.length - 1 ? SAY.ordenFinal : SAY.ordenDespues; prompt.textContent = q; say([q]); ctx.setDots(steps.length, k); } }
      else { b.classList.add('bad'); T.set(() => b.classList.remove('bad'), 450); ctx.bad(); }
    } }, h('span', { class: 'oe' }, s.e), h('span', { class: 'ol' }, s.t)); cards.append(b); });
    stage.append(prompt, slots, cards); ctx.setDots(steps.length, 0);
    say([act.intro, SAY.ordenPrimero]); repeatFn = () => say([prompt.textContent]);
  };
  /* clasificar en dos grupos (tocar o arrastrar) */
  RENDER.sort = (ctx) => {
    const { act, stage } = ctx; const items = act.items; let k = 0;
    const prompt = h('div', { class: 'prompt', 'data-testid': 'prompt' }, act.groups[0].e + ' ' + act.groups[0].name + '  ·  ' + act.groups[1].e + ' ' + act.groups[1].name);
    const holder = h('div', { style: 'min-height:150px;display:grid;place-items:center' });
    const baskets = h('div', { class: 'baskets' }, ...act.groups.map(g => h('button', { class: 'basket', style: '--c:' + (g.id === 'a' ? '#FF7A59' : '#2E86DE'), 'data-g': g.id, 'data-testid': 'basket-' + g.id, onclick: () => drop(g.id) }, h('span', { class: 'be' }, g.e), h('span', {}, g.name), h('div', { class: 'in' }))));
    let cur = null;
    function show() { holder.innerHTML = ''; ctx.setDots(items.length, k); if (k >= items.length) { say([praise()]); afterSpeech(() => ctx.finish(), 700); return; }
      const it = items[k]; cur = h('div', { class: 'sort-item', 'data-testid': 'sort-item', 'data-g': it.g }, it.e); holder.append(cur, h('div', { class: 'sort-name' }, it.w)); drag(cur); }
    function drop(gid) { if (k >= items.length) return; const it = items[k]; const bk = baskets.querySelector('[data-g="' + gid + '"]');
      if (it.g === gid) { bk.querySelector('.in').append(h('span', {}, it.e)); SFX.good(); k++; if (k < items.length) say([SAY.grupoBien, items[k].w]); show(); }
      else { bk.classList.add('hover'); T.set(() => bk.classList.remove('hover'), 400); ctx.errors++; SFX.bad(); say([SAY.grupoMal]); } }
    function drag(el) { let sx, sy, moved = false, ghost = null;
      el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; moved = false; el.setPointerCapture && el.setPointerCapture(e.pointerId); });
      el.addEventListener('pointermove', e => { if (sx == null) return; if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) > 12) { moved = true; ghost = el.cloneNode(true); ghost.classList.add('drag'); document.body.append(ghost); el.style.opacity = '.3'; }
        if (moved && ghost) { ghost.style.left = (e.clientX - 50) + 'px'; ghost.style.top = (e.clientY - 60) + 'px'; baskets.querySelectorAll('.basket').forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('hover', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }); } });
      const end = e => { if (sx == null) return; sx = null; el.style.opacity = ''; if (ghost) { ghost.remove(); ghost = null; } let target = null; baskets.querySelectorAll('.basket').forEach(b => { if (b.classList.contains('hover')) target = b.dataset.g; b.classList.remove('hover'); }); if (moved && target) drop(target); };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); }
    stage.append(prompt, holder, baskets);
    say([act.intro].concat(act.say || [], [items[0].w])); show();
    repeatFn = () => say((act.say || []).concat(k < items.length ? [items[k].w] : []));
  };
  /* memorama */
  RENDER.memory = (ctx) => {
    const { act, stage } = ctx; const cards = act.cards; let open = [], pairs = 0, busy = false; const total = cards.length / 2;
    const grid = h('div', { class: 'mem', style: 'grid-template-columns:repeat(' + (cards.length <= 6 ? 3 : 4) + ',minmax(0,1fr))' });
    cards.forEach((c, j) => { const b = h('button', { class: 'mcard', 'data-id': c.id, 'data-testid': 'card-' + j, 'aria-label': 'carta', onclick: () => {
      if (busy || b.classList.contains('up') || b.classList.contains('ok')) return; b.classList.add('up'); b.textContent = c.e; SFX.tap(); open.push({ b, c });
      if (open.length === 2) { const [x, y] = open; open = []; if (x.c.id === y.c.id) { x.b.classList.add('ok'); y.b.classList.add('ok'); pairs++; ctx.setDots(total, pairs); SFX.good(); say([SAY.pareja, c.w]); if (pairs >= total) afterSpeech(() => ctx.finish(ctx.errors <= total ? 3 : ctx.errors <= total * 2 ? 2 : 1), 600); }
        else { busy = true; ctx.errors++; T.set(() => { [x, y].forEach(o => { o.b.classList.remove('up'); o.b.textContent = '?'; }); busy = false; }, 900); } }
    } }, '?'); grid.append(b); });
    stage.append(h('div', { class: 'prompt' }, SAY.memorama), grid); ctx.setDots(total, 0);
    say([act.intro]); repeatFn = () => say([act.intro]);
  };
  /* canción de la semana + aplausos */
  RENDER.canto = (ctx) => {
    const { act, stage } = ctx; let claps = 0;
    const lyr = h('div', { class: 'lyrics' }, ...act.lines.map(l => h('div', { class: 'lyric' }, l)));
    const clapBtn = h('button', { class: 'btn primary clapbtn hidden', 'data-testid': 'clap', style: '--c:#FF7A59;font-size:44px;padding:18px 40px', onclick: () => { claps++; SFX.clap(); clapBtn.textContent = '👏 ' + claps + ' / 8'; ctx.setDots(8, claps); if (claps >= 8) { clapBtn.disabled = true; say([praise()]); afterSpeech(() => ctx.finish(3), 500); } } }, '👏 0 / 8');
    const sing = () => { say([act.intro]); [...lyr.children].forEach((el, j) => say([{ text: act.lines[j], el }], { queue: true })); afterSpeech(() => { clapBtn.classList.remove('hidden'); say([SAY.cantoAplaude]); }, 800); };
    const skip = h('button', { class: 'btn small', 'data-testid': 'show-clap', onclick: () => { clapBtn.classList.remove('hidden'); say([SAY.cantoAplaude]); } }, '👏 Ir a los aplausos');
    stage.append(h('div', { class: 'big', style: 'font-size:80px' }, act.proyectoE || '🎵'), lyr, clapBtn, skip); ctx.setDots(8, 0);
    sing(); repeatFn = sing;
    if (!started || !S.settings.voice) clapBtn.classList.remove('hidden');
  };
  /* pausa activa / respiración */
  RENDER.move = (ctx) => {
    const { act, stage } = ctx; let left = act.secs; const C = 2 * Math.PI * 80;
    const ring = h('div', { class: 'ring', html: '<svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="80" fill="rgba(255,255,255,.6)" stroke="#E6E6E6" stroke-width="14"/><circle class="pr" cx="90" cy="90" r="80" fill="none" stroke="#20BF6B" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg>' });
    const num = h('div', { class: 'rn' }, act.e); ring.append(num);
    const done = h('button', { class: 'btn primary hidden', 'data-testid': 'move-done', style: '--c:#20BF6B', onclick: () => ctx.finish(3) }, '¡Listo! ✓');
    stage.append(h('div', { class: 'prompt' }, act.intro), h('div', { class: act.breathe ? 'breathe' : 'moving' }, ring), h('div', { class: 'movetext' }, act.t), done);
    say([act.intro, act.t]); repeatFn = () => say([act.t]);
    afterSpeech(() => { const pr = ring.querySelector('.pr'); let el = 0; const id = T.every(() => { el += 0.2; const f = Math.min(1, el / act.secs); pr.setAttribute('stroke-dashoffset', String(C * f)); if (f >= 1) { clearInterval(id); done.classList.remove('hidden'); SFX.good(); } }, 200); }, 300);
    T.set(() => done.classList.remove('hidden'), (act.secs + 20) * 1000);
  };
  /* las letras de mi nombre */
  const ABC = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  const normName = n => String(n || '').toUpperCase().normalize('NFD').replace(/(?!\u0303)[\u0300-\u036f]/g, '').normalize('NFC').replace(/[^A-ZÑ]/g, '');
  RENDER.nombre = (ctx) => {
    const { act, stage } = ctx; let name = normName(ST().name); if (name.length < 2) name = 'KINDER'; name = name.slice(0, 7);
    const first = name[0]; const letterSay = L => GEN.LETRA[L.toLowerCase()] || L;
    function step1() { stage.innerHTML = ''; ctx.setDots(2, 0);
      const pool = shuffle(ABC.split('').filter(x => x !== first)).slice(0, 3); const opts = h('div', { class: 'opts', style: 'grid-template-columns:repeat(4,minmax(0,1fr))' });
      shuffle([first, ...pool]).forEach((L, k) => { const b = h('button', { class: 'opt glass', 'data-ok': L === first ? '1' : '0', 'data-testid': 'opt-' + k, onclick: () => { if (b.classList.contains('bad')) return; if (L === first) { b.classList.add('good'); SFX.good(); say([letterSay(L), praise(), SAY.nombre2]); afterSpeech(step2, 600); } else { b.classList.add('bad'); ctx.bad(); } } }, h('span', { class: 'on', style: 'color:var(--LEN)' }, L)); opts.append(b); });
      stage.append(h('div', { class: 'prompt' }, SAY.nombre1), h('div', { class: 'word', style: 'font-size:46px' }, h('span', { class: 'f' }, '?'), name.slice(1).replace(/./g, ' _')), opts);
      say([act.intro]); repeatFn = () => say([SAY.nombre1]); }
    function step2() { stage.innerHTML = ''; ctx.setDots(2, 1); let k = 0;
      const slots = h('div', { class: 'slots', 'data-target': name }, ...name.split('').map(() => h('div', { class: 'slot', style: 'width:clamp(46px,11vw,80px);min-height:clamp(60px,13vw,96px)' }, '')));
      const tiles = h('div', { class: 'opts', style: 'grid-template-columns:repeat(' + Math.min(name.length, 4) + ',minmax(0,1fr))' });
      shuffle(name.split('').map((L, j) => ({ L, j }))).forEach(({ L }, q) => { const b = h('button', { class: 'opt glass', 'data-l': L, 'data-testid': 'tile-' + q, style: 'min-height:90px', onclick: () => { if (b.style.visibility === 'hidden') return;
        if (L === name[k]) { const sl = slots.children[k]; sl.textContent = L; sl.classList.add('filled'); b.style.visibility = 'hidden'; SFX.tap(); say([letterSay(L)]); k++; if (k >= name.length) { SFX.good(); say([praise()], { queue: true }); afterSpeech(() => ctx.finish(), 700); } }
        else { b.classList.add('bad'); T.set(() => b.classList.remove('bad'), 450); ctx.bad(); } } }, h('span', { class: 'on', style: 'color:var(--LEN);font-size:48px' }, L)); tiles.append(b); });
      stage.append(h('div', { class: 'prompt' }, SAY.nombre2), slots, tiles); repeatFn = () => say([SAY.nombre2]); }
    step1();
  };
  /* saludo y registro de emociones */
  RENDER.saludo = (ctx) => {
    const { act, stage, date } = ctx; ctx.setDots(act.proyectoIntro ? 2 : 1, 0);
    const faces = h('div', { class: 'faces' }, ...act.emociones.map((em, k) => h('button', { class: 'face-btn', 'data-testid': 'face-' + em.id, onclick: () => { const st = ST(); (S.feelings[st.id] = S.feelings[st.id] || {})[date] = em.id; save(); faces.querySelectorAll('.face-btn').forEach(b => b.style.outline = ''); faces.children[k].style.outline = '5px solid #20BF6B'; SFX.good(); say([em.say]); afterSpeech(after, 500); } }, h('div', { class: 'fs', html: A.face(em.id) }), em.w)));
    let moved = false;
    function after() { if (moved) return; moved = true; if (!act.proyectoIntro) return ctx.finish(3); ctx.setDots(2, 1); const p = ctx.pl.proyecto;
      stage.innerHTML = ''; stage.append(h('div', { class: 'big' }, p.e), h('div', { class: 'prompt' }, 'Proyecto de la semana: ' + p.titulo), h('div', { class: 'movetext' }, p.pregunta), h('button', { class: 'btn primary', 'data-testid': 'saludo-ok', style: '--c:#20BF6B', onclick: () => ctx.finish(3) }, '¡Vamos! ▶'));
      say([act.proyectoIntro, act.pregunta]); repeatFn = () => say([act.proyectoIntro, act.pregunta]); }
    stage.append(h('div', { class: 'mascot' }, h('div', { class: 'm', html: A.character(charId(), 'happy') }), h('div', { class: 'bubble' }, '¡Hola, ' + ST().name + '! ¿Cómo te sientes hoy?')), faces);
    say([act.intro]); repeatFn = () => say([act.intro]);
  };
  /* actividad fuera de pantalla */
  RENDER.fuera = (ctx) => {
    const { act, stage } = ctx; ctx.setDots(1, 0);
    stage.append(h('div', { class: 'big' }, '🖐️'), h('div', { class: 'prompt' }, 'Actividad sin pantalla'), h('div', { class: 'card movetext', 'data-testid': 'fuera-text', style: 'max-width:640px' }, act.t),
      h('p', { class: 'muted' }, 'Deja la tableta y hazlo con tu grupo o tu familia. Un adulto toca «Listo» al terminar.'),
      h('button', { class: 'btn primary', 'data-testid': 'fuera-ok', style: '--c:#20BF6B', onclick: () => ctx.finish(3) }, '✓ ¡Listo, ya lo hicimos!'));
    say([act.intro, act.t, SAY.fueraFin]); repeatFn = () => say([act.t]);
  };

  /* ---------- PANEL DE ADULTOS ---------- */
  let adultTab = null, fichaDate = null;
  function adultPanel(tab) {
    const school = S.mode === 'escuela';
    const tabs = school ? [['plan', '📋 Planeación'], ['grupo', '👧👦 Grupo'], ['avance', '📈 Avance'], ['casa', '🏠 Para casa'], ['ajustes', '⚙️ Ajustes']] : [['casa', '🏠 Hoy en casa'], ['avance', '📈 Avance'], ['grupo', '👧👦 Niños'], ['plan', '📋 Plan del día'], ['ajustes', '⚙️ Ajustes']];
    adultTab = tab || adultTab || tabs[0][0]; if (!tabs.some(t => t[0] === adultTab)) adultTab = tabs[0][0];
    const body = h('div', { 'data-testid': 'adult-body' });
    app.append(h('div', { class: 'screen' }, header({ back: home }), h('div', { class: 'panel', 'data-testid': 'adult-panel' },
      h('div', { class: 'tabs' }, ...tabs.map(([id, l]) => h('button', { class: 'tab' + (id === adultTab ? ' on' : ''), 'data-testid': 'tab-' + id, onclick: () => go(adultPanel, id) }, l))), body)));
    ({ plan: tabPlan, grupo: tabGrupo, avance: tabAvance, casa: tabCasa, ajustes: tabAjustes })[adultTab](body);
  }
  function printHTML(node) { const p = document.getElementById('print'); p.innerHTML = ''; p.append(node); window.print(); }
  function download(name, text, type) { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  function schoolLine() { const s = S.settings; return [s.school && ('Escuela: ' + s.school), s.cct && ('CCT: ' + s.cct), s.teacher && ('Docente: ' + s.teacher), s.group && ('Grupo: ' + s.group)].filter(Boolean).join(' · '); }
  function fichaNode(d) {
    const f = GEN.ficha(d); if (!f) return h('p', {}, 'Ese día no hay clases: ' + GEN.info(d).nombre + '.');
    const p = f.proyecto; const ul = arr => h('ul', {}, ...arr.map(x => h('li', {}, x)));
    return h('div', { class: 'ficha', 'data-testid': 'ficha' },
      h('div', { class: 'muted', style: 'font-size:13px' }, APP_NAME + ' · ' + GRADE.nombreGrado + ' · Alineada al Programa Sintético de la Fase 2 (SEP)'),
      h('h2', {}, 'Planeación del día · ' + cap(f.fechaLarga)), schoolLine() ? h('div', {}, schoolLine()) : null,
      h('div', {}, 'Día ' + f.n + ' de ' + f.total + ' del ciclo · ' + cap(triName(f.trimestre)) + (f.efemeride ? ' · Efeméride: ' + f.efemeride : '')),
      h('h3', {}, p.e + ' Proyecto de la semana: ' + p.titulo), h('p', {}, h('b', {}, 'Propósito: '), p.proposito), h('p', {}, h('b', {}, 'Pregunta detonadora: '), p.pregunta),
      h('p', {}, h('b', {}, 'Campo formativo eje: '), p.campo, '. ', h('b', {}, 'Ejes articuladores: '), p.ejes.join(', ') + '.'), h('p', {}, h('b', {}, 'Materiales: '), [].concat(p.materiales).join(', ')),
      h('h3', {}, 'Contenidos y Procesos de Desarrollo de Aprendizaje (PDA)'),
      h('table', { class: 'rep' }, h('thead', {}, h('tr', {}, h('th', {}, 'Campo formativo'), h('th', {}, 'Contenido'), h('th', {}, 'PDA (2° grado)'))),
        h('tbody', {}, ...f.campos.flatMap(c => c.contenidos.map((ct, j) => h('tr', {}, h('td', {}, j === 0 ? c.nombre : ''), h('td', {}, ct.texto), h('td', {}, ...ct.pda.map(x => h('div', { class: 'pda' }, h('b', {}, x.id + ' '), x.texto)))))))),
      h('h3', {}, 'Secuencia didáctica'), h('b', {}, 'Inicio'), ul(f.inicio), h('b', {}, 'Desarrollo'),
      h('ol', {}, ...f.desarrollo.map(x => h('li', {}, x.titulo + ' (' + x.campo + ')' + (x.pda.length ? ' — PDA ' + x.pda.join(', ') : '')))),
      h('b', {}, 'Cierre'), ul(f.cierre), h('h3', {}, 'Evaluación formativa (observación)'), ul(f.evaluacion),
      h('p', { class: 'muted' }, '⏱️ Tiempo de pantalla estimado: ' + f.minutosPantalla + ' min por niña o niño. El resto del día es trabajo sin pantalla.'),
      h('p', { class: 'muted', style: 'font-size:12px' }, 'Observaciones: ______________________________________________'));
  }
  function tabPlan(body) {
    fichaDate = fichaDate || GEN.nextSchoolDay(CUR_DATE) || GEN.DAYS[0]; if (!GEN.IDX[fichaDate]) fichaDate = GEN.nextSchoolDay(fichaDate) || GEN.prevSchoolDay(fichaDate);
    const inp = h('input', { type: 'date', value: fichaDate, min: CAL.inicio, max: CAL.fin, 'data-testid': 'ficha-date', onchange: () => { const v = inp.value; if (v) { fichaDate = GEN.nextSchoolDay(v) || GEN.prevSchoolDay(v); go(adultPanel, 'plan'); } } });
    const prev = GEN.DAYS[GEN.IDX[fichaDate] - 2], nxt = GEN.DAYS[GEN.IDX[fichaDate]];
    const week = () => { const m = GEN.monday(fichaDate); const box = h('div'); for (let k = 0; k < 5; k++) { const d = GEN.addDays(m, k); if (GEN.IDX[d]) { const n = fichaNode(d); n.style.pageBreakAfter = 'always'; box.append(n); } } return box; };
    body.append(h('div', { class: 'row', style: 'align-items:center' },
      h('button', { class: 'btn small', disabled: !prev, 'data-testid': 'ficha-prev', onclick: () => { fichaDate = prev; go(adultPanel, 'plan'); } }, '◀'), inp,
      h('button', { class: 'btn small', disabled: !nxt, 'data-testid': 'ficha-next', onclick: () => { fichaDate = nxt; go(adultPanel, 'plan'); } }, '▶'),
      h('button', { class: 'btn small', 'data-testid': 'ficha-print', onclick: () => printHTML(fichaNode(fichaDate)) }, '🖨️ Imprimir día'),
      h('button', { class: 'btn small', onclick: () => printHTML(week()) }, '🖨️ Imprimir semana')), fichaNode(fichaDate));
  }
  function tabGrupo(body) {
    const sts = Object.values(S.students);
    body.append(h('h3', {}, S.mode === 'escuela' ? 'Alumnos (' + sts.length + ')' : 'Niñas y niños'),
      h('p', { class: 'muted' }, 'Los datos se guardan solo en este aparato. Usa nombre o apodo; no se piden apellidos ni datos personales.'),
      h('div', { class: 'tablewrap' }, h('table', { class: 'rep', 'data-testid': 'roster' }, h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Nombre'), h('th', {}, 'Estrellas'), h('th', {}, 'Personaje'), h('th', {}, ''))),
        h('tbody', {}, ...sts.map(s => h('tr', {}, h('td', { style: 'font-size:26px' }, s.avatar), h('td', {}, h('input', { value: s.name, maxlength: 18, 'aria-label': 'Nombre', onchange: e => { s.name = cleanName(e.target.value) || s.name; save(); } })), h('td', {}, '⭐ ' + totalStars(s.id)),
          h('td', {}, h('select', { onchange: e => { s.character = e.target.value; save(); } }, ...CHARS.map(c => h('option', { value: c.id, selected: c.id === s.character }, c.name)))),
          h('td', {}, h('button', { class: 'btn small ghost', 'data-testid': 'del-' + s.id, onclick: () => { if (confirm('¿Borrar a ' + s.name + ' y todo su avance?')) { removeStudent(s.id); go(adultPanel, 'grupo'); } } }, '🗑️'))))))),
      h('div', { class: 'row', style: 'margin-top:10px' }, h('input', { id: 'g-new', placeholder: 'Nombre o apodo', maxlength: 18, 'data-testid': 'g-new' }),
        h('button', { class: 'btn small primary', 'data-testid': 'g-add', onclick: () => { const v = document.getElementById('g-new').value; if (!cleanName(v)) return toast('Escribe un nombre'); addStudent(v); go(adultPanel, 'grupo'); } }, '＋ Agregar'),
        h('button', { class: 'btn small', onclick: () => go(pickStudent) }, '👆 Elegir quién juega')));
  }
  /* avance por campo formativo y periodo de evaluación */
  const PLAN_CACHE = {};
  const planOf = d => PLAN_CACHE[d] || (PLAN_CACHE[d] = GEN.plan(d));
  function periodDays(tri) { const t = todayISO(); return GEN.DAYS.filter(d => d <= t && (tri === 0 || GEN.trimestreDe(d) === tri)); }
  function stats(sid, tri) {
    const days = periodDays(tri); const exp = { LEN: 0, SPC: 0, ENS: 0, HUC: 0 }, got = { LEN: 0, SPC: 0, ENS: 0, HUC: 0 }; let stars = 0, acts = 0; const pdas = new Set(); const done = S.done[sid] || {};
    days.forEach(d => planOf(d).acts.forEach(a => { exp[a.campo]++; }));
    Object.entries(done).forEach(([id, x]) => { const d = id.slice(0, 10); if (tri && GEN.trimestreDe(d) !== tri) return; if (d > todayISO()) return; if (!GEN.IDX[d]) return; got[x.campo] = (got[x.campo] || 0) + 1; stars += x.stars || 0; acts++; (x.pda || []).forEach(p => pdas.add(p)); });
    const pct = {}; Object.keys(exp).forEach(c => { pct[c] = exp[c] ? Math.min(100, Math.round(100 * got[c] / exp[c])) : 0; });
    const fe = {}; Object.entries(S.feelings[sid] || {}).forEach(([d, e]) => { if (!tri || GEN.trimestreDe(d) === tri) fe[e] = (fe[e] || 0) + 1; });
    const mins = Math.round(Object.entries(S.screen[sid] || {}).filter(([d]) => !tri || GEN.trimestreDe(d) === tri).reduce((a, [, v]) => a + v, 0) / 60);
    return { days: days.length, exp, got, pct, stars, acts, pdas, fe, mins, diasActivos: new Set(Object.keys(done).map(k => k.slice(0, 10))).size };
  }
  const EMO = { feliz: '😊', triste: '😢', enojado: '😠', miedo: '😨', sorprendido: '😮', cansado: '🥱' };
  const meter = (v, c) => h('div', { class: 'meter', title: v + '%' }, h('i', { style: 'width:' + v + '%;background:' + c }), h('span', {}, v + '%'));
  let avTri = 0;
  function tabAvance(body) {
    const t = todayISO(); if (!avTri) avTri = Math.max(1, Math.min(3, GEN.trimestreDe(t)));
    const sts = Object.values(S.students); const C = ['LEN', 'SPC', 'ENS', 'HUC'];
    const sel = h('div', { class: 'row' }, ...[[1, '1er trimestre'], [2, '2º trimestre'], [3, '3er trimestre'], [-1, 'Todo el ciclo']].map(([n, l]) => h('button', { class: 'btn small' + (avTri === n ? ' primary' : ''), 'data-testid': 'tri-' + n, onclick: () => { avTri = n; go(adultPanel, 'avance'); } }, l)));
    const tri = avTri === -1 ? 0 : avTri; const trInfo = tri ? CAL.trimestres.find(x => x.n === tri) : null;
    const rows = sts.map(s => ({ s, st: stats(s.id, tri) }));
    const table = h('table', { class: 'rep', 'data-testid': 'avance-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'Nombre'), ...C.map(c => h('th', {}, CI[c].corto)), h('th', {}, '⭐'), h('th', {}, 'PDA trabajados'), h('th', {}, 'Emociones'), h('th', {}, ''))),
      h('tbody', {}, ...rows.map(({ s, st }) => h('tr', {}, h('td', {}, s.avatar + ' ' + s.name), ...C.map(c => h('td', {}, st.exp[c] ? meter(st.pct[c], CI[c].color) : '—')), h('td', {}, st.stars), h('td', {}, st.pdas.size + ' / ' + Object.keys(GEN.PDA).length), h('td', {}, Object.entries(st.fe).map(([e, n]) => EMO[e] + n).join(' ') || '—'), h('td', {}, h('button', { class: 'btn small ghost', onclick: () => printHTML(reportNode(s, tri)) }, '🖨️'))))));
    body.append(sel, h('p', { class: 'muted' }, (trInfo ? 'Periodo: ' + GEN.fechaCorta(trInfo.de) + ' al ' + GEN.fechaCorta(trInfo.a) + '. ' : 'Ciclo completo. ') + 'Días de clase transcurridos hasta hoy: ' + periodDays(tri).length + '. El porcentaje compara las actividades hechas con las programadas en esos días.'),
      sts.length ? h('div', { class: 'tablewrap' }, table) : h('p', {}, 'Aún no hay alumnos.'),
      h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn small', 'data-testid': 'print-group', onclick: () => printHTML(groupReportNode(rows, tri, table)) }, '🖨️ Imprimir reporte del grupo'), h('button', { class: 'btn small', 'data-testid': 'csv', onclick: () => exportCSV(rows, tri) }, '⬇️ Exportar CSV (Excel)')));
  }
  function groupReportNode(rows, tri, table) { return h('div', { class: 'ficha' }, h('h2', {}, 'Reporte de avance · ' + (tri ? triName(tri) : 'ciclo completo') + ' · ' + CAL.ciclo), h('div', {}, schoolLine()), h('div', { class: 'muted' }, APP_NAME + ' · generado el ' + GEN.fechaLarga(todayISO())), table.cloneNode(true), h('p', { class: 'muted', style: 'font-size:12px' }, 'Este reporte apoya la evaluación formativa; no sustituye la observación de la docente.')); }
  function reportNode(s, tri) {
    const st = stats(s.id, tri); const C = ['LEN', 'SPC', 'ENS', 'HUC'];
    const byCampo = {}; [...st.pdas].filter(id => GEN.PDA[id]).forEach(id => { const p = GEN.PDA[id]; (byCampo[p.campo] = byCampo[p.campo] || []).push(p); });
    return h('div', { class: 'ficha' }, h('h2', {}, 'Reporte individual · ' + s.name), h('div', {}, schoolLine()), h('div', {}, (tri ? cap(triName(tri)) : 'Ciclo completo') + ' ' + CAL.ciclo + ' · ' + GRADE.nombreGrado),
      h('table', { class: 'rep' }, h('tbody', {}, ...C.map(c => h('tr', {}, h('td', {}, CI[c].nombre), h('td', {}, st.got[c] + ' de ' + st.exp[c] + ' actividades'), h('td', {}, st.pct[c] + '%'))))),
      h('p', {}, 'Estrellas: ' + st.stars + ' · Días con actividad: ' + st.diasActivos + ' · Tiempo de pantalla: ' + st.mins + ' min · Emociones registradas: ' + (Object.entries(st.fe).map(([e, n]) => e + ' ' + n).join(', ') || '—')),
      h('h3', {}, 'PDA trabajados en la app'), ...C.filter(c => byCampo[c]).map(c => h('div', {}, h('b', {}, CI[c].nombre), h('ul', {}, ...byCampo[c].map(p => h('li', {}, p.id + ' — ' + p.texto))))),
      h('h3', {}, 'Observaciones de la docente'), h('p', {}, '______________________________________________'), h('p', {}, '______________________________________________'));
  }
  function exportCSV(rows, tri) {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"';
    const head = ['Nombre', 'Periodo', 'Lenguajes %', 'Saberes y P. Científico %', 'Ética, Nat. y Soc. %', 'De lo Humano y lo Com. %', 'Actividades', 'Estrellas', 'PDA trabajados', 'Minutos de pantalla', 'Emociones'];
    const lines = [head.map(q).join(',')].concat(rows.map(({ s, st }) => [s.name, tri ? 'Trimestre ' + tri : 'Ciclo', st.pct.LEN, st.pct.SPC, st.pct.ENS, st.pct.HUC, st.acts, st.stars, st.pdas.size, st.mins, Object.entries(st.fe).map(([e, n]) => e + ':' + n).join(' ')].map(q).join(',')));
    download('avance-' + (S.settings.group || 'grupo').replace(/[^\w-]+/g, '') + '-' + (tri ? 't' + tri : 'ciclo') + '.csv', '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }
  /* para casa */
  function tabCasa(body) {
    const d = GEN.nextSchoolDay(CUR_DATE) || GEN.DAYS[GEN.DAYS.length - 1]; const pl = GEN.plan(d); const p = pl.proyecto; const f = GEN.ficha(d);
    const st = ST(); const mins = st ? Math.round(screenToday() / 60) : 0;
    body.append(h('div', { class: 'ficha', 'data-testid': 'casa' }, h('h2', {}, '🏠 ' + (d === CUR_DATE ? 'Hoy' : 'Próximo día de clases') + ': ' + cap(pl.fechaLarga)),
      h('h3', {}, p.e + ' Esta semana: ' + p.titulo), h('p', {}, p.proposito),
      h('p', {}, h('b', {}, 'Consejo para hoy: '), pl.casa), h('p', {}, h('b', {}, 'Actividad sin pantalla: '), pl.acts[pl.acts.length - 1].t),
      h('p', {}, h('b', {}, 'Platiquen: '), p.pregunta), h('p', {}, h('b', {}, 'Palabras de la semana: '), p.vocab.map(v => v.split('|')[1]).join(', ') + '.'),
      h('h3', {}, 'Lo que se busca que aprenda (en palabras sencillas)'), h('ul', {}, ...f.campos.flatMap(c => c.contenidos.flatMap(ct => ct.pda.slice(0, 1).map(x => h('li', {}, x.texto))))),
      h('h3', {}, 'Ideas para toda la semana'), h('ul', {}, ...p.casa.map(x => h('li', {}, x))),
      st ? h('p', { class: 'muted' }, '⏱️ Pantalla hoy (' + st.name + '): ' + mins + ' min de ' + S.settings.screenLimit + ' recomendados.') : null,
      h('p', { class: 'muted', style: 'font-size:13px' }, 'Recomendación: acompañe a su hija o hijo mientras usa la app y prefieran siempre el juego, la lectura en voz alta y el tiempo al aire libre.')),
      h('button', { class: 'btn small', onclick: () => printHTML(body.querySelector('.ficha').cloneNode(true)) }, '🖨️ Imprimir para enviar a casa'));
  }
  /* ajustes, licencia, respaldo y acerca de */
  function tabAjustes(body) {
    const s = S.settings;
    const f = (id, label, key, ph) => h('div', { class: 'field' }, h('label', { for: id }, label), h('input', { id, value: s[key] || '', placeholder: ph || '', maxlength: 60, 'data-testid': id, onchange: e => { s[key] = cleanName2(e.target.value); save(); toast('Guardado'); } }));
    const tog = (label, key) => h('label', { class: 'row', style: 'align-items:center;font-weight:800' }, h('input', { type: 'checkbox', checked: !!s[key], style: 'width:26px;height:26px', onchange: e => { s[key] = e.target.checked; save(); if (key === 'voice' && !s[key]) stopSpeech(); } }), label);
    const fileIn = h('input', { type: 'file', accept: 'application/json,.json', style: 'display:none', onchange: e => { const file = e.target.files[0]; if (!file) return; file.text().then(t => { const x = JSON.parse(t); if (!x || x.v !== 1 || !x.students) throw 0; if (!confirm('Esto reemplaza los datos de este aparato. ¿Continuar?')) return; localStorage.setItem(KEY, JSON.stringify(x)); location.reload(); }).catch(() => toast('Archivo no válido')); } });
    body.append(
      h('h3', {}, '🏫 Licencia escuela'), h('p', { class: 'muted' }, 'El nombre de la escuela aparece en el encabezado y en las fichas y reportes impresos.'),
      f('a-school', 'Nombre de la escuela', 'school', 'Jardín de Niños …'), f('a-cct', 'Clave de Centro de Trabajo (CCT)', 'cct', '12DJN0000X'), f('a-teacher', 'Docente', 'teacher'), f('a-group', 'Grupo', 'group', '2° A'),
      h('h3', {}, '🔊 Voz y sonido'), tog('Voz del personaje', 'voice'), tog('Efectos de sonido', 'sound'),
      h('div', { class: 'field' }, h('label', {}, 'Personaje (para la niña o niño actual)'), h('div', { class: 'char-row' }, ...CHARS.map(c => h('button', { class: 'char-card' + (c.id === charId() ? ' sel' : ''), style: '--c:' + c.color, 'data-char': c.id, onclick: () => { const st = ST(); if (st) st.character = c.id; s.character = c.id; save(); loadClips(c.id, () => say([SAY[c.id]])); go(adultPanel, 'ajustes'); } }, h('div', { class: 'cv', html: A.character(c.id, 'happy') }), c.name)))),
      h('button', { class: 'btn small', 'data-testid': 'settings-test-sound', onclick: testSound }, '🔈 Probar sonido'),
      h('h3', {}, '⏱️ Tiempo de pantalla'), h('div', { class: 'row' }, ...[10, 15, 20, 30].map(m => h('button', { class: 'btn small' + (s.screenLimit === m ? ' primary' : ''), onclick: () => { s.screenLimit = m; save(); go(adultPanel, 'ajustes'); } }, m + ' min'))),
      h('h3', {}, '📍 Modo de uso'), h('div', { class: 'row' }, h('button', { class: 'btn small' + (S.mode === 'escuela' ? ' primary' : ''), 'data-testid': 'set-escuela', onclick: () => { S.mode = 'escuela'; adultTab = null; save(); go(adultPanel, 'ajustes'); } }, '🏫 Escuela'), h('button', { class: 'btn small' + (S.mode === 'casa' ? ' primary' : ''), 'data-testid': 'set-casa', onclick: () => { S.mode = 'casa'; adultTab = null; save(); go(adultPanel, 'ajustes'); } }, '🏠 Casa')),
      h('h3', {}, '💾 Respaldo'), h('p', { class: 'muted' }, 'Todo se guarda solo en este aparato. Descarga un respaldo para pasarlo a otra tableta o computadora.'),
      h('div', { class: 'row' }, h('button', { class: 'btn small', 'data-testid': 'backup', onclick: () => download('mi-dia-kinder-respaldo-' + todayISO() + '.json', JSON.stringify(S), 'application/json') }, '⬇️ Descargar respaldo'), h('button', { class: 'btn small', onclick: () => fileIn.click() }, '⬆️ Cargar respaldo'), fileIn,
        h('button', { class: 'btn small ghost', onclick: () => { if (confirm('¿Borrar TODOS los datos de este aparato?') && confirm('Esta acción no se puede deshacer. ¿Seguro?')) { localStorage.removeItem(KEY); location.href = location.pathname; } } }, '🗑️ Borrar todo')),
      h('h3', {}, 'ℹ️ Acerca de'), h('div', { class: 'card', style: 'font-size:15px' },
        h('p', {}, h('b', {}, APP_NAME), ' · ' + GRADE.nombreGrado + ' · Ciclo ' + CAL.ciclo + ' · versión ' + VERSION),
        h('p', {}, 'Actividades diarias alineadas al programa de la SEP: Plan de Estudio 2022 de la Nueva Escuela Mexicana y Programa Sintético de la Fase 2 (los 4 campos formativos, ' + Object.keys(GEN.CONT).length + ' contenidos y ' + Object.keys(GEN.PDA).length + ' PDA de 2° grado). Calendario: ' + CAL.fuente + '.'),
        h('p', {}, h('b', {}, 'No es un producto oficial de la SEP'), ' ni está respaldado por ella; es un material de apoyo independiente.'),
        h('p', {}, '🔒 Privacidad: sin anuncios, sin cuentas y sin recopilar datos. Nada sale de este aparato. ', h('a', { href: 'privacidad.html', target: '_blank', rel: 'noopener' }, 'Aviso de privacidad'), '.'),
        h('p', { class: 'muted' }, 'Voces: Piper TTS (pregrabadas). Ilustraciones y emojis del sistema.')));
  }

  /* ---------- arranque ---------- */
  const VERSION = '1.0.0';
  window.addEventListener('beforeunload', flushScreen);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushScreen(); else if (app.querySelector('.act') && !actStart) { actStart = Date.now(); actDate = todayISO(); } });
  window.__mdk = { go, home, calendar, runAct, adultPanel, state: () => S, plan: GEN.plan, setDate: d => { CUR_DATE = d; }, stats };
  if (S.mode && ST()) home(); else app.append(h('div', { class: 'screen' }));
  startScreen();
})();
