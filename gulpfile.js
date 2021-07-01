const gulp = require('gulp');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tslint = require('gulp-tslint');
const mocha = require('gulp-mocha');

function getProject(test) {
	const tsProject = typescript.createProject('tsconfig.json');
	if (test) {
		tsProject.config.include.push('./test/**/*.ts')
	}

	return tsProject;
}

// Compile the TS sources
gulp.task('libBuild', () => {
	const tsProject = getProject();
	return tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject())
		.pipe(sourcemaps.write('./', { includeContent: true,
			sourceRoot: '../lib'
		}))
		.pipe(gulp.dest('./build'))
});

gulp.task('testBuild', () => {
	const tsProject = getProject(true);
	tsProject.config.include.push('./test/*.ts')
	return tsProject.src()
		.pipe(tsProject())
		.pipe(gulp.dest('./test/build'))
});

gulp.task('testRun', gulp.series('testBuild', () => {
	let reporter = 'list';
	if (process.env.JUNIT) {
		reporter = 'mocha-junit-reporter';
	}
	return gulp.src('./test/build/test/index.js', { read: false })
		.pipe(mocha({ reporter: reporter, timeout: 20000 }))
}));

gulp.task('tslint', () => {
	const tsProject = getProject(true);
	return tsProject.src()
		.pipe(tslint({
			configuration: 'tslint.json',
			formatter: 'prose'
		}))
		.pipe(tslint.report())
});

gulp.task('build', gulp.series('libBuild'));
gulp.task('test', gulp.series('libBuild', 'testRun'));
