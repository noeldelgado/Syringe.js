module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'})

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            all: {
                files: ["_/examples/**/*.*", "test/**/*.*", "src/**/*.*"],
                tasks: ['mocha_phantomjs'],
                options: {
                    livereload: true
                }
            }
        },

        uglify: {
            options: {
                banner: '/* <%= pkg.name %> -v <%= pkg.version %> - <%= pkg.homepage %> - Licensed under the <%= pkg.license %> lincese */ \n',
            },
            lib: {
                src: 'src/syringe.js',
                dest: 'dist/syringe.min.js'
            }
        },

        mocha_phantomjs: {
            all: ['test/**/*.html']
        }

    })

   grunt.registerTask('default', ['watch'])
   grunt.registerTask('test', ['mocha_phantomjs'])
   grunt.registerTask('dist', ['uglify'])

}
