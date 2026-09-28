import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { AdminLayout } from './layout/admin-layout';

const TITLE = 'Administración';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [roleGuard('ADMIN')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/admin-dashboard-page').then((m) => m.AdminDashboardPage),
        title: `Dashboard | ${TITLE}`,
      },
      {
        path: 'alumnos',
        loadComponent: () => import('./students/students-page').then((m) => m.StudentsPage),
        title: `Alumnos | ${TITLE}`,
      },
      {
        path: 'alumnos/nuevo',
        loadComponent: () =>
          import('./students/student-create-page').then((m) => m.StudentCreatePage),
        title: `Nuevo alumno | ${TITLE}`,
      },
      {
        path: 'alumnos/:id',
        loadComponent: () =>
          import('./students/student-detail-page').then((m) => m.StudentDetailPage),
        title: `Alumno | ${TITLE}`,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'perfil' },
          {
            path: 'perfil',
            loadComponent: () =>
              import('./students/tabs/student-profile-tab').then((m) => m.StudentProfileTab),
          },
          {
            path: 'mediciones',
            loadComponent: () =>
              import('./students/tabs/student-measurements-tab').then(
                (m) => m.StudentMeasurementsTab,
              ),
          },
          {
            path: 'entrenamiento',
            loadComponent: () =>
              import('./students/tabs/student-training-tab').then((m) => m.StudentTrainingTab),
          },
          {
            path: 'nutricion',
            loadComponent: () =>
              import('./students/tabs/student-nutrition-tab').then((m) => m.StudentNutritionTab),
          },
          {
            path: 'reservas',
            loadComponent: () =>
              import('./students/tabs/student-bookings-tab').then((m) => m.StudentBookingsTab),
          },
        ],
      },
      {
        path: 'horarios',
        loadComponent: () => import('./schedule/schedule-page').then((m) => m.SchedulePage),
        title: `Horarios | ${TITLE}`,
      },
      {
        path: 'reservas',
        loadComponent: () => import('./bookings/bookings-page').then((m) => m.BookingsPage),
        title: `Reservas | ${TITLE}`,
      },
      {
        path: 'entrenamiento',
        loadComponent: () =>
          import('./shared/plans-overview-page').then((m) => m.PlansOverviewPage),
        data: { kind: 'training' },
        title: `Entrenamiento | ${TITLE}`,
      },
      {
        path: 'nutricion',
        loadComponent: () =>
          import('./shared/plans-overview-page').then((m) => m.PlansOverviewPage),
        data: { kind: 'nutrition' },
        title: `Nutrición | ${TITLE}`,
      },
      {
        path: 'recetas',
        loadComponent: () => import('./recipes/admin-recipes-page').then((m) => m.AdminRecipesPage),
        title: `Recetario | ${TITLE}`,
      },
      {
        path: 'planes',
        loadComponent: () => import('./plans/admin-plans-page').then((m) => m.AdminPlansPage),
        title: `Planes | ${TITLE}`,
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./settings/admin-settings-page').then((m) => m.AdminSettingsPage),
        title: `Configuración | ${TITLE}`,
      },
    ],
  },
];
