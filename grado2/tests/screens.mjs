// Capturas en celular (412×860): inicio, Hoy, varias actividades, calendario, ficha de la maestra, avance, día sin clases.
import puppeteer from "puppeteer-core";
const BASE = process.env.BASE || "http://localhost:8795/";
const DIR = new URL("./screens/", import.meta.url).pathname;
const b = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 860, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { if (!localStorage.getItem('mdk2_v1')) localStorage.setItem('mdk2_v1', JSON.stringify({ v: 1, mode: 'escuela', settings: { school: 'Jardín de Niños Benito Juárez', teacher: 'Mtra. Laura', group: '2° B', cct: '12DJN0123X', character: 'teco' }, students: { a: { id: 'a', name: 'Sofi', avatar: '🦊', character: 'teco' }, b: { id: 'b', name: 'Mateo', avatar: '🐯', character: 'leo' } }, current: 'a' })); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async n => { await sleep(500); await p.screenshot({ path: DIR + n + ".png" }); console.log(DIR + n + ".png"); };
await p.goto(BASE + "?fecha=2026-11-26", { waitUntil: "networkidle0" }); await shot("01-inicio");
await p.click('[data-testid="start"]'); await sleep(300); await shot("02-hoy");
const D = '2026-11-26'; const acts = await p.evaluate(d => window.__mdk.plan(d).acts.map(a => a.key), D); console.log(acts.join(","));
for (const [i, k] of acts.entries()) { await p.evaluate((d, i) => window.__mdk.go(window.__mdk.runAct, d, i), D, i); await shot("03-act-" + (i + 1) + "-" + k); }
// más tipos de actividad de otros días
const want = { canto: 0, cuento: 0, memorama: 0, psort: 0, sonido: 0, patron: 0, monedas: 0, posicion: 0, formas: 0, rima: 0, medir: 0, situaciones: 0 };
const days = await p.evaluate(() => GEN.DAYS);
for (const d of days) { const ks = await p.evaluate(d => window.__mdk.plan(d).acts.map(a => a.key), d); for (const [i, k] of ks.entries()) if (k in want && !want[k]) { want[k] = 1; await p.evaluate((d, i) => window.__mdk.go(window.__mdk.runAct, d, i), d, i); await shot("04-" + k); } if (Object.values(want).every(Boolean)) break; }
await p.evaluate(() => window.__mdk.go(window.__mdk.calendar, '2026-11-26')); await shot("05-calendario");
await p.evaluate(() => window.__mdk.go(window.__mdk.adultPanel, 'plan')); await shot("06-ficha-maestra");
await p.screenshot({ path: DIR + "06b-ficha-completa.png", fullPage: true });
await p.evaluate(() => window.__mdk.go(window.__mdk.adultPanel, 'avance')); await shot("07-avance");
await p.evaluate(() => window.__mdk.go(window.__mdk.adultPanel, 'casa')); await shot("08-casa");
await p.evaluate(() => window.__mdk.go(window.__mdk.adultPanel, 'ajustes')); await shot("09-ajustes");
await p.evaluate(() => { window.__mdk.setDate('2026-11-16'); window.__mdk.go(window.__mdk.home); }); await shot("10-dia-festivo");
await p.setViewport({ width: 1280, height: 800 }); await p.evaluate(() => { window.__mdk.setDate('2026-11-26'); window.__mdk.go(window.__mdk.home); }); await shot("11-tableta-hoy");
await b.close();
