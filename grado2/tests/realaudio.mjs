// Prueba con AUDIO REAL (sin mocks): graba la salida de PulseAudio (speakers.monitor) mientras se usa la app y mide energía por paso.
import puppeteer from "puppeteer-core"; import { spawn } from "child_process"; import fs from "fs";
const URL = process.argv[2] || "http://localhost:8795/?fecha=2026-11-26";
const OUT = process.argv[3] || new globalThis.URL("./real-audio.wav", import.meta.url).pathname;
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"], ignoreDefaultArgs: ["--mute-audio"] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 860 });
await p.evaluateOnNewDocument(() => { if (!localStorage.getItem('mdk2_v1')) localStorage.setItem('mdk2_v1', JSON.stringify({ v: 1, mode: 'escuela', settings: { school: 'Jardín de Niños Prueba', character: 'teco' }, students: { a: { id: 'a', name: 'Sofi', avatar: '🦊', character: 'teco' } }, current: 'a' })); });
const rec = spawn("parec", ["-d", "speakers.monitor", "--file-format=wav", "--rate=16000", "--channels=1", OUT]);
const t0 = Date.now(); const ev = [];
await p.exposeFunction("__ev", x => ev.push(((Date.now() - t0) / 1000).toFixed(1) + "s " + x));
await p.evaluateOnNewDocument(() => document.addEventListener("mh-say", e => window.__ev(e.detail.via + ": " + e.detail.text)));
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const steps = [];
const step = async (name, fn, wait, expectSound = true) => { const s = (Date.now() - t0) / 1000; await fn(); await sleep(wait); steps.push({ name, s, e: (Date.now() - t0) / 1000, expectSound }); };
await p.goto(URL); await sleep(1500);
await step("silencio antes de tocar (no debe sonar sin gesto)", async () => {}, 2500, false);
await step("Probar sonido", () => p.click('[data-testid="test-sound"]'), 4000);
await step("Toca para empezar → Hoy", () => p.click('[data-testid="start"]'), 5000);
await step("abrir actividad 1 (saludo)", () => p.click('[data-testid="act-0"]'), 5000);
await step("tocar carita feliz", () => p.click('[data-testid="face-feliz"]'), 5000);
await step("abrir actividad 3 (Saberes)", async () => { await p.evaluate(() => window.__mdk.go(window.__mdk.runAct, '2026-11-26', 2)); }, 7000);
await step("respuesta equivocada", async () => { const w = await p.$('.opt[data-ok="0"]'); if (w) await w.click(); }, 3500);
await step("respuesta correcta", async () => { const w = await p.$('.opt[data-ok="1"]'); if (w) await w.click(); }, 5000);
await step("botón repetir 🔊", () => p.click('[data-testid="repeat"]'), 5000);
for (const c of ['luna', 'leo', 'axi']) await step("voz de " + c, async () => { await p.evaluate(c => { const s = window.__mdk.state(); s.students.a.character = c; }, c); await p.evaluate(c => window.__mdk.go(window.__mdk.adultPanel, 'ajustes'), c); await p.click(`[data-char="${c}"]`); }, 4500);
rec.kill("SIGINT"); await sleep(800); await b.close();
const buf = fs.readFileSync(OUT); let off = 12; while (off < buf.length - 8 && buf.toString("ascii", off, off + 4) !== "data") off += 8 + buf.readUInt32LE(off + 4); off += 8;
const pcm = new Int16Array(buf.buffer.slice(buf.byteOffset + off, buf.byteOffset + buf.length - ((buf.length - off) % 2)));
const rate = 16000, win = 1600, rms = [];
for (let i = 0; i + win <= pcm.length; i += win) { let s = 0; for (let j = 0; j < win; j++) s += pcm[i + j] * pcm[i + j]; rms.push(Math.sqrt(s / win) / 32768); }
const voiced = (a, z) => { let n = 0, peak = 0; for (let k = Math.floor(a * 10); k < Math.min(rms.length, Math.floor(z * 10)); k++) { if (rms[k] > 0.01) n++; peak = Math.max(peak, rms[k]); } return { sec: n / 10, peak: +peak.toFixed(3) }; };
const res = []; let fails = 0;
for (const s of steps) { const v = voiced(s.s, s.e); const pass = s.expectSound ? v.sec >= 0.5 : v.sec < 0.3; if (!pass) fails++; res.push(`${pass ? 'PASS' : 'FAIL'} ${s.name}: ${v.sec}s con sonido (pico RMS ${v.peak}) en ventana de ${(s.e - s.s).toFixed(1)}s`); }
const clips = ev.filter(x => / clip: /.test(x)).length, tts = ev.filter(x => / tts: /.test(x)).length;
const summary = `grabado ${(pcm.length / rate).toFixed(1)} s; segundos con sonido: ${rms.filter(x => x > 0.01).length / 10}; frases como clip MP3: ${clips}, por voz del sistema: ${tts}; errores: ${errs.length}`;
console.log(summary); console.log(res.join("\n")); console.log("eventos:\n" + ev.join("\n"));
fs.writeFileSync(OUT.replace(".wav", ".txt"), summary + "\n" + res.join("\n") + "\n\n" + ev.join("\n") + "\n\nerrores: " + errs.join(" | "));
process.exit(fails || errs.length ? 1 : 0);
