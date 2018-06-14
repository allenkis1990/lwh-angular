/*jshint unused: vars */


define([
        './common/stateMapper',
        './common/state-config',
        'baseStateMapper',
        'uiRouterExtras',
        'prometheus/modules/interceptor',
        'angular',
        'oclazyload',
        'angularSanitize',
        'states/home-state',
        './common/hbCommon',
        'restangular'
    ],

    function (stateMapper, stateConfig, baseStateMapper) {
        'use strict';
        stateMapper = stateConfig.merge(stateMapper, baseStateMapper, appName);

        var app = angular.module('app',
            ['oc.lazyLoad',
                'ct.ui.router.extras',
                'HB_interceptor',
                'app.states.home',
                'ui.router',
                'ngSanitize',
                'hbCommon',
                'restangular']
        );
        app.constant('futureStates', stateMapper.futureStates);
        app.constant('modules', stateMapper.modules)


        app.config(function ($interpolateProvider, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $futureStateProvider, HBInterceptorProvider,
                             $httpProvider, /**restAngular配置项目的一个服务*/ RestangularProvider, futureStates, modules) {

            // 为了修复IE系列编译后dom的换行
            // 以'${{'替换默认的'{{'解析开始符 --choaklin.2015.9.10
            $interpolateProvider.startSymbol('b{{');
            HBInterceptorProvider.app = 'admin';
            //////////////////////////////
            //  请求响应拦截器            //
            //////////////////////////////
            $ocLazyLoadProvider.config({
                jsLoader: requirejs,
                loadedModules: ['states'],
                modules: modules
            });

            var ocLazyLoadStateFactory = ['$q', '$ocLazyLoad', 'futureState', function ($q, $ocLazyLoad, futureState) {
                var deferred = $q.defer();
                $ocLazyLoad.load(futureState.module)
                    .then(function (name) {
                        deferred.resolve();
                    }, function () {
                        deferred.reject();
                    });
                return deferred.promise;
            }];

            $futureStateProvider.stateFactory('ocLazyLoad', ocLazyLoadStateFactory);

            $futureStateProvider.addResolve(['$q', '$injector', '$http', function ($q, $injector, $http) {
                var deferd = $q.defer(),
                    promise = deferd.promise;
                angular.forEach(futureStates, function (futureState) {
                    $futureStateProvider.futureState(futureState);
                });
                deferd.resolve(futureStates.futureStates);
                return promise;
            }]);

            /////////////////////////////
            //配置RestAngular			//
            /////////////////////////////

            RestangularProvider.addFullRequestInterceptor(
                function (element, operation, route, url, headers, params, httpConfig) {
                    if (operation === 'post') {
                        if (headers['Content-Type'] && angular.isObject(element)) {
                            if (headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1) {
                                element = $.param(element);
                            }
                        }
                    }
                    return {
                        element: element,
                        params: params,
                        headers: headers,
                        httpConfig: httpConfig
                    };
                });
            RestangularProvider.setDefaultHttpFields({cache: false});
        });

        app.run(['$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                $rootScope.$on('$stateChangeSuccess', function (events, state) {
                    if (!state.statted) {
                        state.statted = true;
                    }
                })
            }
        ]);
        return app;
    });
