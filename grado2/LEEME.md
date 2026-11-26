# Mi Día en el Kínder · 2° de preescolar

App web educativa (sin conexión, sin anuncios, sin recopilar datos) con **actividades para cada día de clases del ciclo
escolar 2026-2027**, alineada al programa de la SEP (Nueva Escuela Mexicana · Plan de Estudio 2022 · Programa Sintético
de la Fase 2). **No es un producto oficial de la SEP.**

## Qué incluye
- **185 días de clase** del calendario oficial (Acuerdo SEP publicado en el DOF el 15-jul-2026), con festivos, CTE,
  vacaciones, registro de calificaciones y efemérides. Cada día: saludo y emociones, Lenguajes, Saberes y Pensamiento
  Científico, actividad del proyecto de la semana, pausa activa o respiración y una actividad sin pantalla (~11–15 min).
- **41 proyectos semanales** que cubren los 4 campos formativos, 34 contenidos y los **130 PDA de 2°**.
- **Modo niña/niño**: botones grandes, todo con voz (4 personajes: Teco, Luna, Leo y Axi), no requiere leer.
- **Modo maestra** (con puerta para adultos): ficha de planeación diaria con contenidos y PDA (imprimible por día o semana),
  lista del grupo, avance por campo formativo y trimestre, reporte individual y del grupo, exportación CSV, licencia escuela
  (nombre, CCT, docente, grupo), respaldo en archivo.
- **Modo casa**: consejos diarios para la familia, actividad sin pantalla, palabras de la semana.

## Estructura
```
grado2/www/            sitio estático (lo que se publica)
  js/data/             calendario, currículo 2° y proyectos (datos estructurados)
  js/gen-banks.js      bancos de palabras, cuentos, rimas, etc.
  js/gen.js            motor que genera el plan de cada fecha
  js/app.js            interfaz
  audio/<personaje>/   voces pregrabadas (MP3) + manifest.json
grado2/tools/          frases a grabar, síntesis de voz, manifiestos
grado2/tests/          pruebas e2e, audio real y capturas
```

## Probar localmente
```
cd grado2/www && python3 -m http.server 8795
# abre http://localhost:8795/  (para simular otra fecha: ?fecha=2027-02-10)
```
