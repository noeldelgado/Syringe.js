module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'})

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            all: {
                files: ["examples/**/*.*", "src/**/*.*"],
                tasks: [],
                options: {
                    livereload: true
                }
            }
        },

        uglify: {
            options: {
                banner: '/* <%= pkg.name %> -v <%= pkg.version %> */\n',
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
