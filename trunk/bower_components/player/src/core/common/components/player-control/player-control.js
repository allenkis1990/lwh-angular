/**
 * Created by 亡灵走秀 on 2017/2/9.
 */

define(['../../../../common/helper'], function (helper) {
    'use strict';

    function PlayerControl(options) {

        this.init(options);

        this.eventHandle('init');
    }

    function clearInterval(timer) {

        timer && window.clearInterval(timer);
    }

    function animate(obj, opts) {
        return obj.stop().animate(opts);
    }

    PlayerControl.prototype = {

        constructor: PlayerControl,
        $el: {},

        uiAppendToEle: '',

        init: function (options) {
            this.options = options;
            this.uiAppendToEle = options.container;
            this.totalTime = options.totalTime || 0;
            this.timeSchedule = options.schedule || 0;
            this.whoAttach = this.uiAppendToEle;
            var me = this;

            function togglePlayerController(opacity) {
                me.delayHidePlayController_timer && window.clearTimeout(me.delayHidePlayController_timer);

                animate(this, {
                    opacity: opacity
                })
            }

            function createDomUi() {
                var uiHtml = '<div class="cont-container">' +
                    '<div class="current-time">00:00:00</div>' +
                    '<div class="middle">' +
                    '<div class="progress-container">' +
                    '<div class="progress"></div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="total-time"></div> ' +
                    '</div>';

                var te = $(uiHtml);

                (me.whoAttach || te).bind('mouseenter mouseleave', function (event) {
                    togglePlayerController.call(te, event.type === 'mouseenter' ? 1 : 0)
                })

                return te
            }

            this.uiAppendToEle.after(this.$el.container = createDomUi());

            // 延迟1.5秒隐藏播放条

            this.delayHidePlayController_timer && window.clearTimeout(this.delayHidePlayController_timer);

            this.delayHidePlayController_timer = window.setTimeout(function () {
                animate(me.$el.container, {
                    opacity: 0
                })
            }, 1500)

            this.getElements();
            this.play();
        },

        getDuration: function () {
            return this.totalTime;
        },

        getElements: function () {
            this.$el.currentTime = this.$el.container.find('.current-time');
            this.$el.totalTime = this.$el.container.find('.total-time');
            this.$el.progress = this.$el.container.find('.progress');

            this.renderValue();
        },

        renderValue: function () {
            this.$el.totalTime.html(helper.toTime(this.totalTime));
        },

        play: function () {
            var me = this;

            this.stop();

            clearInterval(this.timing_timer);

            me.eventHandle('playing');

            this.timing_timer = window.setInterval(function () {

                if (me.timeSchedule >= me.totalTime) {
                    me.stop();
                    me.$el.progress.css({width: '100%'});
                    // 如果是
                    if (me.timingState && me.schedule() == 100) {
                        me.eventHandle('end');
                        me.options.core.LMSCommit('end');
                        me.timingState = false;
                    }
                    me.timeSchedule = me.totalTime;
                    me.$el.currentTime.html(helper.toTime(me.totalTime));
                    return;
                } else {
                    animate(me.$el.progress, {
                        width: me.schedule() + '%'
                    });

                    me.timeSchedule++;
                    me.timingState = true;
                    me.$el.currentTime.html(helper.toTime(me.timeSchedule));
                    me.options.events.timeListen && me.options.events.timeListen();
                }
            }, 1000)
        },

        getTime: function () {
            return this.timeSchedule;
        },

        eventHandle: function (method) {
            this.playerState = method;
            var core = this.options.launchStudy;
            if (this.options.event) {
                switch (method) {
                    case "end":
                        this.options.event.endPlay && this.options.event.endPlay('end', this);
                        break;
                    case "pause":
                        this.options.event.statePlay && this.options.event.statePlay('pause', this);
                        break;
                    case "playing":
                        this.options.event.statePlay && this.options.event.statePlay('playing', this);
                        break;
                    case "seek":
                        this.options.event.statePlay && this.options.event.statePlay('seek', this);
                        break;
                    case "init":
                        this.options.event.initPlay && this.options.event.initPlay(this, core.core);
                        this.options.event.startPlay && this.options.event.startPlay('start', this);
                        break;
                }
            }

            if (this.options[method]) {
                this.options[method]();
            }
        },

        getState: function () {
            return this.playerState;
        },

        schedule: function () {
            if (this.totalTime === 0) {
                return 100;
            }
            return Math.floor((parseInt(this.timeSchedule) / parseInt(this.totalTime)) * 100)
        },

        pause: function () {
            this.eventHandle('pause');
            this.stop();
        },

        stop: function () {
            this.eventHandle('stop');
            clearInterval(this.timing_timer);
            this.timing_timer = null;
        },

        restart: function () {
            this.eventHandle('playing');
            this.play();
        },

        destroy: function () {
            this.eventHandle('destroy');
        },
        initPlayer: function () {

        }
    };

    if (!Function.prototype.bind) {
        Function.prototype.bind = function () {

        }
    }

    return PlayerControl;

});
