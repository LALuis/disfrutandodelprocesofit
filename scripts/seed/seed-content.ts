/** Demo content (measurements, plans, recipes, schedule) attached to the seed users. */

export interface SeedMeasurement {
  readonly date: string;
  readonly weight: number;
  readonly bodyFatPercentage: number | null;
  readonly muscleMass: number | null;
  readonly waist: number | null;
  readonly notes: string;
}

/** Roughly monthly measurements ending at the seed date, oldest first. */
export function measurementsFor(
  base: { weight: number; fat: number; muscle: number; waist: number },
  count: number,
  today: Date,
): SeedMeasurement[] {
  return Array.from({ length: count }, (_, index) => {
    const monthsAgo = count - 1 - index;
    const date = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 15);
    const progress = index / Math.max(1, count - 1);
    return {
      date: localIsoDate(date),
      weight: round1(base.weight - progress * 4.2),
      bodyFatPercentage: round1(base.fat - progress * 3),
      muscleMass: round1(base.muscle + progress * 1.4),
      waist: round1(base.waist - progress * 5),
      notes: index === 0 ? 'Evaluación inicial.' : '',
    };
  });
}

function localIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export const SEED_TRAINING_PLAN = {
  name: 'Fuerza · Bloque 1',
  description: 'Base de fuerza en 3 días con progresión semanal de cargas.',
  active: true,
  days: [
    {
      id: 'dia-a',
      name: 'Día A',
      focus: 'Pecho / Tríceps',
      exercises: [
        {
          name: 'Press de banca',
          sets: 4,
          reps: '6-8',
          rest: '120 s',
          targetWeight: '60 kg',
          notes: 'Controlar la bajada.',
        },
        {
          name: 'Press inclinado con mancuernas',
          sets: 3,
          reps: '10',
          rest: '90 s',
          targetWeight: '22 kg',
          notes: '',
        },
        {
          name: 'Fondos en paralelas',
          sets: 3,
          reps: '8-10',
          rest: '90 s',
          targetWeight: '',
          notes: 'Asistidos si hace falta.',
        },
        {
          name: 'Extensión de tríceps en polea',
          sets: 3,
          reps: '12',
          rest: '60 s',
          targetWeight: '25 kg',
          notes: '',
        },
      ],
    },
    {
      id: 'dia-b',
      name: 'Día B',
      focus: 'Piernas',
      exercises: [
        {
          name: 'Sentadilla trasera',
          sets: 4,
          reps: '5',
          rest: '150 s',
          targetWeight: '80 kg',
          notes: 'Profundidad completa.',
        },
        {
          name: 'Peso muerto rumano',
          sets: 3,
          reps: '8',
          rest: '120 s',
          targetWeight: '70 kg',
          notes: '',
        },
        { name: 'Prensa', sets: 3, reps: '12', rest: '90 s', targetWeight: '140 kg', notes: '' },
        {
          name: 'Elevación de gemelos',
          sets: 4,
          reps: '15',
          rest: '60 s',
          targetWeight: '',
          notes: '',
        },
      ],
    },
    {
      id: 'dia-c',
      name: 'Día C',
      focus: 'Espalda / Bíceps',
      exercises: [
        {
          name: 'Dominadas',
          sets: 4,
          reps: '6',
          rest: '120 s',
          targetWeight: '',
          notes: 'Con banda elástica si es necesario.',
        },
        {
          name: 'Remo con barra',
          sets: 4,
          reps: '8',
          rest: '90 s',
          targetWeight: '50 kg',
          notes: '',
        },
        {
          name: 'Jalón al pecho',
          sets: 3,
          reps: '10-12',
          rest: '90 s',
          targetWeight: '45 kg',
          notes: '',
        },
        {
          name: 'Curl con barra',
          sets: 3,
          reps: '10',
          rest: '60 s',
          targetWeight: '25 kg',
          notes: '',
        },
      ],
    },
  ],
};

export const SEED_OLD_TRAINING_PLAN = {
  name: 'Adaptación',
  description: 'Primeras 4 semanas: técnica y acondicionamiento general.',
  active: false,
  days: [
    {
      id: 'full-1',
      name: 'Full body',
      focus: 'Cuerpo completo',
      exercises: [
        {
          name: 'Sentadilla goblet',
          sets: 3,
          reps: '12',
          rest: '60 s',
          targetWeight: '16 kg',
          notes: '',
        },
        { name: 'Flexiones', sets: 3, reps: '10', rest: '60 s', targetWeight: '', notes: '' },
        {
          name: 'Remo con mancuerna',
          sets: 3,
          reps: '12',
          rest: '60 s',
          targetWeight: '14 kg',
          notes: '',
        },
        { name: 'Plancha', sets: 3, reps: '40 s', rest: '45 s', targetWeight: '', notes: '' },
      ],
    },
  ],
};

