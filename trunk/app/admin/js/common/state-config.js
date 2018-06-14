/**
 * Created by 46607 on 2017/4/7.
 */

define(function (mod) {
    "use strict";

    function findIndex(array, fn) {
        var result;
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (fn(item)) {
                item.$index = i;
                result = item;
                break;
            }
        }

        return result;
    }

    return {
        registerState: function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider

                .when('/accountSetting', 'accountSetting/accountSetting.detail')

                .otherwise('home');

            $stateProvider.state('states', {
                abstract: true, url: "",
                views: {
                    "topView@": {
                        templateUrl: 'views/home/top.html',
                        controller: ['$scope', '$rootScope', '$http', 'homeService',
                            function ($scope, $rootScope, $http, homeService) {
                                $scope.model = {
                                    showRed: false
                                };
                                $rootScope.examModel = {};
                                $scope.goHome = function () {
                                    window.open('/portal/accountant', '_self');
                                };
                                homeService.findUserDetailInfo().then(function (data) {
                                    $rootScope.$$$$userInfo = data.info;
                                    $scope.model.user = data.info;
                                });
                                homeService.ifShowRed().then(function (data) {
                                    if (data.status) {
                                        $scope.model.showRed = data.info;
                                    }
                                })
                            }]
                    },
                    "footerView@": {
                        templateUrl: 'views/home/footer.html',
                        controller: ['$scope', '$rootScope', '$http',
                            function ($scope, $rootScope, $http) {

                            }]
                    }
                }
            })


                .state('states.accountSetting', {
                    url: '/accountSetting',
                    sticky: true,
                    views: {
                        'contentView@': {
                            templateUrl: '/center/views/accountSetting/index.html',
                            controller: ['$scope', function ($scope) {
                                $scope.parentModel = {}
                            }]
                        }
                    }
                })
        },
        merge: function (own, base, dir) {
            var mergeResult = {
                futureStates: [],
                modules: []
            };
            if (!base) {
                return own;
            }
            // merge 流程

            // 以原来的

            // 遍历center/js/common下面配置的stateMapper，

            /**
             * 1. 如果当前模板存在和此母块的配置信息的话，将母块当中的信息覆盖成自己模板的信息  √
             * 2. 如果母快中有子中没有的配置信息，将母的保留，√
             * 3. 如果子中有母中没有的信息， 将子的信息保存进去，√
             * 。。。完成配置
             */
            angular.forEach(base.futureStates, function (baseItem) {
                var futureState = baseItem,
                    module = {};

                //- > 1.  如果当前的模板存在已经配置的信息则将当前的配置信息覆盖

                futureState = findIndex(own.futureStates, function (item) {
                        return item.stateName === baseItem.stateName;
                    }) || futureState;

                if (!angular.isUndefined(futureState.$index)) {
                    module = findIndex(own.modules, function (item) {
                        return futureState.module === item.name;
                    });
                    angular.forEach(module.files, function (item, index) {
                        module.files[index] = '../modules/' + dir + '/js/' + item;
                    })
                } else {
                    module = findIndex(base.modules, function (item) {
                        return futureState.module === item.name;
                    });
                }
                mergeResult.futureStates.push(futureState);
                mergeResult.modules.push(module);

            });

            angular.forEach(own.futureStates, function (item) {
                var findOut = findIndex(base.futureStates, function (findItem) {
                    return findItem.stateName === item.stateName;
                });
                if (!findOut) {

                    mergeResult.futureStates.push(item);

                    var module = findIndex(own.modules, function (subItem) {
                        return item.module === subItem.name;
                    });

                    angular.forEach(module.files, function (item, index) {
                        module.files[index] = '../modules/' + dir + '/js/' + item;
                    });

                    mergeResult.modules.push(module);
                }
            });

            return mergeResult;
        }
    }
});