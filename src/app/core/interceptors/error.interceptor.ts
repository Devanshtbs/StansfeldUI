import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Unwraps the backend's ApiResponse<T> envelope on error and normalizes
 * failures so feature components can just subscribe to `.error()`.
 * Bearer token attachment itself is handled by MsalInterceptor
 * (see msal.config.ts) - this only deals with the response side.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      // TODO once AuthController exists: on 401, redirect to sign-in.
      // TODO: surface err.error.message (ApiResponse<T>.Message) to a toast/snackbar.
      return throwError(() => err);
    }),
  );
};
