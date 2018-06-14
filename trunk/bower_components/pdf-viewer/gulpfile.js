'use strict';
var gulp        = require ( 'gulp' ),
    browserSync = require ( 'browser-sync' ),
    rjs         = require ( 'gulp-requirejs' ),
    uglify      = require ( 'gulp-uglify' ),
    reload      = browserSync.reload;

gulp.task ( 'serve', function () {
    browserSync ( {
        server: { baseDir: './' }
    } );

    gulp.watch ( 'test/mainTest/index.html', reload );
} );

gulp.task ( 'requirejsBuild', function () {
    rjs ( {
        baseUrl : 'src/main/',
        optimize: 'uglify',
        exclude : ['jquery', 'jqueryJson'],
        paths   : {
            jquery    : 'component/jquery/jquery',
            jqueryJson: 'component/jquery/jquery-json'
        },
        out     : 'src/main/test.r2.js',
        name    : 'test.r'
    } )

        .pipe ( uglify () )

        .pipe ( gulp.dest ( '' ) ); // pipe it to the output DIR
} );
