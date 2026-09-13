import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { StudentLayout } from './layout/student-layout';

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
        title: 'Inicio | Portal alumno',
      },
    ],
  },
];
