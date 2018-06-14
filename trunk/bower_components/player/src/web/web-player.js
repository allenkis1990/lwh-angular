define ( [
    '../common/helper',
    '../core/common/player-timer',
], function ( helper, TimerFactory ) {
    var webPlayer = {
        type          : "web",
        player        : "",
        /**
         * 当前定时器工厂
         */
        __timerFactory: undefined,
        initPlayer    : function ( launchStudy ) {
            var that       = this;
            var c          = undefined,
                objectives = launchStudy.objectives,
                core       = launchStudy.core;
            var webUrl     = launchStudy.interaction.streamHost + launchStudy.interaction.streamPath;
            if ( launchStudy.options.containerId != '' && launchStudy.options.containerId != undefined ) {
                c = document.getElementById ( launchStudy.options.containerId );
            } else {
                c = document.getElementById ( 'web_container' );
            }

            if ( helper.isEmptyString ( c ) ) {
                helper.log ( 'web_container id is null' );
            } else {
                c.src          = webUrl;
                c.style.height = (launchStudy.options.height == undefined || launchStudy.options.height == '') ? '685px' : launchStudy.options.height;
                c.style.width  = (launchStudy.options.width == undefined || launchStudy.options.width == '') ? '100%' : launchStudy.options.width;
                c.frameBorder  = 0;
            }
            if ( that.__timerFactory ) that.__timerFactory.destroy ();
            //设定个定时器 执行一次
            if ( launchStudy.extend.studyMode == helper.playMode.learn ) {
                //如果媒体长度小于10秒则设置执行当次定时器，10秒后执行
                if ( core.mediaTotalTimeLength < 10 ) {
                    window.setTimeout ( function () {
                        that.LMSCommit ( 'play' );
                    }, 10 * 1000 );
                }
                if ( helper.isUndefined ( that.__timerFactory ) )
                    that.__timerFactory = new TimerFactory ();
                that.__timerFactory.create ( helper.Const.Timing.commit, objectives.policy.intervalTime * 1000, function () {
                    that.LMSCommit ( 'play' );
                } );

                this.initCompleted ( this );
                //that.__timerFactory.get(helper.Const.Timing.commit).start();
            }
        },

        /**
         * 获取新的提交数据
         * @param launchStudy
         * @returns {core:{object},extend:{object}}
         */
        getCurrentLaunchStudyCore: function ( launchStudy ) {
            var record                      = {},
                core = launchStudy.core, ts = launchStudy.objectives.policy.intervalTime;

            record.primaryKey         = core.primaryKey;
            record.courseRecordId     = core.courseRecordId;
            record.coursewareRecordId = core.coursewareRecordId;
            record.lessonId           = core.lessonId;
            record.lessonLocation     = core.lessonLocation;
            record.studyMode          = core.studyMode;
            record.studyLastScale     = core.studyLastScale + ts;
            record.studyCurrentScale  = core.studyCurrentScale + ts;
            record.studySchedule      = core.studySchedule;
            record.timingMode         = "scale";
            record.studyStatus        = core.studyStatus;
            record.lessonStatus       = 1;

            return {
                core  : record,
                extend: launchStudy.context
            };
        },

        /**
         * commit之后需要处理的方法
         * @param launchStudy
         */
        commitAfter: function ( launchStudy ) {
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
        destroy    : function () {
            if ( this.__timerFactory )
                this.__timerFactory.destroy ();
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
    var _class    = {
        init: function ( api ) {
            return $.extend ( {}, webPlayer, api );
        }
    };
    return _class;
} );
