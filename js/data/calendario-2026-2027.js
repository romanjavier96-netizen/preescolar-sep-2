/* Calendario escolar 2026-2027 — SEP, Acuerdo 07/07/26 (DOF 15-jul-2026). 185 días para preescolar, primaria y secundaria. */
(function (root) {
  'use strict';
  const CAL = {
    ciclo: '2026-2027',
    oficial: true,
    fuente: 'SEP. Acuerdo número 07/07/26, Diario Oficial de la Federación, 15 de julio de 2026.',
    inicio: '2026-08-31', fin: '2027-07-09', diasOficiales: 185,
    suspension: {
      '2026-09-16': 'Día de la Independencia de México',
      '2026-11-02': 'Día de Muertos',
      '2026-11-16': 'Aniversario de la Revolución Mexicana (día de descanso)',
      '2026-12-25': 'Navidad',
      '2027-01-01': 'Año Nuevo',
      '2027-01-06': 'Suspensión de labores docentes',
      '2027-02-01': 'Día de la Constitución (día de descanso)',
      '2027-03-15': 'Natalicio de Benito Juárez (día de descanso)',
      '2027-05-05': 'Batalla de Puebla',
    },
    cte: ['2026-09-25', '2026-10-30', '2026-11-27', '2027-01-29', '2027-02-26', '2027-04-30', '2027-05-28', '2027-06-25'],
    cteIntensivo: ['2026-08-24', '2026-08-28'],
    registro: ['2026-11-13', '2027-03-05', '2027-07-02'],
    vacaciones: [
      { de: '2026-12-21', a: '2027-01-05', nombre: 'Vacaciones de invierno' },
      { de: '2027-03-22', a: '2027-04-02', nombre: 'Vacaciones de primavera' },
    ],
    boletas: [
      { de: '2026-11-23', a: '2026-11-26', trimestre: 1 },
      { de: '2027-03-16', a: '2027-03-19', trimestre: 2 },
      { de: '2027-07-08', a: '2027-07-09', trimestre: 3 },
    ],
    /* periodos de evaluación: se cierran con la entrega de boletas */
    trimestres: [
      { n: 1, de: '2026-08-31', a: '2026-11-26', nombre: 'Primer trimestre' },
      { n: 2, de: '2026-11-30', a: '2027-03-19', nombre: 'Segundo trimestre' },
      { n: 3, de: '2027-03-23', a: '2027-07-09', nombre: 'Tercer trimestre' },
    ],
    /* efemérides y días conmemorativos (los de clase se trabajan en la actividad del día) */
    efemerides: {
      '2026-09-07': 'Jornada de concientización contra el abuso sexual y el maltrato infantil',
      '2026-09-13': 'Gesta de los Niños Héroes',
      '2026-09-15': 'Grito de Independencia',
      '2026-09-16': 'Día de la Independencia',
      '2026-10-12': 'Día de la Nación Pluricultural',
      '2026-11-01': 'Día de Muertos',
      '2026-11-02': 'Día de Muertos',
      '2026-11-20': 'Aniversario de la Revolución Mexicana',
      '2026-12-12': 'Tradiciones de diciembre',
      '2027-02-05': 'Aniversario de la Constitución',
      '2027-02-14': 'Día del Amor y la Amistad',
      '2027-02-21': 'Día Internacional de la Lengua Materna',
      '2027-02-24': 'Día de la Bandera',
      '2027-03-08': 'Día Internacional de la Mujer',
      '2027-03-18': 'Expropiación petrolera',
      '2027-03-19': 'Llegada de la primavera',
      '2027-03-21': 'Natalicio de Benito Juárez y primavera',
      '2027-04-22': 'Día de la Tierra',
      '2027-04-29': 'Celebramos el Día de la Niña y el Niño',
      '2027-04-30': 'Día de la Niña y el Niño',
      '2027-05-05': 'Batalla de Puebla',
      '2027-05-10': 'Día de las Madres',
      '2027-05-15': 'Día de la Maestra y el Maestro',
      '2027-06-05': 'Día Mundial del Medio Ambiente',
      '2027-06-20': 'Día del Padre',
    },
  };
  root.CAL = CAL;
  if (typeof module !== 'undefined') module.exports = CAL;
})(typeof window !== 'undefined' ? window : globalThis);
