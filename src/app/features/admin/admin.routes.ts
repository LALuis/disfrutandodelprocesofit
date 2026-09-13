import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { AdminLayout } from './layout/admin-layout';

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
        title: 'Dashboard | Administración',
      },
    ],
  },
];
