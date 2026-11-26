# Mi Día en el Kínder — notas de trabajo (preescolar SEP)

App de actividades diarias para preescolar **alineada al programa de la SEP** (no es producto oficial de la SEP).
Grado 2 primero (`grado2/`); después grado1/ y grado3/ reutilizando el mismo motor (`www/js/gen.js`, `www/js/app.js`)
y cambiando solo los datos (`www/js/data/grado*.js`, `curriculo-*.js`).

## Fuentes (verificadas 26-nov-2026)
- Calendario escolar 2026-2027 (OFICIAL, publicado en DOF 15-jul-2026): Acuerdo número 07/07/26.
  - DOF: https://sidof.segob.gob.mx/notas/docFuente/5793645 (imagen oficial guardada en investigacion/cal-dof.png)
  - Boletín SEP: https://educacionbasica.sep.gob.mx/publica-sep-calendario-escolar-2026-2027-para-educacion-basica-y-normal/
  - Detalle (registro de calificaciones, boletas): https://www.sev.gob.mx/educacion-basica/calendario-escolar/
  - 185 días: inicio lun 31-ago-2026, fin vie 9-jul-2027. CTE intensivo 24–28 ago. CTE ordinario: 25-sep, 30-oct, 27-nov-2026; 29-ene, 26-feb, 30-abr, 28-may, 25-jun-2027.
  - Suspensión de labores: 16-sep, 2-nov, 16-nov, 25-dic-2026; 1-ene, 6-ene, 1-feb, 15-mar, 5-may-2027.
  - Vacaciones: 21-dic-2026 a 5-ene-2027 (regreso 7-ene); 22-mar a 2-abr-2027.
  - Registro de calificaciones (sin clases, en la imagen oficial en azul): 13-nov-2026, 5-mar-2027, 2-jul-2027.
    Con esto el conteo da exactamente 185 días (verificado con script).
  - Entrega de boletas: 23–26 nov 2026; 16–19 mar 2027; 8–9 jul 2027. Jornada contra abuso sexual y maltrato infantil: 7-sep-2026.
- Programa Sintético Fase 2 (preescolar), SEP 2024: https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase-2.pdf
  - Extraído columna 2° → investigacion/curriculo-fase2-2o.json (4 campos, 34 contenidos, 130 PDA).
- Plan de Estudio 2022 — 7 ejes articuladores: Inclusión, Pensamiento crítico, Interculturalidad crítica, Igualdad de género,
  Vida saludable, Apropiación de las culturas a través de la lectura y la escritura, Artes y experiencias estéticas.
  https://educacionbasica.sep.gob.mx/segundo-aniversario-del-plan-de-estudio-para-la-educacion-preescolar-primaria-y-secundaria-2022/
- Efemérides: fechas cívicas conocidas (16-sep, 20-nov, 5-feb, 24-feb, 21-mar, 30-abr, 5-may, 10-may, 15-may, 5-jun);
  los días en negritas de la imagen oficial = "días conmemorativos o de reflexión".

## Estado
- ver sección "Bitácora" abajo.

## Bitácora
- 26-nov-2026: investigación (DOF/SEP calendario, Programa Sintético Fase 2) y extracción de 130 PDA de 2°.
- Datos: `grado2/www/js/data/` (calendario-2026-2027.js, curriculo-2.js, grado2.js con 41 proyectos semanales).
- Motor: `gen-banks.js` + `gen.js` (determinista por fecha; 185 días distintos; cobertura PDA 130/130).
- App: `grado2/www/js/app.js` (modos niño / maestra / casa, puerta de adultos, calendario, ficha, avance, CSV, respaldo).
- Voz: `grado2/tools/phrases.js` → phrases.json (≈2,440 frases) → `tools/synth.py` (Piper, mismos ajustes que Mundo de Habilidades,
  reutiliza MP3 idénticos de ninos-app) → `tools/manifest.py` escribe `www/audio/<personaje>/manifest.json`.
- Pruebas: `grado2/tests/` (e2e.mjs todos los días, realaudio.mjs con PulseAudio, screens.mjs capturas). Servidor local: puerto 8795.
- Para 1° y 3°: crear `grado1/` o `grado3/` copiando `grado2/www`, cambiar `data/curriculo-N.js` (columna del grado en el
  Programa Sintético), `data/gradoN.js` (proyectos) y bancos/niveles en gen-banks.js; el calendario es compartido.
