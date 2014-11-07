angular.module('auth0-sample', ['auth0', 'ngRoute'])
.config(function (authProvider, $httpProvider, $routeProvider, $locationProvider) {

  $routeProvider.when('/', {
    templateUrl: 'public/main.html',
    controller: 'MainCtrl'
  })
  .when('/info', {
    templateUrl: 'public/info.html',
    controller: 'InfoCtrl',
    requiresLogin: true
  });

  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    callbackURL: location.href,
    loginUrl: '/'
  });

  authProvider.on('loginSuccess', function($location) {
    $location.hash('');
    $location.path('/info');
  });

  authProvider.on('loginFailure', function(error) {
    alert("Error logging in", error);
  });

  $locationProvider.hashPrefix('!');

  $locationProvider.html5Mode(true);


  $httpProvider.interceptors.push('authInterceptor');
})
.run(function(auth) {
  auth.hookEvents();
})
.controller('MainCtrl', function($scope, auth) {

  $scope.login = function() {
    auth.signin();
  }
})
.controller('InfoCtrl', function($scope, auth, $location) {
  $scope.auth = auth;

  $scope.logout = function() {
    auth.signout();
    $location.path('/');
  }
});
