var myApp = angular.module('myApp', [
  'ngCookies', 'auth0', 'ui.router'
]);

myApp.config(function($stateProvider, $urlRouterProvider, $httpProvider, authProvider, $locationProvider) {

  // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise('/home');

  // Now set up the states
  $stateProvider
  .state('logout', {
    url: '/logout',
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })
  .state('root', {
    url: '/home',
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    data: {
      requiresLogin: true
    }
  });


  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    callbackURL: location.href,
    loginState: 'login'
  });
  $httpProvider.interceptors.push('authInterceptor');
})
.run(function(auth) {
  auth.hookEvents();
});

