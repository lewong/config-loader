/*global module */
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			folder: ["dist/*, .build/"]
		},
		meta: {
			version: '<%= pkg.version %><%= grunt.config("buildNumber") %>',
			build: '<%= grunt.template.today("mm/dd/yyyy hh:MM:ss TT") %>;'
		},
		rig: {
			all: {
				expand: true,
				cwd: "src/build/",
				src: '*.js',
				dest: 'dist/'
			}
		},
		uglify: {
			all: {
				expand: true,
				cwd: "dist/",
				src: '*.js',
				ext: ".min.js",
				dest: 'dist/'
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
			test: {
				src: "test/**/*",
				dest: "dist/"
			},
			components: {
				src: "components/**/*.{js,css}",
				dest: "dist/test/"
			}
		},
		replace: {
			options: {
				patterns: [{
					match: 'timestamp',
					replacement: '<%= grunt.template.today() %>'
				}, {
					match: 'version',
					replacement: '<%= pkg.version %><%= grunt.config("buildNumber") %>'
				}]
			},
			dist: {
				expand: true,
				cwd: "dist/",
				src: '*.js',
				dest: 'dist/'
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
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks("grunt-push-svn");
	grunt.registerTask('deploy', 'deploy to svn', function() {
		grunt.config("svnDir", grunt.option("dir"));
		if (grunt.option("build")) {
			grunt.config("buildNumber", "-" + grunt.option("build"));
		}
		grunt.task.run("push_svn");
	});
	grunt.registerTask('default', ['clean', 'jshint:devel', 'rig', 'replace', 'copy']);
	grunt.registerTask('release', ['clean', 'jshint:release', 'rig', 'replace', 'copy', 'uglify']);
};