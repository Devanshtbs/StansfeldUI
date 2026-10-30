# Stansfeld Scott Distributor Portal — Frontend

Angular 18 (standalone components, no NgModules), structured so each portal
page from the approved mockup becomes one lazy-loaded feature, added one at
a time as its backend API is ready.

## What's here now

| Path | Purpose |
|---|---|
| `src/app/app.component.ts` | Root shell — just a `<router-outlet>`. |
| `src/app/app.routes.ts` | **Empty on purpose.** Comment block shows the exact pattern and suggested build order for every future page. |
| `src/app/app.config.ts` | Wires the router, `HttpClient` (with error interceptor), and MSAL/Entra External ID providers. |
| `src/app/core/auth/msal.config.ts` | MSAL instance + guard + interceptor factories. Every real value (tenant, client ID, scope) comes from `environment.ts`. |
| `src/app/core/auth/auth.guard.ts` | `authGuard` re-export of `MsalGuard` for protecting future routes. |
| `src/app/core/interceptors/error.interceptor.ts` | Global HTTP error handling, unwraps the backend's `ApiResponse<T>` shape. |
| `src/environments/` | `apiBaseUrl` + Entra config placeholders for dev and prod. |
| `src/assets/logo/stansfeld-logo.svg` | Real brand asset from the approved mockup. |
| `src/styles.scss` | CSS custom properties matching the mockup's teal palette, so future components stay visually consistent. |

No `features/`, `shared/components/`, or `layout/` folders exist yet — those
get created as each page is built, not before.

## Running it now

```bash
npm install
npm start
```

This serves an empty shell at `http://localhost:4200` — there's nothing to
show yet by design, since no routes exist.

## Adding the first real page (e.g. Sign In)

1. Fill in real values in `src/environments/environment.ts` (Entra tenant,
   client ID, API scope) once the app registrations exist.
2. Create `src/app/features/auth/sign-in/sign-in.component.ts` (standalone
   component, matches page 01 of the mockup).
3. Register it in `app.routes.ts`:
   ```ts
   {
     path: 'sign-in',
     loadComponent: () =>
       import('./features/auth/sign-in/sign-in.component')
         .then(m => m.SignInComponent),
   },
   ```
4. Add a matching service in `src/app/core/services/` (e.g. `auth.service.ts`)
   that calls the backend's `AuthController` once it exists.

Repeat this pattern for every page in the mockup (Dashboard, Create Order,
Bulk Upload, Order History/Detail, Invoices List/Detail, Documents, and the
four self-service dashboards) as their backend modules land — see the
backend's `README.md` for the matching build order on that side.

## Auth model

Distributors authenticate against **Entra External ID** via MSAL redirect
flow (see `msal.config.ts`). `MsalInterceptor` automatically attaches a
bearer token to any request whose URL matches `environment.apiBaseUrl`, so
feature services never handle tokens directly — just call the API.
