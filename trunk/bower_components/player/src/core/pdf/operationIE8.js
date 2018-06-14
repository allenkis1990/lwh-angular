﻿
/**
 * Plug-in Name:operationIE8
 * Plug-in Description:defined the api of pdf(IE8) operation
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2015/04/28
 */

define([
    './pdfobject',
    '../common/player-timer',
    '../../common/helper'
], function (PDFObject, TimerFactory, helper) {
    var win = window,
        doc = document;

    var pdfIE8 = {
        type: "pdfIE8",
        /**
         * 当前定时器工厂
         */
        __timerFactory: undefined,
        player: "",
        initPlayer: function (launchStudy) {
            var that = this;
            if (that.__timerFactory) that.__timerFactory.destroy();

            var container = doc.getElementById(launchStudy.options.containerId);
            if (container == null || container == undefined) {
                container = doc.createElement("div");
                container.id = "pdf_container_IE8";
                container.style.width = isNaN(launchStudy.options.containerId) ? 640 : launchStudy.options.width;
                container.style.height = isNaN(launchStudy.options.height) ? 640 : launchStudy.options.height;
                //container.contentWindow.document.appendChild(pdfContainer);
                $('body', doc).append(container);
            }

            var realUrl = "";

            if (launchStudy.extend.studyMode == 1) {
                if (launchStudy.core.studyStatus != 2 || launchStudy.core.studyMode == 1) {
                    if (launchStudy.extend.type == 'three') {
                        realUrl = launchStudy.extend.lessonDocument[0].path;
                    }
                    else {
                        realUrl = launchStudy.interaction.streamHost + launchStudy.interaction.streamPath;
                    }

                    that.__timerFactory = new TimerFactory();
                    //launchStudy.objectives.policy.intervalTime
                    that.__timerFactory.create(helper.Const.Timing.commit, launchStudy.objectives.policy.intervalTime * 1000, function () {
                        that.LMSCommit('play');
                        helper.log("pdfIE8 commit");
                    });
                }
            } else {
                if (launchStudy.extend.type == 'three') {
                    realUrl = launchStudy.extend.lessonDocument[0].path;
                }
                else {
                    realUrl = launchStudy.interaction.streamHost + launchStudy.interaction.streamPath;
                }
            }

            var myPDF = new PDFObject({
                id: container.id,
                iframeId: launchStudy.options.containerId,
                width: launchStudy.options.width,
                height: launchStudy.options.height,
                url: realUrl,
                pdfOpenParams: {
                    view: 'Fit'
                },
                downLoadFileUrl: launchStudy.downFile.fileUrl,
                downLoadUrl: launchStudy.downFile.fileDownloadUrl
            });

            myPDF.embed(container.id);

            //that.__timerFactory.get(helper.Const.Timing.commit).start();
            that.player = myPDF;
            if (!that.player.pluginTypeFound) {
                return;
            }

            if (launchStudy.extend.studyMode === helper.playMode.learn) {
                this.createPlayerController(launchStudy, $(container), this);
            }

            if (that.initCompleted) that.initCompleted(that);
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

        /**
         * 销货当前对象
         */
        destroy: function () {
            if (this.__timerFactory)
                this.__timerFactory.destroy();
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
    var coreObj = {
        init: function (api) {
            return $.extend({}, pdfIE8, api);
        },
        extend: function () {
            return $.extend({}, pdfIE8, this, true);
        }
    };
    return coreObj;
});
