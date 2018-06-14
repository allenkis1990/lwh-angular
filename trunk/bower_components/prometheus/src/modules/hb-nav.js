/**
 * Created by wengpengfei on 2016/4/22.
 */
define(['angular', 'angularUiRouter', 'uiRouterExtras', 'oclazyload'],

    function (angular) {

        function isIe() {
            return (function (ua) {
                var ie = ua.match(/MSIE\s([\d\.]+)/) ||
                    ua.match(/(?:trident)(?:.*rv:([\w.]+))?/i);
                return ie && parseFloat(ie[1]);
            })(navigator.userAgent);
        }

        return angular.module('hb.nav', ['ui.router', 'oc.lazyLoad',
            'ct.ui.router.extras'])

        // sideMenu
            .provider('sideMenu', [function () {

                this.setLoadMenuUrl = function (url) {
                    this.menuUrl = url;
                };
                this.sync = true;
                this.menuUrl = 'datas/hb.menu.json';
                this.setOptions = function (options) {
                    var options = options || {};
                    this.menuUrl = options.menuUrl || 'datas/hb.menu.json';
                    this.menuTemplateUrl = options.menuTemplateUrl || 'templates/tpls/tpl-hb-side-menu.html';
                    this.sync = options.sync;
                };

                var _this = this;

                this.$get = ['$http', function ($http) {
                    return {
                        sync: _this.sync,
                        /**
                         * 加载菜单的服务
                         * @returns {*}
                         */
                        loadMenu: function () {
                            return $http.get(_this.menuUrl);
                        },
                        getSrollOptions: function () {
                            return _this.scrollOptions;
                        }
                    }
                }]
            }])

            .provider('hbTab', function () {
                var HbTab = function () {

                };
                HbTab.prototype = {
                    appendNewTab: angular.noop
                };
                this.$get = [function () {
                    return new HbTab();
                }]
            })

            .factory('TabService', ['$rootScope', '$state', function ($rootScope, $state) {
                var TabService = {
                    HB_TAB: {
                        tabs: []
                    }
                };

                TabService.findView = function (view) {
                    var findOutInfo;
                    for (var i = 0; i < this.HB_TAB.tabs.length; i++) {
                        if (view[this.HB_TAB.tabs[i].viewName]) {
                            findOutInfo = this.HB_TAB.tabs[i];
                            break;
                        }
                    }
                    return findOutInfo;
                };

                TabService.goAnyWay = function (currentState) {
                    var result = {};

                    if (currentState.unListed) {
                        var theState = {
                            state: currentState.name,
                            name: currentState.title
                        };
                        this.newState(result, theState, currentState);
                    } else {
                        for (var id = 0; id < $rootScope.menuList.length; id++) {
                            var state = $rootScope.menuList[id];
                            if (!state.subs) {
                                this.newState(result, state, currentState);
                            } else {
                                for (var k = 0; k < state.subs.length; k++) {
                                    var subState = state.subs[k];
                                    this.newState(result, subState, currentState);
                                }
                            }
                        }
                    }
                    if (result.state) {
                        this.appendNewTab(result.state.name, result.state.activeView.stateName, result.state.activeView.params, result.state.viewName, true);
                    }
                };

                TabService.compare2State = function (one, two) {
                    return new RegExp('^' + one + '.').test(two) || one === two;
                };

                TabService.newState = function (result, state, compareState) {
                    if (this.compare2State(state.state, compareState.name)) {
                        var active = {
                            params: compareState.$stateParams,
                            stateName: compareState.name
                        };
                        result.state = {
                            name: state.name,
                            viewName: state.state,
                            position: 'index',
                            closeAble: true,
                            subs: [],
                            activeView: active
                        }
                    }
                };

                TabService.changeCurrent = function (view, params) {
                    return $state.go(view, params)
                };

                TabService.appendNewTab = function (title, view, params, parentView, closeAble) {
                    var includes = {};
                    includes[parentView || view] = true;
                    var storeState = this.findView(includes);

                    TabService.from = "0";

                    if (!storeState) {
                        storeState = {
                            name: title, viewName: parentView || view,
                            params: params,
                            activeView: {stateName: view, params: params},
                            closeAble: closeAble
                        };

                        this.HB_TAB.tabs.push(storeState);
                    } else {
                        storeState.params = params;
                        storeState.activeView = {stateName: view, params: params};
                    }

                    if (this.HB_TAB.tabs.length > 1) {
                        this.changeCurrent(view, params);
                        $rootScope.$broadcast('events:addTab', storeState);
                    }
                };


                TabService.init = function () {
                    var home = $rootScope.menuList[0];
                    TabService.appendNewTab(home.name, home.state, undefined, undefined, false);
                };

                return TabService;
            }])

            .directive('hbSideMenu', ['sideMenu', '$rootScope', '$timeout', 'TabService', '$state',
                function (sideMenu, $rootScope, $timeout, TabService, $state) {
                    var methodMap = {
                        'switch': true,
                        'false': -250,
                        'true': 0,
                        toggleMenu: function () {
                            var how = methodMap[methodMap['switch']];
                            this.css({left: how + 'px'})
                                .siblings('.tab').css({left: (how + 250) + 'px'});
                            return how + 250;
                        }
                    };
                    return {
                        templateUrl: function (element, attrs) {
                            return attrs.templateUrl || 'templates/tpls/tpl-hb-side-menu.html';
                        },
                        replace: true,
                        compile: function (tElement) {

                            return function link($scope, $element, $attr) {
                                $scope.model = $scope.model || {};
                                $scope.model.currentMenuName = 'states.home';
                                $scope.isIe8 = isIe() === 8;
                                $scope.showMenu = false;
                                $scope.events = {
                                    /**
                                     * 切换左侧导航蓝
                                     */
                                    toggleSideNav: function () {
                                        $scope.showMenu = !$scope.showMenu;
                                        $scope.model.nowMarginLeft = 0;
                                        if ($scope.showMenu) {
                                            $scope.model.sideStyle = {marginLeft: '-250px'};
                                            $rootScope.contentStyle = {marginLeft: 0};
                                            $scope.model.nowMarginLeft = -250;
                                        } else {
                                            $scope.model.sideStyle = {marginLeft: 0};
                                            $rootScope.contentStyle = {marginLeft: '250px'};
                                            $scope.model.nowMarginLeft = 0;

                                        }

                                        $rootScope.$broadcast('events:changeSideWidth', $scope.model.nowMarginLeft);
                                    },

                                    toggleSub: function ($e, menu, parentIsCurrentState, parentState) {
                                        var $this = $($e.target),
                                            $li = $this.closest('li'),
                                            $span = $('<span class="ink"></span>'),
                                            daydayday = Math.max($li.outerWidth(), $li.outerHeight());
                                        $li.find('.ink').remove();
                                        $li.css({position: 'relative', overflow: 'hidden'});
                                        $span.css({
                                            width: daydayday,
                                            height: daydayday,
                                            top: ($e.pageY - $li.offset().top - (daydayday / 2)) + 'px',
                                            left: ($e.pageX - $li.offset().left - (daydayday / 2)) + 'px'
                                        });

                                        $li.find('>a').append($span);

                                        $span.addClass('animate-ink');

                                        menu.showSub = !menu.showSub;

                                        if (menu.subs && menu.subs.length > 0) {
                                            angular.forEach($rootScope.menuList, function (item) {
                                                if (item.name !== menu.name) {
                                                    item.showSub = false;
                                                }
                                            });

                                            var liSubUl = $li.find('ul');
                                            if (liSubUl.is(':visible')) {
                                                liSubUl.slideUp()
                                            } else {
                                                liSubUl.slideDown()
                                                    .parent().siblings().find('ul').slideUp();
                                            }
                                        }

                                        if (menu.subs) {
                                            if (menu.subs.length <= 0) {
                                                return false;
                                            }
                                            return false;
                                        }
                                        $scope.model.currentMenu = parentIsCurrentState;
                                        $scope.model.currentMenuName = parentState;
                                        $state.go(menu.state, menu.name);
                                    }
                                };
                            }
                        }
                    }
                }])


            .run(['$rootScope', 'sideMenu', '$stateParams', 'TabService', '$state',
                function ($rootScope, sideMenu, $stateParams, TabService, $state) {
                    $rootScope.menuList = [];
                    $rootScope.model = $rootScope.model || {};


                    sideMenu.loadMenu()
                        .then(function (data) {
                            $rootScope.menuList = data.data;
                            if ($rootScope.menuList && $rootScope.menuList.length > 0) {
                                TabService.init();
                            }
                            $rootScope.$on('$stateChangeSuccess', function (a, currentState) {
                                // 路由切换state引用参数出现异常
                                currentState.$stateParams = angular.copy($stateParams);

                                var includes = currentState.$$state().includes,
                                    theView;
                                if (TabService.from === "0") {
                                    TabService.goAnyWay(currentState);
                                    theView = TabService.findView(includes);
                                    theView.activeView.stateName = currentState.name;
                                    theView.activeView.params = angular.copy($stateParams);
                                    TabService.from = "1";
                                } else {
                                    if (includes) {
                                        if (includes[currentState.name]) {
                                            theView = TabService.findView(includes);
                                            if (theView) {
                                                theView.activeView.stateName = currentState.name;
                                                theView.activeView.params = angular.copy($stateParams);
                                            } else {
                                                TabService.goAnyWay(currentState);
                                            }
                                        }
                                    }
                                }
                            });
                        });
                }])

            .directive('hbTab', ['$rootScope', '$state', 'hbTab', '$stateParams', '$timeout', 'TabService',
                function ($rootScope, $state, hbTab, $stateParams, $timeout, TabService) {
                    return {
                        restrict: 'A',
                        replace: true,
                        templateUrl: function (element, attrs) {
                            return attrs.templateUrl || 'templates/tpls/tpl-hb-tab.html';
                        },
                        link: function ($scope, $element, $attr, ctrl) {

                            $scope.$state = $state;
                            TabService.from = "0";
                            $scope.style = {};

                            $scope.HB_TAB = TabService.HB_TAB;

                            $scope.$on('events:clickMenuItem', function (data) {
                                $scope.HB_TAB.currentTab = data.parentView || data.view;
                            });

                            $scope.style.left = 0;

                            // -------------------

                            /**
                             *  关闭tab的时候触发的事件
                             *
                             *
                             *  2016-11-16 增加关闭tab的时候，判断是否当前激活的tab是否与关闭tab有关联，如果有，则跳到前面那个状态
                             *              如果没有， 则不跳转状态
                             * @param $e
                             * @param index
                             * @param viewName
                             */
                            $scope.closeTab = function ($e, index, viewName) {
                                $e.stopPropagation();
                                TabService.from = "0";
                                var thePreTab;
                                $scope.HB_TAB.tabs.splice(index, 1);
                                if ($state.includes(viewName)) {
                                    thePreTab = $scope.HB_TAB.tabs[index - 1];
                                    $timeout(function () {
                                        TabService.changeCurrent(thePreTab.activeView.stateName, thePreTab.activeView.params);
                                    });
                                }

                                if ($scope.style.left < 0) {
                                    $scope.style.left += 126;
                                    if ($scope.style.left > 0) {
                                        $scope.style.left = 0;
                                    }
                                }
                            };

                            $scope.navToolClick = function ($event) {
                                var $this = $($event.target);
                                var data = $this.data();

                                var method = {
                                    refresh: function () {
                                        $state.reload($state.current);
                                    },
                                    closeAll: function () {
                                        TabService.init();
                                        $scope.HB_TAB.tabs = $scope.HB_TAB.tabs.slice(0, 1);
                                    }
                                };

                                method[data.action] && method[data.action]();
                            };

                            $scope.mouseEnter = function ($e) {
                                var titleContent = $($e.target).closest('a')
                                    .find('.title-content');
                                titleContent.stop().fadeOut(function () {
                                    titleContent.next().fadeIn();
                                });
                            };

                            $scope.mouseLeave = function ($e) {
                            };

                            $scope.clickTab = function ($e, view, params, exactlyView) {
                                TabService.from = "1";
                                $scope.HB_TAB.currentTab = angular.copy(exactlyView);
                                TabService.changeCurrent(view, params);
                                $rootScope.$broadcast('events:clickMenuItem', true);
                                $e.preventDefault();
                            };

                            // $scope.goRight = function () {
                            //
                            //     var navWidth = $nav.width();
                            //
                            //     if ($scope.style.width + 40 > navWidth) {
                            //         $scope.style.left -= 126;
                            //         if ($scope.style.width + $scope.style.left < navWidth) {
                            //             $scope.style.left = (navWidth - ($scope.style.width + 40 ) );
                            //         }
                            //     }
                            // };
                            // $scope.goLeft = function () {
                            //     $scope.style.left += 126;
                            //     if ($scope.style.left >= 0) {
                            //         $scope.style.left = 0;
                            //         return false;
                            //     }
                            // }
                        }
                    }
                }
            ])

    });
