angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, auth) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.customlogin = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.logout = function() {
     auth.signout();
     var alertPopup = $ionicPopup.alert({
       title: 'Logged out!',
       template: 'You was logged out!'
     });
     alertPopup.then(function(res) {
       console.log('done');
     });
  }
})

.controller('LoginCtrl', function($scope, auth, $state) {
  auth.signin({
    // This is a must for mobile projects
    popup: true,
    // Make the widget non closeable
    standalone: false,
    // This asks for the refresh token
    // So that the user never has to log in again
    offline_mode: false,
    device: 'Phone'
  }, function() {
    // Login was successful
    $state.go('app.reserved');
  }, function(error) {
    // Oops something went wrong during login:
    alert("There was an error logging in", error);
  });
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.data= [
  	{'name': 'Splashscreen', 'url': ''},
  	{'name': 'UI components', 'url': 'ui'},
  	{'name': 'Sidemenu', 'url': ''},
  	{'name': 'Api Service', 'url': ''},
  	{'name': 'Maps', 'url': 'map'},
  	{'name': 'Social login', 'url': 'reserved'},
  ];
})

.controller('ReservedCtrl', function($scope, auth, $state, $ionicPopup) {
	$scope.auth = auth;
	if( !auth.isAuthenticated ) {
		auth.signin({
			// This is a must for mobile projects
			popup: true,
			// Make the widget non closeable
			standalone: true,
			// This asks for the refresh token
			// So that the user never has to log in again
			offline_mode: true,
			device: 'Phone'
		}, function() {
			// Login was successful
			$state.go('app.reserved');
		}, function(error) {
			// Oops something went wrong during login:
			var alertPopup = $ionicPopup.alert({
				title: 'There was an error logging in!',
				template: 'Error: '+error
			});
			alertPopup.then(function(res) {
				$state.go('app.playlists');
			});
		});
	}

	console.log(auth);
})

.controller('UICtrl', function($scope) {
  $scope.data= [
  	{'name': 'ListView / Splitview', 'url': 'ui_lists'},
  	{'name': 'Cards', 'url': 'ui_cards'},
  	{'name': 'Forms / Setting page', 'url': 'ui_settings'}
  ];
})

.controller('MapCtrl', function($scope, $ionicLoading, $compile) {
//http://ngmap.github.io/
	$scope.positions = [{
		lat: 43.07493,
		lng: -89.381388
	}];

	$scope.$on('mapInitialized', function(event, map) {
		$scope.map = map;

		$scope.centerOnMe= function(){
			$scope.positions = [];

			$ionicLoading.show({
				content: '<i class="icon ion-loading-c"></i>',
				animation: 'fade-in',
				showBackdrop: false,
				maxWidth: 50,
				showDelay: 0
			});

			navigator.geolocation.getCurrentPosition(function(position) {
				var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				$scope.positions.push({lat: pos.k,lng: pos.B});
				var infowindow = new google.maps.InfoWindow({
					map: $scope.map,
					position: pos,
					content: 'Location found using HTML5.'
				});
				$scope.map.setCenter(pos);
				
				$ionicLoading.hide();
			});

		};
	});

	

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
