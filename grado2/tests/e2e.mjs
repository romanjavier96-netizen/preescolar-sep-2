// Prueba de punta a punta: configura escuela, recorre TODOS los días de clase del ciclo completando cada actividad,
// revisa días sin clase, calendario, panel de la maestra (ficha, avance, CSV, ajustes) y modo casa. Cero errores de consola.
import puppeteer from "puppeteer-core";
import fs from "fs";
const BASE = process.env.BASE || "http://localhost:8795/";
const LIMIT = +(process.env.LIMIT || 0);
const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 860, isMobile: true, hasTouch: true });
const errors = [], results = [];
const host = new URL(BASE).host;
page.on("pageerror", e => errors.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
page.on("response", r => { if (r.status() >= 400) errors.push("HTTP " + r.status() + " " + r.url()); });
page.on("requestfailed", r => { const why = (r.failure() || {}).errorText || ""; if (/\.mp3$/.test(r.url()) && /ERR_ABORTED/.test(why)) return; if (/^blob:/.test(r.url())) return; errors.push("reqfail: " + r.url() + " " + why); });
page.on("request", r => { const u = r.url(); if (!u.startsWith("blob:") && !u.startsWith("data:") && new URL(u).host !== host) errors.push("EXTERNAL REQUEST: " + u); });
await page.evaluateOnNewDocument(() => {
  const st = window.setTimeout, si = window.setInterval;
  window.setTimeout = (f, ms, ...a) => st(f, Math.max(1, (ms || 0) * 0.04), ...a);
  window.setInterval = (f, ms, ...a) => si(f, Math.max(1, (ms || 0) * 0.04), ...a);
  window.__spoken = []; window.__via = {};
  document.addEventListener('mh-say', e => { window.__spoken.push(e.detail.text); window.__via[e.detail.via] = (window.__via[e.detail.via] || 0) + 1; });
  Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, getVoices() { return []; }, speak(u) { setTimeout(() => u.onend && u.onend(), 40); }, resume() {}, speaking: false, pending: false, addEventListener() {} } });
  const P = HTMLMediaElement.prototype; let tok = 0;
  P.play = function () { const el = this, my = ++tok; setTimeout(() => { if (my === tok) el.dispatchEvent(new Event('ended')); }, 30); return Promise.resolve(); };
  P.pause = function () { tok++; };
  window.print = () => { window.__printed = (window.__printed || 0) + 1; };
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ok = (name, cond, info = "") => { results.push((cond ? "PASS " : "FAIL ") + name + (info !== "" ? " — " + info : "")); if (!cond) console.log("FAIL", name, info); };
const $ = s => page.$(`[data-testid="${s}"]`);
const click = async (id, wait = 120) => { const el = await $(id); if (!el) throw new Error("missing " + id); await el.evaluate(e => e.click()); await sleep(wait); };
const type = async (sel, txt) => { await page.$eval(sel, (e, t) => { e.value = t; e.dispatchEvent(new Event('change')); }, txt); };

/* ---------- 1. primera vez: modo escuela, datos y alumnos ---------- */
await page.goto(BASE + "?fecha=2026-08-31", { waitUntil: "networkidle0" });
ok("pantalla de inicio", !!(await $("start-screen")));
await click("test-sound", 300);
await click("start"); await click("mode-escuela");
await type("#f-school", "Jardín de Niños Benito Juárez"); await type("#f-teacher", "Mtra. Laura"); await type("#f-group", "2° B");
await click("school-save");
for (const n of ["Sofi", "Mateo", "Ximena"]) { await page.$eval("#f-name", (e, t) => e.value = t, n); await click("student-add"); }
await click("student-done");
const nSt = await page.$$eval(".student", e => e.length); ok("3 alumnos en la lista", nSt === 3, nSt);
await page.$eval(".student", e => e.click()); await sleep(200);
ok("encabezado muestra la escuela", (await page.$eval('[data-testid="brand"]', e => e.textContent)).includes("Benito Juárez"));

