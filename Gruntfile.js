module.exports = function (grunt) {
    var appConfig = null;

	/**
	 * Grunt is only used to uglify the build file in the release folder.
	 */
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        fileReplace: {
        },
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: grunt.file.readJSON('files.json'),
                dest: './release/fw.js'
            }
        },
        uglify: {
            build: {
                src: './release/fw.script.js',
                dest: './release/fw.script.min.js'
            }
        }
    };
    grunt.initConfig(config);
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-file-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('fw', ['uglify']);
    grunt.registerTask('deployCompiled', function () {
		console.log("current workspace");
		console.log("deployed to app !");
    });

    grunt.registerTask('deploy', function () {
        var done = this.async();
        var git = require('simple-git')();
        git.addRemote('github', grunt.option('url'), function () {
            git.add('.', function (error) {
                error ? done() : git.commit(grunt.option('tag'), null, null, function (error) {
                    error ? done() : git.push('github', 'master', function (error) {
                        error ? done() : git.addAnnotatedTag(grunt.option('tag'), grunt.option('tag'), function (error) {
                            error ? done() : git.pushTags('github', done);
                        });
                    });
                });
            });
        });
    });
};
