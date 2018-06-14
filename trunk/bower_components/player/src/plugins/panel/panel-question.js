/**
 * Created by admin on 2016/5/13.
 */
define([
        '../../common/helper',
        '../../extend/remodal/dist/remodal',
        '../../extend/blockUI/jquery.blockUI'
    ],
    function (helper) {
        var defaultOptions = {
            examServiceUrl: '',
            config: {
                /**
                 * 拦截模式|0/1，知识点弹题/随机题
                 */
                mode: 0,
                /**
                 * 触发形式|0/1/2，固定时间点/固定百分比间隔/固定时间间隔
                 */
                triggerForm: 0,
                /**
                 * 触发形式值|在TriggerForm值不为0时，该值必填
                 */
                triggerValue: 0,
                /**
                 * 是否保存答题记录
                 */
                isStoreRecord: true,
                /**
                 * 当mode为0时，该值为题目列表
                 */
                questions: []
            },
            message: {
                /**
                 * 回答错误显示信息
                 */
                wrongAnswer: "回答错误!",
                /**
                 * 回答错误，可重试显示信息`
                 */
                wrongAnswerRetry: "回答错误，请重新作答！",
                /**
                 * 回答正确显示信息
                 */
                correctAnswer: "回答正确！",
                /**
                 * 回答错误，包含可重试次数显示信息
                 */
                wrongAnswerCount: "回答错误，请重新作答！您还可以作答#count#次。",
                /**
                 * （可选项）没有选择答案，回调函数，默认：undefined
                 * 指示以回调方式将信息的展示方式开放，即可以自定义如何显示提示信息和需要提示的信息
                 */
                noAnswerCallback: undefined,
                /**
                 * （可选项）没有选择答案，提示信息对象，默认：undefined
                 * 提供显示信息的对象，显示信息的方式由内部定义，该对象与noAnswerCallback只可选一项
                 * 若两者都提供以noAnswerCallback生效为主；若两者都不提供，以内部的alert显示默认信息
                 */
                noAnswerMessage: undefined
            },
            context: {
                userId: "",
                platformId: "",
                platformVersionId: "",
                projectId: "",
                subProjectId: "",
                unitId: "",
                organizationId: "",
                courseId: "",
                courseWareId: "",
                mediaId: "",
                sourceId: ""
            }
        };

        function QuestionUI(option, totalTimeLength) {

            this.options = $.extend({}, defaultOptions, option);
            this.options.config = $.extend({}, defaultOptions.config, option.config);
            this.options.message = $.extend({}, defaultOptions.message, option.message);

            this.popQuestionState = {
                show: false,
                popTime: 0
            };
            //生成随机时间点
            var questions = [],
                i = 1,
                time;

            if (this.options.examServiceUrl == undefined || this.options.examServiceUrl == "") {
                helper.error("examServiceUrl配置为空！");
                return;
            }
            if (typeof this.options.message.noAnswerMessage !== "undefined") {
                if (!this.options.message.noAnswerMessage instanceof Array) {
                    helper.error("noAnswerMessage must be Array!");
                    return;
                }
            }
            var that = this;
            //构建提示函数
            this.options.message.noAnswerCallback = this.options.message.noAnswerCallback ||
                (typeof this.options.message.noAnswerMessage === "undefined" ? undefined : function (event) {
                        if (typeof event === "undefined") {
                            helper.error("noAnswerCallback[Function]'s parameter 'event' is undefined!");
                            return;
                        }
                        var definedMessage = $.grep(that.options.message.noAnswerMessage, function (n, i) {
                            return n.code == event.code
                        });
                        //如果查找到定义的信息
                        if (definedMessage.length > 0) {
                            var currentMessage = definedMessage[0];
                            showMessage(currentMessage.message);
                        }
                    });

            var config = this.options.config;
            helper.log("弹窗模式：" + (config.mode == helper.Const.popQuestionType.normal ? "知识点" : "随机题"));
            //判断当前模式，随机模式
            if (config.mode == helper.Const.popQuestionType.random) {

                if (config.triggerValue == undefined || config.triggerValue == 0) {
                    helper.error("触发形式值必须设置，且不能为0");
                    return;
                }
                switch (config.triggerForm) {
                    case 1:
                        helper.log("触发形式：固定百分比间隔");

                        if (config.triggerValue > 100 || config.triggerValue < 0) {
                            helper.error("触发形式值必须是1-100之间");
                            return;
                        }

                        while (true) {
                            time = parseInt(totalTimeLength * i * (config.triggerValue / 100));
                            if (time > totalTimeLength) break;
                            questions.push({time: time, id: "-1", times: config.times});
                            i++;
                        }
                        config.questions = questions;
                        break;
                    case 2:
                        helper.log("触发形式：固定时间间隔");

                        while (true) {
                            time = parseInt(i * config.triggerValue);
                            if (time > totalTimeLength) break;
                            questions.push({time: time, id: "-1", times: config.times});
                            i++;
                        }
                        config.questions = questions;
                        break;
                    default:
                        helper.log("未知的触发形式：" + config.triggerForm);
                        break;
                }
            }
            this.notPoppedQuestions = [];

            this.logPop = function (type, question, popTime, useful) {
                var objList = [];


                var commitLogInfo = {
                    userId: this.options.context.userId,
                    courseId: this.options.context.courseId,
                    courseWareId: this.options.context.courseWareId,
                    mediaId: this.options.context.mediaId,
                    type: type
                };


                if (helper.checkApiType(this.options.context.apiType)) {
                    for (var i = 0; i < this.options.context.markers.length; i++) {
                        var mark = this.options.context.markers[i];
                        objList.push({
                            objectId: mark.value,
                            type: mark.key
                        })
                    }
                    commitLogInfo.objectList = objList;
                } else {
                    commitLogInfo.object = {
                        objectId: this.options.context.objectId,
                        objectType: this.options.context.objectType
                    }
                }

                if (type === helper.Const.popQuestionLogType.init) {
                    this.options.config.useful = useful;
                    commitLogInfo.initMessage = this.options.config;
                } else {
                    if (question.popQuestionType === 'notPoppedQuestion') {
                        commitLogInfo.initMessage = {
                            popQuestionType: 'recycleType',
                            popTime: popTime
                        }
                    }
                    commitLogInfo.questionId = question.id || 'The random question type has no id!'
                }
                helper.ajax(this.options.examServiceUrl + '/web/popQuiz/popQuestionLog', commitLogInfo);
            }

            if (this.options.logEnable) {
                this.logPop(helper.Const.popQuestionLogType.init);
            }

            // this.$modal = createUI ( "question_remodal" );
            var me = this;

            this.toggle = function (timestamp, single) {

                this.answerCount = this.options.config.verificationValue;
                var that = this,
                    question;
                if (question = this.askForPop(timestamp)) {
                    // 增加判定条件popped 判定是否弹过窗

                    that.ladyFirst = true;
                    that.options.beforePop && that.options.beforePop.call(single,
                        that.lastToggleTs = timestamp, question);

                    // 暂停当前播放的视频
                    single.pauseCurrent();

                    //// -------------------------
                    that.fadeIn(question, single);
                } else {
                    that.ladyFirst = false;
                }

                return this;
            };

            var theQuestions = this.options.config.questions;

            this.securityTiming = {};
            this.recyclePop = function (kernel) {

                if (this.options.config.mode === helper.Const.popQuestionType.random) {
                    helper.log('随机题不回收弹窗题...');
                    return;
                }

                helper.log('开始回收弹窗题目...');
                if (me.securityTiming.timing) {
                    window.clearInterval(me.securityTiming.timing);
                }
                me.securityTiming.timing = window.setInterval(function () {
                    var currentTime = Math.floor(kernel.player.getTime() || 0);
                    helper.forEach(theQuestions, function (item) {
                        var questionTime = Math.floor(item.time);
                        // 检测到有未弹的试题将
                        if (questionTime < currentTime && !item.popped) {
                            var has = false;
                            helper.forEach(that.notPoppedQuestions, function (subItem) {
                                if (item.id === subItem.id) {
                                    has = true;
                                }
                            })
                            if (!has) {
                                item.$index = me.notPoppedQuestions.length;
                                item.popQuestionType = 'notPoppedQuestion';
                                me.notPoppedQuestions.push(item);
                            }
                        }
                    })

                    helper.log('回收中.... 有: ' + (me.notPoppedQuestions.length) + '  题');
                }, 5000);
            }

            this.askForPop = function (time) {
                var theTimeQuestion = [],
                    time = Math.floor(time),
                    theLen = theQuestions.length,
                    that = this;
                for (var i = 0; i < theLen; i++) {
                    var item = theQuestions[i],
                        questionTime = Math.floor(item.time);
                    if (questionTime === time) {
                        theTimeQuestion.push(item);
                    }
                }

                // 当前时间点没有要弹窗的试题
                if (theTimeQuestion.length <= 0) {
                    return that.notPoppedQuestions[0];
                }

                var theQuestion;

                if (theTimeQuestion.length >= 1) {
                    theQuestion = theTimeQuestion[0];
                }
                return function () {
                    // 如果是随机题的话 ， 获取到要弹窗的试直接弹窗
                    if (that.options.config.mode
                        === helper.Const.popQuestionType.random && theQuestion) {
                        return theQuestion;
                    }
                    /**
                     *
                     * rules {}
                     *      1. showAnswer // 是否显示答案 true 答错次数上限则显示答案 false 不显示
                     *      2. times // 答错几次显示答案
                     *
                     * @type {string|*|Array|CssRule[]}
                     */
                    var result;

                    // 答对不弹窗
                    if (theQuestion.answerResult || theQuestion.answerTimes >= theQuestion.times) {
                        if (theQuestion.answerTimes >= theQuestion.times) {
                            helper.log('次数用完不弹窗');
                        } else {
                            helper.log('答对不弹窗');
                        }
                        result = false;
                    } else {
                        result = theQuestion;
                    }

                    return result;
                }()
            };

            //
            this.lastToggleTs = 0;
            //
            this.isToggle = function (time, ts) {
                return Math.abs(time - this.lastToggleTs) > ts;
            };
            //
            this.hbNb = undefined;
            this.validateCallback = function (result, single, question) {

                $.unblockUI();

                if (result) {

                    this.fadeOut(this.options.message.correctAnswer, single, question);
                    return true;
                } else {

                    // 如果试题上面的答题次数上限为0的话。则是代表答题的模式是答对为止， 答对了才显示答案
                    // 如果为0答题一次就不能再答了。直接关闭
                    if (question.times == 0) {

                        helper.log('当前回答次数<<<<<     ' + question.answerTimes + '     >>>>>');
                        showMessage(this.options.message.wrongAnswerRetry);
                    } else {

                        // 如果已经回答的次数大于回答次数上限。则显示答案、 并且弹窗告诉他回答错误
                        if (question.answerTimes >= question.times) {

                            if (question.rules && question.rules.wrongTimes2_show_answer) {
                                this.hbNb.showResult();
                            }

                            this.fadeOut(this.options.message.wrongAnswer, single, question);
                            return true;
                        }

                        showMessage(this.options.message.wrongAnswerCount.replace(/#count#/gi, question.times - question.answerTimes));
                    }
                }
                return false;
            };

            this.fadeIn = function (question, single, callback) {

                var currentTime = single.player.getTime();
                this.popQuestionState.show = true;
                this.popQuestionState.popTime = currentTime;

                if (this.options.logEnable && this.options.config.mode === helper.Const.popQuestionType.normal) {
                    this.logPop(helper.Const.popQuestionLogType.timing, question, currentTime);
                }

                var that = this;
                var bindConfirm = (function test(question) {
                    return function () {
                        $.blockUI();
                        // 保存数据
                        that.hbNb.saveAnswer().then(function (data) {
                            if (!data) {
                                helper.error("exam Service result is undefined!");
                                return;
                            }
                            var result = data.info.correct;
                            that.hbNb.markResult();
                            question.answerTimes = question.answerTimes || 0;
                            question.answerTimes++;
                            question.answerResult = result;
                            callback && callback()
                            that.validateCallback(result, single, question);
                        });
                    }
                })(question);

                if (this.popQuestionState.show) {
                    this.modal = null;
                }

                if (!this.modal) {
                    var options = {
                        //确认按钮关闭
                        closeOnConfirm: false,
                        //取消按钮关闭窗口
                        closeOnCancel: false,
                        //esc关闭窗口
                        closeOnEscape: false,
                        //任意键关闭窗口
                        closeOnOutsideClick: false
                    };

                    this.modal = createUI('question_remodal').remodal(options);
                }

                // 取消绑定事件， 处理在上面绑定的时候作用域里面的数据内容不会跟着外层的数据模型改变
                $(document).off('confirmation', '.remodal');
                $(document).off('cancellation', '.remodal');

                // 绑定
                that.bindConfirm(function () {
                    bindConfirm();
                });

                that.hideCancel();
                showMessage("");

                that.bindCancel(function () {
                    that.popQuestionState.show = false;
                    // to delete
                    question.popped = true;
                    if (question.popQuestionType === 'notPoppedQuestion') {
                        that.notPoppedQuestions.splice(helper.findIndex(that.notPoppedQuestions, question), 1);
                    }

                    that.modal.close();
                    hideAnswer();
                    single.playCurrent();

                    callback && callback()
                });

                that.open();
                loadQuestion(that, question.id, that.options.examServiceUrl);
                return this;
            };

            this.open = function () {
                this.showConfirm();
                this.modal.open();
            };

            this.fadeOut = function (message, single, question) {
                var modal = this.modal;
                var timeClose = this.options.config.timeClose;
                question.popped = true;
                if (question.popQuestionType === 'notPoppedQuestion') {
                    that.notPoppedQuestions.splice(helper.findIndex(that.notPoppedQuestions, question), 1);
                } else {
                    this.ladyFirst = false;
                }

                if (me.notPoppedQuestions.length > 0) {

                    var tempQuestion = me.notPoppedQuestions[0];

                    that.fadeIn(tempQuestion, single);

                } else {

                    if (timeClose > 0) {
                        showMessage((message || "") + timeClose + "秒后关闭。");
                        timeClose--;
                        this.hideConfirm();
                        var fadeOutId = setInterval(function () {
                            if (timeClose <= 0) {
                                that.popQuestionState.show = false;
                                question.popped = true;
                                modal.close();
                                single.playCurrent();
                                showMessage("");
                                window.clearInterval(fadeOutId);
                            } else {
                                showMessage((message || "") + timeClose + "秒后关闭。");
                            }
                            timeClose--;
                        }, 1000);
                    }
                    else {
                        showMessage(message);

                        if (timeClose !== 'userClick') {
                            setTimeout(function () {
                                that.popQuestionState.show = false;
                                question.popped = true;
                                showMessage("");
                                hideAnswer();
                                modal.close();
                                single.playCurrent();
                            }, 800);
                        } else {
                            this.hideConfirm();
                            this.showCancel();
                        }
                    }
                }

                return this;
            };
            this.resetToggle = function () {
                this.lastToggleTs = -3;
            };
            this.showConfirm = function () {
                getConfirmButton().show();
            };
            this.hideConfirm = function () {
                getConfirmButton().hide();
            };
            this.showCancel = function () {
                getCancelButton().show();
            }
            this.hideCancel = function () {
                getCancelButton().hide();
            }
            this.bindConfirm = function (fn) {
                if (typeof fn !== "function") window.console.log("fn is must function");
                $(document).on('confirmation', '.remodal', fn);
            };
            this.bindCancel = function (fn) {
                if (typeof fn !== "function") window.console.log("fn is must function");
                $(document).on('cancellation', '.remodal', fn);
            };
            this.destroy = function () {
                $(document).off('confirmation', '.remodal');
                $(document).off('cancellation', '.remodal');
            }
        }

        QuestionUI.prototype.mistakeOnPopQuestionClose = function (player, type) {
            // 判断是已经有一个弹窗出来， 如果弹窗没有关闭则不会播放
            if (this.popQuestionState.show) {
                if (player.getState() === 'playing') {
                    if (this.popQuestionState.popTime === player.getTime() && type === 'seek') return;
                    helper.log('系统显示有一个弹窗未正常关闭，  不能正常播放下去');
                    player.play(this.popQuestionState.popTime);
                    player.pause();
                }
            }
        }
        /**
         * 构建弹窗模型
         * @param modalId
         * @returns {JQuery|*}
         */
        function createUI(modalId) {
            var html = "<div class=\"remodal\" id=\"" + modalId + "\">"
                + "<p id='modal-content'>"
                + "</p>"
                + "<p id='modal-answer' style='color:blue; text-align: left;'></p>"
                + "<br>"
                + "<p data-remodal-message-id='modal-message' style='color:red;margin-top: 5px'></p>"
                + "<button data-remodal-action=\"confirm\" class=\"remodal-confirm\">确定</button>"
                + "<button data-remodal-action=\"cancel\" class=\"remodal-cancel\">关闭窗口</button>"
                + "</div>";
            var $modalDiv = $('#' + modalId);
            if ($modalDiv.length <= 0) {
                $(html).appendTo(document.body);
                $modalDiv = $('#' + modalId);
            }
            return $modalDiv;
        }

        /**
         * 变更弹窗内容
         * @param questionHTML
         */
        function changeContent(questionHTML) {
            $('#modal-content').html(questionHTML);
        }

        /**
         * 显示信息
         * @param message
         */
        function showMessage(message) {
            $('[data-remodal-message-id=modal-message]').each(function (i, x) {
                $(x).html(message);
            });
        }

        /**
         * 显示答案
         * @param answer
         * @returns {*|jQuery}
         */
        function showAnswer(answer) {
            if (answer instanceof Array) helper.log("answer is not a Array!");
            return $('#modal-answer').html("正确答案：" + answer.toString()).show();
        }

        /**
         * 隐藏答案
         * @returns {*|jQuery}
         */
        function hideAnswer() {
            return $('#modal-answer').html("").hide();
        }

        /**
         * 获取确定按钮
         * @returns {*|jQuery|HTMLElement}
         */
        function getConfirmButton() {
            return $('[data-remodal-action=confirm]');
        }

        function getCancelButton() {
            return $('[data-remodal-action=cancel]');
        }

        /**
         * 加载外部文件路径
         * @param basePath
         * @returns {string}
         */
        function getOutSideJs(basePath) {
            return helper.getPath(basePath) + helper.Const.File.exam;
        }

        /**
         * 加载题目
         * @param questionUI
         * @param questionId
         */
        function loadQuestion(questionUI, questionId, serviceUrl) {

            var markers = [];
            if (questionUI.options.context.markers && helper.isArray(questionUI.options.context.markers)) {
                for (var i = 0; i < questionUI.options.context.markers.length; i++) {
                    var item = questionUI.options.context.markers[i];
                    markers.push({
                        type: item.key,
                        objectId: item.value
                    })
                }
            }

            var outModule = getOutSideJs(serviceUrl);

            require([outModule], function () {
                questionUI.hbNb = new HB_NB_exam({
                    target: 'modal-content', // 要将试题内容放置的容器  '#exam', 'exam' , $('#exam')
                    server: questionUI.options.examServiceUrl, // 服务保存地址
                    params: {
                        quizSourceType: questionUI.options.config.mode == 1 ? 2 : 1,// 1 或者2 （1: 来源数据库题****库, 2: 随机生成试题） // 必须提供
                        questionId: questionId, // 必须参数 // 试题id
                        userId: questionUI.options.context.userId, // 必须参数 // 用户id
                        platformId: questionUI.options.context.platformId, // *
                        platformVersionId: questionUI.options.context.platformVersionId, // *
                        projectId: questionUI.options.context.projectId, // *
                        subProjectId: questionUI.options.context.subProjectId, // *
                        unitId: questionUI.options.context.unitId, // *
                        organizationId: questionUI.options.context.organizationId,
                        courseId: questionUI.options.context.courseId,
                        courseWareId: questionUI.options.context.courseWareId,
                        mediaId: questionUI.options.context.mediaId,
                        objectList: questionUI.options.apiType === 'Marker' ? markers : [
                                {
                                    objectId: questionUI.options.context.objectId,
                                    type: questionUI.options.context.objectType
                                }
                            ],

                        sourceId: questionUI.options.context.sourceId
                    },
                    events: questionUI.options.message.noAnswerCallback
                });
            });

        }

        return QuestionUI;
    });
