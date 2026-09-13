import { AppIconName } from '@shared/components/icon/app-icons';

export interface HomeHighlight {
  readonly icon: AppIconName;
  readonly title: string;
  readonly description: string;
}

export interface MethodStep {
  readonly title: string;
  readonly description: string;
}

/** Static marketing copy for the home page. Kept out of the template for readability. */
export const BENEFITS: readonly HomeHighlight[] = [
  {
    icon: 'target',
    title: 'Entrenamiento con método',
    description: 'Ficha personalizada según tu objetivo, tu nivel y tu disponibilidad.',
  },
  {
    icon: 'line-chart',
    title: 'Progreso medible',
    description: 'Mediciones periódicas y gráficos para ver cómo avanzás mes a mes.',
  },
  {
    icon: 'calendar',
    title: 'Agenda desde el celular',
    description: 'Reservá tu turno en segundos y asegurate tu lugar en grupos reducidos.',
  },
  {
    icon: 'heart-pulse',
    title: 'Nutrición integrada',
    description: 'Plan de alimentación y recetario opcionales para acompañar tu entrenamiento.',
  },
];

export const METHOD_STEPS: readonly MethodStep[] = [
  {
    title: 'Evaluación inicial',
    description:
      'Charlamos sobre tus objetivos, tomamos tus medidas y definimos un punto de partida real.',
  },
  {
    title: 'Plan a tu medida',
    description:
      'Armamos tu ficha de entrenamiento y, si lo querés, tu plan de nutrición. Todo en tu portal.',
  },
  {
    title: 'Seguimiento constante',
    description:
      'Revisamos tu progreso, ajustamos cargas y celebramos cada avance. Sin atajos, con proceso.',
  },
];

export const GYM_FEATURES: readonly HomeHighlight[] = [
  {
    icon: 'users',
    title: 'Grupos reducidos',
    description: 'Cupos limitados por turno para que siempre tengas atención del coach.',
  },
  {
    icon: 'dumbbell',
    title: 'Equipamiento completo',
    description: 'Zona de fuerza, funcional y cardio para cualquier tipo de entrenamiento.',
  },
  {
    icon: 'clock',
    title: 'Turnos flexibles',
    description: 'Horarios de mañana, tarde y noche para que el gym se adapte a tu rutina.',
  },
  {
    icon: 'activity',
    title: 'Portal del alumno',
    description: 'Tu ficha, tus reservas y tu progreso siempre a mano, desde el celular.',
  },
];
