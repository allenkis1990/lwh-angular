
// 获取访问当前应用的domain
var domain = window.location.href.replace(/http:\/\/|https:\/\//, '').split('/')[0].replace(/:\d{4}/, '');
    // 判断dev!='false'的时候为开发环境，
    // 在构建的时候将变量替换成false；dev就为false ，意思为测试环境或者是生产环境
    dev = '$$dev$$' != 'false';

// 根据上面配置dev判断是否是开发环境，

var devOptions = function () {
    return {
        baseUrl: dev ? '/admin/js' : '',
        mainAppPath: dev ? '../modules/' + appName + '/js/' : './',
        // 开发环境的时候没有做目录分离， 加载的内容基本从母版内容那边引入，
        // 测试或者生产环境对目录分离后加载的内容基本以自己的为准
        loadDir: dev ? '../../' : ''
    }
}();

if (dev) {
    require.config({
        baseUrl: devOptions.baseUrl
    })
}

require.config({
    // urlArgs    : (+new Date ()) + '',
    //baseUrl: '/bower_components/',
    paths: {
        controllers: 'controllers',
        services: 'services',
        angular: '/bower_components/angular/angular',
        angularSanitize: '/bower_components/angular-sanitize/angular-sanitize',
        angularUiRouter: '/bower_components/angular-ui-router/release/angular-ui-router',
        restangular: '/bower_components/restangular/dist/restangular',
        jquery: '/bower_components/jquery/dist/jquery',
        oclazyload: '/bower_components/oclazyload/dist/ocLazyLoad',
        uiRouterExtras: '/bower_components/ui-router-extras/release/ct-ui-router-extras',
        lodash: '/bower_components/lodash/lodash',
        prometheus: '/bower_components/prometheus/src'
    },
    shim: {
        angular: {deps: ['jquery'], exports: 'angular'},
        restangular: {deps: ['lodash', 'angular'], exports: 'restangular'},
        angularSanitize: {deps: ['angular'], exports: 'angularSanitize'},
        oclazyload: {deps: ['angular'], exports: 'oclazyload'},
        angularUiRouter: {deps: ['angular'], exports: 'angularUiRouter'},
        uiRouterExtras: {deps: ['angularUiRouter'], exports: 'uiRouterExtras'},
        lodash: {exports: '_'}
    },
    packages: [],
    waitSeconds: 0
});


require.devOptions = devOptions;

// 优先加载angular，
require(['angular'], function () {

    if (dev) {
        require(['common/stateMapper'], function (stateMapper) {
            bootstrap( stateMapper);
        })
    } else {
        bootstrap(undefined);
    }

    /**
     * 应用正式启动
     * @param appConfig
     * @param stateMapper
     */
    function bootstrap(stateMapper) {
        define('baseStateMapper', stateMapper);
        console.log(devOptions.mainAppPath);
        require([devOptions.mainAppPath + 'main.app'], function (app) {
            console.log(app);
            angular.bootstrap(document.documentElement, ['app']);
        });
    }
});


