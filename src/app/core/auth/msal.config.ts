import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

/**
 * One-time MSAL instance for Entra External ID (distributor sign-in /
 * request-access). Every value here comes from environment.ts - fill
 * those in once the app registrations exist, nothing else needs to change.
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.entra.clientId,
      authority: environment.entra.authority,
      redirectUri: environment.entra.redirectUri,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  });
}

/** Routes wrapped by MsalGuard redirect to sign-in if not authenticated. */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [environment.entra.apiScope],
    },
  };
}

/**
 * Tells MsalInterceptor which outgoing requests should get a bearer
 * token attached - i.e. only calls to our own API, never third parties.
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(environment.apiBaseUrl + '/*', [environment.entra.apiScope]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}
