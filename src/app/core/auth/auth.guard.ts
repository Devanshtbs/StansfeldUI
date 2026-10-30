import { MsalGuard } from '@azure/msal-angular';

/**
 * Use on any feature route that requires a signed-in distributor, e.g.:
 *   { path: 'dashboard', canActivate: [authGuard], loadComponent: ... }
 *
 * Re-exported under a project-specific name so feature route files don't
 * need to know it's backed by MSAL specifically.
 */
export const authGuard = MsalGuard;
