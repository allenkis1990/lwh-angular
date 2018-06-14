/**
 * Created by wengpengfei on 2016/5/26.
 */
var gulp        = require ( 'gulp' ),
    fs          = require ( 'fs' ),
    buildConfig = require ( './build/build.config.js' ),
    uglify      = require ( 'gulp-uglify' ),
    clean       = require ( 'gulp-clean' ),
    Q           = require ( 'q' ),
    copy        = require ( 'gulp-copy' ),
    runSeq      = require ( 'run-sequence' ),
    zip         = require ( 'gulp-zip' ),
    browserSync = require ( 'browser-sync' ),
    requirejs   = require ( 'gulp-requirejs' ),
    serveStatic = require ( 'serve-static' ),
    httpProxy   = require ( 'http-proxy-middleware' ),
    //////////////////////////////////////////
    config      = buildConfig (),
    zipName     = '',
    zipPath     = config.tagHistoryPath;

/**
 * 默认执行的任务
 */
gulp.task ( 'default', function () {
    runSeq ( 'clean', 'copy', 'uglify', 'tag', 'clean', 'zip' );
} );

function tag( basePath, getPath, version ) {
    var dirs  = fs.readdirSync ( config.tagPath );
    var index = dirs.indexOf ( version );
    zipName   = version + '_zip.zip';
    if ( index === -1 ) {
        return gulp.src ( [
                basePath + '/src/**/*.*',
                '!' + basePath + '/src/datas/**/*.*',
                '!' + basePath + '/src/styles/**/*.*',
                '!' + basePath + '/src/templates/**/*.*',
                '!' + basePath + '/src/views/**/*.*',
                getPath + '/bower.json',
                getPath + '/README.MD',
                getPath + '/gulpfile.js',
                getPath + '/package.json'
            ] )
            .pipe ( gulp.dest ( config.tagPath + '/' + version + '/' ) )
    } else {
        return gulp.src ( basePath );
    }
}
/**
 * 给项目打上tag
 */
gulp.task ( 'tag', function () {

    var bowerPath    = './bower.json';
    var bowerJson    = fs.readFileSync ( bowerPath, { encoding: 'utf-8' } );
    bowerJson        = JSON.parse ( bowerJson );
    var trunkVersion = bowerJson.version;

    return tag ( config.distPath, config.trunkPath, trunkVersion );
} );

/**
 * 将需要的文件拷贝到dist目录
 */
gulp.task ( 'copy', function () {

    return gulp.src ( ['src/**/*.*', 'README.MD', 'bower.json'] )

        .pipe ( copy ( config.distPath, {} ) );

} );

/**
 * 压缩版本
 */
gulp.task ( 'uglify', function () {
    return uglify_method ( [config.distPath + '/**/*.js'], config.distPath );
} );

function uglify_method( srcs, dest ) {
    return gulp.src ( srcs )

        .pipe ( uglify () )

        .pipe ( gulp.dest ( dest ) );
}

/**
 * 清脏
 */
gulp.task ( 'clean', [], function () {
    return gulp.src ( config.distPath + '/' )

        .pipe ( clean () );
} );

/**
 * 将项目源码对应tag打包成zip格式
 */
gulp.task ( 'zip', function () {

    return gulp.src ( [
            config.trunkPath + '/**/*.*',
            '!' + config.trunkPath + '/node_modules/**/*.*'
        ] )

        .pipe ( zip ( zipName ) )

        .pipe ( gulp.dest ( zipPath ) )
} );

gulp.task ( 'concat:rjs', function () {
    requirejs ( {
        baseUrl       : './trunk/test/mainTest/js',
        name          : 'app',
        out           : './js/app.js',
        mainConfigFile: './trunk/test/mainTest/js/main.config.js',
        optimize      : "uglify"
    } ).pipe ( gulp.dest ( './trunk/test/mainTest/' ) )
} );

gulp.task ( 'serve', function () {
    var uploadProxy = "";
    browserSync ( {
        server    : {
            baseDir: './'
        },
        middleware: [
            { route: '/src/main', handle: serveStatic ( './src/main' ) },
            { route: '/bower_components', handle: serveStatic ( './bower_components' ) },
            { route: '/js/main', handle: serveStatic ( './src/main' ) }
        ]
    } )
} );

/**
 *
 */
gulp.task ( 'ub', function () {
    var version = process.argv[4];
    zipName     = version + '_zip.zip';
    runSeq ( 'uglify:branches', 'zip:branch' );
} );

gulp.task ( 'zip:branch', function () {
    var version = process.argv[4];
    return gulp.src ( [
            config.branchesPath + '/' + version + '/**/*.*'
        ] )
        .pipe ( zip ( zipName ) )

        .pipe ( gulp.dest ( zipPath ) )
} );

gulp.task ( 'uglify:branches', ['tag:branches'], function () {
    var version = process.argv[4];
    return uglify_method ( [config.tagPath + '/' + version + '/main/**/*.js'], config.tagPath + '/' + version + '/main' );
} );

gulp.task ( 'tag:branches', function ( arg, b ) {
    var version = process.argv[4];
    if ( version ) {
        return tag ( config.branchesPath + '/' + version + '/', config.branchesPath + '/' + version, version )
    } else {
        return gulp.src ();
    }
} );

