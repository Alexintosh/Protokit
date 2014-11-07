define(['angular', './myApp'], function (angular, myApp) {
  myApp.controller('MenuCtrl', function ($scope, $location) {
    $scope.go = function (target) {
      $location.path(target);
    };
  });

  myApp.controller('MsgCtrl', function ($scope, auth) {
    $scope.message = '';
  });

  myApp.controller('RootCtrl', function (auth, $scope) {
    $scope.$parent.message = 'Welcome ' + auth.profile.name + '!';
    $scope.auth = auth;
  });

  myApp.controller('LoginCtrl', function (auth, $scope, $location) {
    $scope.user = '';
    $scope.pass = '';

    function onLoginSuccess() {
      $scope.$parent.message = '';
      $location.path('/');
      $scope.loading = false;
    }

    function onLoginFailed() {
      $scope.$parent.message = 'invalid credentials';
      $scope.loading = false;
    }

    $scope.submit = function () {
      $scope.$parent.message = 'loading...';
      $scope.loading = true;

      auth.signin({
        connection: 'Username-Password-Authentication',
        username: $scope.user,
        popup: true,
        password: $scope.pass
     }, onLoginSuccess, onLoginFailed);
    };

    $scope.doGoogleAuthWithPopup = function () {
      $scope.$parent.message = 'loading...';
      $scope.loading = true;

      auth.signin({
        popup: true,
        connection: 'google-oauth2',
        scope: 'openid name email',
        popup: true
      }, onLoginSuccess, onLoginFailed);
    };
  });

  myApp.controller('LogoutCtrl', function (auth, $scope, $location) {
    auth.signout();
    $scope.$parent.message = '';
    $location.path('/login');
  });

});
