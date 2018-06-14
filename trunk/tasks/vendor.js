/**
 * Created by wengpengfei on 2016/8/31.
 */

var gulp      = require ( 'gulp' ),
    rjs       = require ( 'gulp-requirejs' ),
    config    = require ( '../things/config/config.js' ),       // 配置文件
    fs        = require ( 'fs' ),
    through2  = require ( 'through2' ),
    requirejs = require ( 'requirejs' ),
    uglify    = require ( 'gulp-uglify' );

/**
 * @description 主要用来处理合并压缩以requirejs模块加载器管理的js模块文件。
 * @target <h1>解决首页文件加载的时候文件请求数量过多</h1>
 * 这个任务可能花费的时间是根据portal下面的模板的数量来决定的
 */
module.exports = function ( options ) {

    // options.taskList = options.taskList || [];
    options.seque    = options.seque || [];
    var paths        = {
            controllers                           : 'controllers',
            services                              : 'services',
            css                                   : '../../../bower_components/require-css/css',
            kendo                                 : '../../../bower_components/KendoUI/js',
            angular                               : '../../../bower_components/angular/angular',
            angularAnimate                        : '../../../bower_components/angular-animate/angular-animate',
            angularCookies                        : '../../../bower_components/angular-cookies/angular-cookies',
            angularMocks                          : '../../../bower_components/angular-mocks/angular-mocks',
            angularResource                       : '../../../bower_components/angular-resource/angular-resource',
            angularRoute                          : '../../../bower_components/angular-route/angular-route',
            angularSanitize                       : '../../../bower_components/angular-sanitize/angular-sanitize',
            angularTouch                          : '../../../bower_components/angular-touch/angular-touch',
            angularUiRouter                       : '../../../bower_components/angular-ui-router/release/angular-ui-router',
            restangular                           : '../../../bower_components/restangular/dist/restangular',
            jquery                                : '../../../bower_components/jquery/dist/jquery',
            cooper                                : '../../../bower_components/cooper/dist/cooper',
            oclazyload                            : '../../../bower_components/oclazyload/dist/ocLazyLoad',
            uiRouterExtras                        : '../../../bower_components/ui-router-extras/release/ct-ui-router-extras',
            d3                                    : '../../../bower_components/d3/d3',
            lodash                                : '../../../bower_components/lodash/lodash',
            webuploader                           : '../../../bower_components/webuploader_fex/dist/webuploader',
            'webuploader.flashonly'               : '../../../bower_components/webuploader_fex/dist/webuploader.flashonly',
            cropper                               : '../../../bower_components/cropper/dist/cropper',
            'pathConst'                           : '../../../bower_components/StudyLibrary/pathConst',
            'playLoader'                          : '../../../bower_components/StudyLibrary/scripts/initialization',
            'echarts'                             : '../../../bower_components/echarts/build/source/echarts-all',
            prometheus                            : '../../../bower_components/prometheus/dist',
            jqueryNiceScroll                      : '../../../bower_components/jquery.nicescroll/jquery.nicescroll',
            sweetAlert                            : '../../../bower_components/sweetalert/dist/sweetalert.min',
            artDialog                             : '../../../bower_components/artDialog/dist/dialog-plus-min',
            "directives/remote-validate-directive": '../../../bower_components/prometheus/dist/directives/remote-validate',
            "directives/upload-files-directive"   : '../../../bower_components/prometheus/dist/directives/upload-files',
            "directives/upload-image-directive"   : '../../../bower_components/prometheus/dist/directives/upload-image',
            "common/hbWebUploader"                : '../../../bower_components/prometheus/dist/modules/uploader',
            player                                : '../../../bower_components/player/dist/player',
            es5ShimForIe                          : '../../../bower_components/es5-shim/es5-shim',
            jqueryJson                            : '../../../bower_components/jquery-json/dist/jquery.json.min',
            cameras                               : '../../../bower_components/cameras/dist/js/cameras',
            angularStorage                        : '../../../bower_components/angular-local-storage/dist/angular-local-storage',

            cookie        : '../../../bower_components/cookies-js/dist/cookies',
            liteValidate  : '../../../bower_components/validation/lite-validate',
            bootstrap     : '../../../bower_components/bootstrap/dist/js/bootstrap',
            'loader'      : '../../../bower_components/player/src/core/common/player',
            //multimediaDocument: '../../../bower_components/StudyLibrary/scripts',
            jqueryKnob    : '../../../bower_components/jquery-knob/js/jquery.knob',
            jqueryExcanvas: '../../../bower_components/jquery-knob/excanvas'

        },
        shims        = {
            artDialog        : { deps: ['jquery'], exports: 'dialog' },
            angular          : { deps: ['jquery'], exports: 'angular' },
            //  Restangular depends on either lodash or underscore{要使用这个必须依赖lodash或者underscore}
            restangular      : { deps: ['lodash', 'angular'], exports: 'restangular' },
            cropper          : { deps: ['jquery'], exports: 'cropper' },
            player           : { exports: 'player' },
            echarts          : { exports: "echarts" },
            jqueryNiceScroll : { deps: ['jquery'], exports: 'jqueryNiceScroll' },
            webuploader      : { deps: ['jquery'], exports: 'webuploader' },
            angularAnimate   : { deps: ['angular'], exports: 'angularAnimate' },
            angularCookies   : { deps: ['angular'], exports: 'angularCookies' },
            angularResource  : { deps: ['angular'], exports: 'angularResource' },
            angularSanitize  : { deps: ['angular'], exports: 'angularSanitize' },
            angularRoute     : { deps: ['angular'], exports: 'angularRoute' },
            oclazyload       : { deps: ['angular'], exports: 'oclazyload' },
            angularTouch     : { deps: ['angular'], exports: 'angularTouch' },
            angularMocks     : { deps: ['angular'], exports: 'angularMock' },
            angularUiRouter  : { deps: ['angular'], exports: 'angularUiRouter' },
            uiRouterExtras   : { deps: ['angularUiRouter'], exports: 'uiRouterExtras' },
            d3               : { exports: 'd3' },
            lodash           : { exports: '_' },
            sweetAlert       : { deps: ['jquery'], exports: 'sweetAlert' },
            'kendo/kendo.web': { deps: ['angular'] },
            angularStorage   : { deps: ['angular'] },
            liteValidate     : { deps: ['validateEngine', 'jquery'], exports: 'liteValidate' },
            loader           : { exports: 'loader' },
            jqueryKnob       : { deps: ['jquery'], exports: 'jqueryKnob' },
            jqueryExcanvas   : { deps: ['jquery'], exports: 'jqueryExcanvas' },
            cooper           : {
                deps: ['jquery'], exports: 'Cooper'
            }
        },
        apps         = fs.readdirSync ( config.dist ),
        directoryMap = {},
        portalPath = {
            controllers                           : 'controllers',
            services                              : 'services',
            css                                   : '../../bower_components/require-css/css',
            kendo                                 : '../../bower_components/KendoUI/js',
            angular                               : '../../bower_components/angular/angular',
            angularAnimate                        : '../../bower_components/angular-animate/angular-animate',
            angularCookies                        : '../../bower_components/angular-cookies/angular-cookies',
            angularMocks                          : '../../bower_components/angular-mocks/angular-mocks',
            angularResource                       : '../../bower_components/angular-resource/angular-resource',
            angularRoute                          : '../../bower_components/angular-route/angular-route',
            angularSanitize                       : '../../bower_components/angular-sanitize/angular-sanitize',
            angularTouch                          : '../../bower_components/angular-touch/angular-touch',
            angularUiRouter                       : '../../bower_components/angular-ui-router/release/angular-ui-router',
            restangular                           : '../../bower_components/restangular/dist/restangular',
            jquery                                : '../../bower_components/jquery/dist/jquery',
            cooper                                : '../../bower_components/cooper/dist/cooper',
            oclazyload                            : '../../bower_components/oclazyload/dist/ocLazyLoad',
            uiRouterExtras                        : '../../bower_components/ui-router-extras/release/ct-ui-router-extras',
            d3                                    : '../../bower_components/d3/d3',
            lodash                                : '../../bower_components/lodash/lodash',
            webuploader                           : '../../bower_components/webuploader_fex/dist/webuploader',
            'webuploader.flashonly'               : '../../bower_components/webuploader_fex/dist/webuploader.flashonly',
            cropper                               : '../../bower_components/cropper/dist/cropper',
            'pathConst'                           : '../../bower_components/StudyLibrary/pathConst',
            'playLoader'                          : '../../bower_components/StudyLibrary/scripts/initialization',
            'echarts'                             : '../../bower_components/echarts/build/source/echarts-all',
            prometheus                            : '../../bower_components/prometheus/dist',
            jqueryNiceScroll                      : '../../bower_components/jquery.nicescroll/jquery.nicescroll',
            sweetAlert                            : '../../bower_components/sweetalert/dist/sweetalert.min',
            artDialog                             : '../../bower_components/artDialog/dist/dialog-plus-min',
            "directives/remote-validate-directive": '../../bower_components/prometheus/dist/directives/remote-validate',
            "directives/upload-files-directive"   : '../../bower_components/prometheus/dist/directives/upload-files',
            "directives/upload-image-directive"   : '../../bower_components/prometheus/dist/directives/upload-image',
            "common/hbWebUploader"                : '../../bower_components/prometheus/dist/modules/uploader',
            player                                : '../../bower_components/player/dist/player',
            es5ShimForIe                          : '../../bower_components/es5-shim/es5-shim',
            jqueryJson                            : '../../bower_components/jquery-json/dist/jquery.json.min',
            cameras                               : '../../bower_components/cameras/dist/js/cameras',
            angularStorage                        : '../../bower_components/angular-local-storage/dist/angular-local-storage',

            cookie        : '../../bower_components/cookies-js/dist/cookies',
            liteValidate  : '../../bower_components/validation/lite-validate',
            bootstrap     : '../../bower_components/bootstrap/dist/js/bootstrap',
            'loader'      : '../../bower_components/player/src/core/common/player',
            //multimediaDocument: '../../bower_components/StudyLibrary/scripts',
            jqueryKnob    : '../../bower_components/jquery-knob/js/jquery.knob',
            jqueryExcanvas: '../../bower_components/jquery-knob/excanvas'
        };
    // [ 'admin', 'bower_components', 'center', 'login', 'play', 'portal' ]
    config.getSubDirectories ( apps, config.dist + '/' )

        .forEach ( function ( directory ) {
            if ( directory !== 'bower_components' ) {
                directoryMap[directory] = {};
                if ( directory !== 'portal' ) {
                    fs.readdirSync ( config.dist + '/' + directory + '/js' ).forEach ( function ( files ) {
                        if ( new RegExp ( '^' + directory + '.app' ).test ( files ) ) {
                            directoryMap[directory].mainFile = files;
                        }
                    } )
                } else {
                    fs.readdirSync ( config.dist + '/' + directory + '/' ).forEach ( function ( portalSub ) {
                        if ( fs.statSync ( config.dist + '/' + directory + '/' + portalSub ).isDirectory () ) {
                            directoryMap[directory][portalSub] = {};
                            fs.readdirSync ( config.dist + '/' + directory + '/' + portalSub ).forEach ( function ( files ) {
                                if ( new RegExp ( '^portal.app' ).test ( files ) ) {
                                    directoryMap[directory][portalSub].mainFile = files;
                                }
                            } )
                        }
                    } )
                }
            }
        } );

    Object.keys ( directoryMap ).forEach ( function ( directory ) {
        if ( directory !== config.portal ) {
            if ( directoryMap[directory].mainFile ) {
                var baseUrl = config.dist + '/' + directory + '/js/',
                    out     = baseUrl + directoryMap[directory].mainFile,
                    name    = directoryMap[directory].mainFile.replace ( /(.*)\.js/, '$1' );
                gulp.task ( name, function () {
                    return gulp.src ( out )

                        .pipe ( through2.obj ( function ( file, nnn, callback ) {
                            var stream = this;
                            requirejs.optimize ( {
                                optimize: 'uglify2',
                                baseUrl : baseUrl,
                                out     : out,
                                paths   : portalPath,
                                shim    : shims,
                                name    : name
                            }, function ( text ) {
                                file.contents = new Buffer ( text );
                                stream.push ( file );
                                callback ();
                            } )
                        } ) )
                } );

                options.seque.push ( '"' + name + '"' );
            }
        } else {
            Object.keys ( directoryMap[directory] ).forEach ( function ( portalSub ) {
                var mainFile = directoryMap[directory][portalSub].mainFile
                if ( mainFile ) {
                    var baseUrl = config.dist + '/' + directory + '/',
                        out     = baseUrl + portalSub + '/' + mainFile,
                        name    = portalSub + '/' + mainFile.replace ( /(.*)\.js/, '$1' );

                    gulp.task ( name, function () {

                        return gulp.src ( out )

                            .pipe ( through2.obj ( function ( file, nnn, callback ) {
                                var stream = this;
                                requirejs.optimize ( {
                                    optimize: 'uglify2',
                                    baseUrl : baseUrl,
                                    paths   : paths,
                                    shim    : shims,
                                    out     : out,
                                    name    : name
                                }, function ( text ) {
                                    file.contents = new Buffer ( text );
                                    stream.push ( file );
                                    callback ();
                                } )
                            } ) )
                    } );

                    options.seque.push ( '"' + name + '"' );
                }
            } )
        }
    } );
};