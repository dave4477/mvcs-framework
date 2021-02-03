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
		rollup: {
			options: {
			  'format' : 'iife',
			  'name' : 'fw',
			  /*
				plugins: function () {
				  return [
					babel({
					  exclude: './node_modules/**',
					  presets: ['es2015-rollup'],
					}),
				  ];
				},			  
				*/
			},
			main: {
				dest: 'release/fw.module.js',
				src: 'src/core/fw.js' // --format iife --name "fw"

			},
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
	grunt.loadNpmTasks('grunt-rollup');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('fw', ['uglify']);
	grunt.registerTask('roll', ['rollup']);
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
