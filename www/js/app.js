// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova', 'ngMap', 'auth0'])

.run(function($ionicPlatform, $cordovaSplashscreen, auth) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  // Hook auth0-angular to all the events it needs to listen to
  auth.hookEvents();
})

.config(function($stateProvider, $urlRouterProvider, authProvider) {
  
  // Configure Auth0
  authProvider.init({
    domain: 'alexintosh.auth0.com',
    clientID: 'SxIHpsMBbL0vaY2Be71BLMK4uJjexlbN',
    callbackURL: location.href,
    loginState: 'login'
  });

  
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })
    
    .state('login', {
      url: '/login',
      templateUrl: 'templates/browse.html',
      controller: 'LoginCtrl',
   })

   .state('app.reserved', {
      url: '/reserved',
      views: {
        'menuContent' :{
          templateUrl: "templates/reserved.html",
	  controller: 'ReservedCtrl'
        }
      },
      data:{ requireLogin:true }
   })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.ui', {
      url: "/ui",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'UICtrl'
        }
      }
    })
    
    .state('app.cards', {
      url: "/ui_cards",
      views: {
        'menuContent' :{
          templateUrl: "templates/cards.html",
        }
      }
    })

    .state('app.map', {
      url: "/map",
      views: {
        'menuContent' :{
          templateUrl: "templates/map.html",
	  controller: 'MapCtrl'
        }
      }
    })

    .state('app.settings', {
      url: "/ui_settings",
      views: {
        'menuContent' :{
          templateUrl: "templates/settings.html"
        }
      }
    })

    .state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    })

    .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});