/* ---------- solucionador genérico de actividades (dentro de la página) ---------- */
await page.evaluate(() => {
  const sl = ms => new Promise(r => setTimeout(r, ms * 25)); // los timers van 25x más rápido
  const q = s => document.querySelector(s);
  async function waitFor(fn, ms = 6000) { const t0 = performance.now(); while (performance.now() - t0 < ms) { const v = fn(); if (v) return v; await new Promise(r => requestAnimationFrame(r)); } return null; }
  window.__solve = async (mistake) => {
    const stage = await waitFor(() => q('[data-testid="stage"]')); if (!stage) return 'no-stage';
    const tipo = stage.dataset.tipo; let guard = 0; let mistakeDone = !mistake;
    while (!q('[data-testid="reward"]') && guard++ < 80) {
      if (tipo === 'choice') { const good = q('.opt[data-ok="1"]:not(.good)'); if (!q('.opt.good') && good) { if (!mistakeDone) { const bad = q('.opt[data-ok="0"]:not(.bad)'); if (bad) { bad.click(); mistakeDone = true; await sl(4); } } const cnt = [...document.querySelectorAll('.cnt')]; cnt.forEach(c => c.click()); good.click(); } }
      else if (tipo === 'orden') { const steps = [...document.querySelectorAll('[data-step]')].filter(b => b.style.visibility !== 'hidden').sort((a, b) => a.dataset.step - b.dataset.step); if (steps[0]) steps[0].click(); }
      else if (tipo === 'sort') { const it = q('[data-testid="sort-item"]'); if (it) q('[data-testid="basket-' + it.dataset.g + '"]').click(); }
      else if (tipo === 'memory') { const cards = [...document.querySelectorAll('.mcard:not(.ok)')]; if (cards.length) { const id = cards[0].dataset.id; const pair = cards.filter(c => c.dataset.id === id); pair[0].click(); pair[1].click(); } }
      else if (tipo === 'canto') { const sc = q('[data-testid="show-clap"]'); if (sc) sc.click(); const c = q('[data-testid="clap"]'); for (let i = 0; i < 8; i++) c.click(); }
      else if (tipo === 'move') { const d = await waitFor(() => { const b = q('[data-testid="move-done"]'); return b && !b.classList.contains('hidden') && b; }, 8000); if (d) d.click(); else return 'move-timeout'; }
      else if (tipo === 'nombre') { const g = q('.opt[data-ok="1"]:not(.good)'); if (g && !q('.opt.good')) g.click(); const slots = q('.slots[data-target]'); if (slots) { const name = slots.dataset.target; const k = [...slots.children].filter(s => s.textContent).length; const tile = [...document.querySelectorAll('[data-l]')].find(t => t.dataset.l === name[k] && t.style.visibility !== 'hidden'); if (tile) tile.click(); } }
      else if (tipo === 'saludo') { const so = q('[data-testid="saludo-ok"]'); if (so) so.click(); else if (!q('.face-btn[style*="outline"]')) q('[data-testid="face-feliz"]').click(); }
      else if (tipo === 'fuera') q('[data-testid="fuera-ok"]').click();
      await sl(3);
    }
    const rw = await waitFor(() => q('[data-testid="reward"]'), 8000); if (!rw) return 'no-reward:' + tipo;
    return 'ok:' + tipo + ':' + q('[data-testid="reward-stars"]').dataset.stars;
  };
});

