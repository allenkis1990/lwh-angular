/**
 * Created by wengpengfei on 2016/8/25.
 */
var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path');

/**
 *
 * 创建模块 gulp createModule -n  someName [-v 0.0.1]
 *
 *  -a for appName
 *  -n for moduleName
 */
gulp.task('createModule', function () {

    var moduleName = options.n,
        appName = options.a,
        version = options.v,
        replaceModuleNameReg = /\$\$moduleName\$\$/g,
        templateDirectory = config.getTemplateBase(appName, moduleName),
        styleDirectory = config.getLessBase(appName, moduleName),
        htmlDirectory = config.getViewsTemplateBase(appName, moduleName);

    /**
     *
     * @param moduleName
     * @returns {string}
     */
    function getStateContents(moduleName) {
        return ("define ( ['$$moduleName$$/js/modules/home/main'], function ( controllers ) {" +
        "'use strict';" +
        "angular.module ( 'app.portal.states.$$moduleName$$', [] )" +
        ".config ( ['$stateProvider', function ( $stateProvider ) {" +
        "       $stateProvider.state ( 'states.$$moduleName$$', {" +
        "           url  : '/$$moduleName$$'," +
        "           views: {" +
        "               '@': {" +
        "                   templateUrl: '$$moduleName$$/views/index.html'," +
        "                   controller : 'app.portal.states.$$moduleName$$.indexCtrl'" +
        "               }" +
        "           }" +
        "       } )" +
        "   }] ) " +
        "} )").replace(replaceModuleNameReg, moduleName);
    }

    /**
     *
     * @param moduleName
     * @returns {string}
     */
    function getNotPortalStateContents(app, moduleName) {
        return ("define ( ['modules/$$moduleName$$/main'], function ( controllers ) {" +
        "'use strict';" +
        "angular.module ( 'app." + app + ".states.$$moduleName$$', [] )" +
        ".config ( ['$stateProvider', function ( $stateProvider ) {" +
        "       $stateProvider.state ( 'states.$$moduleName$$', {" +
        "           url  : '/$$moduleName$$'," +
        "           views: {" +
        "               '@': {" +
        "                   templateUrl: 'views/$$moduleName$$/index.html'," +
        "                   controller : 'app." + app + ".states.$$moduleName$$.indexCtrl'" +
        "               }" +
        "           }" +
        "       } )" +
        "   }] ) " +
        "} )").replace(replaceModuleNameReg, moduleName);
    }

    /**
     *
     * @param moduleName
     * @returns {string}
     */
    function getMainContents(moduleName) {
        return ("define ( ['$$moduleName$$/js/modules/home/controllers/$$moduleName$$-ctrl'], function ( controllers ) {" +
        "'use strict';" +
        "angular.module ( 'app.portal.states.$$moduleName$$.main', [] )" +
        ".controller ( 'app.portal.states.$$moduleName$$.indexCtrl', controllers.indexCtrl );" +
        "} );").replace(replaceModuleNameReg, moduleName)
    }

    /**
     *
     * @param moduleName
     * @returns {string}
     */
    function getNotPortalMainContents(app, moduleName) {
        return ("define ( ['modules/$$moduleName$$/controllers/$$moduleName$$-ctrl'], function ( controllers ) {" +
        "'use strict';" +
        "angular.module ( 'app." + app + ".states.$$moduleName$$.main', [] )" +
        ".controller ( 'app." + app + ".states.$$moduleName$$.indexCtrl', controllers.indexCtrl );" +
        "} );").replace(replaceModuleNameReg, moduleName)
    }

    /**
     *
     * @param moduleName
     * @returns {string}
     */
    function getControllerContents(moduleName) {
        return ('define ( function ( $$moduleName$$ ) {\n' +
        '"use strict";\n' +
        'return {\n' +
        '    indexCtrl: ["$scope", function ( $scope ) {\n' +
        '       console.log ( "$$moduleName$$" );\n' +
        '       }]\n' +
        '}' +
        '} );').replace(replaceModuleNameReg, moduleName);
    }

    /**
     *
     */
    function createScript() {
        // 创建模块文件夹
        var portalAppJsContents = fs.readFileSync(config.getThingsBase('templates/js/portal.app.js'), config.utfEncoding);
        fs.mkdirSync(templateDirectory);
        // fs.writeFileSync ( templateDirectory + '/common/si.js' );
        fs.mkdirSync(templateDirectory + '/js');
        fs.writeFileSync(templateDirectory + '/portal.app.js', portalAppJsContents.replace(replaceModuleNameReg, moduleName), config.utfEncoding);
        fs.mkdirSync(templateDirectory + '/js/common');
        fs.mkdirSync(templateDirectory + '/js/modules');
        fs.mkdirSync(templateDirectory + '/js/modules/home');
        fs.writeFileSync(templateDirectory + '/js/modules/home/main.js', getMainContents(moduleName), config.utfEncoding);
        fs.mkdirSync(templateDirectory + '/js/modules/home/controllers');
        fs.writeFileSync(templateDirectory + '/js/modules/home/controllers/' + moduleName + '-ctrl.js', getControllerContents(moduleName), config.utfEncoding);
        fs.mkdirSync(templateDirectory + '/js/modules/home/services');
        fs.mkdirSync(templateDirectory + '/js/modules/home/directives');

        // 状态
        fs.mkdirSync(templateDirectory + '/js/states');
        fs.writeFileSync(templateDirectory + '/js/states/' + moduleName + '-state.js', getStateContents(moduleName), config.utfEncoding);

        // 创建重要文件
        // fs.writeFileSync ( templateDirectory + '/' + moduleName + '.app.js' );
        fs.writeFileSync(templateDirectory + '/info.json');
        writeInfoJson(moduleName, options.v);
        fs.writeFileSync(templateDirectory + '/README.MD');
        function writeInfoJson(moduleName, version) {
            var info = {
                name: moduleName,
                themes: {
                    "default": moduleName + '/styles/default/' + moduleName + '.css'
                },
                main: moduleName + '/portal.app.js',
                version: version || '0.0.1'
            };

            fs.writeFileSync(templateDirectory + '/info.json', JSON.stringify(info), config.utfEncoding);
        }
    }

    function createStyle(directory) {
        fs.mkdirSync(directory);
        fs.mkdirSync(directory + '/default');
        fs.writeFileSync(directory + '/default/' + moduleName + '.less', '', config.utfEncoding);
    }

    function createView(directory) {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + 'index.html');
    }

    function createNotPortalModule(directory) {
        var moduleThings = directory + '/modules/' + moduleName;
        fs.mkdirSync(moduleThings);
        fs.writeFileSync(moduleThings + '/main.js', getNotPortalMainContents(appName, moduleName), config.utfEncoding);

        fs.mkdirSync(moduleThings + '/controllers');
        fs.writeFileSync(moduleThings + '/controllers/' + moduleName + '-ctrl.js', getControllerContents(moduleName));

        fs.writeFileSync(directory + '/states/' + moduleName + '-state.js', getNotPortalStateContents(appName, moduleName), config.utfEncoding);
    }

    if (options.a === config.portal) {

        [{
            from: config.getThingsBase('templates/js/si.js'),
            to: templateDirectory + '/js/common'
        }].map(function (item) {
            doCopy(item.from, item.to);
        });
        createScript();

        createStyle(styleDirectory);

        createView(htmlDirectory);

        fs.mkdirSync(templateDirectory + '/images');

        gulp.run(['loadStates', 'less']);
    } else {

        var viewWhere = './app/' + options.a + '/views/' + options.n + '/',
            jsWhere = './app/' + options.a + '/js/';

        createNotPortalModule(jsWhere);

        createView(viewWhere);

        gulp.run(['loadStates', 'less']);
    }

});

/**
 * 删除模块命令 gulp removeModule -name someName [-v 0.0.1]
 */
gulp.task('removeModule', function () {
    var moduleName = options.n,
        version = options.v,
        templateDirectory = config.getTemplateBase(moduleName),
        styleDirectory = config.getLessBase(moduleName),
        htmlDirectory = config.getViewsTemplateBase(moduleName);

    /**
     * 深层删除文件夹
     * @param path
     */
    function deleteFolderRecursive(path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    //////////////////////////////////////////
    deleteFolderRecursive(templateDirectory);
    //////////////////////////////////////////
    deleteFolderRecursive(styleDirectory);
    ////////////////////////////////////////
    deleteFolderRecursive(htmlDirectory);
    ////////////////////////////////////////
});