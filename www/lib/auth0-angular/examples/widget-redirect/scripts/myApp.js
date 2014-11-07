var myApp = angular.module('myApp', [
  'ngCookies', 'auth0', 'ngRoute'
]);



myApp.config(function ($routeProvider, authProvider, $httpProvider) {
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
    /* isAuthenticated will prevent user access to forbidden routes */
    requiresLogin: true
  });

  authProvider.init({
    domain: 'samples.auth0.com',
    clientID: 'BUIJSW9x60sIHBw8Kd9EmCbj8eDIFxDC',
    callbackURL: location.href,
    loginUrl: '/login'
  });

  authProvider.on('loginSuccess', function($location) {
    console.log("Login Success");
    $location.path('/');
  });

  authProvider.on('authenticated', function($location) {
    console.log("Authenticated");

  });

  authProvider.on('logout', function() {
    console.log("Logged out");
  })

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('authInterceptor');
});