/* ---------- 2. todos los días de clase ---------- */
const DAYS = await page.evaluate(() => GEN.DAYS.slice());
ok("185 días de clase en el calendario", DAYS.length === 185, DAYS.length);
const todo = LIMIT ? DAYS.filter((d, i) => i % Math.ceil(185 / LIMIT) === 0) : DAYS;
const seenKeys = {}; const sigs = new Set(); let dayFails = 0; const t0 = Date.now();
for (const [i, d] of todo.entries()) {
  await page.evaluate(d => { window.__mdk.setDate(d); window.__mdk.go(window.__mdk.home); }, d);
  await sleep(30);
  const info = await page.evaluate(() => ({ card: !!document.querySelector('[data-testid="daycard"]'), tiles: document.querySelectorAll('.path .tile').length, proj: (document.querySelector('[data-testid="project"]') || {}).textContent, date: (document.querySelector('[data-testid="date"]') || {}).textContent, keys: [...document.querySelectorAll('.path .tile')].map(t => t.dataset.key) }));
  if (!info.card || info.tiles !== 6 || !info.proj) { dayFails++; ok("día " + d + " se muestra", false, JSON.stringify(info)); continue; }
  info.keys.forEach(k => seenKeys[k] = (seenKeys[k] || 0) + 1);
  sigs.add(await page.evaluate(d => JSON.stringify(window.__mdk.plan(d).acts.map(a => [a.key, a.titulo, (a.rounds || []).map(r => r.say[0]), a.t, (a.items || []).map(x => x.w), (a.cards || []).map(x => x.e), (a.steps || []).map(x => x.t)])), d));
  const before = await page.$eval('[data-testid="total"] b', e => +e.textContent);
  const res = [];
  await click("go", 40);
  for (let k = 0; k < 6; k++) {
    const r = await page.evaluate(m => window.__solve(m), i % 7 === 3 && k === 2);
    res.push(r);
    if (!r.startsWith('ok')) break;
    await page.evaluate(() => { const n = document.querySelector('[data-testid="next"]') || document.querySelector('[data-testid="to-home"]'); n.click(); });
    await sleep(25);
  }
  const allOk = res.length === 6 && res.every(r => r.startsWith('ok'));
  await page.evaluate(() => window.__mdk.go(window.__mdk.home)); await sleep(20);
  const after = await page.evaluate(() => ({ done: document.querySelectorAll('.path .tile.is-done').length, total: +document.querySelector('[data-testid="total"] b').textContent }));
  if (!allOk || after.done !== 6 || after.total <= before) { dayFails++; ok("día " + d + " completo", false, res.join(',') + ' done=' + after.done); }
  if (i % 20 === 0) console.log(d, res.join(' '), ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
ok("todos los días recorridos se muestran y se completan (" + todo.length + ")", dayFails === 0, dayFails + " fallas");
ok("contenido distinto cada día", sigs.size === todo.length, sigs.size + "/" + todo.length);
ok("variedad de plantillas", LIMIT ? true : Object.keys(seenKeys).length >= 20, JSON.stringify(seenKeys));

/* ---------- 3. días sin clase ---------- */
const special = ["2026-08-29", "2026-09-16", "2026-09-25", "2026-11-02", "2026-11-13", "2026-11-16", "2026-12-25", "2027-01-01", "2027-01-06", "2027-02-01", "2027-03-15", "2027-03-25", "2027-05-05", "2027-12-01".replace("2027-12-01", "2027-07-20"), "2026-08-15", "2026-12-28"];
for (const d of special) {
  await page.evaluate(d => { window.__mdk.setDate(d); window.__mdk.go(window.__mdk.home); }, d); await sleep(40);
  const nc = await page.evaluate(() => ({ nc: !!document.querySelector('[data-testid="noclass"]'), t: (document.querySelector('[data-testid="noclass"] p') || {}).textContent }));
  ok("sin clases " + d, nc.nc, nc.t);
}
await click("practice", 150);
ok("práctica libre abre actividades", await page.$$eval('.path .tile', e => e.length) === 6);
await page.evaluate(() => { window.__mdk.setDate('2026-12-25'); window.__mdk.go(window.__mdk.home); }); await sleep(40);
await click("next-day", 150);
ok("botón próximo día de clases → 6 ene? no: 7 ene 2027", (await page.$eval('[data-testid="date"]', e => e.textContent)).includes("7 de enero"), await page.$eval('[data-testid="date"]', e => e.textContent));

/* ---------- 4. calendario ---------- */
await page.evaluate(() => { window.__mdk.setDate('2026-08-31'); window.__mdk.go(window.__mdk.home); }); await sleep(40);
await click("open-cal", 120);
let clase = 0, months = [];
for (let m = 0; m < 12; m++) { const r = await page.evaluate(() => ({ n: document.querySelectorAll('.cal-day.clase').length, m: document.querySelector('[data-testid="cal-month"]').textContent, ck: document.querySelectorAll('.cal-day .ck').length })); clase += r.n; months.push(r.m + ':' + r.n + '/' + r.ck); await click("cal-next", 40); }
await page.evaluate(() => window.__mdk.go(window.__mdk.calendar, '2026-10-12')); await sleep(60);
ok("calendario: 185 días de clase de agosto a julio", clase === 185, months.join(" "));
await page.$eval('.cal-day[data-date="2026-10-12"]', e => e.click()); await sleep(80);
ok("tocar un día del calendario abre ese día", (await page.$eval('[data-testid="date"]', e => e.textContent)).includes("12 de octubre"));

/* ---------- 5. puerta de adultos y panel de la maestra ---------- */
await click("adult-btn", 100);
const ans = await page.$eval('[data-testid="gate-q"]', e => e.dataset.answer);
await page.evaluate(() => { const b = document.querySelector('.keypad button[data-k="0"]'); }); // respuesta equivocada primero
for (const ch of "1") await page.$eval(`.keypad button[data-k="${ch === '1' && ans[0] === '1' ? '2' : '1'}"]`, e => e.click());
if (ans.length === 2) await page.$eval('.keypad button[data-k="9"]', e => e.click());
await sleep(60);
ok("respuesta equivocada no abre el panel", !(await $("adult-panel")));
for (const ch of ans) await page.$eval(`.keypad button[data-k="${ch}"]`, e => e.click());
await sleep(150);
ok("respuesta correcta abre el panel", !!(await $("adult-panel")));
ok("ficha de planeación con PDA", await page.evaluate(() => { const f = document.querySelector('[data-testid="ficha"]'); return !!f && /PDA/.test(f.textContent) && f.querySelectorAll('.pda').length >= 3; }));
let fichaOk = 0; for (let k = 0; k < 30; k++) { await click("ficha-next", 30); if (await page.evaluate(() => document.querySelectorAll('[data-testid="ficha"] .pda').length >= 3)) fichaOk++; }
ok("30 fichas consecutivas con PDA", fichaOk === 30, fichaOk);
await click("ficha-print", 60);
ok("imprimir ficha llena #print", await page.evaluate(() => window.__printed >= 1 && document.getElementById('print').textContent.length > 300));
await click("tab-grupo"); ok("lista del grupo", await page.$$eval('[data-testid="roster"] tbody tr', e => e.length) === 3);
await page.$eval('[data-testid="g-new"]', e => e.value = "Leo"); await click("g-add");
ok("agregar alumno desde el panel", await page.$$eval('[data-testid="roster"] tbody tr', e => e.length) === 4);
await click("tab-avance"); await click("tri--1");
const av = await page.evaluate(() => [...document.querySelectorAll('[data-testid="avance-table"] tbody tr')].map(r => r.textContent));
ok("avance del ciclo con porcentajes", av.length === 4 && /100%/.test(av[0]), av[0]);
await click("tri-1"); ok("avance por trimestre", !!(await $("avance-table")));
await click("csv", 200); await click("print-group", 60);
await click("tab-casa"); ok("pestaña para casa", !!(await $("casa")));
await click("tab-ajustes"); await type('[data-testid="a-cct"]', "12DJN0123X"); await sleep(50);
ok("CCT guardado", await page.evaluate(() => window.__mdk.state().settings.cct === "12DJN0123X"));
await click("settings-test-sound", 200);
await click("backup", 200);

/* ---------- 6. modo casa ---------- */
await click("set-casa", 100); await page.evaluate(() => { window.__mdk.setDate('2027-02-10'); window.__mdk.go(window.__mdk.home); }); await sleep(60);
ok("botón de papás en modo casa", (await page.$eval('[data-testid="adult-btn"]', e => e.textContent)).includes("Papás"));
await click("adult-btn", 100); const a2 = await page.$eval('[data-testid="gate-q"]', e => e.dataset.answer); for (const ch of a2) await page.$eval(`.keypad button[data-k="${ch}"]`, e => e.click()); await sleep(120);
ok("modo casa abre en 'Hoy en casa'", !!(await $("casa")));

/* ---------- 7. persistencia ---------- */
const spoken = await page.evaluate(() => ({ n: window.__spoken.length, via: window.__via }));
ok("la voz habló", spoken.n > (LIMIT ? 50 : 500), JSON.stringify(spoken));

await page.reload({ waitUntil: "networkidle0" }); await click("start", 200);
ok("los datos siguen después de recargar", await page.evaluate(() => Object.keys(window.__mdk.state().students).length === 4 && window.__mdk.state().settings.school.includes("Benito")));
ok("cero errores de consola / red", errors.length === 0, errors.slice(0, 10).join(" | "));
console.log(results.join("\n"));
fs.writeFileSync(new URL("./e2e-results.txt", import.meta.url), results.join("\n") + "\n\nERRORES:\n" + errors.join("\n") + "\n");
await browser.close();
process.exit(results.some(r => r.startsWith("FAIL")) ? 1 : 0);
