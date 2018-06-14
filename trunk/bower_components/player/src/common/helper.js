define(['./const'], function (Const) {
    'use strict';

    /**
     * 帮助类提供常量和帮助方法
     * @constructor
     */
    function Helper() {

        /**
         * 学习模式
         * @description
         *      <ul>
         *          <li>0: 试听模式</li>
         *          <li>1: 学习模式</li>
         *          <li>2: 预览模式（适用与门户仅仅用来播放观看用的）</li>
         *      </ul>
         * @type {{
         *          listen: number,
         *          learn: number,
         *          preview: number
         *       }}
         */
        this.playMode = {
            listen: 0,
            learn: 1,
            preview: 2
        };

        /**
         *
         * @type {{
         *          single: string,
         *          pdf: string,
         *          web: string
         *      }}
         */
        this.playType = {
            single: 'single',
            pdf: 'pdf',
            web: 'web',
            three: 'three',
            scorm: 'scorm'
        };

    }

    Helper.prototype = {

        Const: Const,
        /**
         * 根据类型获取api接口地址， 主要是区别marker 数量
         * @param type
         */
        getApiUrl: function (type) {

        },
        /**
         * throw a exception
         * @param message
         */
        error: function (message) {
            //throw new Error(message);
            this.log(message, 'error');
        },

        findIndex: function (array, info, field) {
            var result,
                field = field || 'id';
            keep:
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (item[field] === info[field]) {
                        item.$index = i;
                        result = item;
                        break keep;
                    }
                }
            return result;
        },

        forEach: function (array, callback) {
            if (!this.isArray(array)) return;
            var i = 0,
                len = array.length;

            for (i; i < len; i++) {
                this.isFunction(callback) && callback(array[i], i);
            }
        },

        /**
         * 兼容ie的输出，如果全局有console 则输出， 否则不做任何操作
         * @param {String} message 输出的内容
         */
        log: function (message, type) {
            if (window.console) {
                console[type || 'log'](message);
            }
        },

        ajax: function (requestUrl, requestData, successFun, errorMessage) {
            if (this.isUndefined($)) {
                this.error("jQuery is undefined!");
            }
            var reqData = $.toJSON(requestData),
                me = this;
            if (typeof XDomainRequest !== 'undefined') {
                var xdr = new XDomainRequest();
                xdr.onload = function () {
                    if (xdr.responseText) {
                        try {
                            successFun($.parseJSON(xdr.responseText));
                        } catch (e) {
                            window.console && console.log(e);
                        }
                    }
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
                        me.error(xhr);
                    }
                });
            }
        },
        /**
         * to format time
         * @param seconds
         * @returns {string}
         */
        toTime: function (seconds) {
            var minute = seconds / 60;
            var second = seconds % 60;
            var hour = minute / 60;
            minute = minute % 60;

            hour = parseInt(hour, 10);
            minute = parseInt(minute, 10);
            second = parseInt(second, 10);
            return (hour >= 10 ? hour : "0" + hour) + ":" + (minute >= 10 ? minute : "0" + minute) + ":" + (second >= 10 ? second : "0" + second);
        },
        /**
         * 设置一个定时器
         * @param  {Function} fn
         * @param  {int} delay
         */
        setInterval: function (fn, delay) {
            return window.setInterval(fn, delay);
        },
        /**
         * 清除一个定时器
         * @param  {int} intervalId
         */
        clearInterval: function (intervalId) {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        },
        /**
         * 是否IE8
         * @returns {boolean}
         */
        isIE8: function () {
            var isIEEight = false;
            if ((navigator.userAgent.indexOf("MSIE 9.0") > 0 && !window.innerWidth)
                || (navigator.userAgent.indexOf("MSIE 8.0") > 0 && !window.innerWidth)) {
                isIEEight = true;
                return isIEEight;
            } else {
                return isIEEight;
            }
        },
        /**
         * 获取目录
         * @param path
         * @returns {string}
         */
        getPath: function (path) {
            return path + (path.lastIndexOf("/") == (path.length - 1) ? "" : "/");
        },
        /**
         * 判断是否是函数
         * @param {Function} val 要判断的对象
         * @returns {boolean}
         */
        isFunction: function (val) {
            return Object.prototype.toString.call(val) === "[object Function]" && typeof val === 'function';
        },
        /**
         * 判断是否是字符串
         * @param {String} val 要判断的对象
         * @returns {boolean}
         */
        isString: function (val) {
            return typeof val === 'string' && Object.prototype.toString.call(val) === "[object String]";
        },
        /**
         * 判断是否是空的字符串
         * @param val
         * @returns {boolean}
         */
        isEmptyString: function (val) {
            if (val === null && this.isUndefined(val)) {
                return true;
            }
            return (('' + val).replace(/\s/g, '')) == '';
        },
        /**
         * 判断是否是数组
         * @param {Array} val 要判断的对象
         * @returns {boolean}
         */
        isArray: function (val) {
            return Object.prototype.toString.call(val) === '[object Array]';
        },
        /**
         * 判断是否是未定义的
         * @param {Undefined} value 要判断的对象
         * @returns {boolean}
         */
        isUndefined: function (val) {
            return typeof val === 'undefined';
        },
        /**
         * 判断是否是数字
         * @param {Number} val 要判断的对象
         * @returns {boolean}
         */
        isNumber: function (val) {
            return typeof val === 'number' && Object.prototype.toString.call(val) === '[object Number]';
        },
        /**
         * 判断是否是布尔类型
         * @param val
         * @returns {boolean}
         */
        isBoolean: function (val) {
            return typeof val === 'boolean' && Object.prototype.toString.call(val) === '[object Boolean]';
        },
        /**
         * 空的函数
         */
        noop: function () {

        },
        /**
         * 带有then的空函数
         * @returns {{then: helper.noop}}
         */
        promiseNoop: function () {
            return {then: this.noop};
        },
        /**
         * @ignore
         */
        getStyleByOptions: function (option, type, attr) {
            if (option) {
                if (attr && type) {
                    return option[type][attr];
                } else {
                    return option;
                }
            }
        },
        checkApiType: function (type) {
            return type === 'Marker';
        }
    };
    return new Helper();
});
