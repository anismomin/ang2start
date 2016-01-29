var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');
var config = require('./gulp.config')();

var del = require('del');
var concat = require('gulp-concat')
var runSequence = require('run-sequence');


/* Server */
var browserSync = require('browser-sync');
var superstatic = require('superstatic');

/* Images */
var imagemin = require('gulp-imagemin');

/* style */
var sass        = require('gulp-sass');


// SERVER
gulp.task('cleanServer', function(){
    return del(config.builtServer)
});

gulp.task('build_server', ['cleanServer'], function () {
    var tsProject = tsc.createProject(config.serverConf);    
    var tsResult = gulp.src(config.devServerTs)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject))
    return tsResult.js
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(config.builtServer))
});


// CLIENT
gulp.task('ts-lint', function() {
    return gulp.src(config.clientTs)
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: false
        }));
})

/*
  jsNPMDependencies, sometimes order matters here! so becareful!
*/
// var jsNPMDependencies = [
//     'angular2/bundles/angular2-polyfills.js',
//     'systemjs/dist/system.src.js',
//     'rxjs/bundles/Rx.js',
//     'angular2/bundles/angular2.dev.js',
//     'angular2/bundles/router.dev.js'
// ] 

gulp.task('build_index', function(){
    
    // var mappedPaths = jsNPMDependencies.map(file => {return path.resolve('node_modules', file)});
    
    // var copyJsNPMDependencies = gulp.src(mappedPaths, {base:'node_modules'})
    //     .pipe(gulp.dest(config.builtLibs));
     
    // var copyIndex = gulp.src(config.indexPage)
    //     .pipe(gulp.dest(config.builtClient));

    // return [copyJsNPMDependencies, copyIndex];

});

gulp.task('compile-ts', function() {
    
    var tsProject = tsc.createProject(config.clientConf);

    var sourceTsFiles = [
        config.clientTs
    ];

    var tsResult = gulp
        .src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.builtClient));
});

gulp.task('build_html', function() {
    gulp.src(config.clientHtml)
        .pipe(gulp.dest(config.builtClient))
        .pipe(browserSync.stream());    
});

gulp.task('build_sass', function() {
    return gulp.src(config.clientScss)
        .pipe(sass())
        .pipe(gulp.dest(config.scss))
        .pipe(browserSync.stream());
});

gulp.task('build_img', function () {
    return gulp.src(config.clientImages)
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(config.images));
});


gulp.task('serve', ['build_server', 'ts-lint', 'compile-ts', 'build_html', 'build_img', 'build_sass'], function() {
    	
    gulp.watch([config.clientTs, config.clientHtml], ['build_server', 'ts-lint', 'compile-ts', 'build_html', 'build_img', 'build_sass']);
	
    browserSync({
        port: 4000,
        files: ['index.html', '**/*.js'],
        injectChanges: true,
        logFileChanges: false,
        logLevel: 'silent',    
        notify: true,
        reloadDelay: 0,
        server: {
            baseDir: ['./'],
            middleware: superstatic({ debug: false})
        }
    });	
});

gulp.task('default', ['serve']);
