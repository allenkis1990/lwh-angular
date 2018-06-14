
var dev = true,
    configUrl = 'project.main.json',

// configUrl = 'http://192.168.1.171:8000/web/portal/getPortalTemplet',
domain = window.location.href;

domain = domain.replace(/http:\/\/|https:\/\//, '').split('/')[0].replace(/:\d{4}/, '');

require({
    paths: {
        angular: '/bower_components/angular/angular',
        jquery: '/bower_components/jquery/dist/jquery',
        angularUiRouter: '/bower_components/angular-ui-router/release/angular-ui-router',
        oclazyload: '/bower_components/oclazyload/dist/ocLazyLoad',
        restangular: '/bower_components/restangular/dist/restangular',
        lodash: '/bower_components/lodash/lodash',
        uiRouterExtras: '/bower_components/ui-router-extras/release/ct-ui-router-extras',
        css: '/bower_components/require-css/css',
        cookie: '/bower_components/cookies-js/dist/cookies',
        jqueryNiceScroll: '/bower_components/prometheus/dist/modules/hb-nice-scroll',
        artDialog: '/bower_components/artDialog/dist/dialog-plus-min',
        angularCookies: '/bower_components/angular-cookies/angular-cookies',
        prometheus: '/bower_components/prometheus/src',
        bootstrap: '/bower_components/bootstrap/dist/js/bootstrap',
        angularSanitize: '/bower_components/angular-sanitize/angular-sanitize'
    },
    shim: {
        angular: { exports: 'angular', deps: ['jquery'] },
        restangular: { deps: ['angular', 'lodash'] },
        angularUiRouter: { deps: ['angular'], exports: 'angularUiRouter' },
        oclazyload: { deps: ['angular'] },
        uiRouterExtras: { deps: ['angular'], exports: 'uiRouterExtras' },
        jqueryNiceScroll: { deps: ['jquery', 'angular'], exports: 'jqueryNiceScroll' },
        artDialog: { deps: ['jquery'], exports: 'dialog' },
        angularCookies: { deps: ['angular'] },
        loader: { exports: 'loader' },
        angularSanitize: { deps: ['angular'], exports: 'angularSanitize' }
    },
    callback: function () {
        dev = new RegExp('project.main.json', 'g').test(configUrl);

        function getDomainInfo(configs) {
            var result;
            for (var i = 0; i < configs.length; i++) {
                if (configs[i].domain === domain) {
                    result = configs[i];
                    break;
                }
            }
            return result;
        }

        require(['angular', '_app_config_infos_', 'jquery'], function (angular, _app_config_infos_) {

            var invoker = angular.injector(['ng']),
                myInfo;

            invoker.invoke(['$http', function ($http) {

                $http.get(configUrl + '?_q=' + +new Date(), {
                    params: {
                        domain: domain
                    }
                }).then(function (data) {
                    var remoteData = getDomainInfo(data.data);

                    for (var i = 0; i < _app_config_infos_.length; i++) {
                        if (remoteData.baseUrl === _app_config_infos_[i].name) {
                            myInfo = _app_config_infos_[i];
                            break;
                        }
                    }

                    if (!myInfo) {
                        return false;
                    }

                    // 设置标头
                    document.title = remoteData.name;

                    require(['./' + myInfo.main.replace(/(^js\/)?(.*)\.js$/, "$2")], function (app) {
                        angular.module('snifferSolution', []).config(['$provide', function ($provide) {
                            //解决ie10下面的placeholder导致$dirty为true
                            $provide.decorator('$sniffer', ['$delegate', function ($sniffer) {
                                var msie = parseInt((/msie (\d+)/.exec(angular.lowercase(navigator.userAgent)) || [])[1], 10);
                                var _hasEvent = $sniffer.hasEvent;
                                $sniffer.hasEvent = function (event) {
                                    if (event === 'input' && msie === 10) {
                                        return false;
                                    }
                                    _hasEvent.call(this, event);
                                };
                                return $sniffer;
                            }]);
                        }]);
                        angular.bootstrap(document.getElementsByTagName("html")[0], ['app', 'snifferSolution']);
                    });

                    require.dev = dev;
                    remoteData.baseUrl = dev ? remoteData.baseUrl : remoteData.baseUrl + '/js';
                    require.config_data_for_cms = remoteData;
                    require.local_config_data_for_cms = myInfo;
                });
            }]);
        });
    }
});

//# sourceMappingURL=main.config-compiled.js.map