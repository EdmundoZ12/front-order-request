import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/requests/requests').then((m) => m.Requests),
      },
      {
        path: 'quotations',
        loadComponent: () => import('./pages/quotations/quotations').then((m) => m.Quotations),
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./pages/evaluations/evaluations').then((m) => m.Evaluations),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
      },
      {
        path: 'request-form',
        loadComponent: () => import('./pages/request-form/request-form').then((m) => m.RequestForm),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
