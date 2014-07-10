var path = require('path');
var fs = require('fs');

var buildPath = 'www';
var distPath = 'dist';
var appPath = 'node_modules/app';

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      js: {
        files: [
          'Gruntfile.js',
          appPath + '/main.js',
          'test/**/*.js'
        ],
        tasks: [ 'browserify:dev', 'appcache' ]
      },
      less: {
        files: appPath + '/styles/**/*.less',
        tasks: [ 'less:dev', 'appcache' ]
      }
    },

    browserify: {
      dev: {
        src: [ appPath + '/main.js' ],
        dest: buildPath + '/bundle.js',
        options: { debug: true }
      },
      dist: {
        src: [ appPath + '/main.js' ],
        dest: distPath + '/bundle.js',
        options: {}
      }
    },

    less: {
      dev: {
        src: [
          appPath + '/vendor/addtohomescreen.css',
          appPath + '/styles/style.less'
        ],
        dest: buildPath + '/style.css'
      },
      dist: {
        options: {
          cleancss: true
        },
        src: [
          appPath + '/vendor/addtohomescreen.css',
          appPath + '/styles/style.less'
        ],
        dest: distPath + '/style.css'
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: buildPath + '/',
            src: [ 'index.html', 'appcache-loader.html', 'img/**' ],
            dest: distPath + '/'
          }
        ]
      }
    },

    uglify: {
      dist: {
        src: [ distPath + '/bundle.js' ],
        dest: distPath + '/bundle.js'
      }
    },

    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: [ '**' ]
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('appcache', function () {
    var manifest = path.join(__dirname, 'www/manifest.appcache');
    var content = fs.readFileSync(manifest, 'utf8');
    content = content.replace(/(timestamp:\s)[0-9]+/, '$1' + Date.now());
    fs.writeFileSync(manifest, content);
    fs.writeFileSync(path.join(__dirname, 'dist/manifest.appcache'), content);
  });

  grunt.registerTask('default', [
    'browserify',
    'less',
    'appcache',
    'copy',
    'uglify'
  ]);

  grunt.registerTask('deploy', [ 'default', 'gh-pages' ]);

};

