/**
 * cameras - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v1.0.2
 * @link 
 * @license ISC
 */
define([
        "./common/util",
        "./widgets/dialog",
        "./widgets/button",
        "./plugins/webcam/webcam",
        "cropper"
    ],
    function (Util, Dialog, Button, Webcam) {
        'use strict';

        var util = new Util(),
            events = {
                live: 'live',
                error: 'error',
                compare: 'compare',
                upload: 'upload'
            };

        function apply(event, arg) {
            return !util.isUndefined(event) && util.isObject(event) && util.isFunction(event.callback) && event.callback.apply(this, arg);
        }

        function Cameras(options) {
            this.options = $.extend({
                cropperAble: true,
                dealWay: 'truncate',
                aspectRatio: 5 / 7,
                uploadUrl: './',
                cameraSet: {
                    enable_flash: true,
                    force_flash: false,
                    flip_horiz: false,
                    fps: 30,
                    swfURL: '',
                    flashNotDetectedText: '',
                    unfreeze_snap: true,
                    upload_name: 'webCam',
                    image_format: 'jpeg',
                    jpeg_quality: 100
                }
            }, options, true);

            config.call(this, null);

            this.eventsQueue = [];

            this.camerasLoad;

            this.camerasContainer =
                createUI.call(this, this.camerasLoad);

            this.uiInfo = this.options.takeOver || this.camerasContainer.uiInfo;

            this.init(this.camerasContainer);

            Webcam.setFlashCanvasPath((this.options.libPath || '/bower_components') + '/cameras/src/js/plugins/flashcanvaspro/');

            this.load();
        }

        /**
         *
         */
        function config() {
            if (!util.isUndefined(Webcam)) {
                Webcam.set(this.options.cameraSet);
            }
        }

        Cameras.prototype = {

            init: function (dialog) {
                var me = this;
                Webcam.on('live', function () {

                    me.camerasLoad = 200;

                    apply(me.getEvent(events.live));
                });

                Webcam.on('error', function (error) {
                    if (!dialog.isTakeOver()) {
                        dialog.camerasOccur(false);
                    }

                    if ('FlashError' === error.name) {
                        me.camerasLoad = 500;

                        apply(me.getEvent(events.error));
                    }
                });

                Webcam.on('load', function () {

                    me.camerasLoad = 100;
                    if (!dialog.isTakeOver()) {
                        dialog.camerasOccur(true);
                    }
                })
            },

            reset: function () {
                this.camerasContainer.events.recapture.call(this.camerasContainer);
            },

            destroy: function () {
                Webcam && Webcam.reset();
            },

            getEvent: function (eventName) {

                var queueLen = this.eventsQueue.length;

                for (var i = 0; i < queueLen; i++) {
                    var queItem = this.eventsQueue[i];
                    if (queItem.eventName === eventName) {
                        return queItem;
                    }
                }
            },

            on: function (eventName, fn) {
                var addOne = {eventName: eventName, callback: fn},
                    hasOne = this.getEvent(eventName);

                var me = this;
                if (!hasOne) {
                    this.eventsQueue.push(addOne);
                } else {
                    var callback = hasOne.callback;
                    hasOne.callback = function () {
                        callback.apply(me, arguments);
                        fn.apply(me, arguments);
                    }
                }

                return this;
            },

            /**
             * 拍照
             * @returns {*}
             */
            capture: function () {
                var defer = $.Deferred(),
                    me = this,
                    $img;

                var dialog = me.camerasContainer;

                if (!dialog.isTakeOver()) {
                    $img = dialog.preview();
                } else {
                    $img = $('#' + me.uiInfo.cropperContainerId)
                }

                if (me.camerasLoad !== 200) {
                    defer.reject();
                    return defer;
                }

                $img.unbind('load');

                $img.load(function () {
                    defer.resolve(me.imageUrl);
                    if (me.deleteUrl) {
                        util.ajax(me.deleteUrl);
                    }
                });

                $img.prop('src', '');

                function doResult(imageUrl) {
                    apply(me.getEvent('capture'), [me, me.imageData]);
                    $img.prop('src', imageUrl);
                    if ($img && $img.length > 0 && me.options.cropperAble) {
                        $img.cropper({
                            dragmode: 'move',
                            aspectRatio: me.options.aspectRatio,
                            preview: '#' + me.uiInfo.cropperPreview
                        }).cropper('replace', imageUrl);
                    }
                    me.imageUrl = imageUrl;
                }

                if (me.camerasLoad === 200) {
                    Webcam.snap(function (data_uri) {
                        me.imageData = data_uri;
                        me.deleteUrl = undefined;
                        dialog.imageData = me.imageData;
                        // 如果是ie8， 则将执行这一个解决方案， 将base64先上传到服务器，转成image生成imageurl到前端，展示
                        // ie8下面base64过长在src上面显示导致图片显示不出来
                        if (util.isIe8()) {
                            me.mustDelete = true;
                            var sourceUrl = me.options.captureUrl ? me.options.captureUrl : (me.options.uploadUrl.substring(0, me.options.uploadUrl.lastIndexOf('/')) + '/uploadTempBase64Image'),
                                imageUrl = me.options.previewUrl ? me.options.previewUrl : (me.options.uploadUrl.substring(0, me.options.uploadUrl.lastIndexOf('/')) + '/previewTempBase64Image'),
                                // deleteTempBase64Image/
                                deleteUrl = me.options.deleteUrl ? me.options.deleteUrl : (me.options.uploadUrl.substring(0, me.options.uploadUrl.lastIndexOf('/')) + '/deleteTempBase64Image');

                            util.ajax(sourceUrl, {
                                base64Data: data_uri.split(',')[1],
                                context: me.options.context
                            }, function (data) {
                                data = data.replace(/\"/g, '');
                                me.deleteUrl = deleteUrl + '?id=' + data;
                                imageUrl += '?id=' + data;
                                doResult(imageUrl);
                            })
                        } else {
                            doResult(data_uri);
                        }
                    });
                } else {
                    defer.reject({
                        code: me.camerasLoad,
                        message: '请检查摄像头'
                    })
                }

                return defer;
            },

            /**
             * 上传
             * @returns {*}
             */
            upload: function () {
                var me = this;

                if (!this.imageData) {
                    return;
                }
                var defer = $.Deferred();

                var $img = $('#' + this.uiInfo.cropperContainerId)
                this.cropperData = {};

                if ($img.length > 0) {
                    this.cropperData = $img.cropper('getData');
                }

                this.cropperData.type = this.options.dealWay;
                util.ajax(this.options.uploadUrl, {
                    base64Data: this.imageData.split(',')[1],
                    context: this.options.context,
                    needOperate: [this.cropperData]
                }, function (data) {
                    apply(me.getEvent(events.upload), [data, me.camerasContainer]);

                    if (me.options.compareUrl) {
                        var imageUrl;
                        if (data.convertResult && util.isArray(data.convertResult)) {
                            imageUrl = data.convertResult[0].url;
                        } else {
                            imageUrl = data.url;
                        }
                        util.ajax(me.options.compareUrl, {
                            context: JSON.stringify(me.options.context),
                            imageUrl: imageUrl,
                            compareData: me.options.compareData
                        }, function (compareData) {
                            if (compareData.info) {
                                if (compareData.info.isSimilar) {
                                    me.camerasContainer.tip('success');
                                } else {
                                    me.camerasContainer.tip('failure');
                                }
                                defer.resolve();
                            } else {
                                me.camerasContainer.notification('failure', '比对失败!');
                                defer.reject();
                            }

                            apply(me.getEvent(events.compare), [compareData.info, me.camerasContainer]);
                        }, function () {

                            me.camerasContainer.notification('failure', '比对发生系统故障!');
                            defer.reject();
                        })
                    } else {
                        me.camerasContainer.notification('success', '上传成功!');
                        defer.resolve();
                    }
                }, function () {
                    defer.reject();
                    me.camerasContainer.notification('failure', '上传发生系统故障!');
                });

                return defer;

            },

            /**
             * 加载摄像机
             */
            load: function () {
                Webcam.attach(this.uiInfo.containerId);
            },

            get_$dialog: function () {
                return this.camerasContainer;
            }

        };

        function createUI(code) {
            var me = this;

            me.$dialog = new Dialog({
                camerasCode: me.camerasLoad,
                takeOver: !!this.options.takeOver,
                closeAble: this.options.closeAble,
                Webcam: Webcam,
                events: {
                    upload: function (e, imageData) {
                        var getData = this.preview()
                            .cropper('getData')
                        this.cropperData = getData;
                        return me.upload(me.imageData);
                    },
                    reload: function () {
                        this.camerasOccur(true);
                        me.load();
                    },
                    capture: function (event) {
                        event.preventDefault();
                        return me.capture();
                    }
                },
                canCapture: function () {
                    return me.camerasLoad === 200;
                }
            });
            return this.$dialog.init()
        }

        return Cameras;

    });