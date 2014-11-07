define(['angular', 'auth0', 'auth0-angular', 'angular-cookies', 'angular-route'], function (angular, Auth0) {
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
      controller: 'LoginCtrl'
    })
    .when('/', {
      templateUrl: 'views/root.html',
      controller: 'RootCtrl',
      requiresLogin: true
    });


    $locationProvider.hashPrefix('!');

    authProvider.init({
      domain: 'contoso.auth0.com',
      clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
      callbackURL: location.href,
      loginUrl: '/login'
    },
    // Here we are specifying which constructor to use. If you are using
    // Auth0 widget you may want to inject Auth0Widget constructor here.
    Auth0);

    // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
    // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
    // want to check the delegation-token example
    $httpProvider.interceptors.push('authInterceptor');
  });

  return myApp;
});
