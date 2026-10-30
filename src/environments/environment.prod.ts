export const environment = {
  production: true,
  apiBaseUrl: 'http://192.168.1.148:5080/api',
  entra: {
    clientId: '<spa-app-registration-client-id>',
    authority: 'https://<your-tenant>.ciamlogin.com/<your-tenant>.onmicrosoft.com',
    redirectUri: 'https://portal.stansfeldscott.com',
    apiScope: 'api://<api-app-registration-client-id>/access_as_user',
  },
};
