## Server Side Authentication

Now that the user was authenticated on the client side, you want to make sure that every time an API is called, the user attributes are sent in a secure way. The `auth` service that you used before also provides a `token` which is a signed [JSON Web Token](http://tools.ietf.org/html/draft-jones-json-web-token). This token can be sent through an HTTP header and the backedn API can validaate it without any extra roundtrip (since the token has been signed with a secret that is shared between the API and Auth0).

1. Add to your application the `auth0` module:

  ```js
  var myApp = angular.module('myApp', [
    'ngCookies', 'auth0'
  ]);

  
  myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
  ```

2. Use `$http` from your controller in order to make the request.
  ```js
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        // User authenticated, do something with the response
        ...
      })
      .error(function (data, status, headers, config) {
        ...
      });
  ```

  > NOTE: behind the scenes, the `authInterceptor` will add the JSON Web Token to each request: `config.headers.Authorization = 'Bearer '+ auth.idToken;`


3. If the JSON Web Token (`JWT`) has expired or has been tampered, you can handle the case with this event here:

    ```js
        authProvider.on('forbidden', function(response) {
          auth.signout(); 
          $location.path('/login');
        });
    ```
> Note: the JWT expiration can be controlled from the Auth0 dashboard

Now, choose your backend. You can use a JWT library to validate the token. Here are some:
* [ASP.NET Web API](https://docs.auth0.com/aspnetwebapi-tutorial)
* [Node.js API](https://docs.auth0.com/nodeapi-tutorial)
* [Ruby API](https://docs.auth0.com/rubyapi-tutorial)
* [PHP API](https://docs.auth0.com/phpapi-tutorial)

> For more information about JWT check [jwt.io](http://jwt.io).
