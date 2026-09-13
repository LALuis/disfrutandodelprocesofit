import { Routes } from '@angular/router';
import { GYM_BRAND } from '@shared/config/gym-brand';
import { PublicLayout } from './layout/public-layout';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
        title: GYM_BRAND.name,
      },
      {
        path: 'planes',
        loadComponent: () => import('./plans/plans-page').then((m) => m.PlansPage),
        title: `Planes | ${GYM_BRAND.name}`,
      },
      {
        path: 'contacto',
        loadComponent: () => import('./contact/contact-page').then((m) => m.ContactPage),
        title: `Contacto | ${GYM_BRAND.name}`,
      },
    ],
  },
];
