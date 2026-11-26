# Progreso (para retomar tras interrupción)
- [x] Datos, motor, app.js completo, index.html, privacidad.html, manifest, iconos.
- [x] Voz: 2440 frases × 4 personajes en grado2/www/audio/*/ + manifest.json (validados con ffmpeg; muestra ASR en tests/asr-check.txt).
- [x] Capturas: grado2/tests/screens/*.png (script tests/screens.mjs).
- [x] e2e rápido (LIMIT=4/6) pasa salvo 404 de manifest (ya resuelto al generar audio); arreglado modo casa (adultTab reset).
- [x] e2e completo 185 días: TODO PASS, 0 errores, 12621 frases por clip (tests/e2e-full.log). Luego: fuera con 2 PDA → seguimiento 130/130.
- [x] audio real: 12/12 PASS, 13 clips MP3, 0 TTS, 0 errores (tests/real-audio.txt).
- [ ] git init + repo público preescolar-sep-2; gh-pages = subtree grado2/www; verificar 200.
Servidor local: `cd grado2/www && python3 -m http.server 8795`.
