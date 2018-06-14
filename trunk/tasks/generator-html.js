/**
 * Created by wengpengfei on 2016/8/26.
 */
var gulp   = require ( 'gulp' ),
    config = require ( '../things/config/config' ),
    fs     = require ( 'fs' ),
    path   = require ( 'path' ),
    jade   = require ( 'jade' );

gulp.task ( 'generatorHtml', function () {
    var htmlSub       = fs.readdirSync ( config.getHtmlBase () ),
        stream        = gulp.src ( [config.html + '/**/*.html', '!index.html'] ),
        templateJade  = './things/templates/html/template.jade',
        templateJade1 = './things/templates/html/template1.jade',
        fileMap       = {},
        subs          = config.getSubDirectories ( htmlSub, config.getHtmlBase () );

    function reGen() {
        subs.map ( function ( directory ) {
            var subs = fs.readdirSync ( config.getHtmlBase ( directory ) );
            if ( subs.length > 0 ) {
                fileMap[directory] = {}
            }
        } )
    }

    reGen ();
    stream.on ( 'data', function ( file ) {
        var myPath = path.relative ( './html', file.path );
        subs.map ( function ( directory ) {
            var reg = new RegExp ( '^' + directory + '\\\\', 'ig' );
            if ( reg.test ( myPath ) ) {
                fileMap[directory][path.basename ( file.path )] = myPath;
            }
        } )
    } );
    stream.on ( 'end', function () {
        Object.keys ( fileMap ).map ( function ( fileMapOne ) {
            var data = {
                appName  : fileMapOne,
                templates: [],
                defaults : {}
            };

            Object.keys ( fileMap[fileMapOne] ).map ( function ( file ) {
                var filePath  = path.relative ( fileMapOne, fileMap[fileMapOne][file] );
                var theModule = function () {
                    var result = '';
                    if ( /\\/.test ( filePath ) ) {
                        result = filePath.replace ( /(.*)\\.*/, '$1' );
                    }
                    return result;
                } ();
                data.templates.push ( {
                    appName   : fileMapOne,
                    moduleName: theModule,
                    name      : file,
                    href      : filePath
                } )
            } );

            data.defaults           = data.templates[0];
            var jadeTemplateContent = fs.readFileSync ( templateJade, config.utfEncoding );

            fs.writeFileSync ( 'html/' + fileMapOne + '/index_another.html', jade.compile ( jadeTemplateContent, { filename: '.' } ) ( data ), config.utfEncoding );

            var jadeTemplateContent1 = fs.readFileSync ( templateJade1, config.utfEncoding );

            fs.writeFileSync ( 'html/' + fileMapOne + '/index.html', jade.compile ( jadeTemplateContent1, { filename: '.' } ) ( data ), config.utfEncoding );
        } );

    } );
} );
