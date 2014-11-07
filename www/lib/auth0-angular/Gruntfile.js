var pkg = require('./package');

var minorVersion = pkg.version.replace(/\.(\d)*$/, '');
var majorVersion = pkg.version.replace(/\.(\d)*\.(\d)*$/, '');
var path = require('path');

function  renameRelease (v) {
  return function (d, f) {
    var dest = path.join(d, f.replace(/(\.min)?\.js$/, '-'+ v + '$1.js'));
    return dest;
  };
}

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var filesToWatch = [
    'src/**/*.js',
    'test/**/*.js',
    'Gruntfile.js'
  ];

  grunt.initConfig({
    clean: [
      'build/'
    ],

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        ignores:  [
        ]
      },

      all: [
        'Gruntfile.js',
        'src/{,*/}*.js',
        'test/{,*/}*.js',
        'test/{,*/}*.js'
      ]
    },

    ngmin: {
      dist: {
        files: [ { expand: true, cwd: 'src', src: '**/*.js', dest: 'build/' } ]
      }
    },

    concat: {
      dist: { dest: 'build/auth0-angular.js', src: ['build/auth0-angular.js'] }
    },

    uglify: {
      min: {
        files: {
          'build/auth0-angular.min.js': ['build/auth0-angular.js']
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    copy: {
      example: {
        files: {
          'examples/custom-login/scripts/auth0-angular.js':               'build/auth0-angular.js',
          'examples/delegation-token/client/scripts/auth0-angular.js':    'build/auth0-angular.js',
          'examples/custom-signup/client/scripts/auth0-angular.js':       'build/auth0-angular.js',
          'examples/api-authentication/client/scripts/auth0-angular.js':  'build/auth0-angular.js',
          'examples/html5mode/public/auth0-angular.js':                   'build/auth0-angular.js',
          'examples/widget/scripts/auth0-angular.js':                     'build/auth0-angular.js',
          'examples/sso/scripts/auth0-angular.js':                        'build/auth0-angular.js',
          'examples/widget-redirect/scripts/auth0-angular.js':            'build/auth0-angular.js',
          'examples/ui-router/scripts/auth0-angular.js':                  'build/auth0-angular.js',
          'examples/refresh-token/auth0-angular.js':                  'build/auth0-angular.js',
          'examples/requirejs/scripts/auth0-angular.js':                  'build/auth0-angular.js'
         }
      },
      release: {
        files: [{
          expand: true,
          flatten: true,
          src: 'build/*',
          dest: 'release/',
          rename: renameRelease(pkg.version)
        }, {
          expand: true,
          flatten: true,
          src: 'build/*',
          dest: 'release/',
          rename: renameRelease(minorVersion)
        }, {
          expand: true,
          flatten: true,
          src: 'build/*',
          dest: 'release/',
          rename: renameRelease(majorVersion)
        }]
      }
    },

    connect: {
      scenario_custom_login: {
        options: {
          base: './examples/custom-login',
          port: 3000
        }
      }
    },


    watch: {
      dev: {
        options: {
          livereload: true
        },
        files: filesToWatch,
        tasks: ['build']
      }
    },

    protractor: {
      local: {
        configFile: 'scenario/protractor.conf.js',
        args: {
          params: {
            credentials: {
              google: {
                user: process.env.GOOGLE_USER,
                pass: process.env.GOOGLE_PASSWORD
              }
            }
          }
        }
      }
    },

    s3: {
      options: {
        key:    process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
        access: 'public-read',
        headers: {
          'Cache-Control':  'public, max-age=300'
        }
      },
      clean: {
        del: [
          { src:     'w2/auth0-angular-' + pkg.version + '.js', },
          { src:     'w2/auth0-angular-' + pkg.version + '.min.js', },
          { src:     'w2/auth0-angular-' + majorVersion + '.js', },
          { src:     'w2/auth0-angular-' + majorVersion + '.min.js', },
          { src:     'w2/auth0-angular-' + minorVersion + '.js', },
          { src:     'w2/auth0-angular-' + minorVersion + '.min.js', },
          { src:     'w2/auth0-angular-' + minorVersion + '.min.js', }
        ]
      },
      publish: {
        upload: [{
          src:    'release/*',
          dest:   'w2/',
          options: { gzip: false }
        }]
      }
    },
    maxcdn: {
      purgeCache: {
        options: {
          companyAlias:   process.env.MAXCDN_COMPANY_ALIAS,
          consumerKey:    process.env.MAXCDN_CONSUMER_KEY,
          consumerSecret: process.env.MAXCDN_CONSUMER_SECRET,
          zone_id:        process.env.MAXCDN_ZONE_ID,
          method:         'delete'
        },
        files: [
          { dest:     'w2/auth0-angular-' + pkg.version + '.min.js' },
          { dest:     'w2/auth0-angular-' + pkg.version + '.js' },
          { dest:     'w2/auth0-angular-' + majorVersion + '.js', },
          { dest:     'w2/auth0-angular-' + majorVersion + '.min.js', },
          { dest:     'w2/auth0-angular-' + minorVersion + '.js', },
          { dest:     'w2/auth0-angular-' + minorVersion + '.min.js', }
        ],
      },
    }
  });

  grunt.registerTask('build', ['clean', 'jshint', 'ngmin', 'concat', 'uglify', 'karma', 'copy']);
  grunt.registerTask('test', ['build', 'karma']);
  grunt.registerTask('scenario', ['build', 'connect:scenario_custom_login', 'protractor:local']);
  grunt.registerTask('cdn', ['build', 's3', 'maxcdn']);
  grunt.registerTask('default', ['build', 'watch']);

};
