
define(['angular', 'jqueryNiceScroll'], function (angular) {

    var commonModule = angular.module('hb.frontCommon', ['hb.basicData', 'hb.niceScroll', 'hb.util']);


    angular.module('hb.util', [])

        .factory('hbUtil', ['$rootScope',function ($rootScope) {
            var _hbUtil = {};
            _hbUtil.isIe = function () {
                return (function (ua) {
                    var ie = ua.match(/MSIE\s([\d\.]+)/) ||
                        ua.match(/(?:trident)(?:.*rv:([\w.]+))?/i);
                    return ie && parseFloat(ie[1]);
                })(navigator.userAgent);
            };

            return _hbUtil;
        }]);

    angular.module('hb.basicData', []).factory('hbBasicData', ['$http', '$rootScope',
        function ($http, $rootScope) {
            var hbBasicData = {

            };
            return hbBasicData;

        }]).run(['$http', '$rootScope', 'hbBasicData', '$log', '$state', '$timeout',
        function ($http, $rootScope, hbBasicData, $log, $state, $timeout) {
            $rootScope.showApp_$$ = false;
            $rootScope.$on('$stateChangeSuccess', function () {
                $rootScope.showApp_$$ = true;
            });

        }])
});