/*global module */
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			folder: ["dist/*"]
		},
		meta: {
			version: '<%= pkg.version %><%= grunt.config("buildNumber") %>',
			build: '<%= grunt.template.today("mm/dd/yyyy hh:MM:ss TT") %>;'
		},
		uglify: {
			all: {
				files: {
					"dist/<%= pkg.name %>.min.js": "dist/<%= pkg.name %>.js"
				}
			}
		},
		jshint: {
			devel: {
				options: grunt.file.readJSON("./components/project-settings/jshint-dev.json"),
				src: ['src/**/*.js']
			},
			release: {
				options: grunt.file.readJSON("./components/project-settings/jshint.json"),
				src: ['src/**/*.js']
			}
		},
		rig: {
			devel: {
				src: ['src/build/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js'
			},
			bundled: {
				src: ['src/build/<%= pkg.name %>-bundled.js'],
				dest: 'dist/<%= pkg.name %>-bundled.js'
			}
		},
		bump: {
			files: ['package.json', 'bower.json']
		},
		testem: {
			options: {
				"framework": "qunit"
			},
			all: {
				src: ['dist/test/qunit/test.html'],
				dest: 'tests.tap'
			}
		},
		copy: {
			code: {
				expand: true,
				cwd: 'dist/',
				src: '**',
				dest: 'dist/',
				flatten: true,
				filter: 'isFile'
			},
			test: {
				src: "test/**/*",
				dest: "dist/"
			},
			components: {
				src: "components/**/*.{js,css}",
				dest: "dist/test/"
			}
		},
		push_svn: {
			options: {
				trymkdir: true,
				remove: false
			},
			release: {
				src: "./dist",
				dest: '<%= grunt.config("svnDir") %>/<%= pkg.version %><%= grunt.config("buildNumber") %>',
				tmp: './.build'
			}
		},
		watch: {
			files: ['Gruntfile.js', 'src/**/*', 'test/**/*'],
			tasks: ['default']
		}
	});
	grunt.loadNpmTasks('grunt-rigger');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-bumpx');
	grunt.loadNpmTasks('grunt-testem');
	grunt.loadNpmTasks("grunt-push-svn");
	grunt.registerTask('deploy', 'deploy to svn', function() {
		grunt.config("svnDir", grunt.option("dir"));
		if (grunt.option("build")) {
			grunt.config("buildNumber", "-" + grunt.option("build"));
		}
		grunt.task.run("push_svn");
	});
	grunt.registerTask('default', ['clean', 'jshint:devel', 'rig', 'copy']);
	grunt.registerTask('release', ['clean', 'jshint:release', 'rig', 'copy', 'uglify']);
};