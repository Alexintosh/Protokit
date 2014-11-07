require.config({
    paths: {
        'angular':          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular',
        'angular-route':    '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-route',
        'angular-cookies':  '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-cookies',
        'auth-angular':     './auth0-angular',
        'auth0':            '//cdn.auth0.com/w2/auth0-4'
    },
    shim: {
        'angular':{ exports:'angular' },

        'angular-cookies':  { deps:['angular']         },
        'angular-route':    { deps:['angular']         },
        'auth0-angular':    { deps:['angular',
                                    'angular-cookies',
                                    'angular-route']   }
    }
});

define([ './controllers' ], function () {
  // Your app has loaded!
});

