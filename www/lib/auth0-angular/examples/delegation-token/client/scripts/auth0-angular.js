(function () {
  angular.module('auth0', [
    'auth0.storage',
    'auth0.service',
    'auth0.interceptor',
    'auth0.utils'
  ]).run([
    'auth',
    function (auth) {
      auth.hookEvents();
    }
  ]);
  angular.module('auth0.utils', []).provider('authUtils', function () {
    var Utils = {
        capitalize: function (string) {
          return string ? string.charAt(0).toUpperCase() + string.substring(1).toLowerCase() : null;
        },
        urlBase64Decode: function (str) {
          var output = str.replace('-', '+').replace('_', '/');
          switch (output.length % 4) {
          case 0: {
              break;
            }
          case 2: {
              output += '==';
              break;
            }
          case 3: {
              output += '=';
              break;
            }
          default: {
              throw 'Illegal base64url string!';
            }
          }
          return window.atob(output);  //polifyll https://github.com/davidchambers/Base64.js
        }
      };
    angular.extend(this, Utils);
    this.$get = [
      '$rootScope',
      '$q',
      function ($rootScope, $q) {
        var authUtils = {};
        angular.extend(authUtils, Utils);
        authUtils.safeApply = function (fn) {
          var phase = $rootScope.$root.$$phase;
          if (phase === '$apply' || phase === '$digest') {
            if (fn && typeof fn === 'function') {
              fn();
            }
          } else {
            $rootScope.$apply(fn);
          }
        };
        authUtils.callbackify = function (nodeback, success, error, self) {
          if (angular.isFunction(nodeback)) {
            return function (args) {
              args = Array.prototype.slice.call(arguments);
              var callback = function (err, response, etc) {
                if (err) {
                  error && error(err);
                  return;
                }
                // if more arguments then turn into an array for .spread()
                etc = Array.prototype.slice.call(arguments, 1);
                success && success.apply(null, etc);
              };
              args.push(authUtils.applied(callback));
              nodeback.apply(self, args);
            };
          }
        };
        authUtils.isWidget = function (lib) {
          return lib && lib.getClient;
        };
        authUtils.promisify = function (nodeback, self) {
          if (angular.isFunction(nodeback)) {
            return function (args) {
              args = Array.prototype.slice.call(arguments);
              var dfd = $q.defer();
              var callback = function (err, response, etc) {
                if (err) {
                  dfd.reject(err);
                  return;
                }
                // if more arguments then turn into an array for .spread()
                etc = Array.prototype.slice.call(arguments, 1);
                dfd.resolve(etc.length > 1 ? etc : response);
              };
              args.push(authUtils.applied(callback));
              nodeback.apply(self, args);
              // spread polyfill only for promisify
              dfd.promise.spread = dfd.promise.spread || function (fulfilled, rejected) {
                return dfd.promise.then(function (array) {
                  return Array.isArray(array) ? fulfilled.apply(null, array) : fulfilled(array);
                }, rejected);
              };
              return dfd.promise;
            };
          }
        };
        authUtils.applied = function (fn) {
          // Adding arguments just due to a bug in Auth0.js.
          return function (err, response) {
            // Using variables so that they don't get deleted by UglifyJS
            err = err;
            response = response;
            var argsCall = arguments;
            authUtils.safeApply(function () {
              fn.apply(null, argsCall);
            });
          };
        };
        return authUtils;
      }
    ];
  });
  angular.module('auth0.interceptor', []).provider('authInterceptor', function () {
    var skipJWT = 'skipAuthorization';
    var authHeader = 'Authorization';
    var authPrefix = 'Bearer ';
    this.setSkipJWT = function (name) {
      skipJWT = name || skipJWT;
    };
    this.setAuthHeader = function (name) {
      authHeader = name || authHeader;
    };
    this.setAuthPrefix = function (name) {
      authPrefix = name || authPrefix;
    };
    this.$get = [
      '$rootScope',
      '$q',
      '$injector',
      function ($rootScope, $q, $injector) {
        var auth;
        return {
          request: function (config) {
            // When using auth dependency is never loading, we need to do this manually
            // This issue should be related with: https://github.com/angular/angular.js/issues/2367
            if (config[skipJWT] || !$injector.has('auth')) {
              return config;
            }
            auth = auth || $injector.get('auth');
            config.headers = config.headers || {};
            if (auth.idToken && !config.headers[authHeader]) {
              config.headers[authHeader] = authPrefix + auth.idToken;
            }
            return config;
          },
          responseError: function (response) {
            // handle the case where the user is not authenticated
            if (response.status === 401) {
              $rootScope.$broadcast('auth0.forbiddenRequest', response);
            }
            return $q.reject(response);
          }
        };
      }
    ];
  });
  angular.module('auth0.storage', []).service('authStorage', [
    '$injector',
    function ($injector) {
      // Sets storage to use
      var put, get, remove = null;
      if (localStorage) {
        put = function (what, value) {
          return localStorage.setItem(what, value);
        };
        get = function (what) {
          return localStorage.getItem(what);
        };
        remove = function (what) {
          return localStorage.removeItem(what);
        };
      } else {
        var $cookieStore = $injector.get('$cookieStore');
        put = function (what, value) {
          return $cookieStore.put(what, value);
        };
        get = function (what) {
          return $cookieStore.get(what);
        };
        remove = function (what) {
          return $cookieStore.remove(what);
        };
      }
      this.store = function (idToken, accessToken, state, refreshToken) {
        put('idToken', idToken);
        if (accessToken) {
          put('accessToken', accessToken);
        }
        if (state) {
          put('state', state);
        }
        if (refreshToken) {
          put('refreshToken', refreshToken);
        }
      };
      this.get = function () {
        return {
          idToken: get('idToken'),
          accessToken: get('accessToken'),
          state: get('state'),
          refreshToken: get('refreshToken')
        };
      };
      this.remove = function () {
        remove('idToken');
        remove('accessToken');
        remove('state');
        remove('refreshToken');
      };
    }
  ]);
  angular.module('auth0.service', [
    'auth0.storage',
    'auth0.utils'
  ]).provider('auth', [
    'authUtilsProvider',
    function (authUtilsProvider) {
      var defaultOptions = { callbackOnLocationHash: true };
      var config = this;
      this.init = function (options, Auth0Constructor) {
        if (!Auth0Constructor && typeof Auth0Widget === 'undefined' && typeof Auth0 === 'undefined') {
          throw new Error('You must add either Auth0Widget.js or Auth0.js');
        }
        if (!options) {
          throw new Error('You must set options when calling init');
        }
        this.loginUrl = options.loginUrl;
        this.loginState = options.loginState;
        this.clientID = options.clientID || options.clientId;
        this.sso = options.sso;
        this.minutesToRenewToken = options.minutesToRenewToken || 120;
        var Constructor = Auth0Constructor;
        if (!Constructor && typeof Auth0Widget !== 'undefined') {
          Constructor = Auth0Widget;
        }
        if (!Constructor && typeof Auth0 !== 'undefined') {
          Constructor = Auth0;
        }
        this.auth0lib = new Constructor(angular.extend(defaultOptions, options));
        if (this.auth0lib.getClient) {
          this.auth0js = this.auth0lib.getClient();
          this.isWidget = true;
        } else {
          this.auth0js = this.auth0lib;
          this.isWidget = false;
        }
      };
      this.eventHandlers = {};
      this.on = function (anEvent, handler) {
        if (!this.eventHandlers[anEvent]) {
          this.eventHandlers[anEvent] = [];
        }
        this.eventHandlers[anEvent].push(handler);
      };
      var events = [
          'loginSuccess',
          'loginFailure',
          'logout',
          'forbidden'
        ];
      angular.forEach(events, function (anEvent) {
        config['add' + authUtilsProvider.capitalize(anEvent) + 'Handler'] = function (handler) {
          config.on(anEvent, handler);
        };
      });
      this.$get = [
        '$rootScope',
        '$q',
        '$injector',
        'authStorage',
        '$window',
        '$location',
        'authUtils',
        function ($rootScope, $q, $injector, authStorage, $window, $location, authUtils) {
          var auth = { isAuthenticated: false };
          var getHandlers = function (anEvent) {
            return config.eventHandlers[anEvent];
          };
          var callHandler = function (anEvent, locals) {
            $rootScope.$broadcast('auth0.' + anEvent, locals);
            angular.forEach(getHandlers(anEvent) || [], function (handler) {
              $injector.invoke(handler, auth, locals);
            });
          };
          // SignIn
          var onSigninOk = function (idToken, accessToken, state, refreshToken, isRefresh) {
            authStorage.store(idToken, accessToken, state, refreshToken);
            var profilePromise = auth.getProfile(idToken);
            var tokenPayload = auth.getTokenPayload(idToken);
            var response = {
                idToken: idToken,
                accessToken: accessToken,
                state: state,
                refreshToken: refreshToken,
                isAuthenticated: true,
                tokenPayload: tokenPayload
              };
            angular.extend(auth, response);
            callHandler(!isRefresh ? 'loginSuccess' : 'authenticated', angular.extend({ profile: profilePromise }, response));
            return profilePromise;
          };
          function forbidden() {
            authStorage.remove();
            if (config.loginUrl) {
              $location.path(config.loginUrl);
            } else if (config.loginState) {
              $injector.get('$state').go(config.loginState);
            } else {
              callHandler('forbidden');
            }
          }
          // Redirect mode
          var refreshingToken = null;
          $rootScope.$on('$locationChangeStart', function () {
            var hashResult = config.auth0lib.parseHash($window.location.hash);
            if (!auth.isAuthenticated) {
              if (hashResult && hashResult.id_token) {
                onSigninOk(hashResult.id_token, hashResult.access_token, hashResult.state, hashResult.refresh_token);
                return;
              }
              var storedValues = authStorage.get();
              if (storedValues && storedValues.idToken) {
                if (auth.hasTokenExpired(storedValues.idToken)) {
                  if (storedValues.refreshToken) {
                    refreshingToken = auth.refreshIdToken(storedValues.refreshToken);
                    refreshingToken.then(function (idToken) {
                      onSigninOk(idToken, storedValues.accessToken, storedValues.state, storedValues.refreshToken, true);
                    }, function () {
                      forbidden();
                    })['finally'](function () {
                      refreshingToken = null;
                    });
                  } else {
                    forbidden();
                  }
                  return;
                } else {
                  var expireDate = auth.getTokenExpirationDate(storedValues.idToken);
                  if (expireDate.valueOf() - new Date().valueOf() <= auth.config.minutesToRenewToken * 60 * 1000) {
                    auth.renewIdToken(storedValues.idToken).then(function (token) {
                      auth.idToken = token;
                      auth.tokenPayload = auth.getTokenPayload(token);
                    });
                  }
                }
                onSigninOk(storedValues.idToken, storedValues.accessToken, storedValues.state, storedValues.refreshToken, true);
                return;
              }
              if (config.sso) {
                config.auth0js.getSSOData(authUtils.applied(function (err, ssoData) {
                  if (ssoData.sso) {
                    auth.signin({
                      popup: false,
                      connection: ssoData.lastUsedConnection.strategy
                    }, null, null, config.auth0js);
                  }
                }));
              }
            }
          });
          $rootScope.$on('auth0.forbiddenRequest', function () {
            forbidden();
          });
          if (config.loginUrl) {
            $rootScope.$on('$routeChangeStart', function (e, nextRoute) {
              if (nextRoute.$$route && nextRoute.$$route.requiresLogin) {
                if (!auth.isAuthenticated && !refreshingToken) {
                  $location.path(config.loginUrl);
                }
              }
            });
          }
          if (config.loginState) {
            $rootScope.$on('$stateChangeStart', function (e, to) {
              if (to.data && to.data.requiresLogin) {
                if (!auth.isAuthenticated && !refreshingToken) {
                  e.preventDefault();
                  $injector.get('$state').go(config.loginState);
                }
              }
            });
          }
          // Start auth service
          auth.config = config;
          var checkHandlers = function (options) {
            var successHandlers = getHandlers('loginSuccess');
            if (!options.popup && !options.username && !options.email && (!successHandlers || successHandlers.length === 0)) {
              throw new Error('You must define a loginSuccess handler ' + 'if not using popup mode or not doing ro call because that means you are doing a redirect');
            }
          };
          auth.hookEvents = function () {
          };
          auth.getTokenPayload = function (token) {
            var parts = token.split('.');
            if (parts.length !== 3) {
              throw new Error('Error getting token payload');
            }
            var decoded = authUtils.urlBase64Decode(parts[1]);
            if (!decoded) {
              throw new Error('Error getting token payload');
            }
            return JSON.parse(decoded);
          };
          auth.getTokenExpirationDate = function (token) {
            var decoded;
            try {
              decoded = auth.getTokenPayload(token);
            } catch (e) {
              return null;
            }
            if (!decoded.exp) {
              return null;
            }
            var d = new Date(0);
            // The 0 here is the key, which sets the date to the epoch
            d.setUTCSeconds(decoded.exp);
            return d;
          };
          auth.hasTokenExpired = function (token) {
            if (!token) {
              return true;
            }
            var d = auth.getTokenExpirationDate(token);
            if (isNaN(d)) {
              return true;
            }
            // Token expired?
            if (d.valueOf() > new Date().valueOf()) {
              // No
              return false;
            } else {
              // Yes
              return true;
            }
          };
          auth.getToken = function (options) {
            options = options || { scope: 'openid' };
            if (!options.id_token && !options.refresh_token) {
              options.id_token = auth.idToken;
            }
            var getDelegationTokenAsync = authUtils.promisify(config.auth0js.getDelegationToken, config.auth0js);
            return getDelegationTokenAsync(options).then(function (delegationResult) {
              return delegationResult.id_token;
            });
          };
          auth.refreshIdToken = function (refresh_token) {
            var refreshTokenAsync = authUtils.promisify(config.auth0js.refreshToken, config.auth0js);
            return refreshTokenAsync(refresh_token || auth.refreshToken).then(function (delegationResult) {
              return delegationResult.id_token;
            });
          };
          auth.renewIdToken = function (id_token) {
            var renewIdTokenAsync = authUtils.promisify(config.auth0js.renewIdToken, config.auth0js);
            return renewIdTokenAsync(id_token || auth.idToken).then(function (delegationResult) {
              return delegationResult.id_token;
            });
          };
          auth.signin = function (options, successCallback, errorCallback, lib) {
            options = options || {};
            checkHandlers(options);
            var auth0lib = lib || config.auth0lib;
            var signinCall = authUtils.callbackify(auth0lib.signin, function (profile, idToken, accessToken, state, refreshToken) {
                onSigninOk(idToken, accessToken, state, refreshToken).then(function (profile) {
                  if (successCallback) {
                    successCallback(profile);
                  }
                });
              }, function (err) {
                callHandler('loginFailure', { error: err });
                if (errorCallback) {
                  errorCallback(err);
                }
              }, auth0lib);
            if (authUtils.isWidget(auth0lib)) {
              signinCall(options, null);
            } else {
              signinCall(options);
            }
          };
          auth.signup = function (options, successCallback, errorCallback) {
            options = options || {};
            checkHandlers(options);
            var auth0lib = config.auth0lib;
            var signupCall = authUtils.callbackify(auth0lib.signup, function (profile, idToken, accessToken, state, refreshToken) {
                if (!angular.isUndefined(options.auto_login) && !options.auto_login) {
                  successCallback();
                } else {
                  onSigninOk(idToken, accessToken, state, refreshToken).then(function (profile) {
                    if (successCallback) {
                      successCallback(profile);
                    }
                  });
                }
              }, function (err) {
                callHandler('loginFailure', { error: err });
                if (errorCallback) {
                  errorCallback(err);
                }
              }, auth0lib);
            if (config.isWidget) {
              signupCall(options, null);
            } else {
              signupCall(options);
            }
          };
          auth.reset = function (options, successCallback, errorCallback) {
            options = options || {};
            var auth0lib = config.auth0lib;
            var resetCall;
            if (config.isWidget) {
              resetCall = authUtils.callbackify(auth0lib.reset, successCallback, errorCallback, auth0lib);
              resetCall(options, null);
            } else {
              resetCall = authUtils.callbackify(auth0lib.changePassword, successCallback, errorCallback, auth0lib);
              resetCall(options);
            }
          };
          auth.signout = function () {
            authStorage.remove();
            auth.profile = null;
            auth.profilePromise = null;
            auth.idToken = null;
            auth.state = null;
            auth.accessToken = null;
            auth.tokenPayload = null;
            auth.isAuthenticated = false;
            callHandler('logout');
          };
          auth.getProfile = function (idToken) {
            var getProfilePromisify = authUtils.promisify(config.auth0lib.getProfile, config.auth0lib);
            auth.profilePromise = getProfilePromisify(idToken || auth.idToken);
            return auth.profilePromise.then(function (profile) {
              auth.profile = profile;
              return profile;
            });
          };
          return auth;
        }
      ];
    }
  ]);
}());