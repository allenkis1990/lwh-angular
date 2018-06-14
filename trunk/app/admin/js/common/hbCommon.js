
define(['angular'],
    function (angular) {

        var hbCommon = angular.module('hbCommon', ['hb.util']);

        angular.module('hb.util', [])

            .factory('hbUtil', ['$rootScope', function ($rootScope) {
                var _hbUtil = {};
                _hbUtil.isIe = function () {
                    return (function (ua) {
                        var ie = ua.match(/MSIE\s([\d\.]+)/) ||
                            ua.match(/(?:trident)(?:.*rv:([\w.]+))?/i);
                        return ie && parseFloat(ie[1]);
                    })(navigator.userAgent);
                };

                _hbUtil.isEmptyString = function (val) {
                    if (!val || val === '' || val === null || ((val + '').replace(/(^s*)|(s*$)/g, "").length) === 0) {
                        return true;
                    }
                    return false;
                };


                _hbUtil.validateIsNaN = function (obj) {
                    return isNaN(Number(obj))
                };

                _hbUtil.validateIsNull = function (obj) {
                    return (obj === '' || obj === undefined || obj === null);
                };

                return _hbUtil;
            }]);

        hbCommon.directive('hbBind', ['$compile', '$parse', function ($compile, $parse) {
            return {
                link: function ($scope, $element, $attr) {
                    $scope.$watch($attr.hbBind, function () {
                        var hbBind = $parse($attr.hbBind)($scope);
                        var comHbBind = $compile($.parseHTML(hbBind))($scope);
                        $element.html(comHbBind);
                    });
                }
            }
        }]);

    });

