module.exports = function(grunt) {

	var buildTasks = ['concat', 'jshint'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['editor/**/*.js'],
			options: {
				globals: {
					editor: true,
					jQuery: true,
					console: true,
					document: true
				},
				force: true
			}
		},

		concat: {
			options: {
				separator: '\n\n'
			},
			scripts: {
				src: ['editor/build.js', 'editor/**/*.js'],
				dest: '../public/js/editor.js'
			}
		},

		watch: {
			options: {
				livereload: true
			},
			all: {
				files: ['editor/**/*.js'],
				tasks: buildTasks,
				options: {
					spawn: false,
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', buildTasks);
	grunt.registerTask('serve', buildTasks.concat('watch'));
};