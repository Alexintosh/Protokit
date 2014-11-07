var myApp = angular.module('myApp', [
  'auth0', 'ngRoute'
]);

myApp.config(function ($routeProvider, authProvider, $httpProvider, $locationProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    requiresLogin: true
  });

  $locationProvider.hashPrefix('!');

  authProvider.init({
    domain: 'samples.auth0.com',
    clientID: 'BUIJSW9x60sIHBw8Kd9EmCbj8eDIFxDC',
    callbackURL: location.href,
    loginUrl: '/login'
  });

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('authInterceptor');
});
