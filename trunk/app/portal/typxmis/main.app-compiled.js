/**
 * Created by wengpengfei on 2016/8/8.
 */
define(['typxmis/js/common/stateMapper', 'typxmis/js/common/hbFrontCommon', 'prometheus/modules/interceptor', 'css!' + require.local_config_data_for_cms.themes[require.config_data_for_cms.theme], 'angular', 'uiRouterExtras', 'oclazyload', 'angularUiRouter', 'restangular', 'prometheus/modules/placeholder'], function (stateMapper) {
    'use strict';

    return angular.module('app', ['ui.router', 'oc.lazyLoad', 'ct.ui.router.extras', 'restangular', 'hb.frontCommon', 'HB_interceptor', 'Placeholder']).constant('modules', stateMapper.modules).constant('futureStates', stateMapper.futureStates).config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$futureStateProvider', 'modules', 'futureStates', '$locationProvider', 'RestangularProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $futureStateProvider, modules, futureStates, $locationProvider, RestangularProvider, $httpProvider) {
        /////////////////////////////////////////////
        /////                                   /////
        $locationProvider.hashPrefix('!');
        $locationProvider.html5Mode(true);
        /////                                   /////
        /////////////////////////////////////////////
        $ocLazyLoadProvider.config({
            //debug: true,
            jsLoader: requirejs,
            //events: true,
            loadedModules: ['states'],
            modules: modules
        });

        var ocLazyLoadStateFactory = ['$q', '$ocLazyLoad', 'futureState', function ($q, $ocLazyLoad, futureState) {
            var deferred = $q.defer();
            $ocLazyLoad.load(futureState.module).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            });
            return deferred.promise;
        }];

        $futureStateProvider.stateFactory('ocLazyLoad', ocLazyLoadStateFactory);

        // 随便一个注解
        $futureStateProvider.addResolve(['$q', '$injector', '$http', function ($q) {
            var deferd = $q.defer(),
                promise = deferd.promise;
            angular.forEach(futureStates, function (futureState) {
                $futureStateProvider.futureState(futureState);
            });
            deferd.resolve(futureStates);
            return promise;
        }]);

        $urlRouterProvider.otherwise('index');
        $stateProvider.state('states', {
            url: '',
            abstract: true
        });

        /////////////////////////////
        //配置RestAngular			//
        /////////////////////////////

        RestangularProvider.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
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
        $httpProvider.interceptors.push(['$q', function ($q) {
            var responseInterceptor = {
                request: function (request) {
                    var now = +new Date();
                    if (request.url.indexOf('/web/') !== -1) {
                        if (request.url.indexOf('?') !== -1) {
                            request.url += '&_q_=' + now;
                        } else {
                            request.url += '?_q_=' + now;
                        }
                    }
                    return request;
                },
                responseError: function (rejection) {
                    return $q.reject(rejection);
                }
            };
            return responseInterceptor;
        }]);
        RestangularProvider.setDefaultHttpFields({ cache: false });
    }]).run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }]);
});

//# sourceMappingURL=main.app-compiled.js.map