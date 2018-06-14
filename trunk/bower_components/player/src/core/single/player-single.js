/**
 * Plug-in Name:Single
 * Plug-in Description:单视频核心组件
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2016/05/11
 */
define ( [
    '../common/player-kernel',
    '../../common/helper',
    '../common/player-event',
    '../common/player-timer',
    '../common/player-frame'
], function ( kernel, helper, StateEvent, TimerFactory, FrameEvent ) {
    'use strict';

    var single = {
        /**
         * 当前类型
         */
        type                     : helper.playType.single,
        /**
         * 播放器对象
         */
        player                   : kernel,
        /**
         * 播放器容器Id
         */
        playerContainerId        : "p2ps_video",
        /**
         * 当前状态事件
         */
        __stateEvent             : undefined,
        /**
         * 当前定时器工厂
         */
        __timerFactory           : undefined,
        /**
         * 设置状态监听器
         * @param state 播放器状态，'play', 'seek', 'pause', 'end','init','state','start'
         * @param func 函数
         */
        setStateListening        : function ( state, func ) {
            if ( helper.isUndefined ( this.__stateEvent ) ) {
                this.__stateEvent = new StateEvent ();
            }
            this.__stateEvent.add ( state, func );
            return this;
        },
        /**
         * 初始化播放器
         * @param launchStudy
         * @private
         */
        __init                   : function ( launchStudy ) {

            var kernel = this.player,
                that   = this;

            //重置播放器
            kernel.reset ();

            //作为播放器核心的事件监听
            if ( helper.isUndefined ( that.__stateEvent ) ) that.__stateEvent = new StateEvent ();

            var userInitEvent = launchStudy && launchStudy.event && launchStudy.event.initPlay;
            //新增一个初始化完成的事件监听
            that.__stateEvent.add ( 'init', function ( _player_, _core_ ) {
                if ( userInitEvent ) {
                    userInitEvent ( _player_, _core_ );
                }
                if ( that.initCompleted )
                    that.initCompleted ( that );
            } );

            //添加播放状态监听
            if ( launchStudy.extend.studyMode == helper.playMode.learn ) {
                that.__stateEvent.add ( ['play', 'seek', 'close', 'pause', 'end'], function ( state, _kernel, _launchStudy ) {
                    studyState ( state, _kernel, _launchStudy );
                } );
            }
            kernel.monitorConfig.streamCompleted = that.streamCompleted;
            if ( launchStudy.interceptConfig.isEnable ) {
                var frame = new FrameEvent ();
                frame.init ( that, kernel );
                if ( that.__stateEvent.get ( 'frame' ) ) {
                    frame.listening ( that.__stateEvent.get ( 'frame' ) );
                }
            }
            //为播放器设置状态监听器
            kernel.setStateListen ( function ( state, _kernel ) {
                var event   = that.__stateEvent.get ( state ),
                    stEvent = that.__stateEvent.getStateEvent ();
                if ( event )
                    event ( state, that, launchStudy );
                if ( stEvent )
                    stEvent ( state, _kernel );
            } );

            var container,
                hasContainer = false;
            if ( launchStudy.options.containerId ) {
                that.playerContainerId = launchStudy.options.containerId;
                container              = document.getElementById ( that.playerContainerId );
                hasContainer           = !helper.isUndefined ( container );
            }

            if ( !hasContainer ) {
                container    = document.createElement ( "div" );
                container.id = that.playerContainerId;
                document.body.appendChild ( container );
            }

            var width  = launchStudy.options.width,
                height = launchStudy.options.height;

            that.__timerFactory = launchStudy.__timerFactory || new TimerFactory ();

            width  = width || '100%';
            height = height || '500px';

            //当前学习模式
            if ( launchStudy.extend.studyMode == helper.playMode.learn ) {
                if ( launchStudy.core.studyStatus != 2 || launchStudy.core.studyMode == helper.playMode.learn ) {
                    that.__timerFactory.create ( helper.Const.Timing.commit, launchStudy.objectives.policy.intervalTime * 1000, function () {
                        that.LMSCommit ( "play" );
                    } );
                }
            } else {
                //当前预览模式
                if ( launchStudy.extend.studyMode == helper.playMode.preview ) {
                    var limit = launchStudy.options.limit;
                    if ( limit > 0 ) {
                        that.__timerFactory.create ( helper.Const.Timing['break'], 1000, function () {
                            previewCompleted ( that, limit, launchStudy.options.callback );
                        } );
                    }
                }
            }

            //初始化播放器
            kernel.init ( that.playerContainerId, launchStudy.interaction.streamHost, launchStudy.interaction.streamPath,
                "auto", "vod", width, height, launchStudy.interaction.p2p_option, launchStudy.options.startAt,
                function ( _kernel ) {
                    var initEvent = that.__stateEvent.getInitEvent ();
                    if ( initEvent ) initEvent ( _kernel, launchStudy.core );
                } );
        },
        /**
         * 初始化播放器
         * @param launchStudy
         */
        initPlayer               : function ( launchStudy ) {
            this.__init ( launchStudy );
        },
        /**
         * 暂停当前模块
         */
        pauseCurrent             : function () {
            if ( this.player.getState () === 'playing' ) {
                //暂停播放器
                this.player.pause ();
            }
            // //暂停所有定时器
            // if ( this.__timerFactory ) {
            //     this.__timerFactory.allStop ();
            // }
            //停止帧监听
            if ( this.player.frameListen ) {
                this.player.frameListen.stopListen ();
            }
        },
        /**
         * 播放当前模块
         */
        playCurrent              : function ( t ) {
            if ( helper.isNumber ( t ) ) {
                this.player.play ( t );
            } else {
                //播放
                this.player.play ();
            }
            // if ( this.__timerFactory ) {
            //     //启动所有定时器
            //     this.__timerFactory.allStart ();
            // }
            //启动帧监听
            if ( this.player.frameListen ) {
                this.player.frameListen.listening ();
            }
        },
        /**
         * 重置当前提交定时器
         * @param delay
         * @param fn
         */
        resetCommitTimer         : function ( delay, fn ) {
            var that = this;
            if ( helper.isUndefined ( fn ) ) {
                fn = function () {
                    that.LMSCommit ( "play" )
                };
            }
            this.__timerFactory.reset ( helper.Const.Timing.commit, delay, fn );
        },
        /**
         * 初始化完成事件
         */
        initCompleted            : function ( kernel ) {

        },
        /**
         * 播放流初次加载完成
         * @param kernel
         */
        streamCompleted          : function ( kernel ) {

        },
        /**
         * 获取新的提交数据
         * @param launchStudy
         * @returns {core:{object},extend:{object}}
         */
        getCurrentLaunchStudyCore: function ( launchStudy ) {
            var record                = {},
                core                  = launchStudy.core;
            record.primaryKey         = core.primaryKey;
            record.courseRecordId     = core.courseRecordId;
            record.coursewareRecordId = core.coursewareRecordId;
            record.studentId          = core.studentId;
            record.studentName        = core.studentName;
            record.lessonId           = core.lessonId;
            record.lessonLocation     = core.lessonLocation;
            record.studyMode          = core.studyMode;
            record.studyLastScale     = core.studyLastScale;
            record.historyMaxScale    = core.studyCurrentScale;
            record.studyCurrentScale  = parseInt ( this.player.getTime () );

            var totalScale = parseInt ( this.player.getDuration (), 10 );

            if ( record.studyCurrentScale == -1 ) {
                record.studyCurrentScale = launchStudy.core.studyCurrentScale;
            }
            record.studySchedule = parseFloat ( record.studyCurrentScale / totalScale ) * 100;
            record.timingMode    = "schedule";
            record.studyStatus   = core.studyStatus;
            //"not_ready", "not_open", "playing", "pause", "end"
            switch ( this.player.getState () ) {
                case "not_ready":
                case "not_open":
                case "pause":
                default:
                    record.lessonStatus = "passed";
                    break;
                case "playing":
                    record.lessonStatus = "browsed";
                    break;
                case "end":
                    record.lessonStatus = "completed";
                    break;
            }
            return { core: record, extend: launchStudy.context };
        },
        /**
         * commit之后需要处理的方法
         * @param launchStudy
         */
        commitAfter              : function ( launchStudy ) {
            var core = launchStudy.core, objectives = launchStudy.objectives;
            var that = this;
            //when the study status is completed,clear the timer
            //the status: 0-unlearning, 1-learning, 2-learningCompleted
            // if ( core.studyStatus == 2 ) {
            //     that.__timerFactory.get ( helper.Const.Timing.commit ).stop ();
            // }
            //when the policy changed,the timer must be reset,reset last player scale
            if ( objectives.modifyPolicy ) {
                that.__timerFactory.reset ( helper.Const.Timing.commit, objectives.policy.intervalTime * 1000, function () {
                    that.LMSCommit ();
                } ).start ();
                this.player.play ( core.studyCurrentScale );
            }
            if ( helper.isFunction ( launchStudy.event.commitAfter ) ) {
                var info = {
                    multimediaRecordId: core.primaryKey,
                    coursewareRecordId: core.coursewareRecordId,
                    courseRecordId    : core.courseRecordId,
                    mediaSchedule     : core.studySchedule,
                    coursewareSchedule: core.coursewareSchedule,
                    courseSchedule    : core.courseSchedule,
                    courseId          : core.courseId,
                    courseWareId      : core.courseWareId,
                    multimediaId      : core.multimediaId
                };
                launchStudy.event.commitAfter ( core, that.player );
            }
        },
        /**
         * 销货当前对象
         */
        destroy                  : function () {
            if ( this.__timerFactory ) {
                this.__timerFactory.destroy ();
            }
            if ( this.__stateEvent ) {
                this.__stateEvent = undefined;
            }
            if ( this.player && this.player.frameListen ) {
                this.player.frameListen.destroy ();
            }
        },

        LMSInitialize: function () {

        },

        LMSCommit: function () {

        },

        LMSFinish: function () {

        },

        LMSSetValue: function ( key, value ) {

        },

        LMSGetValue: function ( key ) {

        },

        LMSGetLastError: function () {

        },

        LMSGetErrorString: function ( errorCode ) {

        },

        LMSGetDiagnostic: function ( errorCode ) {

        }
    };

    /**
     * 当前状态业务拦截
     * @param state
     * @param single
     * @param launchStudy
     */
    function studyState( state, single, launchStudy ) {
        var record   = single.getCurrentLaunchStudyCore ( launchStudy );
        var isPlayed = record.core.historyMaxScale >= record.core.studyCurrentScale;
        switch ( state ) {
            case "play":
            case "pause":
            case "close":
                break;
            case "seek":
                //判断当前跳跃的刻度是否是播放过的,如果不是，则跳跃到最长的刻度上
                if ( !launchStudy.options.isCanSeek && !isPlayed ) {
                    single.playCurrent ( record.core.historyMaxScale );
                }
                break;

            case "end":
                if ( launchStudy.extend.studyMode == helper.playMode.learn ) {
                    single.LMSCommit ( state );
                }
                single.pauseCurrent ();
                break;
            default:
                break;
        }
    }

    /**
     * 预览监听
     * @param single
     * @param limit
     * @param fn
     */
    function previewCompleted( single, limit, fn ) {
        if ( single.player.getTime () >= limit ) {
            single.player.seek ( 0 );
            single.player.pause ();
            single.__timerFactory.get ( helper.Const.Timing['break'] ).stop ();
            helper.log ( "preview end!" );
            helper.isFunction ( fn ) && fn ( single.player );
        }
    }

    return {
        init: function ( api ) {
            return $.extend ( {}, single, api );
        }
    };
} );
