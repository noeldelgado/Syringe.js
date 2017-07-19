module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      all: {
        files: ["_/examples/**/*.*", "test/**/*.*", "src/**/*.*"],
        tasks: ['mocha_phantomjs'],
        options: {
          livereload: true
        }
      },
      newBuild: {
        files: ["package.json"],
        tasks: ["uglify"]
      }
    },

    mocha_phantomjs: {
      all: ['test/**/*.html']
    }

  });

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('test', ['mocha_phantomjs']);
};
