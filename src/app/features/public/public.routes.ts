import { Routes } from '@angular/router';
import { PublicLayout } from './layout/public-layout';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
        title: 'Disfrutando del proceso fit',
      },
      {
        path: 'planes',
        loadComponent: () => import('./coming-soon/coming-soon-page').then((m) => m.ComingSoonPage),
        data: { title: 'Planes' },
        title: 'Planes | Disfrutando del proceso fit',
      },
      {
        path: 'contacto',
        loadComponent: () => import('./coming-soon/coming-soon-page').then((m) => m.ComingSoonPage),
        data: { title: 'Contacto' },
        title: 'Contacto | Disfrutando del proceso fit',
      },
    ],
  },
];
