var fs = require('fs');
var pkg = require('./package');
var cssPrefix = require('css-prefix');

var minor_version = pkg.version.replace(/\.(\d)*$/, '');
var major_version = pkg.version.replace(/\.(\d)*\.(\d)*$/, '');
var path = require('path');

function  rename_release (v) {
  return function (d, f) {
    var dest = path.join(d, f.replace(/(\.min)?\.js$/, '-'+ v + "$1.js"));
    return dest;
  };
}

module.exports = function (grunt) {
  grunt.initConfig({
    connect: {
      test: {
        options: {
          // base: "test",
          hostname: '*',
          base: ['.', 'example', 'example/build', 'build'],
          port: 9999
        }
      },
      example: {
        options: {
          hostname: '*',
          base: ['example', 'example/build', 'build'],
          port: 3000
        }
      },
      "example-https": {
        options: {
          base: ['example', 'example/build', 'build'],
          port:  3000,
          protocol: 'https',
          hostname: '*',
          cert: fs.readFileSync(__dirname + '/test/https_test_certs/server.crt').toString(),
          key:  fs.readFileSync(__dirname + '/test/https_test_certs/server.key').toString()
        }
      }
    },
    browserify: {
      options: {
        bundleOptions: {
          debug: true
        },

        // Convert absolute sourcemap filepaths to relative ones using mold-source-map.
        postBundleCB: function(err, src, cb) {
          if (err) { return cb(err); }
          var through = require('through');
          var stream = through().pause().queue(src).end();
          var buffer = '';

          stream.pipe(require('mold-source-map').transformSourcesRelativeTo(__dirname)).pipe(through(function(chunk) {
            buffer += chunk.toString();
          }, function() {
            cb(err, buffer);
          }));
          stream.resume();
        }

      },
      debug: {
        files: {
          'build/auth0-widget.js': ['standalone.js']
        }
      },
    },

    // uglify: {
    //   min: {
    //     files: {
    //       'build/auth0-widget.min.js': ['build/auth0-widget.js']
    //     }
    //   }
    // },
    less: {
      dist: {
        options: {
          paths: ["widget/css"],
        },
        files: {
          "widget/css/main.css": "widget/css/main.less",
          "widget/css/zocial.css": "widget/css/zocial.less"
        }
      },
      example: {
        files: {
          "example/build/index.css": "example/index.less"
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 2 versions', 'ff 15', 'opera 12.1', 'ie 8']
      },
      main: {
        src:  'widget/css/main.css',
        dest: 'widget/css/main.css',
      },
    },
    prefix: { //this adds "a0-" to every class and id
      css: {
        src: 'widget/css/main.css',
        dest: 'widget/css/main.css',
        prefix: 'a0-'
      }
    },
    cssmin: {
      minify: {
        options: {
          keepSpecialComments: 0
        },
        files: {
          'widget/css/main.min.css': ['widget/css/main.css'],
          'widget/css/zocial.min.css': ['widget/css/zocial.css']
        }
      }
    },
    copy: {
      example: {
        files: {
          'example/auth0-widget.min.js': 'build/auth0-widget.min.js',
          'example/auth0-widget.js':     'build/auth0-widget.js'
        }
      },
      release: {
        files: [
          { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(pkg.version) },
          { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(minor_version) },
          { expand: true, flatten: true, src: 'build/*', dest: 'release/', rename: rename_release(major_version) }
        ]
      }
    },
    exec: {
      'uglify': {
        cmd: 'node_modules/.bin/uglifyjs build/auth0-widget.js  -b beautify=false,ascii_only=true > build/auth0-widget.min.js',
        stdout: true,
        stderr: true
      },
      'test-inception': {
        cmd: 'node_modules/.bin/mocha ./test/support/characters-inception.test.js',
        stdout: true,
        stderr: true
      },
      'test-integration': {
        cmd: 'node_modules/.bin/zuul -- test/*.js',
        stdout: true,
        stderr: true
      },
      'test-phantom': {
        cmd: 'node_modules/.bin/zuul --ui mocha-bdd --phantom 9999 -- test/*.js',
        stdout: true,
        stderr: true
      }
    },
    clean: {
      build: ["release/", "build/", "widget/css/main.css", "widget/css/main.min.css", "widget/css/zocial.css", "widget/css/zocial.min.css", "example/auth0-widget.js"]
    },
    watch: {
      another: {
        files: ['node_modules',
                'standalone.js',
                'widget/**/*',
                'i18n/*'],
        tasks: ['build']
      },
      example: {
        files: ['example/*'],
        tasks: ["less:example"]
      }
    },
    aws_s3: {
      options: {
        accessKeyId:     process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET,
        bucket:          process.env.S3_BUCKET,
        uploadConcurrency: 5,
        params: {
          CacheControl: 'public, max-age=300'
        },
        // debug: true <<< use this option to test changes
      },
      clean: {
        files: [
          { action: 'delete', dest: 'w2/auth0-widget-' + pkg.version + '.js', },
          { action: 'delete', dest: 'w2/auth0-widget-' + pkg.version + '.min.js', },
          { action: 'delete', dest: 'w2/auth0-widget-' + major_version + '.js', },
          { action: 'delete', dest: 'w2/auth0-widget-' + major_version + '.min.js', },
          { action: 'delete', dest: 'w2/auth0-widget-' + minor_version + '.js', },
          { action: 'delete', dest: 'w2/auth0-widget-' + minor_version + '.min.js', }
        ]
      },
      publish: {
        files: [
          {
            expand: true,
            cwd:    'release/',
            src:    ['**'],
            dest:   'w2/'
          }
        ]
      }
    },
    /* Check if the repository is clean after build. If the version found in the build folder was not updated
     * this will make the build fail. */
    checkrepo: {
      cdn: {
        clean: true
      }
    },
    /* Purge FASTLY cache. */
    fastly: {
      options: {
        key:  process.env.FASTLY_KEY,
        host: process.env.FASTLY_HOST
      },
      purge: {
        options: {
          urls: [
            'w2/auth0-widget-' + pkg.version   + '.js',
            'w2/auth0-widget-' + pkg.version   + '.min.js',
            'w2/auth0-widget-' + major_version + '.js',
            'w2/auth0-widget-' + major_version + '.min.js',
            'w2/auth0-widget-' + minor_version + '.js',
            'w2/auth0-widget-' + minor_version + '.min.js'
          ]
        },
      },
    }
  });

  grunt.registerMultiTask('prefix', 'Prefix css.', function() {
    var css = fs.readFileSync(__dirname + '/' + this.data.src, 'utf8');
    var prefixed = cssPrefix(this.data.prefix, css.toString());
    fs.writeFileSync(__dirname + '/' + this.data.dest, prefixed);
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  grunt.registerTask("build",         ["clean", "less:dist", "prefix:css", "autoprefixer:main", "cssmin:minify", "browserify:debug", "exec:uglify"]);

  grunt.registerTask("example",       ["less:example", "connect:example", "build", "watch"]);
  grunt.registerTask("example-https", ["less:example", "connect:example-https", "build", "watch"]);

  grunt.registerTask("dev",           ["connect:test", "build", "watch"]);
  grunt.registerTask("phantom",       ["build", "exec:test-inception", "exec:test-phantom"]);
  grunt.registerTask("integration",   ["build", "exec:test-inception", "exec:test-integration"]);

  grunt.registerTask("cdn",           ["build", "copy:release", "aws_s3", "fastly:purge"]);

};
