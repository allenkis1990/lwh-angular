/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
define(
    ['angular', 'artDialog', './extend/extend', 'angularUiRouter', 'common/hbLesson', 'angularAnimate', 'angularStorage', './extend/external'],
    function (angular, artDialog, extend) {
        'use strict';

        var dialog_ = dialog,

            undefined_ = function () {
                return arguments[1]
            }(),

            templateCode_ = {
                normal: 100,
                out_of_date: 101,
                out_of_play_time: 102,
                can_not_listen: 103,
                must_buy: 104
            },
            forEach = angular.forEach,
            isFunction = angular.isFunction;

        ////// listen  类型的要提供课程id 和课件id
        ////// learn   类型的要提供课程id 和课件id
        ////// preview 类型的不需要提供课程id 但是要提供课件id
        /**
         * @rejects
         *      1. 获取登录信息报错
         *      2. 获取课程信息报错
         *      3. 无法获取课件信息
         *      .......... 返回404页面
         *
         * @param message
         */

        // 与外界交互的返回课程页面
        //
        function minErr(message) {
            throw new Error(message);
        }

        angular.module('app', ['ui.router', 'ngAnimate',
            'LocalStorageModule',
            'external',
            'hb.player'])

            .provider('hbPlayerBase', [function () {

                var that = this;
                this.setOptions = function (options) {
                    this.options = options;
                };

                function getOption(param, isLearn) {
                    return isFunction(param) ? param(isLearn) : param;
                }

                this.$get = [function () {
                    return {
                        /**
                         * 获取登录信息
                         * @returns {string}
                         */
                        getLoginInfoUrl: function () {
                            return that.options.prefixUrl + that.options.loginInfoUrl;
                        },
                        /**
                         * 获取放回课程页面的地址
                         * @returns {string}
                         */
                        getLessonPageUrl: function (lessonId) {
                            return that.options.lessonPageUrl += lessonId || '';
                        },

                        /**
                         * 获取课程信息
                         * @param url
                         * @returns {string}
                         */
                        getLessonUrl: function (lessonId, trainClassId, isLearn, mode) {
                            var the = /88\.8888/.test(that.options.prefixUrl);
                            if (mode === 'listen') {
                                // 思婷
                                mode = 1;
                            } else if (mode === 'previewLesson') {
                                mode = 2;
                            } else {
                                mode = 3;
                            }
                            if (the) {
                                return that.options.prefixUrl + getOption(that.options.lessonUrl, isLearn) + '/' + lessonId + '?trainClassId=' + trainClassId;
                            } else {
                                return that.options.prefixUrl + getOption(that.options.lessonUrl, isLearn) + '?lessonId=' + lessonId + '&trainClassId=' + trainClassId + '&mode=' + mode;
                            }
                        },
                        /**
                         * 获取播放参数
                         * @returns {string}
                         */
                        getPlayParamsUrl: function (isLearn, mode) {
                            if (mode === 'listen') {
                                // 思婷
                                mode = 1;
                            } else if (mode === 'previewLesson' || mode === 'preview') {
                                mode = 2;
                            } else {
                                mode = 3;
                            }
                            return that.options.prefixUrl + getOption(that.options.playParamsUrl, isLearn) + '?mode=' + mode;
                        },

                        /**
                         * 获取与服务器沟通的地址
                         * @returns {string}
                         */
                        getCommunicationUrl: function () {
                            return that.options.prefixUrl + that.options.communicationUrl;
                        },
                        /**
                         * 寻求服务端当前课程是否已经学到100%
                         * @returns {string}
                         */
                        getAskLessonScheduleUrl: function () {
                            return that.options.prefixUrl + that.options.askLessonScheduleUrl;
                        },

                        /**
                         * 保存媒体已经播放时长
                         * @returns {string}
                         */
                        saveMediaLearnTimeUrl: function () {
                            return that.options.prefixUrl + that.options.mediaLearnTimeUrl;
                        },

                        /**
                         *
                         * @returns {*}
                         */
                        getTimeToSaveMediaLearTime: function () {
                            return that.options.timeToSaveMediaLearTime || 10;
                        }
                    };
                }]
            }])
            .config(['hbPlayerProvider', 'localStorageServiceProvider', '$httpProvider',
                function (hbPlayerProvider, localStorageServiceProvider, $httpProvider) {
                    localStorageServiceProvider.setStorageType('sessionStorage');
                    localStorageServiceProvider.setPrefix('hb');
                    hbPlayerProvider.setOptions();

                    $httpProvider.interceptors.push(['$rootScope', '$q', function ($rootScope, $q) {
                        var responseInterceptor = {
                            request: function (request) {
                                return request;
                            },
                            responseError: function (rejection) {
                                $rootScope.$error = rejection.data;
                                return $q.reject(rejection);
                            }
                        };
                        return responseInterceptor;
                    }])
                }])

            .factory('commonService', ['$http', '$rootScope', 'hbPlayerBase', '$state', 'CONSTANT', '$timeout', 'localStorageService', '$log', '$location',
                function ($http, $rootScope, hbPlayerBase, $state, CONSTANT, $timeout, localStorageService, $log, $location) {
                    return {
                        storageMap: {
                            // 登陆信息
                            loginInfo: 'dt001'
                        },

                        playModeConstant: {
                            listen: {
                                code: 'listen',
                                desc: '试听'
                            },
                            preview: {
                                code: 'preview',
                                desc: '预览'
                            },
                            previewLesson: {
                                code: 'previewLesson',
                                desc: '预览'
                            },
                            learn: {
                                code: 'learn',
                                desc: '学习'
                            }
                        },

                        openWindow: function (href, target) {
                            var $a = $('<a></a>');
                            $a.attr('href', href);
                            $a.attr('target', target || '_blank');
                            $('body').append($a);
                            $a[0].click();
                            $a.remove();
                        },

                        setTitleName: function (name) {
                            document.title = name
                        },

                        /**
                         *
                         * @param msg
                         */
                        log: function (msg) {
                            $log.log(msg)
                        },

                        learn_at_100_schedule_if_go_test: function () {

                        },

                        /**
                         *
                         */
                        clearAllTimer: function () {
                            for (var i = 0; i < 1000; i++) {
                                window.clearInterval(i);
                            }
                        },
                        getTemplate: function (url) {
                            return $http.get(url);
                        },
                        setRootClass: function (className) {
                            $rootScope.containerClass = className;
                        },
                        /**
                         *
                         * @param name
                         * @param func
                         */
                        registerEvents: function ($scope, name, func) {
                            $scope.events = $scope.events || {};
                            $scope.events[name] = function ($event) {
                                $event.preventDefault();
                                // func.call ( null, arguments );
                                func && func($event)
                            }
                        },

                        lessonLoadingTime: function ($scope, loading) {
                            $scope.loading_time = loading;
                        },
                        /**
                         *
                         * @param $event
                         * @param parent
                         * @returns {*|jQuery}
                         */
                        getTarget: function ($event, parent) {
                            return $($event.target).closest(parent);
                        },

                        /**
                         * s -- > hh:mm:ss
                         * @param time
                         * @returns {string}
                         */
                        convertTime: function (time) {
                            var minute = time / 60;
                            var second = time % 60;
                            var hour = minute / 60;
                            minute = minute % 60;

                            hour = parseInt(hour, 10);
                            minute = parseInt(minute, 10);
                            second = parseInt(second, 10);
                            return (hour >= 10 ? hour : "0" + hour) + ":" + (minute >= 10 ? minute : "0" + minute) + ":" + (second >= 10 ? second : "0" + second);
                        },

                        /**
                         * 根据课件id获取列表中播放对应的课件信息， 如果传lectureid了 则查询这个课件是否是三分屏， 如果是三分屏，
                         *      则将对应播放的三分屏lecture一并返回
                         * @returns {*}
                         */
                        getCourseWareById: function (courseWareId) {

                            if (!this.lesson && !this.lesson.lesson) {
                                return false;
                            }

                            var lesson = this.lesson.lesson,
                                i = 0,
                                j = 0,
                                chapterList = lesson.chapterList,
                                len = chapterList.length,
                                result;
                            for (i; i < len; i++) {
                                var chapter = chapterList[i];

                                result = {
                                    chapter: chapter
                                };

                                chapter.$index = i;

                                for (j = 0; j < chapter.courseWareList.length; j++) {

                                    if (courseWareId) {
                                        var courseWare = chapter.courseWareList[j];
                                        courseWare.$index = j;
                                        if (courseWareId === courseWare.id) {

                                            result.courseWare = courseWare;

                                            ////////////////////////////////////////////////////////////
                                            result.media = courseWare.mediaList[0];
                                            result.media.$index = 0;
                                            ////////////////////////////////////////////////////////////
                                            return result;
                                        }
                                    } else {
                                        var courseWare = chapter.courseWareList[0];
                                        courseWare.$index = 0;
                                        result.courseWare = courseWare;

                                        ////////////////////////////////////////////////////////////
                                        result.media = courseWare.mediaList[0];
                                        result.media.$index = 0;
                                        ////////////////////////////////////////////////////////////
                                        return result;
                                    }
                                }
                            }

                            return result;
                        },
                        fullScreen: function (el) {
                            var rfs = el.requestFullScreen || el.webkitRequestFullScreen ||
                                el.mozRequestFullScreen || el.msRequestFullScreen;
                            if (typeof rfs != "undefined" && rfs) {
                                rfs.call(el);
                            } else if (typeof window.ActiveXObject != "undefined") {
                                //for IE，这里其实就是模拟了按下键盘的F11，使浏览器全屏
                                var wscript = new ActiveXObject("WScript.Shell");
                                if (wscript != null) {
                                    wscript.SendKeys("{F11}");
                                }
                            }
                        },
                        exitFullScreen: function (el) {
                            var cfs = el.cancelFullScreen || el.webkitCancelFullScreen ||
                                el.mozCancelFullScreen || el.exitFullScreen;
                            if (typeof cfs != "undefined" && cfs) {
                                cfs.call(el);
                            } else if (typeof window.ActiveXObject != "undefined") {
                                //for IE，这里和fullScreen相同，模拟按下F11键退出全屏
                                var wscript = new ActiveXObject("WScript.Shell");
                                if (wscript != null) {
                                    wscript.SendKeys("{F11}");
                                }
                            }
                        },

                        /**
                         *
                         * @param params
                         * @param objectInfo
                         * @param id
                         * @returns {string}
                         */
                        genTestUrl: function (params, objectInfo, id, lessonName) {
                            var examService = '/web/examService/examination';
                            // /web/examService/examination?
                            // id=3861cb17-8747-4447-907f-d58b0965e5d2
                            // requestType=7
                            // projectId=402881c74ea1976f014ea19779710000
                            // subProjectId=402881c74ea1976f014ea1977a4d0002
                            // platformId=402881c74e70559e014e7055ade40000
                            // platformVersionId=402881c74e705744014e705751b40000
                            // unitId=2c9180e54e7580cd014e7707b9690004
                            // organizationId=2c91b6e54fa1ad9d014fa2f5a1b80013
                            // userId=2c9181e555e804fe0155ec55915100ed
                            // isAsync=true
                            var temp = {
                                id: id,
                                requestType: params.requestType,
                                projectId: params.projectId,
                                subProjectId: params.subProjectId,
                                platformId: params.platformId,
                                platformVersionId: params.platformVersionId,
                                unitId: params.unitId,
                                organizationId: params.organizationId,
                                userId: this.lesson.userId
                            };

                            if (params.historyId) {
                                temp.historyAnswerExamPaperId = params.historyId;
                            }

                            examService += '?1=1';

                            for (var pro in temp) {
                                examService += '&' + pro + '=' + temp[pro];
                            }

                            examService += '&isAsync=true';

                            examService += '&bizParams=' + angular.toJson(objectInfo);

                            if (lessonName) {
                                lessonName = lessonName.replace(/\//gi, '-.-');
                                examService += '_' + encodeURI(lessonName)
                            }
                            return examService;
                        },
                        getPrevCourseWare: function (currentChapter, currentCourseWare, currentMedia) {
                            var zero = 0,
                                lesson = this.lesson.lesson,
                                chapter,
                                courseware,
                                media,
                                chapterIndex,
                                courseWareIndex,
                                mediaIndex;

                            if (currentChapter.$index === zero && currentCourseWare.$index === zero && currentMedia.$index === zero) {
                                return undefined_;
                            }

                            if (currentCourseWare.$index === zero) {
                                courseWareIndex = zero;
                                mediaIndex = zero;
                                if (currentChapter.$index === zero) {
                                    return undefined_;
                                } else {
                                    chapterIndex = currentChapter.$index - 1;
                                }
                            } else {
                                chapterIndex = currentChapter.$index;
                                courseWareIndex = currentCourseWare.$index - 1;
                                mediaIndex = zero;
                            }

                            chapter = lesson.chapterList[chapterIndex];
                            if (chapter && chapter.courseWareList && chapter.courseWareList[courseWareIndex]) {
                                courseware = chapter.courseWareList[courseWareIndex];
                                media = courseware.mediaList[mediaIndex];
                                return {
                                    chapter: chapter,
                                    courseware: courseware,
                                    media: media
                                }
                            }
                            return false;
                        },

                        getNextCourseWare: function (currentChapter, currentCourseWare, currentMedia) {
                            var chapter,
                                courseware,
                                media,
                                lesson = this.lesson.lesson,
                                chapterIndex,
                                courseWareIndex,
                                mediaIndex;

                            if (currentCourseWare.$index === currentChapter.courseWareList.length - 1) {
                                courseWareIndex = 0;
                                mediaIndex = 0;
                                if (currentChapter.$index === lesson.chapterList.length - 1) {
                                    return undefined_;
                                } else {
                                    chapterIndex = currentChapter.$index + 1;
                                }
                            } else {
                                courseWareIndex = currentCourseWare.$index + 1;
                                chapterIndex = currentChapter.$index;
                                mediaIndex = currentMedia.$index;
                            }
                            chapter = lesson.chapterList[chapterIndex];
                            if (chapter && chapter.courseWareList && chapter.courseWareList[courseWareIndex]) {
                                courseware = chapter.courseWareList[courseWareIndex];
                                media = courseware.mediaList[mediaIndex];
                                return {
                                    chapter: chapter,
                                    courseware: courseware,
                                    media: media
                                }
                            }
                            return false;
                        },

                        go: function ($scope, method, trainClassId) {
                            var chapterIndex = $scope.currentPlayInfo.chapter.$index,
                                courseWareIndex = $scope.currentPlayInfo.courseWare.$index,
                                currentCourseWare = $scope.currentPlayInfo.courseWare,
                                currentChapter = $scope.lesson.chapterList[chapterIndex];

                            var cango = true,
                                that = this;
                            if (method === 'prevLesson') {
                                // 如果点击上一个的时候， 当前课件的索引小于等于0
                                if (courseWareIndex <= 0) {
                                    // 并且当前的章节索引小于等于0。 提示已经是第一章节第一课件
                                    //  不能再上一层了
                                    if (chapterIndex > 0) {

                                        // 设置当前的章节为当前章节的索引、减一
                                        currentChapter = $scope.lesson.chapterList[--chapterIndex];
                                        currentChapter.$index = chapterIndex;
                                        // 设置当前的课件为当前课件的索引、减一
                                        currentCourseWare = currentChapter.courseWareList[currentChapter.courseWareList.length - 1];
                                        currentCourseWare.$index = currentChapter.courseWareList.length - 1;
                                    } else {
                                        //  ( '已经是第一个了' );
                                        cango = false;
                                    }
                                } else {
                                    //
                                    currentCourseWare = currentChapter.courseWareList[--courseWareIndex];
                                    currentCourseWare.$index = courseWareIndex;
                                }
                            } else {
                                // 如果当前的索
                                if (courseWareIndex === currentChapter.courseWareList.length - 1) {
                                    if (chapterIndex < $scope.lesson.chapterList.length - 1) {
                                        // 设置当前的章节为当前章节的索引、减一
                                        currentChapter = $scope.lesson.chapterList[++chapterIndex];
                                        currentChapter.$index = chapterIndex;
                                        // 设置当前的课件为当前课件的索引、减一
                                        currentCourseWare = currentChapter.courseWareList[0];
                                        currentCourseWare.$index = 0;
                                    } else {
                                        cango = false;
                                    }
                                } else {
                                    currentCourseWare = currentChapter.courseWareList[++courseWareIndex];
                                    currentCourseWare.$index = courseWareIndex;
                                }
                            }

                            if (cango) {
                                $scope.currentPlayInfo = that.getCourseWareById(currentCourseWare.id);
                                $state.go('states.home', {
                                    playMode: $state.params.playMode,
                                    lessonId: $state.params.lessonId,
                                    courseWareId: $scope.currentPlayInfo.courseWare.id
                                });
                            }

                        },

                        isLearn: function (playMode) {
                            return this.playModeConstant.learn.code === playMode;
                        },
                        isIe8: function () {
                            var isIEEight = false;
                            if ((navigator.userAgent.indexOf("MSIE 9.0") > 0 && !window.innerWidth)
                                || (navigator.userAgent.indexOf("MSIE 8.0") > 0 && !window.innerWidth)) {
                                isIEEight = true;
                                return isIEEight;
                            } else {
                                return isIEEight;
                            }
                        },
                        resetIframe: function () {
                            this.isIe8() && $('iframe').css({
                                position: 'relative',
                                left: 0
                            });
                        },
                        setIframeOut: function () {
                            this.isIe8() && $('iframe').css({
                                position: 'fixed',
                                left: -10000 + 'px'
                            })
                        },

                        removeIframe: function () {
                            this.isIe8() && $('iframe').remove();
                        },

                        getFilterItems: function () {
                            var filterItem = [];

                            var lessonId = this.lesson.lesson.id;

                            function isFilter(mode) {
                                return mode === CONSTANT.mode.listen;
                            }

                            forEach(this.lesson.lesson.chapterList, function (chapter) {
                                forEach(chapter.courseWareList, function (courseWare) {
                                    forEach(courseWare.mediaList, function (media) {
                                        if (media.type === CONSTANT.courseWareType.single) {
                                            var filter = isFilter(media.mode);
                                            filterItem.push({
                                                courseId: lessonId,
                                                coursewareId: courseWare.id,
                                                filterType: 0,
                                                entityId: media.id,
                                                isFilter: filter
                                            })
                                        }
                                    })
                                })
                            });
                            return filterItem;
                        },

                        isNormalPlay: function (code) {
                            return true;
                        },

                        isLogin: function () {
                            var loginInfo = localStorageService.get(this.storageMap.loginInfo);
                            return loginInfo && loginInfo.login;
                        },

                        /**
                         * 提交已经播放时长
                         */
                        submitPlayTime: function (time, info) {
                            $log.log('当前播放时长' + time);

                            // 同步到服务器
                            return $http.post(hbPlayerBase.saveMediaLearnTimeUrl(),
                                {
                                    exts: $location.$$search.exts,
                                    trainClassId: info.trainClassId,
                                    alreadyPlayTime: time,
                                    lessonId: info.lessonId,
                                    courseWareId: info.courseWareId,
                                    mediaId: info.mediaId
                                })
                        }
                    }
                }])

            .filter('secondFormat', ['commonService', 'CONSTANT', function (commonService, CONSTANT) {
                return function (val, type) {
                    return commonService.convertTime(val);

                }
            }])

            .directive('playerSide', ['$rootScope', 'commonService', 'CONSTANT', '$state', 'hbPlayerBase', 'localStorageService', '$stateParams', '$http', 'components',
                function ($rootScope, commonService, CONSTANT, $state, hbPlayerBase, localStorageService, $stateParams, $http, components) {
                    $rootScope.action_sideStyle = {right: '0'};
                    $rootScope.action_contentStyle = {right: '350px'};

                    return {
                        replace: true,
                        scope: {
                            lesson: '=',
                            currentPlayInfo: '=',
                            availableTime: '='
                        },
                        restrict: 'AE',
                        templateUrl: 'templates/player-side-tpl.html',
                        link: function ($scope) {
                            $scope.courseWareType = CONSTANT.courseWareType;
                            $scope.events = {};
                            $scope.model = {
                                animateIndex: 0,
                                videoTime: false
                            };

                            $scope.directorys = components.getComponentsList();

                            $scope.directoryType = {
                                directory: 'directory',
                                asking: 'asking',
                                recommend: 'recommend',
                                testing: 'testing'
                            };

                            $scope.currentPlayInfo = commonService.currentPlayInfo;

                            $scope.currentDirectory = $scope.directorys[0];
                            $scope.currentDirectory.meetted = true;

                            var operation = (function ($scope) {
                                /**
                                 *
                                 * @constructor
                                 */
                                function Operation() {
                                    var me = this;
                                    angular.forEach($scope.directorys, function (item) {
                                        me[item.name] = function (type) {
                                            me.toggle(type);
                                        }
                                    });
                                    this.open = true;
                                }

                                Operation.prototype = {
                                    toggle: function (who) {
                                        // 如果点击的还是当前的选项卡， 则收缩右边的目录栏
                                        if ($scope.currentDirectory.name === who.name) {
                                            if (this.open) {
                                                this.open = false;
                                            } else {
                                                this.open = true;
                                            }
                                        } else {
                                            this.open = true;
                                            $scope.currentDirectory = who;
                                        }
                                        this.setStyle();
                                    },
                                    setStyle: function () {
                                        if (this.open) {
                                            $rootScope.action_sideStyle.right = 0;
                                            $rootScope.action_contentStyle.right = '350px';
                                        } else {
                                            $rootScope.action_sideStyle.right = '-350px';
                                            $rootScope.action_contentStyle.right = '0';
                                        }
                                    }
                                };
                                return new Operation();
                            })($scope);

                            $scope.events = {
                                toggleDirectory: function ($event, nav) {

                                    operation[nav.name](nav);
                                    nav.meetted = true;
                                    $scope.currentDirectory = nav;

                                }
                            };
                        }
                    }
                }])

            .config(['$stateProvider', '$urlRouterProvider', 'CONSTANT',
                function ($stateProvider, $urlRouterProvider, CONSTANT) {

                    $urlRouterProvider.otherwise('/404');

                    var states = {
                        states: {
                            /**
                             * @param {String=} playMode - listen|learn|previewLesson Link: localhost:8000/play/#/learn/{trainClassId}/{lessonId}/{courseWareId}?exts=sfsf
                             * @param {String} trainClassId - 培训班id
                             * @param {String} lessonId - 课程id
                             * @param {String} exts - 扩展信息， 平台需要的玩意儿
                             */
                            url: '/{playMode: listen|learn|previewLesson}/:trainClassId/:lessonId',
                            abstract: true,
                            resolve: {
                                login: ['$http', 'hbPlayerBase', '$q', 'localStorageService', 'commonService', '$state', '$stateParams', '$rootScope', '$location',
                                    function ($http, hbPlayerBase, $q, localStorageService, commonService, $state, $stateParams, $rootScope, $location) {
                                        var I = $q.defer();
                                        // 记录用户是否登录
                                        $http.get(hbPlayerBase.getLoginInfoUrl(), {
                                            params: {
                                                exts: $location.$$search.exts
                                            }
                                        })
                                            .then(function (data) {
                                                // 学习模式的时候必须登录
                                                var remoteInfo = data.data.info;

                                                if (commonService.isLearn($stateParams.playMode)) {

                                                    // 判断是否是学员如果是学员才能学习

                                                    if (remoteInfo.login) {

                                                        if (remoteInfo.ad !== 1) {
                                                            $state.go('500');
                                                            $rootScope.$error = {
                                                                info: '非学员无法学习!'
                                                            };
                                                            I.reject();
                                                        } else {
                                                            I.resolve(data.data.info);
                                                        }

                                                    } else {
                                                        if (commonService.playModeConstant.learn.code && data.data.info.login) {
                                                            I.resolve(data.data.info);
                                                        } else {
                                                            $state.go('401');
                                                            commonService.log('未登录, 不允许学习!');
                                                        }
                                                    }

                                                } else {
                                                    I.resolve(undefined_);
                                                }

                                                localStorageService.set(commonService.storageMap.loginInfo, data.data.info);
                                            }, function () {
                                                $state.go('500');
                                                I.reject();
                                            });
                                        return I.promise;
                                    }],
                                /**
                                 *
                                 */
                                playInfo: ['$q', '$http', 'commonService', 'hbPlayerBase', 'login', '$state', '$urlMatcherFactory', '$stateParams', '$rootScope', '$timeout', '$location',
                                    function ($q, $http, commonService, hbPlayerBase, login, $state, $urlMatcherFactory, $stateParams, $rootScope, $timeout, $location) {
                                        var defer = $q.defer();
                                        $rootScope.systemLoading = true;
                                        $http.get(
                                            hbPlayerBase.getLessonUrl($stateParams.lessonId, $stateParams.trainClassId, commonService.isLearn($stateParams.playMode), $stateParams.playMode), {
                                                // 10秒超时
                                                params: {
                                                    exts: $location.$$search.exts
                                                },
                                                timeout: 15000
                                            })

                                            .success(function (data) {
                                                if (data.code === 200) {
                                                    if (data.info) {
                                                        commonService.lesson = data.info;
                                                        commonService.setTitleName(commonService.lesson.lesson.name);
                                                        $timeout(function () {
                                                            defer.resolve(commonService.lesson);
                                                            $rootScope.systemLoading = false;
                                                        }, 500)
                                                    } else {
                                                        $rootScope.systemLoading = false;
                                                        $state.go('500');
                                                        defer.reject();
                                                    }
                                                } else {
                                                    $rootScope.systemLoading = false;
                                                    $state.go('500');
                                                    defer.reject();
                                                }
                                            })

                                            .error(function (data) {
                                                $state.go('500');
                                                $rootScope.systemLoading = false;
                                                defer.reject();
                                            });
                                        return defer.promise;
                                    }]
                            },
                            views: {
                                "@": {
                                    templateUrl: 'views/home/index.html',
                                    controller: ['$scope', 'commonService', 'hbPlayerBase', '$timeout', '$state', '$log', '$stateParams',
                                        function ($scope, commonService, hbPlayerBase, $timeout, $state, $log, $stateParams) {
                                            $scope.playMode = $state.params.playMode;
                                            //////////////////////////////////////////浪//////////////////////////////////////////
                                            0 && $log.log('%c' + commonService.playModeConstant[$state.params.playMode].desc,
                                                'font-weight:bold;padding:300px;display:block;' +
                                                'text-align:center;color:white;font-size:100px;' +
                                                'text-shadow: 0px 0px 2px #686868, 0px 1px 1px #ddd, 0px 2px 1px #d6d6d6, ' +
                                                '0px 3px 1px #ccc, 0px 4px 1px #c5c5c5, 0px 5px 1px #c1c1c1, 0px 6px 1px #bbb, ' +
                                                '0px 7px 1px #777, 0px 8px 3px rgba(100, 100, 100, 0.4),' +
                                                ' 0px 9px 5px rgba(100, 100, 100, 0.1), ' +
                                                '0px 10px 7px rgba(100, 100, 100, 0.15), 0px 11px 9px rgba(100, 100, 100, 0.2), ' +
                                                '0px 12px 11px rgba(100, 100, 100, 0.25), 0px 13px 15px rgba(100, 100, 100, 0.3);');
                                            ///////////////////////////////////////////废//////////////////////////////////////////

                                            $scope.lesson = commonService.lesson.lesson;
                                            if ($scope.lesson.chapterList.length === 1) {
                                                if ($scope.lesson.chapterList[0].courseWareList.length === 1) {
                                                    $scope.canNext = false;
                                                    $scope.canPrev = false;
                                                }
                                            }
                                            /**
                                             * @method events.prevLesson
                                             */
                                            commonService.registerEvents($scope, 'prevLesson', function () {
                                                commonService.go($scope, 'prevLesson', $stateParams.trainClassId);
                                            });
                                            ////////////////////////////////////////////////////////////////////////////////////////////////////////

                                            ////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            commonService.registerEvents($scope, 'nextLesson', function () {
                                                commonService.go($scope, 'nextLesson', $stateParams.trainClassId);
                                            });

                                            commonService.registerEvents($scope, 'backToLessonPage', function () {
                                                // 没有提供返回课程界面的地址的话，默认调用当前的地址信息
                                                commonService.clearAllTimer();
                                                //window.location.href = hbPlayerBase.getLessonPageUrl ( $stateParams.lessonId ) || window.location.href;
                                                window.location.href = hbPlayerBase.getLessonPageUrl($stateParams.trainClassId) || window.location.href;
                                            });
                                        }
                                    ]
                                }
                            }
                        },
                        "states.home": {
                            /**
                             * @param {String} courseWareId - 课件id
                             */
                            url: "/:courseWareId?exts",
                            resolve: {
                                playParams: ['$q', '$http', 'hbPlayerBase', 'commonService', '$stateParams', 'playInfo', '$state', '$location',
                                    function ($q, $http, hbPlayerBase, commonService, $stateParams, playInfo, $state, $location) {
                                        var lessonId = $stateParams.lessonId === 'lesson' ? undefined : $stateParams.lessonId,
                                            lesson = commonService.lesson.lesson,
                                            courseWareId,
                                            defer = $q.defer();

                                        if (!commonService.isLearn($stateParams.playMode) && $stateParams.courseWareId === 'courseware') {
                                            courseWareId = null;
                                        } else {
                                            if (lesson.lastPlayInfo) {
                                                if ($stateParams.courseWareId === 'courseware') {
                                                    courseWareId = lesson.lastPlayInfo.courseWareId;
                                                } else {
                                                    courseWareId = $stateParams.courseWareId;
                                                }
                                            } else {
                                                if ($stateParams.courseWareId === 'courseware') {
                                                    courseWareId = null;
                                                } else {
                                                    courseWareId = $stateParams.courseWareId;
                                                }
                                            }
                                        }
                                        commonService.currentPlayInfo = commonService.getCourseWareById(courseWareId);

                                        if (commonService.currentPlayInfo) {
                                            courseWareId = commonService.currentPlayInfo.courseWare.id;

                                            var $mediaCatalog = $('#media-catalog');
                                            $mediaCatalog.length > 0 && $mediaCatalog.remove();
                                            $http.get(hbPlayerBase.getPlayParamsUrl(commonService.isLearn($stateParams.playMode), $stateParams.playMode),
                                                {
                                                    params: {
                                                        exts: $location.$$search.exts,
                                                        lessonId: lessonId,
                                                        courseWareId: courseWareId,
                                                        trainClassId: $stateParams.trainClassId
                                                    }
                                                })
                                                .then(function (data) {
                                                    var res;
                                                    if (data.data && data.data.info) {
                                                        res = data.data.info;
                                                    } else {
                                                        res = data.data[0];
                                                    }
                                                    res.courseWareId = courseWareId;
                                                    res.lectureList && (commonService.currentPlayInfo.media.lectureList = res.lectureList);
                                                    res.catalogList && (commonService.currentPlayInfo.media.catalogList = res.catalogList);
                                                    commonService.currentPlayParams = res;
                                                    defer.resolve(res);
                                                }, function () {
                                                    defer.reject();
                                                    $state.go('500');
                                                });
                                        } else {
                                            defer.reject();
                                            $state.go('404');
                                        }

                                        return defer.promise;
                                    }],

                                /**
                                 * 判断是否可以播放仅学习模式的时候有效
                                 */
                                templateCode: ['$q', '$stateParams', 'commonService', 'playParams',
                                    function ($q, $stateParams, commonService, playParams) {

                                        var defer = $q.defer(),
                                            result = {
                                                code: templateCode_.normal
                                            };

                                        function promise(_code_) {
                                            defer.resolve(_code_);
                                            return defer.promise;
                                        }

                                        var media = commonService.currentPlayInfo.media;

                                        // 如果没有媒体播放信息就说明没有提供获取媒体播放信息的口直接放行
                                        if (commonService.isLearn($stateParams.playMode)) {


                                            // 如果已经播放时间大于等于媒体播放时间乘以允许播放次数---》 不允许播放
                                            if (media.allowPlayTimes && media.alreadyPlayTime >= media.time * media.allowPlayTimes) {
                                                result.code = templateCode_.out_of_play_time;
                                            } else {
                                                result.code = templateCode_.normal;
                                            }
                                        } else {
                                            media.allowPlayTimes = undefined_;
                                            result.code = templateCode_.normal;
                                        }

                                        return promise(result);
                                    }]
                            },
                            views: {
                                "@states": {

                                    templateProvider: ['$stateParams', '$q', 'CONSTANT', 'commonService', 'localStorageService', 'templateCode',
                                        function ($stateParams, $q, CONSTANT, commonService, localStorageService, templateCode) {
                                            var defer = $q.defer(),
                                                templateUrl,
                                                currentMedia = commonService.currentPlayInfo.media;
                                            commonService.setRootClass();
                                            switch (templateCode.code) {
                                                case templateCode_.normal:
                                                    // 如果登陆了
                                                    if (commonService.isLogin() && commonService.isLearn($stateParams.playMode)) {

                                                        /// 不需要购买
                                                        if (currentMedia.mode === CONSTANT.mode.play) {
                                                            end();
                                                        } else {
                                                            if (currentMedia.mode === CONSTANT.mode.buyPlay && !currentMedia.isBuy) {
                                                                commonService.setRootClass();
                                                                templateUrl = 'views/common/must-buy-tpl.html';
                                                            } else {
                                                                end();
                                                            }
                                                        }
                                                    } else {
                                                        // 支持试听
                                                        if (currentMedia.mode === CONSTANT.mode.listen) {
                                                            end();
                                                        } else {
                                                            if (currentMedia.mode === CONSTANT.mode.play) {
                                                                templateUrl = 'views/common/can-not-listen-tpl.html';
                                                            } else {
                                                                templateUrl = 'views/common/must-buy-tpl.html';
                                                            }
                                                        }
                                                    }
                                                    break;
                                                case templateCode_.out_of_date:
                                                    templateUrl = 'views/common/out-of-date-tpl.html';
                                                    break;
                                                case templateCode_.out_of_play_time:
                                                    templateUrl = 'views/common/out-of-play-time-tpl.html';
                                                    break;
                                            }

                                            function end() {
                                                if (CONSTANT.courseWareType.single === currentMedia.type) {
                                                    templateUrl = 'views/play/single/index.html';
                                                } else if (CONSTANT.courseWareType.pdf === currentMedia.type) {
                                                    templateUrl = 'views/play/pdf/index.html';
                                                    commonService.setRootClass('text-player');
                                                } else if (CONSTANT.courseWareType.three === currentMedia.type) {
                                                    templateUrl = 'views/play/three/index.html';
                                                    commonService.setRootClass('three-player');
                                                } else {
                                                    defer.reject();
                                                }
                                            }

                                            commonService.getTemplate(templateUrl)
                                                .then(function (data) {
                                                    defer.resolve(data.data);
                                                });

                                            return defer.promise;
                                        }],

                                    /**
                                     *
                                     */
                                    controllerProvider: ['playParams', 'localStorageService', 'templateCode', '$interval', 'commonService', '$rootScope', '$stateParams',
                                        function (playParams, localStorageService, templateCode, $interval, commonService, $rootScope, $stateParams) {
                                            var controller,
                                                emptyController = [function () {

                                                    $rootScope.hasPrev = commonService.getPrevCourseWare(commonService.currentPlayInfo.chapter, commonService.currentPlayInfo.courseWare, commonService.currentPlayInfo.media);
                                                    $rootScope.hasNext = commonService.getNextCourseWare(commonService.currentPlayInfo.chapter, commonService.currentPlayInfo.courseWare, commonService.currentPlayInfo.media);

                                                }],
                                                currentMedia = commonService.currentPlayInfo.media;
                                            $interval.cancel(commonService.timer);
                                            commonService.clearAllTimer();
                                            commonService.removeIframe();
                                            var businessController = ['$scope', 'hbPlayer', 'CONSTANT', 'commonService', '$state',
                                                '$timeout', 'hbPlayerBase', '$stateParams', '$http', '$rootScope', '$location',
                                                function ($scope, hbPlayer, CONSTANT, commonService, $state,
                                                          $timeout, hbPlayerBase, $stateParams, $http, $rootScope, $location) {
                                                    $rootScope.hasPrev = commonService.getPrevCourseWare(commonService.currentPlayInfo.chapter, commonService.currentPlayInfo.courseWare, commonService.currentPlayInfo.media);
                                                    $rootScope.hasNext = commonService.getNextCourseWare(commonService.currentPlayInfo.chapter, commonService.currentPlayInfo.courseWare, commonService.currentPlayInfo.media);

                                                    $scope.model = $scope.model || {};
                                                    $scope.model.videoTime = true;
                                                    $scope.courseWareType = CONSTANT.courseWareType;
                                                    var flashPlayer,
                                                        filterItems = commonService.isLearn($stateParams.playMode) && commonService.getFilterItems();

                                                    function stopInterval() {
                                                        commonService.timer && $interval.cancel(commonService.timer);
                                                    }

                                                    $scope.$parent.availableTime = '';
                                                    function startInterval() {
                                                        stopInterval();
                                                        // $interval.cancel ( commonService.timer );
                                                        // 判断是否有允许播放次数 如果有允许播放次数，则有定时器扫描
                                                        if (currentMedia.allowPlayTimes) {
                                                            var alreadyPlayTime = currentMedia.alreadyPlayTime,
                                                                rest = (currentMedia.time * currentMedia.allowPlayTimes) - alreadyPlayTime,
                                                                devise = rest % hbPlayerBase.getTimeToSaveMediaLearTime();
                                                            commonService.timer = $interval(function () {
                                                                --rest;
                                                                $scope.currentPlayInfo.media.alreadyPlayTime++;
                                                                if (!((rest % hbPlayerBase.getTimeToSaveMediaLearTime() - devise) )) {
                                                                    // 10秒一次提交
                                                                    commonService.log('10秒');
                                                                    commonService.submitPlayTime($scope.currentPlayInfo.media.alreadyPlayTime,
                                                                        {
                                                                            trainClassId: $stateParams.trainClassId,
                                                                            lessonId: $state.params.lessonId,
                                                                            courseWareId: commonService.currentPlayInfo.courseWare.id,
                                                                            mediaId: commonService.currentPlayInfo.media.id
                                                                        });
                                                                }

                                                                // 计算剩余多少时长
                                                                $scope.$parent.availableTime = commonService.convertTime(rest);
                                                                // 学习时间用光后将定时器清除掉
                                                                if (parseInt($scope.$parent.availableTime.split(':').join('')) <= 0) {
                                                                    commonService.submitPlayTime($scope.currentPlayInfo.media.alreadyPlayTime,
                                                                        {
                                                                            trainClassId: $stateParams.trainClassId,
                                                                            lessonId: $state.params.lessonId,
                                                                            courseWareId: commonService.currentPlayInfo.courseWare.id,
                                                                            mediaId: commonService.currentPlayInfo.media.id
                                                                        });
                                                                    $interval.cancel(commonService.timer);
                                                                    stopInterval();
                                                                    // 停止播放的记录提交
                                                                    commonService.clearAllTimer();
                                                                    $scope.$parent.availableTime = '播放时长达到上限';
                                                                    return false;
                                                                }
                                                            }, 1000);
                                                        } else {
                                                            $scope.$parent.availableTime = undefined_;
                                                            commonService.timer && $interval.cancel(commonService.timer);
                                                        }
                                                    }

                                                    ////////////////////////////////////////////////////////////////////////////////
                                                    ////////////////////////////////////////////////////////////////////////////////
                                                    ////////////////////////////////////////////////////////////////////////////////
                                                    hbPlayer.player({
                                                        data: commonService.lesson,
                                                        angularThings: {
                                                            $scope: $scope,
                                                            initPlay: function (core) {

                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    $timeout(function () {
                                                                        $scope.courseWareSchedule = core.studySchedule;
                                                                    })
                                                                }
                                                            },
                                                            errorInit: function (message) {
                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    $timeout(function () {
                                                                        $scope.errorInit = {
                                                                            status: true,
                                                                            message: message
                                                                        }
                                                                    })
                                                                }
                                                            },
                                                            end: function () {
                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    commonService.log('当前的课件之前的学习进度是' + $scope.courseWareSchedule);
                                                                    var test = $scope.lesson.tests && $scope.lesson.tests[0];
                                                                    $http.get(hbPlayerBase.getAskLessonScheduleUrl(), {
                                                                        params: {
                                                                            exts: $location.$$search.exts,
                                                                            lessonId: $scope.lesson.id,
                                                                            trainClassId: $stateParams.trainClassId
                                                                        }
                                                                    }).success(function (data) {
                                                                        if (data.info.finish
                                                                            && $scope.courseWareSchedule !== 100) {
                                                                            // 如果有测验， 则进入弹窗
                                                                            if (test) {
                                                                                commonService.setIframeOut();
                                                                                //
                                                                                if (data.info.testTimes > 0 ||
                                                                                    data.info.testTimes === -1) {
                                                                                    dialog_({
                                                                                        title: '提示',
                                                                                        content: '课程学习完成，是否立即进入课后测验?',
                                                                                        okValue: '立即进入',
                                                                                        ok: function () {
                                                                                            commonService.resetIframe();
                                                                                            commonService.currentPlayParams.requestType = 7;
                                                                                            commonService.openWindow(test.href + commonService.genTestUrl(commonService.currentPlayParams,
                                                                                                    test.objectList, test.configId, $scope.lesson.name));
                                                                                            return true;
                                                                                        },
                                                                                        cancelValue: '取消',
                                                                                        cancel: function () {
                                                                                            commonService.resetIframe();
                                                                                            return true;
                                                                                        }
                                                                                    }).showModal().show();

                                                                                } else {
                                                                                    dialog_({
                                                                                        title: '提示',
                                                                                        okValue: '查看测验详情',
                                                                                        cancel: function () {
                                                                                            commonService.resetIframe();
                                                                                            return true;
                                                                                        },
                                                                                        cancelValue: '取消',
                                                                                        content: '课后测验次数已使用完毕!无法再测验！',
                                                                                        ok: function () {
                                                                                            commonService.currentPlayParams.requestType = 8;
                                                                                            commonService.currentPlayParams.historyId = data.info.testInfo.historyId;
                                                                                            commonService.openWindow(test.href + commonService.genTestUrl(commonService.currentPlayParams,
                                                                                                    test.objectList, data.info.testInfo.configId, $scope.lesson.name));
                                                                                            return true;
                                                                                        }
                                                                                    }).showModal().show();
                                                                                }
                                                                                // 如果没有测验则观看下一个课件
                                                                            } else {
                                                                                $timeout(function () {
                                                                                    commonService.go($scope.$parent, 'nextLesson', $stateParams.trainClassId);
                                                                                })
                                                                            }
                                                                        } else {
                                                                            $timeout(function () {
                                                                                commonService.go($scope.$parent, 'nextLesson', $stateParams.trainClassId);
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            },
                                                            repeatPlay: function () {

                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    flashPlayer && flashPlayer.pause();
                                                                    commonService.clearAllTimer();
                                                                    $timeout(function () {
                                                                        dialog_({
                                                                            padding: '35px 40px',
                                                                            content: '课程重复播放，请离开当前页面'
                                                                        }).showModal().show();
                                                                    })
                                                                }
                                                            },
                                                            pause: function (state) {
                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    if (state === 'pause' || state === 'end') {
                                                                        $timeout(function () {
                                                                            stopInterval();
                                                                        })
                                                                    } else if (state === 'playing') {
                                                                        startInterval();
                                                                    }
                                                                }
                                                            },
                                                            scheduling: function (core) {
                                                                if (commonService.isLearn($state.params.playMode)) {
                                                                    $timeout(function () {
                                                                        $scope.lesson.schedule = core.courseSchedule;
                                                                        setMediaSchedule(core.courseWareId, core.multimediaId, core.coursewareSchedule);
                                                                    })
                                                                }
                                                            }
                                                        },
                                                        communicationUrl: hbPlayerBase.getCommunicationUrl(),
                                                        playParams: playParams,
                                                        playType: CONSTANT.playMode[$state.params.playMode],
                                                        currentPlayCourseWare: commonService.currentPlayInfo,
                                                        box: CONSTANT.boxs[(currentMedia.type - 1)],
                                                        filterItems: filterItems
                                                    })

                                                        .then(function (player) {
                                                            flashPlayer = player;
                                                            $scope.flashInitaled = true;
                                                            if (currentMedia.mode === CONSTANT.mode.listen) {
                                                                var timer_listen_end = $interval(function () {
                                                                    if (player.getState() === 'playing') {
                                                                        if (currentMedia.listenTime && currentMedia.listenTime < player.getTime()) {
                                                                            player.play(currentMedia.listenTime);
                                                                            player.pause();
                                                                            $timeout(function () {
                                                                                $scope.listenEnd = true;
                                                                            });
                                                                        }
                                                                    }
                                                                }, 1000);
                                                            }
                                                        });

                                                    ////////////////////////////////////////////////////////////////////////////////
                                                    ////////////////////////////////////////////////////////////////////////////////
                                                    ////////////////////////////////////////////////////////////////////////////////

                                                    /**
                                                     *
                                                     * @param courseWareId
                                                     * @param mediaId
                                                     * @param schedule
                                                     */
                                                    function setMediaSchedule(courseWareId, mediaId, schedule) {
                                                        forEach($scope.lesson.chapterList, function (chapter) {
                                                            forEach(chapter.courseWareList, function (courseWare) {
                                                                if (courseWare.id === courseWareId) {
                                                                    forEach(courseWare.mediaList, function (media) {
                                                                        if (media.id === mediaId) {
                                                                            media.schedule = schedule;
                                                                        }
                                                                    })
                                                                }
                                                            })
                                                        })
                                                    }

                                                    $scope.events.toggle = function ($event) {
                                                        $scope.model.videoTime = !$scope.model.videoTime;
                                                    };

                                                    $scope.events.fullScreen = function ($event, who) {
                                                        $scope.isFullScreen = !$scope.isFullScreen;
                                                        $event.preventDefault();
                                                        var el_who = document.getElementById(who);
                                                        commonService.fullScreen(el_who);
                                                    };

                                                    commonService.resetIframe();
                                                    $scope.$on('$destroy', function () {
                                                        ////////////////////////////////////////////////////////
                                                        // 解决在ie8下面， iframe残留
                                                        commonService.removeIframe();
                                                        ////////////////////////////////////////////////////////
                                                        ////////////// 清除所有的定时器，和释放播放器
                                                        //////////////
                                                        // flashPlayer && flashPlayer.destroy ();
                                                    })
                                                }];

                                            if (commonService.isLogin() && commonService.isLearn($stateParams.playMode)) {
                                                if (( (currentMedia.mode === CONSTANT.mode.listen
                                                    || currentMedia.mode === CONSTANT.mode.play)
                                                    && templateCode.code === templateCode_.normal) ||
                                                    (currentMedia.mode === CONSTANT.mode.buyPlay && currentMedia.isBuy && templateCode.code === templateCode_.normal)) {
                                                    controller = businessController;
                                                } else {
                                                    controller = emptyController;
                                                }
                                            } else {
                                                // 支持试听
                                                if (currentMedia.mode === CONSTANT.mode.listen) {
                                                    controller = businessController;
                                                } else {
                                                    controller = emptyController;
                                                }
                                            }

                                            return controller
                                        }]
                                }
                            }
                        },
                        // 找不到页面
                        "404": {
                            url: '/404',
                            views: {
                                "@": {
                                    templateUrl: 'views/common/errors/404.html'
                                }
                            }
                        }
                        ,
                        // 未授权用户
                        "401": {
                            url: '/401',
                            views: {
                                "@": {
                                    templateUrl: 'views/common/errors/401.html'
                                }
                            }
                        }
                        ,
                        // 服务器异常
                        "500": {
                            url: '/500',
                            views: {
                                "@": {
                                    templateUrl: 'views/common/errors/500.html',
                                    controller: ['$rootScope', function ($rootScope) {
                                        $rootScope.$error = $rootScope.$error || {
                                                info: '奥!发生了一些异常!!'
                                            };
                                    }]
                                }
                            }
                        },
                        "preview": {
                            url: '/preview/:courseWareId',
                            params: {
                                lessonId: '',
                                trainClassId: ''
                            },
                            resolve: {
                                playParams: ['$http', '$q', '$stateParams', 'hbPlayerBase', 'commonService', '$timeout', '$rootScope', '$location',
                                    function ($http, $q, $stateParams, hbPlayerBase, commonService, $timeout, $rootScope, $location) {
                                        var defer = $q.defer();
                                        $rootScope.systemLoading = true;
                                        $http.get(hbPlayerBase.getPlayParamsUrl(commonService.isLearn($stateParams.playMode), 'preview'),
                                            {
                                                params: {
                                                    exts: $location.$$search.exts,
                                                    lessonId: $stateParams.lessonId,
                                                    courseWareId: $stateParams.courseWareId,
                                                    trainClassId: $stateParams.trainClassId
                                                }
                                            })
                                            .then(function (data) {
                                                var res;
                                                if (data.data && data.data.info) {
                                                    res = data.data.info;
                                                } else {
                                                    res = data.data[0];
                                                }
                                                res.courseWareId = $stateParams.courseWareId;
                                                $timeout(function () {
                                                    defer.resolve(res);
                                                    $rootScope.systemLoading = false;
                                                }, 1000);
                                            });
                                        return defer.promise;
                                    }]
                            },
                            views: {
                                '@': {
                                    templateUrl: "views/home/preview.html"
                                },
                                "@preview": {
                                    templateProvider: ['playParams', 'commonService', '$q', 'CONSTANT',
                                        function (playParams, commonService, $q, CONSTANT) {
                                            var defer = $q.defer();
                                            var templateUrl;
                                            if (CONSTANT.courseWareType.single === playParams.type) {
                                                templateUrl = 'views/preview/single/index.html';
                                                commonService.setRootClass();
                                            } else if (CONSTANT.courseWareType.pdf === playParams.type) {
                                                templateUrl = 'views/preview/pdf/index.html';
                                                commonService.setRootClass('text-player');
                                            } else if (CONSTANT.courseWareType.three === playParams.type) {
                                                templateUrl = 'views/preview/three/index.html';
                                                commonService.setRootClass('three-player');
                                            } else {
                                                defer.reject();
                                            }

                                            commonService.getTemplate(templateUrl).then(function (data) {
                                                defer.resolve(data.data);
                                            });

                                            return defer.promise;
                                        }],
                                    controllerProvider: ['playParams', function (playParams) {
                                        var controller;
                                        controller = ['$scope', 'hbPlayer', 'CONSTANT', 'commonService', '$state', '$timeout',
                                            function ($scope, hbPlayer, CONSTANT, commonService, $state, $timeout) {
                                                $scope.model = $scope.model || {};
                                                $scope.courseWareType = CONSTANT.courseWareType;
                                                var flashPlayer;
                                                hbPlayer.player({
                                                    data: {
                                                        lesson: {}
                                                    },
                                                    angularThings: {
                                                        $scope: $scope
                                                    },
                                                    playParams: playParams,
                                                    playType: 0,
                                                    currentPlayCourseWare: {media: {type: playParams.type}},
                                                    box: CONSTANT.boxs[(playParams.type - 1)]
                                                })

                                                    .then(function (player) {
                                                        flashPlayer = player;
                                                        $scope.flashInitaled = true;

                                                        //////////////
                                                        $scope.$on('$destroy', function () {
                                                            //////////////
                                                            ////////////// 清除所有的定时器，和释放播放器
                                                            //////////////
                                                            // flashPlayer.destroy ();
                                                        });
                                                    });

                                                $scope.events = {};
                                                $scope.events.toggle = function ($event) {
                                                    $scope.model.videoTime = !$scope.model.videoTime;
                                                };

                                                $scope.events.fullScreen = function ($event, who) {
                                                    $scope.isFullScreen = !$scope.isFullScreen;
                                                    $event.preventDefault();
                                                    var el_who = document.getElementById(who);
                                                    commonService.fullScreen(el_who);
                                                };
                                            }];
                                        return controller;
                                    }]

                                }
                            }
                        },
                        "test": {
                            url: '/test',
                            views: {
                                "@": {
                                    templateUrl: 'views/test/index.html',
                                    controller: ['$scope', function ($scope) {
                                    }]
                                }
                            }
                        }
                    };

                    for (var state in states) {
                        $stateProvider.state(state, states[state]);
                    }
                }])

            /**
             *
             */
            .directive('cataLogSlider', [function () {
                return {
                    compile: function ($element, $attr) {
                        var num = 0;
                        $element.on('click', function ($event) {
                            var $target = $($event.target).closest('a'),
                                data = $target.data(),
                                id = $attr.cataLogSlider,
                                container = $('#' + id).find('ul'),
                                method = {
                                    left: function () {
                                        if (num >= 0) {
                                            return false;
                                        }
                                        num += (7 * 152);
                                        container.css({
                                            left: num + 'px'
                                        })
                                    },
                                    right: function () {
                                        if (Math.abs(num - 7 * 152) >= container.width()) {
                                            return false;
                                        }
                                        num -= (7 * 152);
                                        container.css({
                                            left: num + 'px'
                                        })
                                    }
                                };

                            if (data && container.length > 0) {
                                method[data.operation]();
                            }

                        })
                    }
                }
            }])

            .run(['$state', '$rootScope', function ($state, $rootScope) {
                $rootScope.$state = $state;
            }])

            .directive('loadingStatusBar', [function () {
                return {
                    replace: true,
                    scope: {size: '='},
                    template: '<div class="loading-status-bar">' +
                    '<img ng-src="images/loading64.gif" alt="">' +
                    '</div>'
                }
            }])

            .config(['hbPlayerBaseProvider', function (hbPlayerBaseProvider) {
                hbPlayerBaseProvider.setOptions(extend)
            }])

            .directive('particlesBg', [function () {
                return {
                    link: function ($scope, $element, $attr) {
                        var match = navigator.userAgent.match(/MSIE ([\d.]+)?/);
                        var IE_VERSION = match && +match[1];
                        $element.css({
                            width: '100%',
                            height: '100%'
                        });
                        if (IE_VERSION == 8) {
                            $element.css({
                                backgroundImage: 'url("images/player-bg.png")',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            })
                        } else {
                            require(['particles'], function () {
                                var config = {
                                    particles: {
                                        number: {value: 20, density: {enable: !0, value_area: 1E3}},
                                        color: {value: "#e1e1e1"},
                                        shape: {
                                            type: "circle",
                                            stroke: {width: 0, color: "#000000"},
                                            polygon: {nb_sides: 5},
                                            image: {src: "img/github.svg", width: 100, height: 100}
                                        },
                                        opacity: {
                                            value: .5,
                                            random: !1,
                                            anim: {enable: !1, speed: 1, opacity_min: .1, sync: !1}
                                        },
                                        size: {
                                            value: 15, random: !0, anim: {
                                                enable: !1,
                                                speed: 180, size_min: .1, sync: !1
                                            }
                                        },
                                        line_linked: {
                                            enable: !0,
                                            distance: 650,
                                            color: "#cfcfcf",
                                            opacity: .26,
                                            width: 1
                                        },
                                        move: {
                                            enable: !0,
                                            speed: 2,
                                            direction: "none",
                                            random: !0,
                                            straight: !1,
                                            out_mode: "out",
                                            bounce: !1,
                                            attract: {enable: !1, rotateX: 600, rotateY: 1200}
                                        }
                                    }, interactivity: {
                                        detect_on: "canvas",
                                        events: {
                                            onhover: {enable: !1, mode: "repulse"},
                                            onclick: {enable: !1, mode: "push"},
                                            resize: !0
                                        },
                                        modes: {
                                            grab: {distance: 400, line_linked: {opacity: 1}},
                                            bubble: {distance: 400, size: 40, duration: 2, opacity: 8, speed: 3},
                                            repulse: {distance: 200, duration: .4},
                                            push: {particles_nb: 4},
                                            remove: {particles_nb: 2}
                                        }
                                    }, retina_detect: !0
                                };
                                particlesJS($attr.id, config);
                            })
                        }
                    }
                }
            }])


            .directive('components', ['components', '$compile', '$animate', '$timeout', function (components, $compile, $animate, $timeout) {
                return {
                    link: function ($scope, $element, $attr, ctrl) {

                        $scope.$watch('directorys', function (nv) {
                            angular.forEach(nv, function (item) {
                                var childScope = $scope.$new(),
                                    ele = $('<div ' + item.name + ' ng-if="component.meetted" ng-show="currentDirectory.name === component.name"></div>');

                                childScope.component = item;

                                $element.append(ele);

                                $compile(ele)(childScope);
                            })
                        });

                        $scope.$on('events:toggleDirectory', function (nv) {

                        })
                    }
                }
            }])

            .directive('directory', ['$state', 'commonService', '$location', '$stateParams', function ($state, commonService, $location, $stateParams) {
                return {
                    templateUrl: 'templates/sides/directories.html',
                    link: function ($scope) {
                        $scope.$stateParams = $stateParams
                        $scope.events = $scope.events || {};
                        $scope.events.goTest = function ($event, witch) {
                            $event.preventDefault();

                            function go_to() {
                                commonService.currentPlayParams.requestType = 7;
                                commonService.openWindow(witch.href + commonService.genTestUrl(commonService.currentPlayParams, witch.objectList, witch.configId, $scope.lesson.name));
                                // window.open ( );
                            }

                            function to_test(witch, data) {
                                dialog_({
                                    title: '提示',
                                    okValue: '查看测验详情',
                                    cancel: function () {
                                        return true;
                                    },
                                    cancelValue: '取消',
                                    content: '课后测验次数已使用完毕!无法再测验！',
                                    ok: function () {
                                        commonService.currentPlayParams.requestType = 8;
                                        commonService.currentPlayParams.historyId = data.info.testInfo.historyId;
                                        witch && commonService.openWindow(witch.href + commonService.genTestUrl(commonService.currentPlayParams,
                                                witch.objectList, data.info.testInfo.configId, $scope.lesson.name));
                                        return true;
                                    }
                                }).showModal().show();
                            }

                            witch && $http.get(hbPlayerBase.getAskLessonScheduleUrl(), {
                                params: {
                                    exts: $location.$$search.exts,
                                    lessonId: $stateParams.lessonId,
                                    trainClassId: $stateParams.trainClassId
                                }
                            }).success(function (data) {
                                if ($scope.lesson.goTestMustFinishLearn) {
                                    if (data.info.finish) {
                                        if (data.info.testTimes > 0 || data.info.testTimes === -1) {
                                            go_to();
                                        } else {
                                            to_test(witch, data);
                                        }
                                    } else {
                                        dialog_({
                                            title: '提示',
                                            okValue: '继续学习',
                                            content: '未完成课程学习不能去测验!当前学习进度' + $scope.lesson.schedule + '%',
                                            ok: function () {
                                                return true;
                                            }
                                        }).showModal().show();
                                    }
                                } else {
                                    if (data.info.testTimes > 0 ||
                                        data.info.testTimes === -1) {
                                        go_to();
                                    } else {
                                        to_test(witch, data);
                                    }
                                }
                            });
                        };

                        $scope.events.playSelect = function ($event, chapter, courseWare, media, chapterIndex, courseWareIndex) {

                            if ($scope.currentPlayInfo.courseWare.id === courseWare.id && $scope.currentPlayInfo.media.id === media.id) {
                                //  ( '当前播放的就是你点击的课件' );
                                return false;
                            }
                            chapter.$index = chapterIndex;
                            courseWare.$index = courseWareIndex;
                            media.$index = 0;

                            $scope.currentPlayInfo = {
                                chapter: chapter,
                                courseWare: courseWare,
                                media: media
                            };

                            $state.go('states.home', {
                                lessonId: $state.params.lessonId,
                                courseWareId: courseWare.id
                            });

                        };
                    }
                }
            }])

            .provider('components', [function () {
                var sideComponents = {
                    directory: {
                        name: 'directory',
                        className: 'ico-ml',
                        title: '目录'
                    }
                };

                var me = this;

                this.addComponents = function (component) {
                    sideComponents[component.name] = component;
                };
                this.$get = [function () {
                    return {

                        getComponents: function () {
                            return sideComponents;
                        },

                        addComponents: function (component) {
                            sideComponents[component.name] = component;
                        },

                        getComponentsList: function () {
                            var temp = [];
                            for (var pro in sideComponents) {
                                temp.push(sideComponents[pro]);
                            }
                            return temp;
                        }
                    };
                }]
            }])
    });
