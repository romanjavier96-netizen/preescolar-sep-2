/* Bancos de contenido general para preescolar (reutilizables en 1°, 2° y 3°). Texto original. */
(function (root) {
  'use strict';
  const B = {};
  /* palabras por sonido inicial: letra -> ["emoji|palabra"] */
  B.sonidos = {
    a: ['🐝|abeja', '🌳|árbol', '✈️|avión', '💧|agua', '🦅|águila', '🥑|aguacate'],
    e: ['🐘|elefante', '⭐|estrella', '🌽|elote', '🪜|escalera', '🧽|esponja', '🦂|escorpión'],
    i: ['🦎|iguana', '🧲|imán', '🏝️|isla', '❄️|invierno'],
    o: ['🐻|oso', '👁️|ojo', '🐑|oveja', '🌊|ola', '👂|oreja'],
    u: ['🍇|uvas', '🦄|unicornio', '1️⃣|uno', '💅|uña'],
    m: ['🍎|manzana', '🐒|mono', '🦋|mariposa', '🍈|melón', '🖐️|mano', '🎒|mochila'],
    p: ['🐶|perro', '🍕|pizza', '🐟|pez', '🦆|pato', '🍞|pan', '🐧|pingüino'],
    s: ['☀️|sol', '🐸|sapo', '🍉|sandía', '👒|sombrero', '🪑|silla', '🐍|serpiente'],
    l: ['🦁|león', '🌙|luna', '📚|libro', '🍋|limón', '🐺|lobo', '✏️|lápiz'],
    t: ['🐢|tortuga', '🍅|tomate', '🚂|tren', '🌮|taco', '🐯|tigre', '☕|taza'],
    g: ['🐱|gato', '🐓|gallo', '🍪|galleta', '🎸|guitarra', '🦍|gorila', '🧤|guante'],
    c: ['🏠|casa', '🐴|caballo', '🦀|cangrejo', '🐫|camello', '🥥|coco', '🐰|conejo'],
    n: ['🍊|naranja', '☁️|nube', '👃|nariz', '🪺|nido', '🌵|nopal', '⛄|nieve'],
    r: ['🐭|ratón', '🌹|rosa', '🎁|regalo', '⌚|reloj', '🐸|rana', '🦏|rinoceronte'],
    b: ['🚢|barco', '🐋|ballena', '👢|bota', '⚽|balón', '🚲|bicicleta', '🍬|bombón'],
    f: ['🌸|flor', '🍓|fresa', '🦭|foca', '🔥|fuego', '🦩|flamenco', '💡|foco'],
    d: ['🦖|dinosaurio', '🐬|delfín', '🎲|dado', '🦷|diente', '🍩|dona', '💃|danza'],
  };
  B.letrasPorTrimestre = { 1: ['a', 'e', 'i', 'o', 'u'], 2: ['a', 'e', 'o', 'm', 'p', 's', 'l', 't'], 3: ['m', 'p', 's', 'l', 't', 'g', 'c', 'n', 'r', 'b', 'f', 'd'] };
  /* palabras con sílabas */
  B.silabas = [
    '☀️|sol|sol', '🐟|pez|pez', '🍞|pan|pan', '🌸|flor|flor', '🚂|tren|tren', '🐻|oso|o-so', '🐱|gato|ga-to', '🦆|pato|pa-to', '🌙|luna|lu-na', '🏠|casa|ca-sa',
    '🍋|limón|li-món', '🐸|rana|ra-na', '🐒|mono|mo-no', '🍪|galleta|ga-lle-ta', '🐢|tortuga|tor-tu-ga', '🍅|tomate|to-ma-te', '🐴|caballo|ca-ba-llo', '🍉|sandía|san-dí-a',
    '🦋|mariposa|ma-ri-po-sa', '🐘|elefante|e-le-fan-te', '🍌|plátano|plá-ta-no', '🚲|bicicleta|bi-ci-cle-ta', '🦖|dinosaurio|di-no-sau-rio', '🐧|pingüino|pin-güi-no',
    '🍎|manzana|man-za-na', '🌽|elote|e-lo-te', '⚽|balón|ba-lón', '🦁|león|le-ón', '🎈|globo|glo-bo', '🧸|osito|o-si-to', '🌵|nopal|no-pal', '🐝|abeja|a-be-ja',
  ];
  /* rimas: palabra -> rima correcta */
  B.rimas = [
    ['🐭|ratón', '🔘|botón'], ['🐱|gato', '🍽️|plato'], ['🌙|luna', '🫒|aceituna'], ['🍓|fresa', '👸|princesa'], ['🐻|oso', '🦥|perezoso'],
    ['☀️|sol', '🌻|girasol'], ['🍋|limón', '🦁|león'], ['🌸|flor', '🚜|tractor'], ['🐸|rana', '🪟|ventana'], ['🏠|casa', '🫓|masa'],
    ['🦆|pato', '👟|zapato'], ['🎈|globo', '🐺|lobo'], ['🍞|pan', '🧲|imán'], ['🐟|pez', '🔟|diez'], ['🐴|caballo', '🐓|gallo'],
    ['🍉|sandía', '🌞|día'], ['🌹|rosa', '🦋|mariposa'], ['🎂|pastel', '🍯|miel'], ['🪁|papalote', '🌽|elote'], ['🐢|tortuga', '🐛|oruga'],
  ];
  B.distractoresRima = ['🚗|coche', '🥛|leche', '🐶|perro', '🍌|plátano', '📚|libro', '🧦|calcetín', '🥄|cuchara', '🌳|árbol', '🍕|pizza', '🦒|jirafa', '🐄|vaca', '🎒|mochila'];
  /* secuencias para ordenar (inicio, desarrollo, final) */
  B.cuentos = [
    { t: 'La semilla', p: ['🌰|Primero sembramos una semilla.', '🌱|Después sale una plantita.', '🌻|Al final crece una flor.'] },
    { t: 'El pollito', p: ['🥚|Primero hay un huevo.', '🐣|Después el pollito rompe el cascarón.', '🐥|Al final el pollito camina.'] },
    { t: 'La mariposa', p: ['🐛|Primero hay una oruga.', '🫘|Después la oruga hace un capullo.', '🦋|Al final sale una mariposa.'] },
    { t: 'Mi mañana', p: ['🛏️|Primero me despierto.', '🥣|Después desayuno.', '🏫|Al final voy a la escuela.'] },
    { t: 'Lavarse las manos', p: ['💧|Primero mojo mis manos.', '🧼|Después uso jabón y froto.', '🧻|Al final me seco.'] },
    { t: 'El pastel', p: ['🥚|Primero mezclamos los ingredientes.', '🔥|Después se hornea el pastel.', '🎂|Al final lo compartimos.'] },
    { t: 'El muñeco de nieve', p: ['❄️|Primero cae la nieve.', '⛄|Después hacemos un muñeco.', '☀️|Al final sale el sol y se derrite.'] },
    { t: 'La rana', p: ['🫧|Primero hay huevitos en el agua.', '🐟|Después nacen renacuajos.', '🐸|Al final son ranas.'] },
    { t: 'El dibujo', p: ['📄|Primero tomo una hoja.', '🖍️|Después dibujo con crayolas.', '🖼️|Al final muestro mi dibujo.'] },
    { t: 'La lluvia', p: ['☁️|Primero se nubla el cielo.', '🌧️|Después llueve.', '🌈|Al final sale el arcoíris.'] },
    { t: 'La noche', p: ['🛁|Primero me baño.', '📖|Después leemos un cuento.', '😴|Al final me duermo.'] },
    { t: 'El árbol', p: ['🌰|Primero hay una semilla.', '🌿|Después crece un arbolito.', '🌳|Al final es un árbol grande.'] },
    { t: 'La tortilla', p: ['🌽|Primero se cosecha el maíz.', '🫓|Después se hace la masa.', '🔥|Al final se cuece en el comal.'] },
    { t: 'El globo', p: ['🎈|Primero inflo el globo.', '🎀|Después le amarro un hilo.', '🧒|Al final juego con él.'] },
  ];
  B.cuentos4 = [
    { t: 'El crecimiento', p: ['👶|Primero soy un bebé.', '🧒|Después crezco y voy al kínder.', '🧑|Más tarde soy grande.', '👴|Al final soy abuelo.'] },
    { t: 'La mariposa', p: ['🥚|Primero hay un huevito en la hoja.', '🐛|Después nace una oruga.', '🫘|Luego hace un capullo.', '🦋|Al final sale una mariposa.'] },
    { t: 'Ir a la escuela', p: ['🛏️|Primero me despierto.', '🚿|Después me baño.', '🥣|Luego desayuno.', '🏫|Al final voy a la escuela.'] },
    { t: 'La planta', p: ['🌰|Primero siembro una semilla.', '💧|Después la riego.', '🌱|Luego sale una plantita.', '🌻|Al final crece una flor.'] },
  ];
  /* rutinas para el tiempo */
  B.tiempo = [
    { q: '¿Qué hacemos en la mañana?', ok: '🌅|despertar y desayunar', no: ['🌙|ponernos la pijama para dormir'] },
    { q: '¿Qué hacemos en la noche?', ok: '😴|dormir', no: ['🏫|ir a la escuela'] },
    { q: '¿Qué vemos en el cielo de noche?', ok: '🌙|la luna y las estrellas', no: ['☀️|el sol brillante'] },
    { q: '¿Qué hacemos antes de comer?', ok: '🧼|lavarnos las manos', no: ['🛁|bañarnos en la tina'] },
    { q: '¿Qué hacemos después de comer?', ok: '🪥|lavarnos los dientes', no: ['🧦|ponernos calcetines'] },
    { q: '¿Qué pasa primero?', ok: '🥚|el huevo', no: ['🐔|la gallina grande'] },
    { q: '¿Qué hacemos en la tarde después de la escuela?', ok: '🧸|jugar y descansar', no: ['🌅|despertarnos'] },
  ];
  /* emociones */
  B.emociones = [
    { id: 'feliz', e: '😊', w: 'feliz', say: '¡Qué bueno que estás feliz!' },
    { id: 'triste', e: '😢', w: 'triste', say: 'Está bien sentirse triste. Puedes contarle a alguien de confianza.' },
    { id: 'enojado', e: '😠', w: 'enojado', say: 'Cuando estamos enojados, respiramos profundo. Uno, dos, tres.' },
    { id: 'miedo', e: '😨', w: 'con miedo', say: 'Si tienes miedo, busca a un adulto que te cuide.' },
    { id: 'sorprendido', e: '😮', w: 'sorprendido', say: '¡Qué sorpresa! Cuéntale a tu maestra qué pasó.' },
    { id: 'cansado', e: '😴', w: 'cansado', say: 'Si estás cansado, descansa un poquito y toma agua.' },
  ];
  B.situaciones = [
    { q: 'Le dan un regalo. ¿Cómo se siente?', ok: 'feliz' }, { q: 'Se le cayó su helado. ¿Cómo se siente?', ok: 'triste' },
    { q: 'Le quitaron su juguete. ¿Cómo se siente?', ok: 'enojado' }, { q: 'Hay una tormenta muy fuerte. ¿Cómo se siente?', ok: 'miedo' },
    { q: 'Le hicieron una fiesta sorpresa. ¿Cómo se siente?', ok: 'sorprendido' }, { q: 'Jugó todo el día. ¿Cómo se siente?', ok: 'cansado' },
    { q: 'Su mejor amigo lo abraza. ¿Cómo se siente?', ok: 'feliz' }, { q: 'Su perrito está enfermo. ¿Cómo se siente?', ok: 'triste' },
  ];
  /* formas y colores */
  B.formas = { 1: ['círculo', 'cuadrado', 'triángulo'], 2: ['círculo', 'cuadrado', 'triángulo', 'rectángulo', 'estrella'], 3: ['círculo', 'cuadrado', 'triángulo', 'rectángulo', 'óvalo', 'rombo', 'estrella', 'corazón'] };
  B.objetosForma = [['⚽', 'círculo'], ['🍪', 'círculo'], ['🍊', 'círculo'], ['🍕', 'triángulo'], ['📐', 'triángulo'], ['🚪', 'rectángulo'], ['📱', 'rectángulo'], ['🥚', 'óvalo'], ['🪁', 'rombo'], ['⭐', 'estrella'], ['🖼️', 'cuadrado'], ['🎲', 'cuadrado']];
  B.colores = [['rojo', '#FF5A5F'], ['azul', '#2E86DE'], ['amarillo', '#FFC312'], ['verde', '#20BF6B'], ['morado', '#8854D0'], ['naranja', '#FF9F43'], ['rosa', '#FD79A8']];
  /* comparar magnitudes */
  B.pesos = [['🐘|el elefante', '🐭|el ratón'], ['🚗|el coche', '🪶|la pluma'], ['🪨|la piedra', '🍃|la hoja'], ['🍉|la sandía', '🍇|la uva'], ['🐄|la vaca', '🐔|la gallina'], ['📺|la tele', '✏️|el lápiz'], ['🎃|la calabaza', '🍓|la fresa'], ['🐋|la ballena', '🐟|el pececito']];
  B.altos = [['🦒|la jirafa', '🐢|la tortuga'], ['🌳|el árbol', '🌷|la flor'], ['🏢|el edificio', '🏠|la casita'], ['🐴|el caballo', '🐶|el perrito'], ['🧑|el adulto', '👶|el bebé']];
  /* posiciones */
  B.posiciones = ['arriba', 'abajo', 'dentro', 'al lado'];
  B.posObjs = [['🐱', 'el gato'], ['⚽', 'la pelota'], ['🐶', 'el perro']];
  /* monedas mexicanas */
  B.monedas = [1, 2, 5, 10];
  /* pausas activas */
  B.pausas = [
    { e: '🐸', t: '¡Brinca como rana cinco veces! Uno, dos, tres, cuatro, cinco.' },
    { e: '🦒', t: 'Estírate muy alto como una jirafa. Ahora muy chiquito como un ratón.' },
    { e: '🦩', t: 'Párate en un pie como flamenco. Cuenta hasta cinco. Ahora con el otro pie.' },
    { e: '🐧', t: 'Camina como pingüino, con pasitos cortos, de un lado a otro.' },
    { e: '🦋', t: 'Vuela como mariposa moviendo tus brazos despacito.' },
    { e: '🌳', t: 'Eres un árbol: el viento sopla y te mueves de un lado a otro.' },
    { e: '🏃', t: 'Corre en tu lugar muy rápido... ahora muy despacito.' },
    { e: '👏', t: 'Aplaude diez veces contando conmigo: uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez.' },
    { e: '🙆', t: 'Toca tu cabeza, tus hombros, tus rodillas y tus pies. ¡Otra vez, más rápido!' },
    { e: '🌱', t: 'Agáchate como una semilla. Crece, crece, crece... ¡y abre tus ramas como un árbol!' },
    { e: '🐻', t: 'Camina como oso, con manos y pies en el piso.' },
    { e: '🥁', t: 'Marcha como en un desfile: un, dos, un, dos, levantando las rodillas.' },
    { e: '🐍', t: 'Muévete como serpiente: ondula tus brazos y tu cuerpo.' },
    { e: '🗿', t: 'Juguemos a las estatuas: muévete y cuando diga alto, ¡te congelas! ¡Alto!' },
  ];
  B.respira = [
    { e: '🌸', t: 'Huele la flor por la nariz... y sopla la vela por la boca. Otra vez, despacito.' },
    { e: '🎈', t: 'Infla tu panza como un globo... y desínflala despacito. Tres veces.' },
    { e: '🐢', t: 'Respira lento como tortuga. Entra el aire... sale el aire. Estás en calma.' },
  ];
  /* clasificar general */
  B.clasifica = [
    { a: 'Es rojo|🟥', b: 'Es azul|🟦', items: ['🍎|manzana|a', '🍓|fresa|a', '🌹|rosa|a', '🐳|ballena|b', '🫐|moras azules|b', '🧢|gorra azul|b'] },
    { a: 'Vive en el agua|🌊', b: 'Vive en la tierra|🌳', items: ['🐟|pez|a', '🐙|pulpo|a', '🦀|cangrejo|a', '🐄|vaca|b', '🐶|perro|b', '🐴|caballo|b'] },
    { a: 'Vuela|☁️', b: 'Camina|🐾', items: ['🐦|pájaro|a', '🦋|mariposa|a', '✈️|avión|a', '🐱|gato|b', '🐘|elefante|b', '🐢|tortuga|b'] },
    { a: 'Es fruta|🍎', b: 'Es verdura|🥕', items: ['🍌|plátano|a', '🍇|uvas|a', '🍉|sandía|a', '🥕|zanahoria|b', '🥦|brócoli|b', '🥒|pepino|b'] },
    { a: 'Es ropa|👕', b: 'Es juguete|🧸', items: ['👕|playera|a', '👖|pantalón|a', '🧦|calcetines|a', '🧸|osito|b', '🪀|yoyo|b', '🪁|papalote|b'] },
    { a: 'Es de día|☀️', b: 'Es de noche|🌙', items: ['☀️|sol|a', '🌅|amanecer|a', '🏫|ir a la escuela|a', '🌙|luna|b', '⭐|estrellas|b', '😴|dormir|b'] },
    { a: 'Es transporte|🚗', b: 'Es animal|🐾', items: ['🚗|coche|a', '🚌|camión|a', '🚲|bici|a', '🐑|oveja|b', '🐔|gallina|b', '🐷|cerdo|b'] },
  ];
  root.GEN_BANKS = B;
  if (typeof module !== 'undefined') module.exports = B;
})(typeof window !== 'undefined' ? window : globalThis);
