# Auth0 and AngularJS

This AngularJS module will help you implement client-side and server-side (API) authentication. You can use it together with [Auth0](https://www.auth0.com) to add support for username/password authentication, enterprise identity providers like Active Directory or SAML and also for social identity providers like Google, Facebook or Salesforce among others to your web, API and mobile native apps.

[Auth0](https://www.auth0.com) is a cloud service that provides a turn-key solution for authentication, authorization and Single Sign On.

## Key Features

* **User Login & Signup**: This module lets you easily sign in and sign up your users with any Social Provider, Enterprise Provider or Username and password. You can use the UI already made by Auth0 or create your own
* **Persistent user authentication**: We'll take care of keeping the user logged in after page refresh, browser closed and so on.
* **Authenticated API calls**: We'll take care of automatically adding the `JWT` in every request that is made to your API after the user is authenticated
* **Events/Promise based services**: Our service supports both Events based actions as well as promise based ones
* **Token management**: We'll handle the token storage and configuration all the time. You don't even need to know there's a token.

## Installation

You can install this plugin several ways

### Bower

````bash
bower install auth0-angular
````

### NPM

````bash
npm install auth0-angular
````

### CDN

````html
<script type="text/javascript" src="//cdn.auth0.com/w2/auth0-widget-5.js"></script>
<script type="text/javascript" src="//cdn.auth0.com/w2/auth0-angular-2.js"></script>
````

> **Warning**: If you use a CDN or get the script manually, please be sure to include `auth0-widget` or `auth0.js` that matches the versions [specified on the `bower.json`](https://github.com/auth0/auth0-angular/blob/master/bower.json#L7-L8)

## TL;DR: Quick start guide

### Add module dependency and configure it

````js
angular.module('myCoolApp', ['auth0'])
  .config(function(authProvider, $httpProvider) {

    // routing configuration and other stuff
    // ...

    authProvider.init({
      domain: 'mydomain.auth0.com',
      clientID: 'myClientID',
      loginUrl: '/login',
      callbackUrl: location.href
    });

    // This automatically adds the token in every request
    $httpProvider.interceptors.push('authInterceptor');
  })
  .run(function(auth) {
    auth.hookEvents();
  });
````

### Showing the signin popup and getting the information

````js
// LoginCtrl.js
angular.module('myCoolApp').controller('LoginCtrl', function(auth) {
  $scope.signin = function() {
    auth.signin({popup: true}, function() {
      $location.path('/user-info')
    }, function(err) {
      console.log("Error :(", err);
    });
  }
});
````
````html
<a href="" ng-click="signin()" />
````

### Showing user information
````js
// UserInfo.js
angular.module('myCoolApp').controller('UserInfoCtrl', function(auth) {
  $scope.profile = auth.profile;
});
````
````html
<!-- userInfo.html -->
<span>{{profile.first_name}} {{profile.email}}</span>
````

## Getting Started Guide

### Preface: Authentication Modes

There're 3 modes to handle authentication with all the Providers (Facebook, Linkedin, Github, AD, LDAP, etc.) that Auth0 can handle. **Redirect mode** implies that the page you're seeing is going to get redirected to the page of the provider so that you can login. **Popup mode** implies that your angular app will open a popup window which will go to the provider website so that you can login and then close itself to show the Angular app again. This is really important to your app because if you use Redirect Mode, it means that your angular app will get **reloaded completely** after the user is authenticated with the provider. In Popup mode, the angular app will **remain open**.
The third mode is just doing a CORS call to `/ro` to authenticate the user. This is only used for `Database-Password` connections. In this case, the website will not refresh either.

### Dependencies

auth0-angular depends on either `auth0.js` or `auth0-widget.js`.

If you want to use Auth0's beautiful Widget UI, you need to include `auth0-widget.js`. This lets you configure Title and Icons, but the UI is taken care for you. For all the customization properties, please check out [tihs link](https://docs.auth0.com/login-widget2#4)

Otherwise, if you'll use a custom UI, you need to include `auth0.js`.

**It's important to note that this scripts must be included before auth0-angular**.

If you're using `bower` or `npm`, these 2 scripts are set as dependencies of auth0-angular so that you choose the best for you. Otherwise, you can include them from the CDN:

````html
<!-- Either this -->
<script type="text/javascript" src="//cdn.auth0.com/w2/auth0-widget-5.js"></script>
<!-- or -->
<script type="text/javascript" src="//cdn.auth0.com/w2/auth0-3.js"></script>
````

### SDK API

This is the API for the SDK. `[]` means optional parameter.

#### auth.signin(options[, successCallback, errorCallback])

This method does the signin for you. If you're using `auth0-widget`, it'll display Auth0's widget, otherwise it'll just do the login with the Identity provider that you ask for.

The most important option is the **`popup` option. If set to `true`**, popup mode will be used and as the Angular page will not reload, **you can use callbacks to handle the sigin success and failure**. **We don't use promises since once the widget is opened, the user can enter the password incorrectly several times and then enter it ok. We cannot fulfill a promise (with success or failure) more than once unfortunately**.

````js
auth.signin({popup: true}, function(
  // All good
  $location.path('/');
), function(error) {
  // Error
})
````

**If you set `popup` option to `false`** (**this is the default value**), there're 2 posibilities.
If you've set the `username` and `password` options, then a CORS call to `/ro` will be done and you can use a promise to handle this case.

````js
auth.signin({
  username: $scope.username,
  password: $scope.password,
  connection: ['Username-Password-Authentication']
}, function(
  // All good
  $location.path('/');
), function(error) {
  // Error
})
````

**If you set `popup` option to `false`** (**this is the default value**) **and you don't set username and pasword as options**, redirect mode will be used. As Angular page is reloaded, you **cannot use callbacks nor promises** to handle login success and failure. You'll need to use `events` to handle them:

````js
// app.js
module.config(function(authProvider) {
  authProvider.on('loginSuccess', function($location) {
    $location.path('/');
  });

  authProvider.on('authenticated', function($location) {
    // This is after a refresh of the page
    // If the user is still authenticated, you get this event
  });

  authProvider.on('loginFailure', function($location, error) {
    $location.path('/error');
  });
});
````
````js
// LoginCtrl.js
auth.signin(
  // popup: false. This is the default
);
````

You can read **a more extensive tutorial on how to use auth0-angular with [popup mode here](docs/widget-popup.md) and with [redirect mode here](docs/widget-redirect.md)**.

The rest of the **options that can be sent can be [checked here](https://docs.auth0.com/login-widget2#4)**.

#### auth.signup(options[, successCallback, errorCallback])

This shows the widget but in `signup` mode. It has the same options and parameters as the login. It's important to note that it'll perform a login after a successful signup.

#### auth.reset(options[, successCallback, errorCallback])

This will perform the "Forgot your password" flow.
If you're using `auth0.js` it will send the email to confirm the password change. [See the documentation here](https://github.com/auth0/auth0.js#change-password-database-connections)
If you're using `auth0-widget.js`, it will open the widget in the reset password mode. It can receive in that case the same parameters as the `signin` method.
This method receives 2 extra parameters to handle the success and failure callbacks similar to `signin`.

#### auth.signout()

This signouts the user. Deletes the token from the client storage.

#### auth.profile

This property contains the profile from the user. **This will be filled after the user has logged in successfully**. If you want to use information from `auth.profile` only after the user is logged in, you can just do a `$watch` on this property to wait until it's set.

#### auth.profilePromise

Same as the `auth.profile` but it's actually a promise that you can check. It might be null or a promise. Null is even before the user tries to log in.

#### auth.tokenPayload

This has the decoded Payload of the JWT. **This will be filled after the user has logged in successfully**

#### auth.isAuthenticated

This flag returns whether there's a user authenticated or not.

#### auth.id_token, auth.access_token, auth.state

These properties contain the tokens returned after the user is logged in. Mostly for internal usage.

#### auth.hookEvents()

auth0-angular takes care of checking that **unauthenticated users canoot access restricted resources**. For that, auth0-angular hooks to internal angular events so that we can redirect the user to the login page if he doesn't have the right permission to access a page. For that, you need to hook auth0-angular to all of these events on application run.

First, you need to configure the restricted routes:

````js
// Using ngRoute
module.config(function($routeProvider) {
  $routeProvider.
  when('/info', {
    templateUrl: 'info.html',
    controller: 'InfoCtrl',
    requiresLogin: true
  }).
  when('/login', {
    tempalteUrl: 'login.html',
    controller: 'LoginCtrl'
  });

  authProvider.init({
    domain: 'domain',
    clientID: 'clientID',
    callbackUrl: location.href,
    loginUrl: '/login'
  })
})

// Using ui-router
module.config(function($stateProvider) {
  $stateProvider.
  state('info', {
    url: '/info'
    templateUrl: 'info.html',
    controller: 'InfoCtrl',
    data: {
      requiresLogin: true
    }
  }).
  state('login', {
    url: '/login'
    tempalteUrl: 'login.html',
    controller: 'LoginCtrl'
  });

  authProvider.init({
    domain: 'domain',
    clientID: 'clientID',
    callbackUrl: location.href,
    loginState: 'login'
  })
});
````

Then, you just call `hookEvents` in the `run` method

````js
module.run(function(auth) {
  auth.hookEvents();
});
````

To learn more about routing and using `ngRoute` or `ui-router` with your app, please [read this tutorial](docs/routing.md)

#### auth.getToken(options)

This method does a Delegation Token request, which means exchanging the current token for another one.

There're 2 options:

1) Auth0 has several Addons which let you get new tokens based on Auth0 one. Imagine you have Firebase or AWS. You want to get the token for Firebase, then you can call the following:

````js
auth.getToken({
  api: 'firebase' // By default it's going to be the first active addonn in the list of addons
})
````

2) Imagine you have 2 APIs. The user in your angular app is logged in to your angular app that uses API #1. If you want to use API #2, you need to exchange the token you have for the API #1 for a valid one for API #2. The `targetClientId` parameter is just the identifier of the API #2 in this case. **Returns a promise**.

````js
auth.getToken({
  targetClientId: 'other client id',
  api: 'auth0' // We want the Auth0 ID_token of the other API
})
````

To learn more about delegated access [please click here](https://docs.auth0.com/auth-api#delegated).

#### auth.renewIdToken()

You can configure your token to expire after a certain time. If you don't want your user to login again, you can just refresh the current token, which means getting a new token that will be valid for a certain amount of time.

For example, let's imagine you have a token valid for 10 hours. After 9 hours, you can refresh the token to get a new token that's going to be valid for another 10 hours. You just need to call this method in that case and we'll handle everything for you. **Returns a promise**.


#### auth.refreshIdToken(refresh_token)

Given a **expired** `id_token`, you can use the `refresh_token` to get a new and valid `id_token`.

#### auth.hasTokenExpired(token)

This returns if a particular token has expired or not. Mostly for internal usage.

#### authProvider.init(options)

You use this method to configure the auth service. You must set the following options:

* **domain**: The domain you have from your Auth0 account.
* **callbackUrl**: The callback URL. Usually this is `location.href`.
* **clientId**: The identifier for the application you've created. This can be found in the settings for your app on Auth0.
* **sso**: If you have more than one application and you want Single Sign On on your apps, just set this to `true`. This will mean that if a user signs in to app 1, when he tries to use app 2, he will be already logged in.
* **loginUrl**: Set this to the login url **if you're using ngRoute**.
* **loginState**: Set this to the login state **if you're using ui-router**.
* **minutesToRenewToken**: Renew the `idToken` when it expired in less than N minutes. By default, it's 120 minutes.

#### authProvider.on(event, handler)

You can configure the handlers for all the different events that can happen in your app. The following are the available events right now:

* **authenticated**: This will get called after a refresh of the page if the user is still authenticated. In the handler, you can inject any service you want.
* **loginSucces**: This will get called after a user has successfully logged in. In the handler, you can inject any service you want besides the `profile` and `token` from the user.
* **loginFailure**: This will get called if there's an error authenticating the usr. In the handler, you can inject any service you want besides the `error` which was thrown.
* **logout**: This will get called after a user has successfully logged out.
* **forbidden**: This will get called if a request to an API is made and it returns 401 meaning that the user cannot access that resource. That usually happens when the token is expired. In that case, you should redirect the user to the login page in most cases.

It's important to note that in the case of **redirect mode, it's mandatory to handle login events in this way. In the case of popup mode, you can still handle the login events this way, but you can also handle them with a promise on the signin method**.


## Tutorials & Examples

This is the list of all of the available tutorials.

### Using Auth0 Widget (You don't want your custom UI)

#### Redirect mode

* **[Click here to read the tutorial](docs/widget-redirect.md)**
* **[Click here to see the tutorial](https://github.com/auth0/auth0-angular/tree/master/examples/widget-redirect)**

![Widget redirect](http://cl.ly/image/2o423i362s2P/WidgetRedirect.gif)

#### Popup mode

* **[Clcik here to read the tutorial](docs/widget-popup.md)**
* **[Click here to see the example](https://github.com/auth0/auth0-angular/tree/master/examples/widget)**

![Widget Popup](https://cloudup.com/cg8u9kVV5Vh+)

### With your own UI

#### User/Password Login

* **[Click here to read the tutorial](docs/jssdk.md)**
* **[Click here to see the example](https://github.com/auth0/auth0-angular/tree/master/examples/custom-login)**

![basic_guide](https://cloudup.com/cmaeJKX7LEM+)

#### Social Login

* **[Click here to read the tutorial](docs/jssdk.md#social-authentication)**
* **[Click here to see the example](https://github.com/auth0/auth0-angular/tree/master/examples/custom-login)**

![popup_guide](https://cloudup.com/cKpVNpR4s9y+)


### Refresh tokens

* **[Click here to read the tutorial](docs/refreshToken.md)**

### Consuming a protected REST API

* **[Click here to read the tutorial](docs/backend.md)**
* **[Click here to see the example](https://github.com/auth0/auth0-angular/tree/master/examples/api-authentication)**

### Join or Link accounts

* **[Click here to read the tutorial](docs/link-accounts.md)**

### Integrating to routes (ui-router and ngRoute)

* **[Click here to read the tutorial](docs/routing.md)**
* **[Click here to see the ui-router example](https://github.com/auth0/auth0-angular/tree/master/examples/ui-router)**
* **[Click here to see the ngRoute example](https://github.com/auth0/auth0-angular/tree/master/examples/widget-redirect)**
* **[Click here to see the html5mode example](https://github.com/auth0/auth0-angular/tree/master/examples/html5mode)**

### Using your custom storage

* **[Click here to learn how to use your custom storage to store the tokens instead of localStorage or ngCookies](docs/custom-storage.md)**

### Delegation Token

* **[Click here to see the delegation token example](https://github.com/auth0/auth0-angular/tree/master/examples/delegation-token)**

### Signup with custom fields (Besides Email & Password)

* **[Click here to see the delegation token example](https://github.com/auth0/auth0-angular/tree/master/examples/custom-signup)**

### SSO

* **[Click here to see the SSO example](https://github.com/auth0/auth0-angular/tree/master/examples/sso)**

## Changelog

Check [the CHANGELOG file](CHANGELOG.md) to see the changes from version to version


## Contributing
 [Read here how to run auth0-angular tests](docs/testing.md)


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.
