angular.module( 'sample', [
  'auth0',
  'ngRoute',
  'sample.home',
  'sample.login'
])
.config( function myAppConfig ( $routeProvider, authProvider, $httpProvider, $locationProvider) {
  $routeProvider
    .when( '/', {
      controller: 'HomeCtrl',
      templateUrl: 'home/home.html',
      pageTitle: 'Homepage',
      requiresLogin: true
    })
    .when( '/login', {
      controller: 'LoginCtrl',
      templateUrl: 'login/login.html',
      pageTitle: 'Login'
    });


  authProvider.init({
    domain: AUTH0_DOMAIN,
    clientID: AUTH0_CLIENT_ID,
    callbackURL: location.href,
    loginUrl: '/login'
  });

  authProvider.on('loginSuccess', function($location) {
    // Using a firebase token for this example
    // Replace here with your client token
    auth.getToken('IckaP4QRfGSRGuVZfP9VJBUdlXtgcS4o').then(function(firebaseToken) {
      // Setting the Firebase token for all requests as default one
      $http.defaults.headers.common.Authorization =  'Bearer '+ auth.idToken;
      $location.path('/');
    });
  });

  authProvider.on('loginFailure', function($log, error) {
    $log('Error logging in', error);
  });
})
.run(function(auth) {
  auth.hookEvents();
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$routeChangeSuccess', function(e, nextRoute){
    if ( nextRoute.$$route && angular.isDefined( nextRoute.$$route.pageTitle ) ) {
      $scope.pageTitle = nextRoute.$$route.pageTitle + ' | Auth0 Sample' ;
    }
  });
})

;

