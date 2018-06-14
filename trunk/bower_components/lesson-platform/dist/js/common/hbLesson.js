/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
define(['angular', 'player', '../common/browser'], function (angular, playLoader) {

        var courseWareType = {
            single: 2,
            web: 4,
            pdf: 1,
            three: 3
        };
        angular.module('hb.player', [])

            .provider('hbPlayer', [function () {
                var that = this;
                this.setOptions = function (options) {
                    this.options = options;
                };
                this.$get = ['$state', '$timeout', '$q', '$http',
                    function ($state, $timeout, $q, $http) {
                        return {
                            player: function (options) {
                                options.$state = $state;
                                options.$q = $q;
                                options.$http = $http;
                                options.$timeout = $timeout;
                                return new HB_Lesson(options);
                            }
                        };
                    }]
            }])

            .constant('CONSTANT', {
                /**
                 * * "single"  单视频
                 * "three"   三分屏
                 * "pdf"     PDF文档
                 * "scorm"   scorm标准视频
                 * "web"     web嵌入式
                 *
                 */

                // 试听， 登录播放， 购买播放
                mode: {
                    // 支持试听
                    listen: 1,
                    // 不支持试听
                    play: 2,
                    // 必须购买后才能观看
                    buyPlay: 3
                },
                playMode: {
                    listen: 0,
                    learn: 1,
                    preview: 0,
                    previewLesson: 0
                },
                courseWareType: courseWareType,
                boxs: ['pdf_player_play_container', 'single_player_play_container', 'three_player_play_container']
            });

        /**
         * 课程播放函数
         * @param data
         * @param loadSuccess
         * @returns {boolean}
         * @constructor
         */
        function HB_Lesson(options) {
            /*data,
             loadSuccess,
             playType,
             angularThings, currentPlayCourseWare, filterItems*/

            var self = this;
            if (!options.data) {
                return false;
            }
            this.currentPlayCourseWare = options.currentPlayCourseWare;
            this.filterItems = options.filterItems;
            //////////////////////////////////////////////////////////////////////
            this.$scope = options.angularThings.$scope;
            this.$timeout = options.$timeout;
            this.$state = options.$state;
            //////////////////////////////////////////////////////////////////////
            this.playType = options.playType - 0;
            this.playMode = {
                study: 1, // 学习模式
                listen: 0 //试听模式
            };
            // this.initPlayTime          = options.data.initPlayTime;
            this.isStudyMode = this.playType === this.playMode.study;
            //////////////////////////////////////////////////////////////////////
            this.keyLeftCode = 37;
            this.keySpaceCode = 32;
            this.keyRightCode = 39;
            this.jumpStep = 5;
            this.communication = {times: 60000};
            //////////////////////////////////////////////////////////////////////
            this.resourcePath = options.data.resourcePath || "/mfs/";
            this.currentDomain = options.data.currentDomain || "/mfs/";
            this.stateChangeHandle = {
                end: options.angularThings.end || angular.noop,
                start: options.angularThings.start || angular.noop,
                init: options.angularThings.init || angular.noop,
                seek: options.angularThings.seek || angular.noop,
                scheduling: options.angularThings.scheduling || angular.noop,
                repeatPlay: options.angularThings.repeatPlay || angular.noop,
                pause: options.angularThings.pause || angular.noop,
                initPlay: options.angularThings.initPlay || angular.noop,
                errorInit: options.angularThings.errorInit || angular.noop
            };
            // 如果是学习模式， 则将服务提交的地址弄上去
            if (this.isStudyMode) {
                this.studyServicePath = options.data.studyServicePath;
            }
            this.options = options;

            this.courseWareType = angular.extend({
                "3": "three",
                '1': 'pdf',
                '2': 'single'
            }, courseWareType);

            return self.init({playLoader: new playLoader(), data: options.data}, self.filterItems);
        }

        /**
         * 初始化播放课程参数
         * @param options
         */
        HB_Lesson.prototype.init = function (options, filterItems) {

            this.playLoader = options.playLoader;
            this.playBox = this.options.box || 'play_box_box_box';
            this.keepSessionCommunication();
            return this.playDefaultLesson(options.data, this.currentPlayCourseWare, filterItems);
        };

        HB_Lesson.prototype.setPlayParams = function (playInfo) {
            // 设置默认的必须参数
            this.playParams = {
                streamPath: this.currentPlayCourseWare.media.type === this.courseWareType.pdf ? /^\/mfs\//.test(this.options.playParams.streamPath) ? this.options.playParams.streamPath : '/mfs' + this.options.playParams.streamPath : this.options.playParams.streamPath,
                test: false,
                isCanSeek: true,
                streamHost: this.options.playParams.streamHost,
                pdfHtmlAddress: '../../../bower_components/pdf-viewer/main',
                type: this.courseWareType[this.currentPlayCourseWare.media.type],
                studyMode: this.playType,
                container: {limit: 'null'},
                apiType: this.options.playParams.apiType || 'Marker'
            };
        };
        /**
         * 播放默认的课程
         * @param witch
         */
        HB_Lesson.prototype.playDefaultLesson = function (lesson, courseWare, filterItems) {
            // 单视频和pdf  和web格式的格式文件播放处理方式
            // this.courseWareTotalTime = lessonPlay.playParams.time;
            this.setPlayParams(lesson);
            return this.initPlay(lesson, courseWare.mode, filterItems);
        };

        HB_Lesson.prototype.addListener = function (events) {
            var isFunction = angular.isFunction;
            var listenerList = {
                play: function () {
                    events && events.play && isFunction(events.play) && events.play();
                },
                start: function () {
                    events && events.start && isFunction(events.start) && events.start();
                },
                end: function () {
                    events && events.end && isFunction(events.end) && events.end();
                }
            };

            this.addKeyListener();

            //// 播放的时候执行的函数
            //swfPlayer .setEventListener ( 'play', listenerList.play );
            //// 开始的时候执行的函数
            //swfPlayer.setEventListener ( 'start', listenerList.start );
            //// 结束的时候执行的函数
            //swfPlayer.setEventListener ( 'end', listenerList.end );

        };

        HB_Lesson.prototype.status = {
            playing: 'playing',
            pause: 'pause'
        };

        /**
         *
         */
        HB_Lesson.prototype.addKeyListener = function () {
            var playBox = $('#' + this.playBox);

            playBox.keydown(function ($event) {
                // 键盘向左 快退
                if (this.keyLeftCode === $event.keyCode) {
                    this.play(this.getTime() - this.jumpStep < 0 ? 0 : this.getTime() - this.jumpStep);
                }

                // 键盘向右 快进
                if (this.keyRightCode === $event.keyCode) {
                    this.play(this.getTime() + this.jumpStep > this.getMediaTotalTime() ? this.getMediaTotalTime() : this.getTime() + this.jumpStep);
                }

                //////////////////////////////////////////////////////////////////////////////
                /// 按空格的时候判断是否为播放，如果为播放中的话将视频暂停, 如果为暂停的话，将开始继续播放这个视频/////////////
                //////////////////////////////////////////////////////////////////////////////

                if (this.keySpaceCode === $event.keyCode) {
                    if (swfPlayer) {
                        if (swfPlayer.getState() === this.status.playing) {
                            this.pause();
                        } else if (swfPlayer.getState() === this.status.pause) {
                            this.play(this.getTime());
                        }
                    }

                }
            }.bind(this))
            /*****
             * 设置为100的时候播放器的声音会被禁用掉所以设置为99
             * 所以当数量小于0的时候，  要把声音设置为100
             */
                .on('mousewheel', function ($event) {
                    // 向上
                    var volume = this.getVolume(),
                        volumeStep = 5;
                    if ($event.originalEvent.wheelDelta > 0) {
                        if (volume + volumeStep >= 100) {
                            volume = 99;
                        } else {
                            volume += volumeStep;
                        }
                    } else {
                        if (volume - volumeStep <= 0) {
                            volume = 100;
                        } else {
                            volume -= volumeStep;
                        }
                    }
                    this.changeVolume(volume);
                }.bind(this))

        };
        /**
         *
         * @param number
         */
        HB_Lesson.prototype.changeVolume = function (number) {
            swfPlayer && swfPlayer.setVolume(number);
        };

        /**
         *
         * @param number
         */
        HB_Lesson.prototype.getVolume = function (number) {
            return swfPlayer && swfPlayer.getVolume();
        };

        /**
         * 暂停播放
         */
        HB_Lesson.prototype.pause = function () {
            swfPlayer && swfPlayer.pause();
        };

        /**
         * 播放
         */
        HB_Lesson.prototype.play = function (time) {
            swfPlayer && swfPlayer.play(time);
        };

        /**
         * 获取当前播放时间
         */
        HB_Lesson.prototype.getTime = function () {
            return swfPlayer && (swfPlayer.getTime() || 0);
        };

        HB_Lesson.prototype.getMediaTotalTime = function () {
            return swfPlayer && swfPlayer.getDuration();
        };

        /**
         * 清除定时器
         */
        HB_Lesson.prototype.cleanTimeInterval = function () {
            swfPlayer && swfPlayer.cleanInterval();
        };

        HB_Lesson.prototype.installed = function () {
            return swfPlayer;
        };

        /**
         * 添加讲义的播放地址
         * @param lectureList
         * @returns {*}
         */
        HB_Lesson.prototype.addLecturePath = function (lectureList) {
            var self = this;
            angular.forEach(lectureList, function (data) {
                if (data.type == 4) {
                    data.path = self.currentDomain + data.path;
                } else {
                    data.path = self.resourcePath + data.path;
                }
            });
            return lectureList;
        };

        HB_Lesson.prototype.letItGo = function () {
            this.cleanTimeInterval();
        };

        HB_Lesson.prototype.keepSessionCommunication = function () {
            var that = this;
            if (this.playType === this.playMode.study) {
                window.window_timer_____timer_timer_timer = window.setInterval(function () {
                    if (that.installed()) {
                        that.options.$http.get(that.options.communicationUrl).then(function (data) {
                            if (!data.data.info) {
                                // 如果未登录就停止播放；‘
                                that.pause();// 停止播放;
                                window.location.reload && window.location.reload();
                            }
                        })
                    }
                }, that.communication.times);
            } else {
                this.closeSessionCommunication();
            }
        };

        HB_Lesson.prototype.closeSessionCommunication = function () {
            window.window_timer_____timer_timer_timer && window.clearInterval(window.window_timer_____timer_timer_timer);
            window.window_timer_____timer_timer_timer && delete  window.window_timer_____timer_timer_timer;
        };

        /**
         * 播放
         * @param context
         */
        HB_Lesson.prototype.initPlay = function (context, listenType, filterItems) {
            // 试听模式
            var that = this,
                defer = this.options.$q.defer();
            /** 1是试听 **/
            if (this.playType === this.playMode.study) {
                this.playParams.plmId = this.options.playParams.platformId;
                this.playParams.pvmId = this.options.playParams.platformVersionId;
                this.playParams.prmId = this.options.playParams.projectId;
                this.playParams.subPrmId = this.options.playParams.subProjectId;
                this.playParams.unitId = this.options.playParams.unitId;
                this.playParams.orgId = this.options.playParams.organizationId;

                /**
                 *
                 this.playParams.camera = {
                        type        : 0,
                        captureMode : 0,
                        captureTimes: 10,
                        postUrl     : 'http://192.168.1.72:3111/capture',
                        swfURL      : '../../../bower_components/cameras/src/webcam.swf'
                    }
                 */
                this.playParams.camera = this.options.playParams.camera || {};

                this.playParams.courseId = context.lesson.id;
                this.playParams.usrId = context.userId;
                // yuan源能力idid
                this.playParams.originalAbilityId = context.originalAbilityId;

                this.playParams.multimediaId = this.currentPlayCourseWare.media.id;
                this.playParams.courseWareId = this.currentPlayCourseWare.courseWare.id;
                if (context.originalAbilityId == "-1") {
                    this.playParams.container.isCanSeek = true;
                } else {
                    this.playParams.container.isCanSeek = false;
                }
                this.playParams.guid = this.options.playParams.guid;
                this.playParams.usrName = -1;
                /// 将原来的objectId 改成objectList;
                this.playParams.objectList = this.options.playParams.objectList || [{
                        key: '-1', value: this.options.playParams.objectId
                    }];
                this.playParams.isWriteHistory = true;
                if (angular.isDefined(listenType)) {
                    if (listenType === 1) {
                        this.playParams.isWriteHistory = false;
                    } else {
                        this.playParams.isWriteHistory = true;
                    }
                }

                this.playParams.initURL = this.studyServicePath;

                //entityId:"", 过滤实体编号
                //filterType:-1,实体类型，0/1/2，媒体/课件/课程
                //IsFilter:false ,是否过滤，true/false
                //this.playParams.filterList = [{ entityId: context.mediaId, filterType: 0, IsFilter: true }];
            }

            // todo pdf的时候进度怎么跳转
            if (this.currentPlayCourseWare.media.type === this.courseWareType.pdf) {
                this.playParams.container.id = this.playBox;
                this.playParams.container.docTime = this.currentPlayCourseWare.media.time;
            } else if (this.currentPlayCourseWare.media.type == this.courseWareType.web) {
                this.playParams.type = 'web';
                this.playParams.streamPath = this.options.playParams.streamPath;
                this.playParams.container.id = 'play_content';
                this.playParams.container.height = 600;
                this.playParams.container.width = 878;
            } else {
                if (this.options.playParams.lectureList && this.options.playParams.lectureList.length > 0) {
                    this.playParams.lessonDocument = this.addLecturePath(this.options.playParams.lectureList);
                    this.playParams.lessonCatalog = this.options.playParams.catalogList;
                    this.playParams.container.id = this.playBox;
                    this.playParams.container.height = '100%';
                    this.playParams.container.width = '100%';
                    this.playParams.style = {
                        three: {
                            width: '100%',
                            height: '100%'
                        }
                    };
                    this.playParams.styleOptions = {
                        mediaDocument: {
                            backgroundColor: 'white',
                            textAlign: 'center'
                        }
                    };
                    this.playParams.container.startAt = undefined;
                } else {
                    this.playParams.container.id = this.playBox;
                    this.playParams.container.height = '100%';
                    this.playParams.container.width = '100%';
                    // this.playParams.container.startAt   = that.initPlayTime - 0;
                }
            }
            this.playParams.autoPlay = true;
            this.playParams.playingListen = true;
            this.playParams.timer = {
                three: {
                    init: function (lastStudyScale) {
                        that.options.threeEvent.init(lastStudyScale);
                    },
                    timing: function (player) {
                        that.options.threeEvent.timing(player);
                    }
                }
            };

            this.playParams.filterList = filterItems || [];

            this.$timeout(function () {
                that.playLoader.loaderInit(that.playParams, {
                    repeatPlay: function (core) {
                        that.stateChangeHandle.repeatPlay();
                    },
                    //初始化完成事件
                    initPlay: function (swfPlayerInfo, core) {
                        that.endEventTrigger = false;
                        that.stateChangeHandle.initPlay(core);
                    },
                    //开始播放事件
                    startPlay: function (state, swfPlayer) {
                        defer.resolve(swfPlayer);
                    },
                    errorInit: function (message) {
                        that.stateChangeHandle.errorInit(message);
                    },
                    //结束事件
                    endPlay: function (state, swfPlayer) {
                        if (!that.endEventTrigger) {
                            that.endEventTrigger = true;
                            that.stateChangeHandle.end();
                        }
                        that.stateChangeHandle.pause(swfPlayer.getState());
                    },
                    playing: function (player) {
                        that.stateChangeHandle.seek(player);
                    },
                    //状态监听事件
                    statePlay: function statePlay(state, swfPlayer) {
                        that.stateChangeHandle.pause(swfPlayer.getState());
                    },
                    seekPlay: function (state, player) {
                        that.stateChangeHandle.seek(player);
                    },
                    commitAfter: function (core, player) {
                        that.stateChangeHandle.scheduling(core);
                    }
                }, function interceptConfig(love) {

                    // that.options.playParams.popConfig = false;
                    if (that.options.playParams.popConfig) {
                        var theConfig = that.options.playParams.popConfig || {};

                        /**
                         * 当mode
                         *    0 随机题
                         *
                         *          1. 没有questionList
                         *          2. 没有为当个试题配置弹窗规则
                         *
                         *    1 正规题
                         *          1. 有questionList
                         *          2. 每个question都有自己的规则
                         *
                         */
                        var config = {
                            isEnable: true,
                            beforePop: function (timestamp, question) {
                                theConfig.beforePop && theConfig.beforePop.call(this, arguments);
                            },
                            afterPop: function () {
                                theConfig.afterPop && theConfig.afterPop.call(this, arguments);
                            },
                            config: {
                                mode: theConfig.mode,
                                // 允许回答次数
                                times: theConfig.times,
                                // 随机题才有用///////////////////////////////////
                                triggerForm: theConfig.triggerForm,
                                triggerValue: theConfig.triggerValue,
                                ////////////////////////////////////////////////
                                timeClose: 'userClick',
                                // 常规题才有
                                questions: theConfig.questions
                            },
                            logEnable: true,
                            examServiceUrl: theConfig.examServiceUrl
                        };
                        // 学习模式并且在有配置信息的时候才配置弹窗题
                        return that.playType === that.playMode.study ? config : love;
                    }
                    return love;
                }());
                /**
                 * 添加监听器
                 */
                that.addListener();
            }.bind(this), 0);
            return defer.promise;
        };

        return HB_Lesson;
    }
);
