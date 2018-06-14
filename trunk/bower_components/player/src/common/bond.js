/**
 *
 */

define([
        './helper',
        '../core/common/player-event',
        '../core/pdf/player-pdf',
        '../core/single/player-single',
        '../core/three/player-three',
        '../web/web-player',
        '../plugins/panel/panel-question',
        '../plugins/ashe/ashe',
        "jquery",
        'jqueryJson',
        './ie-extension',
        './utility/security',

    ], function (helper, StateEvent, pdfPlayer, singlePlayer, threePlayer, webPlayer, QuestionUI, Ashe, $) {
        "use strict";

        var initURL = '', commitURL = '';

        var defaultLaunchStudy = {

            /**
             * launchStudy模式,values: "custom"/"scorm"
             * the mode of launchStudy，values："custom"/"scorm"
             */

            pattern: '',
            /**
             * 学习核心数据
             * the study data will commit to server
             */
            core: {

                /**
                 * 学习记录Id
                 * study record identity
                 */
                primaryKey: '',

                /**
                 * 学习进度
                 * user current study schedule
                 */
                studySchedule: 0,

                /**
                 * 当前学习刻度
                 * current player scale
                 */
                studyCurrentScale: 0.00,

                /**
                 * 学习状态,"0/1/2":"未学习/学习中/学习完成"
                 * study status of current lesson,values:"0/1/2"
                 */
                studyStatus: 0,

                /**
                 * 课件播放状态 ,passed/completed/failed/incomplete/browsed/not attempted
                 */
                lessonStatus: "not attempted",
                /**
                 * 学习唯一标识
                 */
                token: '',
                /**
                 * 是否重复播放,0/1,否/是，由Token决定
                 */
                isRepeatPlay: 0,
                /**
                 * 课件进度
                 */
                coursewareSchedule: 0,
                /**
                 * 课程进度
                 */
                courseSchedule: 0,
                /**
                 * 媒体总长度
                 */
                mediaTotalTimeLength: 0,
            },

            /**
             * Information of server
             */
            objectives: {

                /**
                 * 交互模式，"active/unactive":"主动/被动"
                 * interaction mode,values:"active/unactive"
                 */
                mode: 'active',

                /**
                 * 变更策略，"true/false":"变更/不变更"
                 * modify policy,values:true,false
                 */
                modifyPolicy: false,

                /**
                 * 策略信息
                 * interaction policy
                 */
                policy: {

                    /**
                     * 交互间隔，主动模式有效
                     * interval time,unit second
                     */
                    intervalTime: -1,

                    /**
                     * 初始化服务器地址
                     * the initialize server url
                     */
                    initServer: "",

                    /**
                     * 交互服务器地址
                     * the commit server url
                     */
                    commitServer: ""
                }
            },

            /**
             * player information data,user-defined
             */
            interaction: {
                /**
                 * 播放器设置对象
                 */
                p2p_option: {},
                /**
                 * 媒体流服务器地址
                 */
                streamHost: "",
                /**
                 * 媒体流相对路径
                 */
                streamPath: "",

            },
            extend: {},
            /**
             * request context information
             */
            context: {},
            /**
             * event from outside
             */
            event: {
                //初始化完成事件
                initPlay: function (state, kernel) {
                },
                //开始播放事件
                startPlay: function (state, kernel) {
                },
                //结束事件
                endPlay: function (state, kernel) {
                },
                //状态监听事件
                statePlay: function (state, kernel) {
                },
                //重复播放监听
                repeatPlay: function (kernel) {
                },
                //提交完成后
                commitAfter: function (core, kernel) {

                },
                //播放帧监听
                frameListen: undefined
            }
        };
        var Bond = function () {
            this.constructor = this;
            var that = this;
            this._launchStudy = defaultLaunchStudy;
            that.resumeConditionQueue = [];
            this.api = {
                /**
                 * LMS initialize
                 * @returns {string}
                 * @constructor
                 */
                LMSInitialize: function () {
                    helper.log("bond.api.LMSInitialize, mode of launchStudy" + that._launchStudy.pattern);
                    that.playerCore.LMSInitialize(that._launchStudy);
                    return "true";
                },
                /**
                 * LMSCommit
                 * @param status
                 * @returns {string}
                 * @constructor
                 */
                LMSCommit: function (status) {
                    if (helper.isUndefined(status) || helper.isEmptyString(status)) {
                        status = "play";
                    }
                    that.timingCore.commit(status);
                    return "true";
                },
                /**
                 * LMSFinish
                 * @constructor
                 */
                LMSFinish: function () {
                    helper.log("bond.api.LMSFinish");
                    playerCore.LMSFinish(that._launchStudy);
                    return "true";
                },
                /**
                 * LMSSetValue
                 * @param property
                 * @param value
                 * @constructor
                 */
                LMSSetValue: function (property, value) {
                    helper.log("bond.api.LMSSetValue, key:" + property + "; value:" + value);
                    that.playerCore.LMSSetValue(property, value);
                },
                /**
                 * LMSGetValue
                 * @param property
                 * @constructor
                 */
                LMSGetValue: function (property) {
                    helper.log("bond.api.LMSGetValue, key:" + property);
                    return that.playerCore.LMSGetValue(property);
                },
                /**
                 * get LMS last error code
                 * @returns {string}
                 * @constructor
                 */
                LMSGetLastError: function () {
                    var errorCode = that.playerCore.LMSGetLastError();
                    helper.log("bond.api.LMSGetLastError" + errorCode);
                    return errorCode;
                },
                /**
                 * get LMS error message
                 * @param errorCode
                 * @returns {string}
                 * @constructor
                 */
                LMSGetErrorString: function (errorCode) {
                    var errorString = that.playerCore.LMSGetLastError(errorCode);
                    helper.log("bond.api.LMSGetErrorString, errorCode:" + errorCode + "; errorString:" + errorString);
                    return errorString;
                },
                /**
                 * get LMS error diagnostic message
                 * @returns {string}
                 * @constructor
                 */
                LMSGetDiagnostic: function (errorCode) {
                    var diagnostic = that.playerCore.LMSGetDiagnostic(errorCode);
                    helper.log("bond.api.LMSGetDiagnostic, errorCode:" + errorCode + "; diagnostic:" + diagnostic);
                    return diagnostic;
                }
            };
            this.playerCore = {};

            function initAshe(launchStudy) {
                if (!launchStudy.camera || !launchStudy.camera.uploadUrl) {
                    return false;
                }
                launchStudy.camera.compareData = launchStudy.core;
                launchStudy.camera.compareData.userId = launchStudy.context.usrId;
                launchStudy.camera.compareData.objectId = launchStudy.context.objectId;
                launchStudy.camera.compareData.objectType = launchStudy.context.objectType || '-1';
                launchStudy.camera.compareData.markers = launchStudy.context.markers;
                launchStudy.camera.extraData = launchStudy.extraData;

                return that.cameraAshe = new Ashe({
                    sdkConfig: launchStudy,
                    context: launchStudy.context,
                    cameraConfig: launchStudy.camera,
                    player: that.playerCore,
                    panelQuestion: that,
                    compareSuccess: function () {
                        if (!that.questionModule || !that.questionModule.popQuestionState || !that.questionModule.popQuestionState.show) {
                            that.playerCore.player.play();
                        }
                    },
                    uploadSuccess: function () {
                    }
                });
            }

            this.timingCore = {
                isJsonp: false,
                init: function (initTimingUrl, submitTimingUrl, initData, isEnableJsonp) {
                    if (isEnableJsonp) this.isJsonp = isEnableJsonp;
                    var initServerData = {
                        context: {
                            test: initData.test,
                            guid: initData.guid,
                            plmId: initData.plmId,
                            pvmId: initData.pvmId,
                            prmId: initData.prmId,
                            subPrmId: initData.subPrmId,
                            unitId: initData.unitId,
                            orgId: initData.orgId
                        },
                        isWriteHistory: initData.isWriteHistory,
                        usrId: initData.usrId,
                        courseId: initData.courseId,
                        courseWareId: initData.courseWareId,
                        multimediaId: initData.multimediaId,
                        type: initData.type === 'pdfIE8' ? 'pdf' : initData.type,
                        originalAbilityId: initData.originalAbilityId,
                        filterList: initData.filterList,
                        token: window.___token || ''
                    };

                    if (initData.apiType !== 'Marker') {
                        initServerData.context.objectId = initData.objectId;
                        initServerData.context.objectType = '-1';
                    } else {
                        initServerData.context.markers = initData.objectList;
                    }
                    var courseInformation = {
                        courseId: initData.courseId,
                        courseWareId: initData.courseWareId,
                        multimediaId: initData.multimediaId
                    };
                    //request server getInitData
                    this.ajax(initTimingUrl, initServerData, function (result) {
                        if (typeof result != "object") helper.error(result);
                        if (result.head.code === "200") {
                            var config = result.data;
                            that._launchStudy.pattern = config.pattern;
                            if (config.core) {
                                $.extend(that._launchStudy.core, courseInformation, config.core);
                                window.___token = that._launchStudy.core.token;
                            }
                            that._launchStudy.core.type = initServerData.type;
                            //that._launchStudy.option = $.extend({}, that._launchStudy.option, initData.option);
                            switch (that._launchStudy.pattern) {
                                case "custom":
                                    that._launchStudy.objectives.mode = "active";
                                    that._launchStudy.objectives.modifyPolicy = false;
                                    if (config.objectives.policy.intervalTime) {
                                        that._launchStudy.objectives.policy.intervalTime = config.objectives.policy.intervalTime;
                                    } else {
                                        if (that._launchStudy.core.studyStatus !== 2)
                                            that._launchStudy.objectives.policy.intervalTime = 30;
                                    }
                                    break;
                                case "scorm":
                                    that._launchStudy.objectives.mode = "unactive";
                                    $.extend(that.playerCore, {
                                        /**
                                         * the version of support scorm
                                         * @type {string}
                                         */
                                        __supportVersion: "1.2",
                                        /**
                                         * scorm.__errorException
                                         * @type {{GeneralException: {code: string, string: string, diagnostic: string}, InvalidArgumentException: {code: string, string: string, diagnostic: string}, ElementCannotHaveChildrenException: {code: string, string: string, diagnostic: string}, ElementNotArrayException: {code: string, string: string, diagnostic: string}, NoInitException: {code: string, string: string, diagnostic: string}, NoImplementException: {code: string, string: string, diagnostic: string}, InvalidSetValueException: {code: string, string: string, diagnostic: string}, ElementReadonlyException: {code: string, string: string, diagnostic: string}, ElementWriteonlyException: {code: string, string: string, diagnostic: string}, IncorrectDataTypeException: {code: string, string: string, diagnostic: string}}}
                                         */
                                        __errorException: {
                                            GeneralException: {
                                                "code": "101",
                                                "string": "General Exception",
                                                "diagnostic": "General Exception"
                                            },
                                            InvalidArgumentException: {
                                                "code": "201",
                                                "string": "Invalid argument error",
                                                "diagnostic": "Invalid argument error"
                                            },
                                            ElementCannotHaveChildrenException: {
                                                "code": "202",
                                                "string": "Element can't have children error",
                                                "diagnostic": "Invalid argument error"
                                            },
                                            ElementNotArrayException: {
                                                "code": "203",
                                                "string": "Element not an array.Can't have count",
                                                "diagnostic": "Element not an array.Can't have count"
                                            },
                                            NoInitException: {
                                                "code": "301",
                                                "string": "Not initialized",
                                                "diagnostic": "Not initialized"
                                            },
                                            NoImplementException: {
                                                "code": "401",
                                                "string": "Not implemented error",
                                                "diagnostic": "Not implemented error"
                                            },
                                            InvalidSetValueException: {
                                                "code": "402",
                                                "string": "Invalid set value",
                                                "diagnostic": "Invalid set value,element is a keyword"
                                            },
                                            ElementReadonlyException: {
                                                "code": "403",
                                                "string": "Element is read only",
                                                "diagnostic": "Element is read only"
                                            },
                                            ElementWriteonlyException: {
                                                "code": "404",
                                                "string": "Element is write only",
                                                "diagnostic": "Element is write only"
                                            },
                                            IncorrectDataTypeException: {
                                                "code": "405",
                                                "string": "Incorrect data type",
                                                "diagnostic": "Incorrect data type"
                                            },
                                            /**
                                             * Get the exception from error code
                                             * @param errorCode
                                             * @returns {null}
                                             */
                                            get: function (errorCode) {
                                                var properties = this;
                                                for (var code in properties) {
                                                    if (properties[code].code == errorCode.toString())
                                                        return properties[code];
                                                }
                                                return null;
                                            }
                                        },
                                        /**
                                         * scorm.__errorRegExption
                                         * @type {{objectivesScoreChild: RegExp, interactionsId: RegExp, interactionsObjectivesCount: RegExp, interactionsObjectivesId: RegExp, interactionsTime: RegExp, interactionsType: RegExp, interactionsCorrectResponsesCount: RegExp, interactionsCorrectResponsesPattern: RegExp, interactionsWeighting: RegExp, interactionsStudentResponse: RegExp, interactionsResult: RegExp, interactionsLatency: RegExp}}
                                         */
                                        __errorRegExption: {
                                            objectivesScoreChild: new RegExp("cms.objectives.\\d+.score._children"),
                                            interactionsId: new RegExp("cms.interactions.\\d+.id"),
                                            interactionsObjectivesCount: new RegExp("cms.interactions.\\d+.objectives._count"),
                                            interactionsObjectivesId: new RegExp("cms.interactions.\\d+.objectives.\\d+.id"),
                                            interactionsTime: new RegExp("cms.interactions.\\d+.time"),
                                            interactionsType: new RegExp("cms.interactions.\\d+.type"),
                                            interactionsCorrectResponsesCount: new RegExp("cms.interactions.\\d+.correct_responses_count"),
                                            interactionsCorrectResponsesPattern: new RegExp("cms.interactions.\\d+.correct_responses\\d+.pattern"),
                                            interactionsWeighting: new RegExp("cms.interactions.\\d+.weighting"),
                                            interactionsStudentResponse: new RegExp("cms.interactions.\\d+.student_response"),
                                            interactionsResult: new RegExp("cms.interactions.\\d+.result"),
                                            interactionsLatency: new RegExp("cms.interactions.\\d+.latency")
                                        },
                                        /**
                                         * Current error code
                                         * @type {string}
                                         * @private
                                         */
                                        __errorCode: '0',
                                        __dataModel: {}
                                    });
                                    break;
                                default:
                                    helper.error("timing.init:launchStudy.pattern is unknown.");
                                    break;
                            }
                            if (helper.isUndefined(that._launchStudy.options.startAt)
                                || that._launchStudy.options.startAt == -1) {
                                that._launchStudy.options.startAt = that._launchStudy.core.studyLastScale;
                            }

                            var playerType = that._launchStudy.type,
                                launchStudy = that._launchStudy,
                                AsheStreamComplete,
                                panelQuestionStreamComplete;
                            // var hasCameraConfig =
                            that.playerCore.initCompleted = function (player) {

                                if (playerType === helper.playType.pdf) {
                                    initAshe(launchStudy);
                                    player.__timerFactory.allStart();
                                }
                            };

                            /// 如果
                            if (playerType !== helper.playType.pdf) {
                                AsheStreamComplete = function () {
                                    initAshe(launchStudy);
                                }
                            }

                            // 如果有配置拦截， 就说明有弹窗拦截初始化弹窗拦截的组件
                            if (that._launchStudy.interceptConfig.isEnable) {
                                panelQuestionStreamComplete = function (kernel) {
                                    // 如果是随机题目，并且学习进度已经到达百分百， 则不创建弹窗题实例
                                    if (that._launchStudy.core.studySchedule >= 100 &&
                                        that._launchStudy.interceptConfig.config.mode === helper.Const.popQuestionType.random) {
                                        helper.log('随机题目，并且学习进度已经到达百分百..不创建弹窗题实例' + that._launchStudy.core.studySchedule + '-' + helper.Const.popQuestionType.random);
                                        return;
                                    }
                                    that._launchStudy.interceptConfig.apiType = that._launchStudy.apiType;
                                    that.questionModule = new QuestionUI(that._launchStudy.interceptConfig, kernel.getDuration());

                                    that.questionModule.recyclePop(that.playerCore);

                                };
                            }

                            var streamCompleted = that.playerCore.streamCompleted;

                            that.playerCore.streamCompleted = function (player) {
                                helper.isFunction(AsheStreamComplete) && AsheStreamComplete(player);
                                helper.isFunction(panelQuestionStreamComplete) && panelQuestionStreamComplete(player);

                                that.setStateEvent('seek', function (type) {

                                    if (that.questionModule) {
                                        that.questionModule.resetToggle();

                                        that.questionModule.mistakeOnPopQuestionClose(player, type);
                                    }

                                });

                                that.setStateEvent('resume', function (type) {

                                    if (that.questionModule) {
                                        // 判断是已经有一个弹窗出来， 如果弹窗没有关闭则不会播放
                                        that.questionModule.mistakeOnPopQuestionClose(player, type);

                                        player.frameListen && player.frameListen.listening();
                                    }
                                })

                                streamCompleted && streamCompleted(player);

                                // 启动所有的监听器
                                that.playerCore.__timerFactory.allStart();
                            }

                            that.playerCore.initPlayer(that._launchStudy);
                        }
                        else {
                            var errorEvent = initData.event && initData.event.errorInit;
                            if (!errorEvent) {
                                alert("播放器初始化失败！" + result.head.message);
                            } else {
                                errorEvent(result.head.message);
                            }
                        }
                    }, function (errorMessage) {
                        alert(errorMessage);
                    });
                },

                /**
                 * 请求计时
                 * @param status 请求时播放状态，play/pause/close
                 */
                commit: function (status) {
                    if (that._launchStudy.core.studyMode == helper.playMode.listen) {
                        return;
                    }
                    var isCommit = false,
                        record = that.playerCore.getCurrentLaunchStudyCore(that._launchStudy);
                    //set study token
                    record.core.token = window.___token;
                    record.core.intervalTime = that._launchStudy.objectives.policy.intervalTime;

                    this.ajax(commitURL, record, function (result) {
                        if (typeof result != "object") helper.error(result);

                        if (result.head.code === "200") {
                            var returnInfo = result.data;
                            var returnRecord = returnInfo.core;
                            var returnObjectives = returnInfo.objectives;
                            $.extend(that._launchStudy.core, {
                                studyCurrentScale: returnRecord.studyCurrentScale,
                                studyLastScale: returnRecord.studyLastScale,
                                studySchedule: returnRecord.studySchedule,
                                studyStatus: returnRecord.studyStatus,
                                token: returnRecord.token,
                                isRepeatPlay: returnRecord.isRepeatPlay,
                                courseRecordId: returnRecord.courseRecordId,
                                coursewareRecordId: returnRecord.coursewareRecordId,
                                coursewareSchedule: returnRecord.coursewareSchedule,
                                courseSchedule: returnRecord.courseSchedule
                            });
                            helper.log("study commit, mode of launchStudy:'" + that._launchStudy.pattern
                                + "';studyScale:" + helper.toTime(that._launchStudy.core.studyLastScale)
                                + ";studySchedule:" + that._launchStudy.core.studySchedule);
                            if (typeof returnInfo != "object") helper.error(returnInfo);
                            window.___token = returnRecord.token;
                            if (returnInfo.objectives && returnInfo.objectives.modifyPolicy) {
                                if (returnInfo.objectives.modifyPolicy == true && !helper.isUndefined(that._launchStudy.objectives.policy)) {
                                    if (that.playerCore.resetCommitTimer)
                                        that.playerCore.resetCommitTimer(returnInfo.objectives.policy.intervalTime);
                                }
                            }
                            if (that._launchStudy.core.isRepeatPlay == 1)
                                that._launchStudy.event.repeatPlay(that.playerCore);
                            that.playerCore.commitAfter(that._launchStudy);
                        }
                        else {
                            helper.log("计时保存失败！" + result.head.message);
                        }
                    }, function (errorMessage) {
                        alert(errorMessage);
                    });
                },
                /**
                 * ajax请求
                 * @param requestUrl 请求地址
                 * @param requestData 数据
                 * @param successFun 成功函数
                 * @param errorMessage 错误信息
                 */
                ajax: function (requestUrl, requestData, successFun, errorMessage) {
                    if (helper.isUndefined($)) {
                        helper.error("jQuery is undefined!");
                    }
                    var reqData = $.toJSON({head: helper.Const.RequestHead, data: requestData});
                    if (this.isJsonp == true) {
                        if (typeof XDomainRequest !== 'undefined') {
                            var xdr = new XDomainRequest();
                            xdr.onload = function () {
                                successFun($.parseJSON(xdr.responseText));
                            };
                            xdr.onerror = function () {
                                errorMessage('xdr error 请求响应错误');
                            };
                            xdr.onprogress = function () {
                            };
                            xdr.open('post', requestUrl);
                            xdr.send(reqData);
                        } else {
                            $.ajax({
                                type: "post",
                                // dataType: "json",
                                url: requestUrl,
                                contentType: 'text/plain',
                                data: reqData,
                                success: successFun,
                                error: function (xhr) {
                                    helper.error(xhr);
                                }
                            });
                        }
                    } else {
                        $.ajax({
                            url: requestUrl,
                            data: reqData,
                            type: "POST",
                            dataType: "json"
                        }).success(successFun).error(errorMessage);
                    }
                },
                show: function () {

                }
            };
            this.destroy = function () {
                if (this.playerCore)
                    this.playerCore.destroy();
                if (this.questionModule) {
                    this.questionModule.destroy();
                    this.questionModule = undefined;
                }
            };

            this.__events = undefined;
            this.setStateEvent = function (state, fn) {
                if (this.__events === undefined) this.__events = new StateEvent();
                this.__events.add(state, fn);
            };
        };

        function getServerURL(baseURL, methodName, apiType) {
            return helper.getPath(baseURL) + helper.Const.getService(apiType || '')[methodName];
        }

        /**
         *
         * @param bond
         * @param initData
         */
        function constructData(bond, initData) {
            bond._launchStudy = defaultLaunchStudy;
            $.extend(bond._launchStudy.extend, {
                'studyMode': initData.studyMode,
                'lessonName': initData.lessonName,
                'lessonCatalog': initData.lessonCatalog,
                'lessonDocument': initData.lessonDocument,
                'type': initData.type
            });

            bond._launchStudy.camera = initData.camera;

            bond._launchStudy.style = initData.style;
            bond._launchStudy.styleOptions = initData.styleOptions;
            bond._launchStudy.type = initData.type;
            bond._launchStudy.apiType = initData.apiType;

            $.extend(bond._launchStudy.context, {
                'test': initData.test,
                'plmId': initData.plmId,
                'pvmId': initData.pvmId,
                'prmId': initData.prmId,
                'subPrmId': initData.subPrmId,
                'unitId': initData.unitId,
                'orgId': initData.orgId,
                'usrId': initData.usrId,
                'objectId': initData.objectId,
                'objectType': initData.objectType,
                markers: initData.objectList,
                'guid': initData.guid,
                'originalAbilityId': initData.originalAbilityId
            });
            bond._launchStudy.pdfHtmlAddress = initData.pdfHtmlAddress;
            bond._launchStudy.interaction.streamHost = initData.streamHost;
            bond._launchStudy.interaction.streamPath = initData.streamPath;
            bond._launchStudy.interaction.p2p_option = $.extend({}, initData.p2pOption);
            bond._launchStudy.options = {
                containerId: initData.container.id,
                width: initData.container.width,
                height: initData.container.height,
                docTime: initData.container.docTime,
                //最长可以播放至刻度点，预览模式有效
                limit: initData.container.limit == undefined ? 0 : initData.container.limit,
                //预览完成回调
                callback: initData.container.callback,
                //是否可以手动跳跃
                isCanSeek: initData.container.isCanSeek == undefined ? false : initData.container.isCanSeek,
                //从哪一个起始点开始播放
                startAt: initData.container.startAt == undefined ? -1 : initData.container.startAt
            };
            bond._launchStudy.downFile = {
                fileUrl: initData.downFile.fileUrl,
                fileDownloadUrl: initData.downFile.fileDownloadUrl
            };
            bond._launchStudy.event = initData.event;
            bond._launchStudy.interceptConfig = {isEnable: false};
            if (initData.intercept) {
                var config = $.extend({}, initData.intercept);
                config.context = {
                    userId: initData.usrId,
                    platformId: initData.plmId,
                    platformVersionId: initData.pvmId,
                    projectId: initData.prmId,
                    subProjectId: initData.subPrmId,
                    unitId: initData.unitId,
                    organizationId: initData.orgId,
                    courseId: initData.courseId,
                    courseWareId: initData.courseWareId,
                    mediaId: initData.multimediaId,
                    objectId: initData.objectId,
                    objectType: initData.objectType,
                    markers: initData.objectList,
                    sourceId: initData.originalAbilityId
                };
                bond._launchStudy.interceptConfig = config;
            }
        }

        /**
         * 加载模块
         * @param bond
         * @param initData
         * @constructor
         */
        function loadModule(bond, initData, callback) {
            constructData(bond, initData);
            if (bond._launchStudy.interceptConfig.isEnable) {
                bond._launchStudy.event.frameListen = function (ts, single, kernel) {
                    if (bond.questionModule) {
                        bond.questionModule.toggle(ts, single);
                    }
                }
            }
            if (bond.playerCore && bond.playerCore.__timerFactory)
                bond.playerCore.__timerFactory.destroy();
            if (initData.type == helper.playType.pdf) {
                bond.playerCore = pdfPlayer.init(bond);
                setEvent(bond, bond._launchStudy.event);
                if (callback) callback();
            } else if (initData.type == helper.playType.single) {
                var player = singlePlayer['init'](bond.api);
                bond.playerCore = player;
                setEvent(bond, bond._launchStudy.event);
                if (callback) callback();
            } else if (initData.type == helper.playType.three) {
                var player = threePlayer.init(bond.api);
                bond.playerCore = player;
                setEvent(bond, bond._launchStudy.event);
                if (callback) callback();
            } else if (initData.type == helper.playType.web) {
                var player = webPlayer.init(bond.api);
                bond.playerCore = player;
                setEvent(bond, bond._launchStudy.event);
                if (callback) callback();
            } else {
                helper.log("加载未知模块:" + initData.type);
            }
        }

        //初始化预览
        function InitPreview(bond, initData) {
            loadModule(bond, initData, function () {
                bond.playerCore.initPlayer(bond._launchStudy);
                // bond.playerCore.__timerFactory.allStart();
                helper.log("当前播放模式：预览模式");
            });
        }

        //初始化计时播放
        function InitNormal(bond, initData) {
            loadModule(bond, initData, function () {
                initURL = getServerURL(initData.initURL, "init", initData.apiType);
                commitURL = getServerURL(initData.initURL, initData.type === 'pdfIE8' ? 'pdf' : initData.type, initData.apiType);
                bond.timingCore.init(initURL, commitURL, initData, true);
                helper.log("当前播放模式：学习模式");
            });
        }

        //浏览模式
        function initBrowse(bond, initData) {
            loadModule(bond, initData, function () {
                bond.playerCore.initPlayer(bond._launchStudy);
                // bond.playerCore.__timerFactory.allStart ();
                helper.log("当前播放模式：浏览模式");
            });
        }

        /**
         * set toggle event
         * @param bond
         * @param event
         */
        function setEvent(bond, event) {
            if (bond.setStateEvent) {
                bond.setStateEvent('init', event.initPlay);
                bond.setStateEvent('start', event.startPlay);
                bond.setStateEvent('end', event.endPlay);
                bond.setStateEvent('state', event.statePlay);
                bond.setStateEvent('frame', event.frameListen);
            }
            var player = bond.playerCore;
            if (player.setStateListening) {
                player.setStateListening('state', function (state, kernel) {
                    if (event.statePlay) {
                        event.statePlay(state, kernel);
                    }
                    if (bond.__events.get(state))
                        bond.__events.get(state)(state, kernel);
                });
                if (bond.__events.get('frame')) {
                    player.setStateListening('frame', bond.__events.get('frame'));
                }
            }
        }

        //初始化当前对象
        function initialization() {
            var bond = new Bond();
            if (window.__bond)
                window.__bond.destroy();
            window.__bond = bond;
            window.API = bond.api;
            return window.__bond;
        }

        return {
            initBond: function (initData) {
                var bond = initialization();
                switch (initData.studyMode) {
                    case helper.playMode.listen:
                        InitPreview(bond, initData);
                        break;
                    case helper.playMode.learn:
                        InitNormal(bond, initData);
                        break;
                    case helper.playMode.preview:
                        initBrowse(bond, initData);
                        break;
                }
            }
        }
    }
)
;
