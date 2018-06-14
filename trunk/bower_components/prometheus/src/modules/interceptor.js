/**
 * 作者: 翁鹏飞
 *            --- > 亡灵走秀
 * 日期: 2015/8/19
 * 时间: 10:47
 *
 */

define(['angular'], function (angular) {
    'use strict';

    var HB_interceptor = angular.module('HB_interceptor', [])

        .provider('HBInterceptor',
            [function () {
                var that = this;
                this.app = undefined;
                this.loginPageStr = undefined;
                this.$get = [function () {
                    return {
                        getAppString: function () {
                            return that.app;
                        },
                        getApp: function () {
                            return that.app === 'admin' ? 2 : 1;
                        },
                        getLoginPage: function () {
                            return that.loginPageStr || '/login/index.html';
                        },
                        toLoginPage: function () {
                            window.location.href = this.getLoginPage();
                        }
                    }
                }]
            }])

        .config(['$httpProvider', function ($httpProvider) {

            $httpProvider.interceptors.push('ajaxInterceptor');

        }])

        .run([ 'HBInterceptor', '$rootScope', '$http',
            function (HBInterceptor, $rootScope, $http) {
                $rootScope.$on('event:ajaxRequestErrorResponse', function (a, response) {
                    switch (response['code']) {
                        case 401:
                            alert('未登录');
                            break;
                        case 404:
                            alert('404');
                            break;
                        case 500:
                            alert('服务错误');
                            break;
                        case 403:
                            alert('没权限');
                            break;
                    }
                });

                /*HBInterceptor.getApp() === 2 ? (function () {
                    HBInterceptor.storeVar = 'adminUserInfo';
                })() : (function () {
                    HBInterceptor.storeVar = 'frontUserInfo';
                })();*/

                $.ajaxSetup({
                    cache: false,
                    statusCode: {
                        404: function (data, aa, bb) {
                            $rootScope.$broadcast('event:ajaxRequestErrorResponse', {
                                code: 404
                            });
                        },
                        401: function (data) {
                            $rootScope.$broadcast('event:ajaxRequestErrorResponse', {code: 401});
                        },
                        500: function (data, ee, aa, cc) {
                            $rootScope.$broadcast('event:ajaxRequestErrorResponse', {
                                message: data['responseJSON'],
                                code: data.status
                            });
                        },
                        403: function (data, ee, aa, cc) {
                            $rootScope.$broadcast('event:ajaxRequestErrorResponse', {code: 403});
                        }
                    }
                });

            }]);

    HB_interceptor.factory('ajaxInterceptor', ['$q', '$rootScope',
        function ($q, $rootScope) {
            var responseInterceptor = {
                request: function (request) {
                    if (request.url.indexOf('/web/') !== -1) {
                        if (request.url.indexOf('?') !== -1) {
                            request.url += ('&_q_=' + Date.now());
                        } else {
                            request.url += ('?_q_=' + Date.now());
                        }
                    }
                    return request;
                },
                responseError: function (rejection) {
                    $rootScope.$broadcast('event:ajaxRequestErrorResponse', {
                        code: rejection.status,
                        message: rejection.data
                    });
                    return $q.reject(rejection);
                }
            };
            return responseInterceptor;
        }])

        .factory('cookieOp', [function () {
            return {
                rememberPassword: function (var_, info, date) {
                    var Days = 30,
                        exp = new Date();
                    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);

                    var expires = exp.toGMTString();

                    if (typeof date !== 'undefined') {
                        var oldDate = new Date();
                        oldDate.setDate(oldDate.getDate() + date);
                        expires = oldDate.toGMTString();
                    }

                    document.cookie = var_ + '=' + angular.toJson(info) + ";expires=" + expires + ';path=/';
                },
                removeFromCookie: function (key) {
                    this.rememberPassword(key, 1, 1, -1);
                },
                getUserCookie: function (key) {
                    var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
                    if (arr = document.cookie.match(reg))
                        return unescape(arr[2]);
                }
            }
        }])
});
