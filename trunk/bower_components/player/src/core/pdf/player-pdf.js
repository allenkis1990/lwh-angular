/**
 * Created by 亡灵走秀 on 2017/2/10.
 */
define([
        '../common/components/player-control/player-control',
        './operationIE8',
        './operation', '../../common/helper'],
    function (PlayerControl, pdfIEPlayer, pdfPlayer, helper) {
        'use strict';

        var pdf = {
            init: function (bond) {
                $.extend(this, bond.api);
                var player;
                if (helper.isIE8()) {
                    player = pdfIEPlayer.extend.call(this);
                } else {
                    player = pdfPlayer.extend.call(this);
                    player.createPDF(bond._launchStudy);
                }
                return player;
            },

            // ie8下面弹窗被iframe覆盖， 在弹窗之前将iframe隐藏掉
            hidePdfContainer: function () {
                this.playerController.uiAppendToEle && this.playerController.uiAppendToEle.hide();
            },

            showPdfContainer: function () {
                this.playerController.uiAppendToEle && this.playerController.uiAppendToEle.show();
            },

            createPlayerController: function (launchStudy, container, core) {
                var me = this;
                // 进度到100的时候不构建播放条 // 播放类型必须为pdf
                if (launchStudy.type !== helper.playType.three) {
                    me.playerController = new PlayerControl({
                        container: container,
                        core: core,
                        launchStudy: launchStudy,
                        schedule: Math.floor(( parseFloat(launchStudy.core.studySchedule / 100) ) * launchStudy.options.docTime),
                        totalTime: launchStudy.options.docTime,
                        events: {
                            timeListen: function () {
                                if (launchStudy.interceptConfig.isEnable) {
                                    launchStudy.event.frameListen(me.playerController.getTime(), me);
                                }
                            }
                        },
                        event: launchStudy.event
                    });

                    this.player = me.playerController;

                    me.streamCompleted && me.streamCompleted(me.playerController)
                }
            }
        };
        return pdf;
    });