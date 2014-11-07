var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
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
