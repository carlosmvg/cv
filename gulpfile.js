const gulp = require('gulp');

// var ui5preload = require('gulp-ui5-preload');
// var uglify = require('gulp-uglify-es').default;
// var prettydata = require('gulp-pretty-data');
const gulpIgnore = require('gulp-ignore');

let aLibsPath;
let dTimeStart;
const manifest = require('./www/manifest.json');
const prefix = "lib/resources/";

// Excluding patterns
const excluded = [
	"*-dbg.js",
	"*-integration.js",
	"*-nojQuery.js",
	"*.map",
	"*-debug.js"
];

gulp.task(
	'generatePath',
	function(done) {
		dTimeStart = new Date().getTime();
		const aLibs = Object.keys(manifest["sap.ui5"].dependencies.libs);
		aLibsPath = aLibs.map(sLib => sLib.replace(/\./g, "/"));
		done();
	});

gulp.task(
	'copy',
	function(done) {
		// root folder
		gulp.src(prefix + "/*.*")
			.pipe(gulpIgnore.exclude(excluded))
			.pipe(gulp.dest('www/resources/'));

		aLibsPath.forEach((sPath) => {
			gulp.src(prefix + sPath + "/**")
				.pipe(gulpIgnore.exclude(excluded))
				.pipe(gulp.dest('www/resources/' + sPath));
		});
		done();
	});

gulp.task(
	'default',
	gulp.series('generatePath', 'copy'),
	function (done) {
		console.log("Copia realizada en " + (new Date().getTime() - dTimeStart) + " ms.");
		done();
	});

