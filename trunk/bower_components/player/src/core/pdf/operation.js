﻿
/**
 * Plug-in Name:operation
 * Plug-in Description:defined the api of pdf operation
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2015/03/09
 */

define([
    '../common/player-timer',
    '../../common/helper'
], function (TimerFactory, helper) {
    "use strict";
    var win = window,
        doc = win.document,
        event = [],
        toggleEvent = {},
        button = ["sidebar", "find", "pageUp", "pageDown", "zoomOut", "zoomIn", "fullScreen", "open", "print", "downLoad", "mark", "secondarybar"],
        buttonStatus = {},
        defaultButton = {
            "sidebar": true,
            "find": true,
            "pageUp": true,
            "pageDown": true,
            "zoomOut": true,
            "zoomIn": true,
            "fullScreen": false,
            "open": false,
            "print": false,
            "downLoad": false,
            "mark": false,
            "secondarybar": true
        },
        layoutButtonMap = {
            "sidebar": "sidebarToggle",
            "find": "viewFind",
            "pageUp": "previous",
            "pageDown": "next",
            "zoomOut": "zoomOut",
            "zoomIn": "zoomIn",
            "fullScreen": "presentationMode",
            "open": "openFile",
            "print": "print",
            "downLoad": "download",
            "mark": "viewBookmark",
            "secondarybar": "secondaryToolbarToggle"
        };

    /**
     * attach button toggle's event
     * @param evtName
     * @param event
     */
    function attach(evtName, event) {
        if (typeof event !== "function") throw "event must be a function.";
        if (toggleEvent[evtName] != undefined)
            toggleEvent[evtName] = event || function () {
                };
    }

    /**
     * set button status
     * @param btnName
     * @param state
     */
    function setButton(btnName, state) {
        if (typeof state !== "boolean") throw "event must be a boolean.";
        if (buttonStatus[btnName] != undefined)
            buttonStatus[btnName] = state;
    }

    /**
     * layout the button
     */
    function layoutButton() {
        for (var b in buttonStatus) {
            try {
                doc.getElementById(layoutButtonMap[b]).style.display = buttonStatus[b] ? "inline" : "none";
            } catch (e) {
                console.log("b:" + b + ";layoutButtonMap[b]:" + layoutButtonMap[b] + ";doc.getElementById(layoutButtonMap[b]):" + doc.getElementById(layoutButtonMap[b]));
            }
        }
    }

    //defined toggle event of out side
    for (var i in button) {
        event.push("onbefore" + button[i]);
        event.push("onafter" + button[i]);

        buttonStatus[button[i]] = false;
    }

    //defined toggle event function of out side
    for (var i in event) {
        toggleEvent[event[i]] = function () {
        };
    }

    //setting default button status
    for (var b in defaultButton)
        setButton(b, defaultButton[b]);

    var __pdfCommitInterval = undefined;
    window.__goToPageInterval = undefined;

    var __pageSource = {
        index: 0,
        count: 1,
        percent: function () {
            return win.__bond.playerCore.percent(this.index, this.count);
        }
    };

    var pdf = {
        /**
         * pdf视频
         */
        type: "pdf",
        /**
         * 播放器对象
         */
        //PDFViewerApplication
        player: undefined,
        /**
         * 当前定时器工厂
         */
        __timerFactory: undefined,
        /**
         * 初始化播放器
         * @param launchStudy
         */
        initPlayer: function (launchStudy) {
            //set current study record
            //that.studyRecord = option.record;
            //when the media study will not completed,set timer
            var that = this;
            if (that.__timerFactory)
                that.__timerFactory.destroy();

            if (launchStudy.extend.studyMode == helper.playMode.learn) {
                if (launchStudy.core.studyStatus != 2 || launchStudy.core.studyMode == helper.playMode.learn) {
                    //根据上次看的记录 自动加载至页面
                    //that.player.pdfViewer.scrollPageIntoView(launchStudy.core.studyLastScale == 0 ? 1 : launchStudy.core.studyLastScale);
                    win.frames[0].window.addEventListener('pagechange', function (evt) {
                        //当前页
                        var page = win.frames[0].document.getElementById('pageNumber').value || 0;
                        //总页数
                        var pageCount = win.frames[0].PDFViewerApplication.pagesCount || 1;

                        var currentPage = __pageSource.index;
                        //当页面发生变化时
                        if (parseInt(currentPage, 10) < parseInt(page, 10))
                            __pageSource.index = parseInt(page, 10);
                        launchStudy.core.studyLastScale = parseInt(page);
                        __pageSource.count = pageCount;
                    }, true);
                    //定时器来提交数据
                    that.__timerFactory = new TimerFactory();
                    //launchStudy.objectives.policy.intervalTime
                    that.__timerFactory.create(helper.Const.Timing.commit, launchStudy.objectives.policy.intervalTime * 1000, function () {
                        that.LMSCommit('play');
                        helper.log("pdf commit");
                    });
                    var currentPage = launchStudy.core.studyLastScale == 0 ? 1 : launchStudy.core.studyLastScale;
                    //跳至上次学习的页面 因为没找到PDF初始化后的回调方法因此这边设个定时器来跳至，跳转完成后清除定时器
                    window.__goToPageInterval = window.setInterval(function () {
                        if (win.frames[0].PDFViewerApplication) {
                            var viewer = win.frames[0].PDFViewerApplication.pdfViewer;
                            if (viewer && viewer.pages.length != 0) {
                                viewer.scrollPageIntoView(currentPage);
                                win.clearInterval(window.__goToPageInterval);
                                if (that.initCompleted) that.initCompleted(that);
                                //that.__timerFactory.get(helper.Const.Timing.commit).start();
                            }
                        }
                    }, 1000)
                }
            }
            else if (launchStudy.extend.studyMode == helper.playMode.preview) {
                window.__goToPageInterval = window.setInterval(function () {
                    if (win.frames[0].PDFViewerApplication) {
                        var viewer = win.frames[0].PDFViewerApplication.pdfViewer;
                        if (viewer && viewer.pages.length != 0 && launchStudy.options.limit > 0) {
                            viewer.setPdfPage(launchStudy.options.limit);
                            win.clearInterval(window.__goToPageInterval);
                            if (that.initCompleted) that.initCompleted(that);
                            //that.__timerFactory.get(helper.Const.Timing.commit).start();
                        }
                    }
                }, 1000)
            }
        },
        initCompleted: function () {

        },
        /**
         * 创建PDF
         * @param launchStudy
         * @param fileURL
         */
        createPDF: function (launchStudy, fileURL) {
            var that = this;
            createPDF.call(this, launchStudy, fileURL);
            win.setTimeout(function () {
                that.player = win.frames[0].PDFViewerApplication;
            }, 100);
        },
        /**
         * 获取新的提交数据
         * @param launchStudy
         * @returns {core:{object},extend:{object}}
         */
        getCurrentLaunchStudyCore: function (launchStudy) {
            var record = {}, core = launchStudy.core;
            record.primaryKey = core.primaryKey;
            record.courseRecordId = core.courseRecordId;
            record.coursewareRecordId = core.coursewareRecordId;
            record.lessonId = core.lessonId;
            record.lessonLocation = core.lessonLocation;
            record.studyMode = core.studyMode;
            record.studyLastScale = core.studyLastScale;
            record.studyCurrentScale = core.studyCurrentScale;
            record.studySchedule = (this.playerController && this.playerController.schedule()) || 0;
            record.timingMode = "schedule";
            record.studyStatus = core.studyStatus;
            record.lessonStatus = 1;

            return {core: record, extend: launchStudy.context};
        },

        /**
         * 计算两个值的百分比
         * @param a
         * @param b
         * @returns {number}
         */
        percent: function (a, b) {
            var floatNumber = parseFloat(a) / parseFloat(b);
            return Math.round(floatNumber * 10000) / 100;
        },
        /**
         * 销货当前对象
         */
        destroy: function () {
            if (this.__timerFactory)
                this.__timerFactory.destroy();
        },
        /**
         * commit之后需要处理的方法
         * @param launchStudy
         */
        commitAfter: function (launchStudy) {
            var core = launchStudy.core,
                objectives = launchStudy.objectives,
                that = this;
            if (objectives.modifyPolicy) {
                that.__timerFactory.reset(helper.Const.Timing.commit, objectives.policy.intervalTime * 1000, function () {
                    that.LMSCommit();
                }).start();
                this.player.play(core.studyLastScale);
            }
            if (helper.isFunction(launchStudy.event.commitAfter)) {
                launchStudy.event.commitAfter(core, that.player);
            }
        },

        LMSInitialize: function () {

        },

        LMSCommit: function () {

        },

        LMSFinish: function () {

        },

        LMSSetValue: function (key, value) {

        },

        LMSGetValue: function (key) {

        },

        LMSGetLastError: function () {

        },

        LMSGetErrorString: function (errorCode) {

        },

        LMSGetDiagnostic: function (errorCode) {

        },
        playCurrent: function () {
            this.playerController && this.playerController.play();
            this.showPdfContainer();
        },
        pauseCurrent: function () {
            this.playerController && this.playerController.stop();
            this.hidePdfContainer();
        }
    };

    function createPDF(launchStudy, fileURL) {
        var me = this;
        var pdffileURL = fileURL || encodeURIComponent(launchStudy.interaction.streamHost + launchStudy.interaction.streamPath);
        if (launchStudy.options.startAt == null || launchStudy.options.startAt == undefined) {
            launchStudy.options.startAt = 0;
        }
        //var htmlPath = "scripts/pdf/web/viewer.html?file=" + fileURL + "&" + $.param(initData);;

        var htmlPath = (launchStudy.pdfHtmlAddress || '../core/pdf/viewer/') + "/viewer.html?file=" + pdffileURL + "&" + $.param(launchStudy.options);

        var c = document.getElementById(launchStudy.options.containerId);

        if (typeof c == "undefined" || c == null) {
            window.document.body.innerHTML = ("<iframe id='" + launchStudy.options.containerId
            + "' src='" + htmlPath + "' height='" + launchStudy.options.height
            + "' width='" + launchStudy.options.width + "' frameborder='0'></iframe>");
        } else {
            c.src = htmlPath;

            if (launchStudy.options.width == undefined || launchStudy.options.width == '') {
                c.style.width = '100%';
            } else {
                c.style.width = launchStudy.options.width;
            }

            if (launchStudy.options.height == undefined || launchStudy.options.height == '') {
                c.style.height = '100%';

            } else {
                c.style.height = launchStudy.options.height;
            }

            c.frameBorder = 0;
        }

        if (launchStudy.type === helper.playType.pdf && launchStudy.extend.studyMode === helper.playMode.learn) {
            var $frame = $(c).load(function () {
                me.createPlayerController(launchStudy, $frame, me);
            })
        }
    }

    var core = {
        init: function (api) {
            return $.extend({}, pdf, api);
        },
        extend: function () {
            return $.extend({}, pdf, this);
        }
    };
    return core;
});
