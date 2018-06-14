/**
 * Created by wengpengfei on 2016/5/26.
 */
var gulp        = require ( 'gulp' ),
    fs          = require ( 'fs' ),
    buildConfig = require ( './config/build.config.js' ),
    uglify      = require ( 'gulp-uglify' ),
    clean       = require ( 'gulp-clean' ),
    copy        = require ( 'gulp-copy' ),
    runSeq      = require ( 'run-sequence' ),
    zip         = require ( 'gulp-zip' ),
    requirejs   = require ( 'gulp-requirejs' ),
    minimist    = require ( 'minimist' ),          // 任务获取参数
    htmlmin     = require ( 'gulp-htmlmin' ),
    browserSync = require ( 'browser-sync' ),
    serveStatic = require ( 'serve-static' ),
    //////////////////////////////////////////
    config      = buildConfig (),
    options     = minimist ( process.argv.slice ( 2 ) ),
    header      = require ( 'gulp-header' );

//////////////////////////////////////////////////////////////////////////////////////////////////////v
//////////////////////////////////////////////////////////////////////////////////////////////////////v

var type      = options.b,
    base      = type ? '../branches/' + type + '/' : './',
    bowerInfo = require ( base + 'bower.json' ),
    params    = type ? { prefix: 3 } : {};

function copySrc( from, to, version ) {

    return gulp.src ( from )

        .pipe ( copy ( to + '/' + version, params ) )
}

function minJs( from, to, version ) {

    return gulp.src ( from + '/' + version + '/src/**/*.js' )

        .pipe ( uglify () )

        .pipe ( gulp.dest ( from + '/' + version + '/dist' ) )
}

function minHtml( from, to, version ) {
    return gulp.src ( from + '/' + version + '/src/**/*.html' )

        .pipe ( htmlmin ( { collapseWhitespace: true } ) )

        .pipe ( gulp.dest ( to + '/' + version + '/dist' ) );
}

function copyAnotherThing( from, to, version ) {
    return gulp.src ( from )

        .pipe ( copy ( to + '/' + version, params ) )
}

//////////////////////////////////////////////////////////////////////////////////////////////////////v

gulp.task ( 'copy', function () {
    return copySrc ( [base + 'src/**/*.*'], '../tags/', bowerInfo.version );
} );

gulp.task ( 'uglify', function () {
    return minJs ( '../tags', '../tags', bowerInfo.version );
} );

gulp.task ( 'html:min', function () {
    return minHtml ( '../tags/', '../tags', bowerInfo.version )
} );

gulp.task ( 'copy:style', function () {
    return gulp.src ( base + '/src/styles/player.css' )

        .pipe ( gulp.dest ( '../tags/' + bowerInfo.version + '/dist/' ) );
} )

gulp.task ( 'makeHEAD', function () {
    var banner = ['/**',
        ' * <%= pkg.name %> - <%= pkg.description %>',
        ' * @author <%= pkg.author %>',
        ' * @version v<%= pkg.version %>',
        ' * @link <%= pkg.homepage %>',
        ' * @license <%= pkg.license %>',
        ' */',
        ''].join ( '\n' );

    return gulp.src ( '../tags/' + bowerInfo.version + '/dist/**/*.js' )

        .pipe ( header ( banner, { pkg: bowerInfo } ) )

        .pipe ( gulp.dest ( '../tags/' + bowerInfo.version + '/dist/' ) )
} );

gulp.task ( 'copy:ao', function () {
    var copies = [
        'README.MD',
        'gulpfile.js',
        'bower.json',
        'package.json',
        '.bowerrc'];
    var result = [];

    copies.forEach ( function ( item ) {
        result.push ( base + item );
    } );

    return copyAnotherThing ( result,
        '../tags/', bowerInfo.version )
} );

gulp.task ( 'zip', function () {

    return gulp.src ( [
        base + '**/*.*',
        '!' + base + '/node_modules/**/*.*',
        '!' + base + '/bower_components/**/*.*'
    ] )

        .pipe ( zip ( bowerInfo.version + '.zip' ) )

        .pipe ( gulp.dest ( '../tag_history/' ) )
} );

/**
 * 最后发布版本的一个任务
 */
gulp.task ( 'publish', function () {
    if ( fs.readdirSync ( '../tags/' ).indexOf ( bowerInfo.version ) === -1 ) {
        runSeq ( 'copy', 'requirejsBuild', 'copy:style', 'makeHEAD', 'html:min', 'copy:ao', 'zip' );
    } else {
        throw  new Error ( "已经存在此目录，如果要发布请修改版本号，或者确认删除手动删除对应目录文件" );
    }
} );

var rjs = require ( 'gulp-requirejs' );

gulp.task ( 'requirejsBuild', function () {

    rjs ( {
        baseUrl: base + '/src/common/',
        // optimize: 'uglify',
        exclude: ['jquery', 'jqueryJson', 'cameras'],
        paths  : {
            jquery    : '../../bower_components/jquery/dist/jquery',
            jqueryJson: '../../bower_components/jquery-json/dist/jquery.json.min',
            cameras   : '../../bower_components/cameras/dist/js/cameras'
        },
        out    : '../tags/' + bowerInfo.version + '/dist/' + bowerInfo.name + '.js',
        name   : bowerInfo.name
    } )

        .pipe ( uglify () )

        .pipe ( gulp.dest ( '' ) ); // pipe it to the output DIR
} );

gulp.task ( 'serve', function () {
    browserSync ( {
        port      : 1314,
        server    : {
            baseDir: base + 'src/'
        },
        middleware: [
            { route: '/bower_components', handle: serveStatic ( base + '/bower_components' ) },
            { route: '/js', handle: serveStatic ( base + '/dist' ) },
            { route: '/js', handle: serveStatic ( base + '/src' ) }
        ]
    } )
} );

gulp.task ( 'rjs', function () {
    rjs ( {
        baseUrl: base + '/src/common/',
        // optimize: 'uglify',
        exclude: ['jquery', 'jqueryJson', 'cameras'],
        paths  : {
            jquery    : '../../bower_components/jquery/dist/jquery',
            jqueryJson: '../../bower_components/jquery-json/dist/jquery.json.min',
            cameras   : '../../bower_components/cameras/dist/js/cameras'
        },
        out    : './src/dist/' + bowerInfo.name + '.js',
        name   : bowerInfo.name
    } )

        .pipe ( uglify () )

        .pipe ( gulp.dest ( '' ) ); // pipe it to the output DIR
} )


