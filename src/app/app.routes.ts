import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./features/auth/sign-in/sign-in.component')
        .then(m => m.SignInComponent),
  },
  {
    path: 'request-access',
    loadComponent: () =>
      import('./features/auth/request-access/request-access.component')
        .then(m => m.RequestAccessComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'distributor-workspace',
    loadComponent: () =>
      import('./features/workspace/distributor-workspace.component')
        .then(m => m.DistributorWorkspaceComponent),
  },
  {
    path: '**',
    redirectTo: 'sign-in',
  },
];
