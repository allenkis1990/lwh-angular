/**
 * Created by wengpengfei on 2016/11/8.
 *
 *  艾希
 */
define(['cameras', '../../common/helper'],

    function (Cameras, Helper, WebCam) {
        'use strict';

        window.Webcam = WebCam;

        function Ashe(options) {

            this.options = options;

            this.init(options);
        }

        var mode = {
            random: 0,
            fixed: 1,
            average: 2,
            takeover: 3
        }

        /**
         *
         * @param player
         * @constructor
         */
        function AsheTiming(player) {

            var AsheTimePoints = this.AsheTimePoints,
                that = this;

            player.__timerFactory.create('Ashe', 1000, function () {
                var time = Math.floor(player.player.getTime());
                if (AsheTimePoints && AsheTimePoints.length > 0) {

                    var findOut = Helper.findIndex(AsheTimePoints, {time: time}, 'time') || that.protectPopCameras[0];

                    if (findOut && !findOut.popped) {
                        that.popCamerasState.pop = findOut;
                        // 如果摄像头已经被初始化了则不会再弹
                        if (!that.cameras) {
                            that.openCamera();
                            player.player.pause();

                            logCameraPop.call(that, 4, findOut);
                        }
                    }
                }
            });

            player.__timerFactory.create('AsheProtect', 5000, function () {
                var time = Math.floor(player.player.getTime());
                Helper.log('camera pro : ' + that.protectPopCameras.length + '....');
                Helper.forEach(AsheTimePoints, function (item) {
                    if (item.time < time && !item.popped && !Helper.findIndex(that.protectPopCameras, {time: item.time}, 'time')) {
                        item.popType = 'miss';
                        item.$index = that.protectPopCameras.length;
                        that.protectPopCameras.push(item);
                    }
                })
            });
        }

        /**
         *
         * @type {{constructor: Ashe, init: Ashe.init, close: Ashe.close, genAsheData: Ashe.genAsheData, openCamera: Ashe.openCamera}}
         */
        Ashe.prototype = {
            constructor: Ashe,
            init: function (options) {
                this.options = options;

                this.options = $.extend({}, options);

                this.popCamerasState = {};

                this.protectPopCameras = [];

                this.cameraConfig = options.cameraConfig;
                // 默认随机10秒
                this.mix = this.cameraConfig.mix || 10;

                // 随机时间点拍照模式
                this.AsheTimePoints = this.genAsheData();

                AsheTiming.call(this, this.options.player);

                logCameraPop.call(this, 3);

                // return this;
                return this;
            },

            /**
             * 构造弹摄像头的数据时间点
             * @returns {Array}
             */
            genAsheData: function () {
                var AsheTimePoints = [],
                    karma,
                    i = 1,
                    totalTime = this.options.player.player.getDuration();

                // 随机弹窗
                // this.cameraConfig.duration 代表次数
                if (this.cameraConfig.captureMode === mode.random) {

                    this.cameraConfig.duration = this.cameraConfig.duration || totalTime / Math.floor((totalTime * 0.25)) // 如果随机弹的话没有提供次数默认为总时长/总时长乘以0.25的时长

                    for (i; i <= this.cameraConfig.duration; i++) {
                        pushAshe.call(this, AsheTimePoints, totalTime);
                    }

                    AsheTimePoints = AsheTimePoints.sort(function (prev, next) {
                        var _prev = parseInt(prev.time, 10),
                            _next = parseInt(next.time, 10);
                        if (_prev < _next) {
                            return -1;
                        } else if (_prev > _next) {
                            return 1
                        } else {
                            return 0
                        }
                    });

                    // 固定时间段拍照模式
                } else if (this.cameraConfig.captureMode === mode.fixed) {

                    // 固定时间段， 此时 duration 表示为固定时间段 每隔 capture 时间去弹将所有时间除
                    karma = Math.floor(totalTime / this.cameraConfig.duration);

                    for (i; i <= karma; i++) {
                        AsheTimePoints.push({
                            time: this.cameraConfig.duration * (i)
                        });
                    }
                    // 平均时间点拍照模式 此时的duration表示 平均值
                } else if (this.cameraConfig.captureMode === mode.average) {
                    var timePoint = Math.floor(totalTime * (this.cameraConfig.duration / 100)),
                        karma = Math.floor(totalTime / timePoint);

                    for (i; i <= karma; i++) {
                        AsheTimePoints.push({
                            time: timePoint * (i)
                        });
                    }
                } else if (this.cameraConfig.captureMode === mode.takeover) {

                    // 如果是takeover ， 并且类型是percent 表明时间点为百分比形式
                    if (this.cameraConfig.takeover.type === 'percent') {
                        // 将百分比换算成时间点
                        Helper.forEach(this.cameraConfig.takeover.asheTimePoints, function (item) {
                            AsheTimePoints.push({
                                sourceTime: item.time,
                                time: Math.floor((item.time / 100) * totalTime)
                            });
                        })
                    } else {
                        AsheTimePoints = this.cameraConfig.takeover.asheTimePoints;
                    }

                    // 如果构造时间点的构造器是函数， 将构造时间点集合的处理交给外层自己处理
                    if (Helper.isFunction(this.cameraConfig.takeover.generator)) {
                        AsheTimePoints = this.cameraConfig.takeover.generator();
                    }
                }

                // 提供此参数将会在播放器初始化的时候将摄像头弹出来
                if (this.cameraConfig.begin && AsheTimePoints.length > 0) {
                    if (AsheTimePoints[0].time !== 0) {
                        AsheTimePoints.unshift({
                            time: 0
                        })
                    }
                }
                return AsheTimePoints;
            },

            openCamera: function () {
                var me = this;
                this.cameraConfig.context = {
                    platformId: this.options.context.plmId,
                    platformVersionId: this.options.context.pvmId,
                    projectId: this.options.context.prmId,
                    subProjectId: this.options.context.subPrmId,
                    unitId: this.options.context.unitId,
                    organizationId: this.options.context.orgId
                };

                this.cameraConfig.compareData = this.cameraConfig.compareData || {};

                this.cameraConfig.compareData.popInfo = {
                    popCaptureTime: this.cameraConfig.takeover.type === 'percent' ? me.popCamerasState.pop.sourceTime : me.popCamerasState.pop.time,

                    // mode: this.cameraConfig.takeover.type === 'percent'?'百分比': '时间点',
                    playTime: Math.floor(this.options.player.player.getTime()),
                    captureMode: this.cameraConfig.captureMode
                };

                if (this.cameras) {
                    return this.cameras;
                } else {
                    this.cameras = new Cameras(this.cameraConfig);
                    this.cameras.on('upload', function (result) {
                        if (Helper.isFunction(me.options.uploadSuccess)) {
                            me.options.uploadSuccess();
                        }
                    })

                        .on('compare', function (result, cameraDialog) {
                            if (result && result.isSimilar) {
                                cameraDialog.close();
                                me.popCamerasState.pop.popped = true;
                                if (me.popCamerasState.pop.popType === 'miss') {
                                    me.protectPopCameras.splice(me.popCamerasState.pop.$index, 1);
                                }
                                me.cameras = null;
                                me.popCamerasState.pop = null;
                                if (Helper.isFunction(me.options.compareSuccess)) {
                                    me.options.compareSuccess();
                                }
                            }
                        })
                    return this.cameras;
                }
            }
        };

        /**
         *
         */
        function logCameraPop(type, camera) {

            var sdkConfig = this.options.sdkConfig;

            var objList = [];

            var commitLogInfo = {
                userId: sdkConfig.context.usrId,
                courseId: sdkConfig.core.courseId,
                courseWareId: sdkConfig.core.courseWareId,
                mediaId: sdkConfig.core.multimediaId,
                type: type
            };

            if (Helper.checkApiType(sdkConfig.apiType)) {
                for (var i = 0; i < sdkConfig.context.markers.length; i++) {
                    var mark = sdkConfig.context.markers[i];
                    objList.push({
                        objectId: mark.value,
                        type: mark.key
                    })
                }
                commitLogInfo.objectList = objList;
            } else {
                commitLogInfo.object = {
                    objectId: sdkConfig.context.objectId,
                    objectType: sdkConfig.context.objectType
                }
            }

            // 摄像机弹窗initMessagge

            if (type === 3) {
                commitLogInfo.initMessage = JSON.stringify(this.cameraConfig);
            } else if (type === 4) {
                commitLogInfo.initMessage = JSON.stringify(camera);
            }

            Helper.ajax(this.cameraConfig.examServiceUrl + '/web/popQuiz/popQuestionLog', commitLogInfo);
        }

        function pushAshe(AsheTimePoints, total) {
            var num = Math.floor((Math.random() * total ) + 1) + (this.mix ? this.mix * AsheTimePoints.length : 0);
            if (Helper.findIndex(AsheTimePoints, {time: num}, 'time')) {
                pushAshe.call(this, AsheTimePoints, total);
            } else {
                AsheTimePoints.push({
                    time: num
                });
            }
        }

        return Ashe;
    });
