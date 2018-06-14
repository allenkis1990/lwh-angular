/**
 * Plug-in Name:scorm
 * Plug-in Description:
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2015/01/30
 */

define ( ['../core/common/player-event'], function ( StateEvent ) {
        "use strict";

        var win   = window,
            scorm = {},
            g     = {},
            bond  = win.__bond;

        g.node = {
            scormNode: ""
        };

        var tool = {

            //全局初始化
            initConfig: function () {
                var lmsErrorMap = g.config.lmsErrorMap;
                //初始化异常
                lmsErrorMap.put ( "101", g.config.GeneralException );
                lmsErrorMap.put ( "201", g.config.InvalidArgumentException );
                lmsErrorMap.put ( "202", g.config.ElementCannotHaveChildrenException );
                lmsErrorMap.put ( "203", g.config.ElementNotArrayException );
                lmsErrorMap.put ( "301", g.config.NoInitException );
                lmsErrorMap.put ( "401", g.config.NoImplementException );
                lmsErrorMap.put ( "401", g.config.NoImplementException );
                lmsErrorMap.put ( "402", g.config.InvalidSetValueException );
                lmsErrorMap.put ( "403", g.config.ElementReadonlyException );
                lmsErrorMap.put ( "404", g.config.ElementWriteonlyException );
                lmsErrorMap.put ( "405", g.config.IncorrectDataTypeException );
            },

            // 构建提交lms的数据
            bulidCommitData: function () {
                var cmiMap      = g.config.cmiMap,
                    sessionTime = cmiMap.get ( "cmi.core.session_time" ) || '0',//这个属性不支持get方法，因此直接通过map获取
                    exit        = cmiMap.get ( "cmi.core.exit" ) || "exit",
                    milseconds,
                    hms,
                    seconds,
                    mins,
                    hours,
                    totalseconds,
                    sectionLog,
                    endTime;

                if ( sessionTime !== '0' ) {
                    milseconds   = sessionTime.split ( "." )[1];
                    hms          = sessionTime.split ( "." )[0];
                    seconds      = hms.split ( ":" )[2];
                    mins         = hms.split ( ":" )[1];
                    hours        = hms.split ( ":" )[0];
                    totalseconds = parseInt ( seconds, 10 ) + parseInt ( mins, 10 ) * 60 + parseInt ( hours, 10 ) * 3600;
                } else {
                    //课件可能本身不支持时间记录，则由lms自己来记录
                    endTime      = new Date ().getTime ();
                    totalseconds = parseInt ( (endTime - g.config.startTime) / 1000, 10 );
                }

                var progress = API.LMSGetValue ( "cmi.core.lesson_progress" );
                if ( !progress ) {
                    var suspendData = API.LMSGetValue ( "cmi.suspend_data" );
                    // 优先使用挂起的数据换算学习进度
                    progress        = this.calcProgress ( suspendData ) || 0;
                } else {
                    progress = parseFloat ( progress );
                }

                var core = {
                    primaryKey        : g.config.scormDataModule.primaryKey,
                    courseRecordId    : g.config.scormDataModule.courseRecordId,
                    coursewareRecordId: g.config.scormDataModule.coursewareRecordId,
                    lessonId          : g.config.scormDataModule.lessonId,
                    multimediaId      : g.config.scormDataModule.multimediaId,
                    lessonLocation    : API.LMSGetValue ( "cmi.core.lesson_location" ),
                    lessonStatus      : API.LMSGetValue ( "cmi.core.lesson_status" ),
                    studyMode         : g.config.scormDataModule.studyMode,
                    studyCurrentScale : totalseconds || 0,
                    studyLastScale    : g.config.scormDataModule.studyLastScale || 0,
                    studySchedule     : progress,
                    timingMode        : "timespan",
                    studyStatus       : g.config.scormDataModule.studyStatus
                };
                return core;
            },

            // 获取sco的评论
            initComments: function () {
                g.config.cmiMap.put ( "cmi.comments", "" );
            },

            /**
             * a当课件内部不吐进度数据时，使用scorm的cmi.suspend_data进行进度换算
             * @param suspendData
             * @return {number}
             */
            calcProgress: function ( suspendData ) {
                var progress = 0;
                if ( suspendData ) {
                    var supends        = suspendData.split ( '/' ),
                        currentSection = parseInt ( supends[0], 10 ),
                        wholeSection   = parseInt ( supends[1], 10 );
                    if ( currentSection === wholeSection ) {
                        progress = 100;
                    } else {
                        progress = Math.floor ( (currentSection / wholeSection) * 100 );
                    }
                } else {
                    win.console.log ( 'cmi.suspend_data无数据...' );
                }
                win.console.log ( '使用挂起的数据换算的进度是： ' + progress );
                return progress;
            }
        };

        /**
         *  SCORM可以调用的接口，此处命名保持与标准一致(虽然暴露的时候又可以重命名)
         *  其内部方法属性为重写
         */
        scorm = {
            /**
             * prower+
             */
            type                     : "scorm",
            /**
             * 初始化播放器
             */
            initPlayer               : function () {

                var c        = document.getElementById ( bond._launchStudy.options.containerId );
                var htmlPath = bond._launchStudy.interaction.streamHost + bond._launchStudy.interaction.streamPath;
                if ( typeof c == "undefined" || c == null ) {
                    window.document.body.innerHTML = ("<iframe id='" + bond._launchStudy.options.id + "' src='" + htmlPath + "' height='" + bond._launchStudy.options.height + "' width='" + bond._launchStudy.options.width + "' frameborder='0'></iframe>");
                } else {
                    c.src          = htmlPath;
                    c.style.height = bond._launchStudy.options.height <= 0 ? '950px' : bond._launchStudy.options.height;
                    c.style.width  = bond._launchStudy.options.width <= 0 ? '660px' : bond._launchStudy.options.width;
                    c.frameBorder  = 0;
                }

                g.config = {
                    playMode       : bond._launchStudy.core.playMode,
                    startTime      : 0,
                    // 存放CMI数据
                    cmiMap         : new Map (),
                    // scorm数据模型
                    scormDataModule: bond._launchStudy.core,
                    errorCode      : bond.playerCore.__errorCode,
                    // LMS查找的错误Map
                    lmsErrorMap    : new Map (),
                    // 存放scorm定义的error集合
                    errorMap       : bond.playerCore.__errorException,
                    errorRegExpMap : bond.playerCore.__errorRegExption
                };
                tool.initConfig ();
            },
            /**
             * 状态监听器对象
             * @private
             */
            __stateEvent             : undefined,
            /**
             * 设置状态监听器
             * @param state 播放器状态，'play', 'seek', 'pause', 'end','init','state','start'
             * @param func 函数
             */
            setStateListening        : function ( state, func ) {
                if ( this.__stateEvent === undefined ) this.__stateEvent = new StateEvent ();
                this.__stateEvent.add ( state, func );
                return this;
            },
            /**
             * 获取新的提交数据
             * @param launchStudy
             * @returns {core:{object},extend:{object}}
             */
            getCurrentLaunchStudyCore: function ( launchStudy ) {
                return { core: tool.bulidCommitData (), extend: launchStudy.context };
            },
            /**
             * commit之后需要处理的方法
             * @param objectives
             */
            commitAfter              : function ( objectives ) {

            },
            /**
             * 销货当前对象
             */
            destroy                  : function () {
                if ( this.__stateEvent )
                    this.__stateEvent == undefined;
            },
            LMSInitialize            : function () {
                if ( typeof g.config == "undefined" )
                    throw "initPlayer time out!";

                win.console.log ( "player-scorm:init" );
                var dataModule = g.config.scormDataModule,
                    cmiMap     = g.config.cmiMap;
                //初始化相关变量
                cmiMap.put ( "cmi.core.lesson_progress", dataModule.studySchedule );//宽学网课件专属
                //这里要列出系统支持的API列表
                cmiMap.put ( "cmi.core._children", "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session" );
                cmiMap.put ( "cmi.core.student_id", dataModule.studentId );
                if ( dataModule.credit ) {
                    cmiMap.put ( "cmi.core.credit", dataModule.credit );//这里看要学员是否有资格学习此章节，有返回"credit"，没有返回"no-credit"
                } else {
                    cmiMap.put ( "cmi.core.credit", "credit" );//默认能够进入scorm课件页面的都是有权限的
                }
                cmiMap.put ( "cmi.core.lesson_location", dataModule.lessonLocation );//这个值由scorm课件自己维护
                cmiMap.put ( "cmi.core.lesson_status", "not attempted" );
                cmiMap.put ( "cmi.core.entry", dataModule.entry );
                cmiMap.put ( "cmi.core.lesson_mode", "normal" );
                cmiMap.put ( "cmi.suspend_data", dataModule.studySchedule );
                cmiMap.put ( "cmi.launch_data", dataModule.launch_data );//从mainifest中的adlcp:datafromlms中获取
                cmiMap.put ( "cmi.core.score.raw", "0" );   // 对付2013,7,4宽学课件结构整改导致预览报错
                g.config.startTime = new Date ().getTime ();
                // this.__stateEvent = new StateEvent();
                var initEvent      = this.__stateEvent.getInitEvent ();
                if ( initEvent ) initEvent ( 'init', this );
                var startEvent = this.__stateEvent.get ( 'start' );
                if ( startEvent ) startEvent ( 'start', this );
                var stateEvent = this.__stateEvent.getStateEvent ();
                if ( stateEvent ) {
                    stateEvent ( 'init', this );
                    stateEvent ( 'start', this );
                }
                return "true";
            },

            LMSCommit: function () {
                if ( this.__stateEvent.getStateEvent () )
                    this.__stateEvent.getStateEvent ( 'commit', this );
                return 'true';
            },

            LMSFinish: function () {
                // 这里要处理lesson_status，还有页面切换的时候也要
                // 处理cmi.core.entry
                win.console.log ( "player-scorm:finish" );
                if ( this.__stateEvent.getStateEvent () )
                    this.__stateEvent.getStateEvent ( 'end', this );
                if ( this.__stateEvent.get ( 'end' ) )
                    this.__stateEvent.get ( 'end' ) ( 'end', this );
            },

            LMSSetValue: function ( key, value ) {
                if ( key ) {
                    var errorRegMap = g.config.errorRegExpMap,
                        errorCode   = g.config.errorCode,
                        errorMap    = g.config.errorMap;
                    win.console.log ( "set:" + key + ",value:" + value );
                    if ( key === "cmi.core._children" ||
                        key === "cmi.core.score._children" ||
                        key === "cmi.objectives._children" ||
                        key === "cmi.objectives_count" ||
                        key === "cmi.student_data._children" ||
                        key === "cmi.interactions._children" ||
                        key === "cmi.interactions._count" ||
                        errorRegMap.objectivesScoreChild.test ( key ) ||
                        errorRegMap.interactionsCorrectResponsesCount.test ( key ) ) {
                        // 设置错误代码
                        errorCode = errorMap.InvalidSetValueException.code;
                        return 'false';
                    } else if ( key === "cmi.core.student_id" ||
                        key === "cmi.core.credit" ||
                        key === "cmi.core.entry" ||
                        key === "cmi.core.lesson_mode" ||
                        key === "cmi.core.total_time" ||
                        key === "cmi.launch_data" ||
                        key === "cmi.comments_from_lms" ||
                        key === "cmi.student_data.mastery_score" ||
                        key === "cmi.student_data.max_time_allowed" ||
                        key === "cmi.student_data.time_limit_action" ||
                        errorRegMap.interactionsObjectivesCount.test ( key ) ) {
                        // 设置错误代码
                        errorCode = errorMap.ElementReadonlyException.code;
                        return 'false';
                    } else {
                        g.config.cmiMap.put ( key, value );
                        return "true";
                    }
                } else if ( key === "cmi.comments" ) {
                    return "true";
                } else {
                    return 'false';
                }
            },

            LMSGetValue: function ( key ) {
                var value,
                    errorRegMap = g.config.errorRegExpMap,
                    errorCode   = g.config.errorCode,
                    errorMap    = g.config.errorMap;
                if ( key ) {
                    win.console.log ( "get:" + key + ",value:" + g.config.cmiMap.get ( key ) );

                    if ( key === "cmi.core.exit" ||
                        key === "cmi.core.session_time" ||
                        errorRegMap.interactionsId.test ( key ) ||
                        errorRegMap.interactionsObjectivesId.test ( key ) ||
                        errorRegMap.interactionsTime.test ( key ) ||
                        errorRegMap.interactionsType.test ( key ) ||
                        errorRegMap.interactionsCorrectResponsesPattern.test ( key ) ||
                        errorRegMap.interactionsWeighting.test ( key ) ||
                        errorRegMap.interactionsStudentResponse.test ( key ) ||
                        errorRegMap.interactionsResult.test ( key ) ||
                        errorRegMap.interactionsLatency.test ( key ) ) {
                        // 设置错误代码
                        errorCode = errorMap.ElementWriteonlyException.code;
                        return "false";
                    } else if ( errorRegMap.objectivesScoreChild.test ( key ) ) {
                        errorCode = errorMap.objectivesScoreChild.code;
                        return "raw,min,max";
                    } else {
                        value = g.config.cmiMap.get ( key );
                    }
                }
                return value || '';
            },

            LMSGetLastError: function () {
                var temp           = g.config.errorCode;
                g.config.errorCode = '0';
                return temp;
            },

            LMSGetErrorString: function ( errorCode ) {
                return g.config.lmsErrorMap.get ( errorCode ).string;
            },

            LMSGetDiagnostic: function ( errorCode ) {
                return g.config.lmsErrorMap.get ( errorCode ).diagnostic;
            }
        };
        /**
         * 自定义Map的构造器
         */
        function Map() {
            this.arr   = [];
            var Struct = function ( key, value ) {
                this.key   = key;
                this.value = value;
            };

            // 向map中增加元素（key, value)
            this.put = function ( key, value ) {
                var i;
                for ( i = 0; i < this.arr.length; i++ ) {
                    if ( this.arr[i].key === key ) {
                        this.arr[i].value = value;
                        return;
                    }
                }
                this.arr[this.arr.length] = new Struct ( key, value );
            };

            //获取指定key的元素值value，无则返回null
            this.get = function ( key ) {
                var i;
                for ( i = 0; i < this.arr.length; i++ ) {
                    if ( this.arr[i].key === key ) {
                        return this.arr[i].value;
                    }
                }
                return null;
            };

            //删除指定key的元素
            this.remove = function ( key ) {
                var v, i;
                for ( i = 0; i < this.arr.length; i++ ) {
                    v = this.arr.pop ();
                    if ( v.key === key ) {
                        continue;
                    }
                    this.arr.unshift ( v );
                }
            };

            this.size = function () {
                return this.arr.length;
            };

            this.clean = function () {
                this.arr = null;
                this.arr = [];
            };
        }

        var _class = {
            init: function (api) {
                return $.extend({}, scorm, api);
            }
        };

        return _class;
    }
);