export const SEED_NUTRITION_PLAN = {
  title: 'Plan de recomposición',
  description: 'Alimentación equilibrada priorizando proteína en cada comida.',
  objective: 'Bajar grasa corporal manteniendo masa muscular',
  notes: 'Tomar al menos 2 litros de agua por día. Ajustamos porciones en cada revisión mensual.',
  active: true,
  meals: [
    {
      id: 'desayuno',
      type: 'breakfast',
      name: 'Avena proteica',
      description: '',
      notes: '',
      foods: [
        { name: 'Avena', quantity: '50 g', notes: '' },
        { name: 'Leche descremada', quantity: '200 ml', notes: '' },
        { name: 'Banana', quantity: '1 unidad', notes: '' },
        { name: 'Huevos', quantity: '2 unidades', notes: 'Revueltos o duros.' },
      ],
    },
    {
      id: 'media-manana',
      type: 'midMorning',
      name: 'Colación',
      description: '',
      notes: '',
      foods: [
        { name: 'Yogur natural', quantity: '1 pote (170 g)', notes: '' },
        { name: 'Frutos secos', quantity: '20 g', notes: '' },
      ],
    },
    {
      id: 'almuerzo',
      type: 'lunch',
      name: 'Plato completo',
      description: 'Proteína + carbohidrato + vegetales.',
      notes: '',
      foods: [
        { name: 'Pechuga de pollo', quantity: '150 g', notes: 'O pescado / carne magra.' },
        { name: 'Arroz integral', quantity: '80 g en crudo', notes: '' },
        {
          name: 'Ensalada de hojas verdes',
          quantity: 'libre',
          notes: 'Aceite de oliva, 1 cucharada.',
        },
      ],
    },
    {
      id: 'merienda',
      type: 'afternoonSnack',
      name: 'Pre entreno',
      description: '',
      notes: 'Idealmente 60-90 minutos antes de entrenar.',
      foods: [
        { name: 'Pan integral', quantity: '2 rebanadas', notes: '' },
        { name: 'Queso magro', quantity: '40 g', notes: '' },
        { name: 'Fruta', quantity: '1 unidad', notes: '' },
      ],
    },
    {
      id: 'cena',
      type: 'dinner',
      name: 'Cena liviana',
      description: '',
      notes: '',
      foods: [
        { name: 'Tortilla de verduras', quantity: '3 huevos', notes: '' },
        { name: 'Batata al horno', quantity: '150 g', notes: '' },
      ],
    },
  ],
};

export const SEED_RECIPES = [
  {
    id: 'panqueques-avena',
    title: 'Panqueques de avena y banana',
    description: 'Desayuno rápido, sin harina y con buena carga de proteína.',
    category: 'breakfast',
    tags: ['rápido', 'sin harina', 'dulce'],
    preparationTime: 15,
    calories: 320,
    protein: 18,
    carbohydrates: 42,
    fat: 9,
    ingredients: [
      '1 banana madura',
      '2 huevos',
      '40 g de avena',
      '1 cucharadita de canela',
      'Aceite en spray',
    ],
    instructions: [
      'Pisar la banana y mezclar con los huevos.',
      'Agregar la avena y la canela; dejar reposar 5 minutos.',
      'Cocinar en sartén caliente porciones pequeñas, 2 minutos por lado.',
    ],
    active: true,
  },
  {
    id: 'bowl-pollo',
    title: 'Bowl de pollo y quinoa',
    description: 'Almuerzo completo para llevar al trabajo.',
    category: 'lunch',
    tags: ['alta proteína', 'meal prep'],
    preparationTime: 30,
    calories: 520,
    protein: 42,
    carbohydrates: 48,
    fat: 16,
    ingredients: [
      '150 g de pechuga de pollo',
      '70 g de quinoa',
      '1 taza de brócoli',
      '½ palta',
      'Jugo de limón, sal y pimienta',
    ],
    instructions: [
      'Cocinar la quinoa según el paquete.',
      'Grillar el pollo condimentado y cortarlo en tiras.',
      'Cocinar el brócoli al vapor 5 minutos.',
      'Armar el bowl y terminar con la palta y el limón.',
    ],
    active: true,
  },
  {
    id: 'yogur-proteico',
    title: 'Yogur proteico con frutos rojos',
    description: 'Snack frío ideal para después de entrenar.',
    category: 'snack',
    tags: ['sin cocción', 'post entreno'],
    preparationTime: 5,
    calories: 180,
    protein: 20,
    carbohydrates: 18,
    fat: 3,
    ingredients: [
      '170 g de yogur griego natural',
      '80 g de frutos rojos',
      '1 cucharadita de miel',
      '10 g de semillas de chía',
    ],
    instructions: ['Mezclar el yogur con la miel.', 'Cubrir con los frutos rojos y las semillas.'],
    active: true,
  },
  {
    id: 'salmon-verduras',
    title: 'Salmón al horno con verduras',
    description: 'Cena liviana rica en omega 3.',
    category: 'dinner',
    tags: ['bajo en carbohidratos'],
    preparationTime: 25,
    calories: 430,
    protein: 35,
    carbohydrates: 14,
    fat: 26,
    ingredients: [
      '180 g de salmón',
      '1 zucchini',
      '1 morrón',
      '1 cucharada de aceite de oliva',
      'Limón, eneldo y sal',
    ],
    instructions: [
      'Precalentar el horno a 200 °C.',
      'Disponer las verduras en una fuente con el aceite y la sal.',
      'Colocar el salmón encima con limón y eneldo; hornear 18 minutos.',
    ],
    active: true,
  },
  {
    id: 'receta-archivada',
    title: 'Receta archivada (no visible)',
    description: 'Sirve para probar el filtro de recetas activas.',
    category: 'lowCalorie',
    tags: [],
    preparationTime: 10,
    calories: null,
    protein: null,
    carbohydrates: null,
    fat: null,
    ingredients: ['Nada'],
    instructions: ['Nada'],
    active: false,
  },
] as const;

/** Weekday start times and capacity for the generated demo schedule. */
export const SEED_SCHEDULE = {
  daysAhead: 14,
  weekdays: [1, 2, 3, 4, 5],
  times: ['08:00', '09:00', '18:00', '19:00', '20:00'],
  capacity: 8,
  durationMinutes: 60,
  /** One slot with a single place, handy to demo the capacity check. */
  tinySlotTime: '07:00',
};
