var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location, auth) {
  $scope.auth = auth;
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('MsgCtrl', function ($scope, auth) {
  $scope.message = {text: ''};
});

myApp.controller('RootCtrl', function (auth, $scope, $location, $http, API_ENDPOINT) {
  $scope.auth = auth;
  $scope.$watch('auth.profile', function(profile) {
    if (!profile) return;

    $scope.message.text = 'Welcome ' + auth.profile.name + '!';
  });



  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: API_ENDPOINT})
      .success(function (data, status, headers, config) {
        $scope.message.text = 'Protected data was: ' + data;
      });
  };
});

myApp.controller('LoginCtrl', function (auth, $scope, $location) {
  $scope.user = '';
  $scope.pass = '';
  $scope.message.text = '';

  function onLoginSuccess() {
    $scope.message.text = '';
    $location.path('/');
    $scope.loading = false;
  }

  function onLoginFailed() {
    $scope.message.text = 'invalid credentials';
    $scope.loading = false;
  }

  $scope.submit = function () {
    $scope.message.text = 'loading...';
    $scope.loading = true;

    auth.signin({
      connection: 'Username-Password-Authentication',
      username: $scope.user,
      password: $scope.pass,
      scope: 'openid name email'
    }, onLoginSuccess, onLoginFailed);
  };

  $scope.doGoogleAuthWithPopup = function () {
    $scope.message.text = 'loading...';
    $scope.loading = true;

    auth.signin({
      popup: true,
      connection: 'google-oauth2',
      scope: 'openid name email'
    }, onLoginSuccess, onLoginFailed);
  };

});

myApp.controller('LogoutCtrl', function (auth, $scope, $location) {
  auth.signout();
  $scope.message.text
  $location.path('/login');
});
