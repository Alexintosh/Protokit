var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location, auth) {
  $scope.go = function (target) {
    $location.path(target);
  };

  $scope.signup = function() {
    auth.signup({popup:  true, auto_login: false})
      .then(function() {
        $location.path('/');
      })
  }

  $scope.reset = function () {
    auth.reset({popup: true}, function () {
        // TODO Handle when login succeeds
        console.log("OK");
      }, function () {
        console.log("FAIL");
        // TODO Handle when login fails
      });
  };

  $scope.login = function () {
    auth.signin({popup: true}, function () {
        // TODO Handle when login succeeds
        $location.path('/');
      }, function () {
        // TODO Handle when login fails
      });
  };
});

myApp.controller('RootCtrl', function (auth, $scope) {
  $scope.auth = auth;
});

myApp.controller('LoginCtrl', function (auth, $scope) {
  $scope.auth = auth;
});

myApp.controller('LogoutCtrl', function (auth, $location) {
  auth.signout();
  $location.path('/login');
});
