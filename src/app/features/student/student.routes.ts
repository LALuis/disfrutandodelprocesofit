import { Routes } from '@angular/router';
import { featureGuard } from '@core/guards/feature.guard';
import { roleGuard } from '@core/guards/role.guard';
import { StudentLayout } from './layout/student-layout';

const TITLE = 'Portal alumno';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentLayout,
    canActivate: [roleGuard('STUDENT')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/student-dashboard-page').then((m) => m.StudentDashboardPage),
        title: `Inicio | ${TITLE}`,
      },
      {
        path: 'agenda',
        loadComponent: () => import('./booking/booking-page').then((m) => m.BookingPage),
        title: `Agenda | ${TITLE}`,
      },
      {
        path: 'progreso',
        loadComponent: () => import('./progress/progress-page').then((m) => m.ProgressPage),
        title: `Mi progreso | ${TITLE}`,
      },
      {
        path: 'ficha',
        loadComponent: () =>
          import('./profile/fitness-profile-page').then((m) => m.FitnessProfilePage),
        title: `Mi ficha | ${TITLE}`,
      },
      {
        path: 'entrenamiento',
        loadComponent: () => import('./training/training-page').then((m) => m.TrainingPage),
        title: `Entrenamiento | ${TITLE}`,
      },
      {
        path: 'nutricion',
        canActivate: [featureGuard('nutritionEnabled')],
        loadComponent: () => import('./nutrition/nutrition-page').then((m) => m.NutritionPage),
        title: `Nutrición | ${TITLE}`,
      },
      {
        path: 'recetario',
        canActivate: [featureGuard('recipesEnabled')],
        loadComponent: () => import('./recipes/recipes-page').then((m) => m.RecipesPage),
        title: `Recetario | ${TITLE}`,
      },
      {
        path: 'recetario/:id',
        canActivate: [featureGuard('recipesEnabled')],
        loadComponent: () => import('./recipes/recipe-detail-page').then((m) => m.RecipeDetailPage),
        title: `Receta | ${TITLE}`,
      },
      {
        path: 'cuenta',
        loadComponent: () => import('./account/account-page').then((m) => m.AccountPage),
        title: `Mi cuenta | ${TITLE}`,
      },
    ],
  },
];
