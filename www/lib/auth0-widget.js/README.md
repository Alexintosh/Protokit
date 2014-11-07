[![Auth0](https://i.cloudup.com/1vaSVATKTL.png)](http://auth0.com)

[![NPM version][npm-image]][npm-url]
[![Build status][strider-image]][strider-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![Auth0](https://i.cloudup.com/fKuIOiaPrL.png)](http://auth0.com)

[Auth0](https://auth0.com) is an authentication broker that supports social identity providers as well as enterprise identity providers such as Active Directory, LDAP, Office365, Google Apps, Salesforce.

The Auth0 Login Widget makes it easy to integrate SSO in your app. You won't have to worry about:
* Having a professional looking login dialog that displays well on any resolution and device.
* Finding the right icons for popular social providers.
* Remembering what was the identity provider the user chose the last time.
* Solving the home realm discovery challenge with enterprise users (i.e.: asking the enterprise user the email, and redirecting to the right enterprise identity provider).
* Implementing a standard sign in protocol (OpenID Connect / OAuth2 Login)

## Usage

Take `auth0-widget.js` or `auth0-widget.min.js` from the `build` directory and import it to your page.

### Initialize:

Construct a new instance of the Auth0 Widget as follows:

~~~html
<script src="http://cdn.auth0.com/w2/auth0-widget-4.1.js"></script>
<script type="text/javascript">
  var widget = new Auth0Widget({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7',
    callbackURL:  'http://my-app.com/callback'
  });

  // ...
</script>
~~~

### Show Widget:

To invoke the widget, use the `show` method:

~~~javascript
widget.signin();
// or
widget.signin(options, callback);
~~~

#### Options

* __connections__: Array of enabled connections that will be used for the widget. _Default: all enabled connections_.
* __container__: The id of the DIV where the widget will be contained.
* __icon__: Icon url. _Recommended: 32x32_.
* __showIcon__: Show/Hide widget icon. _Default: false_.
* __connection_scopes__: Scopes to request to each identity provider that are not configured for the connection.
* __offline_mode__: If set, the `refresh_token` will be returned after a successful login.

~~~javascript
widget.signin({
  connections: ['facebook', 'google-oauth2', 'twitter', 'Username-Password-Authentication', 'fabrikam.com'],
  container: 'root',
  icon: 'https://s3.amazonaws.com/assets.fabrikam.com/w2/img/logo-32.png',
  showIcon: true,
  offline_mode: true,
  connection_scopes: {
    'facebook': ['public_profile', 'user_friends'],
    'google-oauth2': ['https://www.googleapis.com/auth/orkut'],
    // none for twitter
  }
}, function () {
  // The Auth0 Widget is now loaded.
}, function(profile, id_token, access_token, state, refresh_token) {

});
~~~

## `signup` and `reset`

It is also possible to start the widget in the __Sign Up mode__ or __Reset Password__ mode as follows:

~~~javascript
widget.signup(/* [same as the .signin method] */)

// or

widget.reset(/* [same as the .signin method] */)
~~~

## Single Page Applications

You can handle the authorization process client-side as follows:

~~~javascript
<script type="text/javascript">

  function callback(err, profile, id_token, access_token, state) {
      if (err) {
        // Handle authentication error
        return;
      }
      alert('hello ' + profile.name);
      //use result.id_token to call your rest api
  }

  var widget = new Auth0Widget({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7',
    callbackURL:  'http://my-app.com/',
    callbackOnLocationHash: true
  });

  widget.signin({popup: true}, null, callback)
</script>
~~~

## i18n

__Note 1:__ most of the translations are machine generated, please help us to move this forward.

Version `1.2.0` we added support for internationalization:

![](http://s3.amazonaws.com/blog.auth0.com/login_langs.gif)

You can call instantiate the widget with the `dict` option:

~~~javascript
  var widget = new Auth0Widget({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7',
    callbackURL:  'http://my-app.com/',
    dict:         'es'
  });
~~~

where dict can be a string matching the name of the file in the `i18n` folder or it could be an object literal as follows:

~~~javascript
  var widget = new Auth0Widget({
    domain:       'mine.auth0.com',
    clientID:     'dsa7d77dsa7d7',
    callbackURL:  'http://my-app.com/',
    dict:         {
      "loadingTitle": "loading...",
      "close": "close",
      "signin": {
      ..//same as in i18n json files
    }
  });
~~~

## Customize the look and feel

Apply your own style to the elements.

All classes and ids are prefixed with `a0-` to avoid conflicts with your own stylesheets.

Send us an screenshot! We would love to see what you can do.

## Example

The example directory has a ready-to-go app. In order to run it you need [node](http://nodejs.org/) installed and **grunt** (`npm i grunt -g`), then execute `grunt example` from the root of this project.

## Develop

To run the tests that don't require [BrowserStack](http://browserstack.com), first install `npm install -g testem` and then run `grunt test`.

To run the entire test suite run `grunt dev` and point your browser to `http://localhost:9999/test_harness.html`.

## Browser Compatibility

We are using [BrowserStack](http://browserstack.com) to run the test suite on multiple browsers on every push.

## Develop

Run `grunt dev` and point your browser to `http://localhost:9999/test_harness.html` to run the test suite.

Run `grunt phantom` if you have PhantomJS installed.

Run `grunt integration` (or `npm test`) if you have SauceLabs account. You will need a `SAUCE_ACCESS_KEY` and `SAUCE_USERNAME` env variables.

## Publishing a new version

Use:

```
  # release new version
  $ ./bin/version {patch,minor,major}

  # update remote repository
  $ git push origin master

  # and let Auth0's CI worry about the rest
```

That's it!

## License

MIT


<!-- Vaaaaarrsss -->

[npm-image]: https://img.shields.io/npm/v/auth0-widget.js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/auth0-widget.js
[strider-image]: http://ci.auth0.com/auth0/widget/badge
[strider-url]: http://ci.auth0.com/auth0/widget
[coveralls-image]: https://img.shields.io/coveralls/auth0/widget.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/auth0/widget?branch=master
[david-image]: http://img.shields.io/david/auth0/widget.svg?style=flat-square
[david-url]: https://david-dm.org/auth0/widget
[license-image]: http://img.shields.io/npm/l/auth0-widget.js.svg?style=flat-square
[license-url]: #License
[downloads-image]: http://img.shields.io/npm/dm/auth0-widget.js.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/auth0-widget.js
