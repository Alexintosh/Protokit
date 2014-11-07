## Linking Accounts

In order to link two accounts, in a controller create a link method (make sure to have the auth object injected):

```js
$scope.link = function () {
  auth.signin({
    popup: true,
    access_token: auth.accessToken
  }).then(function () {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  });
};
```

Then in your view create an anchor:

```html
<a ng-click="link()" href="#">link account</a>
```

When the user clicks on that anchor, they will be prompted to enter the credentials the second account they want to join. 

### Restricting Selection

You may want to add a connection parameter to restrict user election. For instance, you can create a view that looks like this:

```html
<a href="#" ng-click="linkGoogle()">Link your Google Account</a>
<a href="#" ng-click="linkTwitter()">Link your Twitter Account</a>
```

And in your controller:

```js
$scope.linkGoogle = function () {
  auth.signin({
    popup: true,
    connection: 'google-oauth2'
    access_token: auth.accessToken
  }).then(function () {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  });

$scope.linkTwitter = function () {
  auth.signin({
    popup: true,
    connection: 'twitter'
    access_token: auth.accessToken
  }).then(function () {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  });
```

So, on that way you limit the choice of the provider to use.
