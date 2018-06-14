/**
 * 作者: 翁鹏飞
 *            --- > 亡灵走秀
 * 日期: 2015/9/14
 * 时间: 13:52
 *
 */

define(['angular', 'webuploader'],
    function (angular, WebUploader) {
        'use strict';
        var HB_WebUploader = angular.module('hb.webUploader', [])
        // 只是输出一些东西
            .run(['uploaderService',
                function (uploaderService) {
                    uploaderService.doSpecialLog('当前分片每片' + WebUploader.Base.formatSize(uploaderService.chunkSize) + '起', 'darkblue');
                    uploaderService.doSpecialLog('注册分片上传以及秒传，断点续传功能....', 'pink');
                }])
            /**
             * 服务
             */
            .provider('HB_WebUploader', [function () {
                var resource = {};
                this.setResourceSource = function (name) {
                    resource.name = name
                };
                this.$get = ['$rootScope', function ($rootScope) {
                    return {
                        getResourceInfo: function () {
                            return $rootScope[resource.name || '$$userInfo'];
                        }
                    };
                }]
            }])

        HB_WebUploader.factory('uploaderService', uploaderService);
        uploaderService.$inject = ['$timeout', '$log'];
        function uploaderService($timeout, $log) {
            var _uploaderService = {
                standard: 'small',
                superBigFileSize: 1610612736, // 1.5G
                smallFileStandard: 5242880 * 2, //10M小文件定义
                chunkSize: 52428800, // 分片大小50m
                CURRENT_HB_WU: null
            };

            _uploaderService.doSpecialLog = function (msg, type) {
                $log.log('%c' + msg, 'color:' + type);
            };

            _uploaderService.uploadComplete = function (file, response) {
                _uploaderService.CURRENT_HB_WU.trigger("uploadProgress", file, 1);
                _uploaderService.CURRENT_HB_WU.trigger("uploadComplete", file);//触发已上传事件
                _uploaderService.CURRENT_HB_WU.trigger("uploadSuccess", file, response);//触发上传成功事件
                _uploaderService.CURRENT_HB_WU.trigger("uploadFinished", file);//触发上传完成事件
            };

            _uploaderService.checkIsBigFile = function (fileSize) {
                // 大于10m的统一是大文件
                return fileSize >= _uploaderService.smallFileStandard;
            };

            _uploaderService.isIe = function () {
                return (function (ua) {
                    var ie = ua.match(/MSIE\s([\d\.]+)/) ||
                        ua.match(/(?:trident)(?:.*rv:([\w.]+))?/i);
                    return ie && parseFloat(ie[1]);
                })(navigator.userAgent);
            };

            _uploaderService.registerBigFileUpload = function (options) {
                _uploaderService.md5CheckPath = options.md5CheckPath;
                _uploaderService.blockMd5CheckPath = options.blockMd5CheckPath;

                var md5Object = new WebUploader.Runtime.Html5.Md5({});
                WebUploader.Uploader.register(
                    {
                        'before-send-file': 'beforeSendFile',
                        'before-send': 'beforeSend'
                    }, {
                        beforeSendFile: function (file) {// 在文件开始发送前进行MD5校验异步操作。是否可以秒传钩子要在create之前注册
                            var task = $.Deferred(),
                                fileSize = file.size;
                            file.guid = WebUploader.Base.guid();
                            $timeout(function () {
                                file.liveStatus = 1;
                            });
                            // 如果文件大小不超过10M的直接不执行md5或者断点续传，或者分片上传

                            file.md5 = md5Object.md5String([file.lastModifiedDate.getTime(), file.name, file.size].join('-'));

                            if (_uploaderService.checkIsBigFile(fileSize) && !_uploaderService.isIe()) {

                                _uploaderService.doSpecialLog('文件大小超过10M,并且开始执行文件的第一次md5计算', 'red');
                                var fileName = file.name;
                                $.ajax({
                                    type: "post",
                                    url: _uploaderService.md5CheckPath,
                                    data: {
                                        md5: file.md5,
                                        guid: file.guid,
                                        originalFileName: fileName,
                                        context: options.context,
                                        requestContext: options.requestContext
                                    }, cache: false,
                                    dataType: "json",
                                    success: function (data) {
                                        if (data.exists) {   //若存在，这返回失败给WebUploader，表明该文件不需要上传
                                            _uploaderService.doSpecialLog('服务器存在计算完成的文件的md5，不执行上传，实现秒传', 'red');
                                            _uploaderService.uploadComplete(file, data);
                                            _uploaderService.CURRENT_HB_WU.skipFile(file);
                                            task.reject();
                                            file.newPath = data.newPath;
                                        } else {
                                            task.resolve();
                                        }
                                    }, error: function () {
                                        task.resolve();
                                    }
                                });
                            } else {
                                $timeout(function () {
                                    file.liveStatus = 2;
                                });
                                task.resolve();
                            }
                            return $.when(task);
                        },
                        beforeSend: function (block) {//分片文件发送之前计算分片文件的MD5,并且验证该分片是否需要上传
                            var task = $.Deferred();
                            if (_uploaderService.checkIsBigFile(block.file.size) && !_uploaderService.isIe()) {
                                block.file.chunkMd5 = md5Object.md5String([block.file.lastModifiedDate.getTime(), block.file.name, block.chunk, block.file.size].join('-'));
                                var fileName = block.file.name;
                                var data = {
                                        md5: block.file.md5,
                                        guid: block.file.guid,
                                        originalFileName: fileName,
                                        size: block.file.size,
                                        context: options.context,
                                        requestContext: options.requestContext
                                    },
                                    chunks = block.chunks,
                                    chunk = block.chunk;
                                if (chunks > 1) {
                                    data.chunks = chunks;//分片数
                                    data.chunk = chunk;//当前分片号
                                    data.chunkMd5 = block.file.chunkMd5;//分片文件的md5
                                    data.chunkSize = block.blob.size;//分片文件大小
                                    $.ajax({
                                        type: "post",
                                        url: _uploaderService.blockMd5CheckPath,
                                        data: data,
                                        cache: false,
                                        dataType: "json"
                                    }).then(function (data) {
                                        if (data.exists) {
                                            task.reject();
                                        } else {
                                            task.resolve();
                                        }
                                    }, function () {
                                        task.resolve();
                                    });
                                } else {
                                    task.resolve();
                                }
                            } else {
                                task.resolve();
                            }
                            return $.when(task);
                        }
                    });
            };
            return _uploaderService;
        }

        /**
         * 文件生命过程
         * file.liveStatus {
         *                  -1,  --> 上传失败
         *                  0,   --> 文件添加到队列当中，并没有做任何操作
         *                  1,   --> 文件正在执行整个文件的md5File操作
         *                  2,   --> 整个文件的md5File成功准备上传
         *                  3,   --> 文件上传百分比完成，等待服务器响应
         *                  4    --> 文件上传百分比完成并且服务器响应成功
         *               }
         */
        HB_WebUploader.directive('hbFileUploader', HB_FileUploaderDirective);
        HB_FileUploaderDirective.$inject = ['uploaderService', '$timeout', '$log', '$parse', '$rootScope', 'HB_WebUploader'];
        function HB_FileUploaderDirective(uploaderService, $timeout, $log, $parse, $rootScope, HB_WebUploader) {
            return {
                restrict: 'AE',
                require: '?^ngModel',
                scope: {
                    onProgress: '&',
                    onSuccess: '&',
                    onFileQueued: '&',
                    onFileTypeDenied: '&',
                    onUploadStart: '&',
                    onUploadStop: '&',
                    onSave: '&',
                    multi: '=',
                    returnIsArray: '@',
                    // 大文件定义大于10M的为大文件
                    standard: '@', //big、small
                    sizeLimit: '@',
                    accepts: '@', // 'jpg,ext,txt'
                    hbFileUploader: '=',
                    params: '=?'
                },
                link: function ($scope, $element, $attr, ngModelController) {
                    if (!ngModelController) {
                        return false;
                    }

                    $scope.$on('$destroy', function () {
                        ngModelController.$setViewValue('');
                        if (uploaderService.CURRENT_HB_WU !== null) {
                            uploaderService.CURRENT_HB_WU.stop(true);
                        }

                        ngModelController.$setValidity('required', false);
                    });

                    function isAssignable(attrs, propertyName) {
                        var fn = $parse(attrs[propertyName]);
                        return angular.isFunction(fn.assign);
                    }

                    // 如果开始上传设置为多文件上传， 则将ngModel设置为数组
                    if ($scope.multi) {
                        !ngModelController.$modelValue && !angular.isArray(ngModelController.$modelValue) && (ngModelController.$setViewValue([]));
                    }
                    var resource = HB_WebUploader.getResourceInfo();
                    if (!HB_WebUploader.registered) {
                        uploaderService.registerBigFileUpload(resource);
                    }
                    HB_WebUploader.registered = true;

                    // 默认为小文件上传
                    var uploadUrl = resource.resourceServicePath,
                        flashMode = uploaderService.isIe();
                    if (!uploaderService.isIe() && checkIsBigStandard()) {
                        uploadUrl = resource.uploadBigFilePath;
                    }

                    function checkIsBigStandard() {
                        return $scope.standard === 'big';
                    }

                    function setModelValue(response) {
                        response = angular.fromJson(response.raw);
                        if (angular.isArray(ngModelController.$viewValue)) {
                            ngModelController.$viewValue.push(response);
                        } else if (angular.isObject(ngModelController.$viewValue)) {
                            ngModelController.$setViewValue(response);
                        } else {
                            if ($scope.multi) {
                                ngModelController.$viewValue.push(response);
                            } else {
                                ngModelController.$setViewValue(response);
                            }
                        }
                    }

                    var chunkSize = uploaderService.chunkSize, HB_WU,
                        formData = angular.extend({}, {
                            context: resource.context,
                            requestContext: resource.requestContext
                        }, $scope.params),
                        server = uploadUrl + '?uploadSync=true',
                        defaultConfiguration = {
                            pick: {
                                id: $element.attr('id') ? '#' + $element.attr('id') : $element,
                                innerHTML: $attr.buttonText || '选择文件',
                                multiple: false
                            },
                            timeout: 0,
                            formData: formData,
                            compress: false,
                            fileSizeLimit: $scope.sizeLimit,
                            auto: $scope.multi ? false : true,
                            swf: '/bower_components/webuploader_fex/dist/Uploader.swf',
                            server: server,
                            // 上传最大并发数: 默认---3
                            threads: 1
                        };

                    if (flashMode) {
                        uploaderService.doSpecialLog('当前模式为ie， flash专享模式', 'red');
                        defaultConfiguration.runtimeOrder = 'flash';
                    } else {
                        if (checkIsBigStandard()) {
                            defaultConfiguration.chunked = true;
                            defaultConfiguration.chunkRetry = 0;//启用分片
                            defaultConfiguration.chunkSize = chunkSize;//分片大小50MB
                        }
                    }

                    if ($scope.accepts) {
                        defaultConfiguration.accept = {
                            title: 'files',
                            extensions: $scope.accepts
                        }
                    }

                    HB_WU = WebUploader.create(defaultConfiguration);

                    HB_WU.on('uploadProgress', function (file, percentage) {
                        var nowPercentage = percentage * 100;
                        if (nowPercentage === 100) {
                            $timeout(function () {
                                file.liveStatus = 3;
                            });
                        }
                        $timeout(function () {
                            file.progress = (nowPercentage).toFixed(2);
                        });
                        $scope.onProgress && $scope.onProgress({percentage: percentage});
                    });

                    HB_WU.on('uploadSuccess', function (file, response) {
                        uploaderService.doSpecialLog('上传成功....', '#449d44');
                        file.uploadSuccess = true;
                        !$scope.multi && HB_WU.reset();
                        $timeout(function () {
                            // 服务器响应成功设置字段为响应成功。
                            file.liveStatus = 4;
                            file.newPath = response.newPath;
                            file.fileId = response.fileId;
                            file.raw = response._raw;
                            file.uploadStatus = 3;
                            setModelValue(file);
                            $scope.onSuccess && $scope.onSuccess({file: file});
                        })
                    });

                    HB_WU.on('stopUpload', function (file) {
                        $scope.onUploadStart && $scope.onUploadStop({file: file});
                        uploaderService.doSpecialLog('停止上传.....', '#c9302c');
                    });

                    HB_WU.on('uploadStart', function (file) {
                        uploaderService.doSpecialLog('开始上传.....', '#286090');
                        $scope.onUploadStart && $scope.onUploadStart({file: file});
                        $timeout(function () {
                            file.uploadBegin = true;
                            file.uploadStatus = 1;
                        })
                    });

                    //文件上传之前加上guid和md5,有分片的包括分片的md5
                    HB_WU.on('uploadBeforeSend', function (object, data, headers) {
                        if ((uploaderService.checkIsBigFile(object.file.size) || checkIsBigStandard()) && !uploaderService.isIe()) {
                            var chunks = object.chunks,
                                chunk = object.chunk;
                            uploaderService.doSpecialLog('当前分片数' + object.chunks, 'pink');
                            data.guid = object.file.guid;//整个文件guid
                            data.md5 = object.file.md5;//整个文件的md5
                            data.originalFileName = object.file.name;//原文件名

                            if (chunks > 1) {//有分片的时候要把分片数以及当前分片号,以及分片的md5和当前分片的大小传上去
                                data.chunks = chunks;//分片数
                                data.chunk = chunk;//当前分片号
                                data.chunkMd5 = object.file.chunkMd5;//分片文件的md5
                                data.chunkSize = object.blob.size;//分片文件大小
                            }
                        }
                    });

                    function isMd5ing(value) {
                        return value === 1;
                    }

                    if (isAssignable($attr, 'hbFileUploader')) {
                        $scope.hbFileUploader = {
                            localFileQueue: [],
                            name: 'hbWebUploader',
                            uploadOne: function (file) {
                                $timeout(function () {
                                    uploaderService.CURRENT_HB_WU = HB_WU;
                                    uploaderService.CURRENT_HB_WU.upload(file);
                                    file.uploadStatus = 1;
                                })
                            },
                            save: function () {
                                uploaderService.CURRENT_HB_WU = HB_WU;
                                var files = uploaderService.CURRENT_HB_WU.getFiles();
                                if (files.length <= 0) {
                                    uploaderService.doSpecialLog('上传文件队列不能为空....', 'red');
                                    return false;
                                }
                                uploaderService.CURRENT_HB_WU.upload();
                            },
                            removeOne: function (file, removeIndex) {
                                if (isMd5ing(file.liveStatus)) {
                                    uploaderService.doSpecialLog('文件正在md5校验不能从队列中删除....', 'red');
                                    return false;
                                }
                                if (file.liveStatus === 2) {
                                    window.confirm('文件正在上传确定要从队列中删除?', function () {
                                        doDelete();
                                    });
                                    return false;
                                }
                                doDelete();
                                function doDelete() {
                                    uploaderService.CURRENT_HB_WU = HB_WU;
                                    uploaderService.CURRENT_HB_WU.removeFile(file);
                                    $scope.hbFileUploader.localFileQueue.splice(removeIndex, 1);
                                }
                            },
                            reupload: function (file) {

                                uploaderService.CURRENT_HB_WU = HB_WU;
                                uploaderService.CURRENT_HB_WU.retry(file);

                            },
                            stopAll: function () {
                                uploaderService.CURRENT_HB_WU = HB_WU;
                                uploaderService.CURRENT_HB_WU.stop(true);
                            },
                            stopOne: function (file) {
                                // 当文件正在md5校验的时候， 不能进行暂停操作
                                if (isMd5ing(file.liveStatus)) {
                                    uploaderService.doSpecialLog('文件正在md5校验，请等待校验结束再进行暂停操作!', 'red');
                                    return false;
                                }
                                $timeout(function () {
                                    uploaderService.CURRENT_HB_WU = HB_WU;
                                    uploaderService.CURRENT_HB_WU.stop(file);
                                    // 0 为还没有上传,1 为正在上传 2为暂停上传 3, 为上传完成
                                    file.uploadStatus = 2;
                                });
                            }
                        };
                    }
                    /**
                     *todo(翁鹏飞) file对象存在文件循环引用， toJson的时候会报错。 暂不知道怎么解决
                     */
                    HB_WU.on('fileQueued', function (file) {
                        ///*** 重设上传地址如果有外传参数的话
                        var temp = [];
                        for (var pro in $scope.params) {
                            temp.push(pro + '=' + $scope.params[pro])
                        }
                        HB_WU.option('server', server + '&' + temp.join('&'));
                        //***

                        var isIe = uploaderService.isIe();
                        var isBig = uploaderService.checkIsBigFile(file.size);
                        if (uploaderService.superBigFileSize < file.size && isIe) {
                            window.alert('想体验超爽超大文件上传，请用chrome或者firefox主流浏览器....');
                            return false;
                        }
                        if (isBig && (!$scope.standard || $scope.standard !== 'big') && !uploaderService.isIe()) {
                            uploaderService.doSpecialLog('当前上传文件大小定义属于大文件，请配置规格standard为big模式.....', 'red');
                            return false;
                        }

                        if ($scope.standard === 'big' && !isBig && !uploaderService.isIe()) {
                            uploaderService.doSpecialLog('当前上传文件大小定义属于小文件，请配置规格standard为small模式或者不配置.....', 'red');
                            return false;
                        }

                        file.guid = WebUploader.Base.guid();
                        file.queueId = $attr.queueid;
                        file.formatSize = WebUploader.Base.formatSize(file.size);
                        file.progress = 0;
                        file.uploadStatus = 0;
                        file.uploadBegin = false;
                        file.liveStatus = 0;//  0刚加入队列 1,准备md5file， 2-md5结束并且正在上传， 3-上传完成

                        if ($scope.multi) {
                            $scope.$apply(function () {
                                if ($scope.hbFileUploader && $scope.hbFileUploader.localFileQueue && angular.isArray($scope.hbFileUploader.localFileQueue)) {
                                    $scope.hbFileUploader.localFileQueue.push(file)
                                }
                            })
                        } else {
                            if ($scope.hbFileUploader) {
                                $scope.hbFileUploader.selectFile = file;
                            }
                        }
                        $scope.onFileQueued && $scope.onFileQueued({file: file});
                    });

                    HB_WU.on('error', function (error) {
                        var errorMessage;
                        switch (error) {
                            case 'Q_TYPE_DENIED':
                                var accept = this.options.accept;
                                var message = '请上传:';
                                var accepts = '';
                                angular.forEach(accept, function (item) {
                                    accepts += item.extensions;
                                });
                                message += accepts + '的文件类型';

                                errorMessage = message
                                break;
                            case 'Q_EXCEED_SIZE_LIMIT':
                                errorMessage = '文件不能超过' + WebUploader.Base.formatSize($scope.sizeLimit)
                                break;
                        }

                        if ($attr.onFileTypeDenied) {
                            $scope.onFileTypeDenied({
                                $info: {
                                    errorMessage: errorMessage,
                                    errorType: error,
                                    accepts: accepts,
                                    uploader: this,
                                    instance: HB_WU
                                }
                            });
                        } else {
                            console.log(errorMessage)
                        }
                    });

                    HB_WU.on('uploadError', function (file, error) {
                        $timeout(function () {
                            file.liveStatus = -1;
                        });
                        $log.log('%c上传过程中出现错误' + error, 'color:red');
                    })
                }
            }
        }
    });
