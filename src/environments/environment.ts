export const environment = {
  production: false,
  apiBaseUrl: 'https://localhost:5081/api',
  entra: {
    clientId: '<spa-app-registration-client-id>',
    authority: 'https://<your-tenant>.ciamlogin.com/<your-tenant>.onmicrosoft.com',
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://<api-app-registration-client-id>/access_as_user',
  },
};
