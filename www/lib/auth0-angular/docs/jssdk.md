# Getting Started: Use your own UI

For this tutorial, you need to create a new account in [Auth0](https://www.auth0.com) and setup a new application. We will then implement client side and server side auth.

1.  Add the following dependencies to your project:
    ```html
    <script src="//code.angularjs.org/1.2.16/angular.min.js"></script>
    <script src="//code.angularjs.org/1.2.16/angular-cookies.min.js"></script>
    <script src="//code.angularjs.org/1.2.16/angular-route.min.js"></script>
    <script src="//cdn.auth0.com/w2/auth0-2.1.js"> </script>
    <script src="//cdn.auth0.com/w2/auth0-angular-1.0.js"> </script>
    ```

2. Add module dependencies:
    ```js
    var app = angular.module('myApp', ['ngRoute', 'auth0']);
    ```

2. Configure routes for the Authentication flow. Note that the `/` route has a `requiresLogin` set to true so that if a non authenticated user tries to go there, he'll be redirected to the `loginPage`
    ```js
    myApp.config(function ($routeProvider, authProvider) {
      ...
      $routeProvider
      .when('/',        { 
        templateUrl: 'views/main.html',     
        controller: 'MainCtrl',
        requiresLogin: true
      })
      .when('/login',   { 
        templateUrl: 'views/login.html',    
        controller: 'LoginCtrl'
     });
    });
    ```

  > Note: Angular's [default routing library](https://docs.angularjs.org/api/ngRoute/service/$route) is used in this example but [ui-router](https://github.com/angular-ui/ui-router) can be used too. Check [auth0-angular ui-router example](https://github.com/auth0/auth0-angular/tree/master/examples/ui-router).

3. Inject and initiate the `auth` service in the app main config block with your `domain`, `clientID` and `callbackURL` (get them from [Auth0](https://app.auth0.com/#/) dashboard in [Application Settings](https://app.auth0.com/#/applications)). Also, you should set the `loginUrl` which is the path the user will be redirected to if he tries to access a route that needs authentication.
    ```js
    myApp.config(function ($routeProvider, authProvider) {
      ...
      authProvider.init({ 
        domain: 'yourdomain.auth0.com', 
        clientID: 'YOUR_CLIENT_ID', 
        callbackURL: location.href,
        loginUrl: '/login'
      });
    })
    .run(function(auth) {
      // This hooks al auth events to check everything as soon as the app starts
      auth.hookEvents();
    });;
  ```

4. Configure the `loginSuccess` and `loginFailure` events to handle the login. You can inject any `angularjs` service to the handler as well as `idToken`, `profile` and `authToken`.

  ```js
      myApp.config(function (authProvider) {
        ...
        authProvider.on('loginSuccess', function($location) {
          // See how we injected $location here
          $location.path('/');
        });

        authProvider.on('loginFailure', function($window) {
          $window.alert('Error logging in');
        })
      });
    ```


4. Inject the `auth` service in your controllers and call the `signin`/`signout` methods.
  ```js
  myApp
    .controller('LoginCtrl', function ($scope, auth) {
      $scope.login = function() {
        // This will authenticate the user with your custom UI
        auth.signin({
          username: $scope.username,
          password: $scope.password,
          connection: 'Username-Password-Authentication'
        });
      }
    })
    .controller('MainCtrl', function ($scope, auth) {
      $scope.logout = function() {
        auth.signout();
      }
    });
  ```

  ```html
  <!-- Include this on your login.html -->
  <div>
    <label>Username</label><input type="text" ng-model="username" />
    <label>Password</label><input type="text" ng-model="password" />
  </div>
  <a href="" ng-click="signin()">click to login</a>

  <!-- Include this on your main.html -->
  <a href="" ng-click="logout()">click Here to logout</a>
  ```

6. Use the `auth.profile` object to show user attributes in the view.
  ```js
  myApp.controller('MainCtrl', function ($scope, auth) {
    $scope.user = auth.profile;
  };
  ```
  The template of that controller will be:
  ```html
  <div>
    <br />
    <span>Welcome {{user.name}}!</span>
  </div>
  ```

> More details about the parameters you can use for the [Auth0 Login Widget](https://docs.auth0.com/login-widget2) and [auth0.js](https://github.com/auth0/auth0.js).

After that, you may want to send requests to your server side. That can be found in the [Server Side Authentication section](backend.md).

## Social Authentication
To add Social authentication follow these steps:

1. Add the a button to login with Google in your `login.html`
  ````html
  <input type="button" ng-click="loginWithGoogle()" />
  ````
2. Add the code to login with Google in `LoginCtrl`
  ````js
  $scope.loginWithGoogle = function() {
    auth.signin({
      connection: 'google-oauth2'
      // add popup: true if you want the google page to open in a popup
      // instead of doing a redirect
      // popup: true
    });
  }
  ````

