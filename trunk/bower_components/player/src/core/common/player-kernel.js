/**
 * Plug-in Name:Kernel
 * Plug-in Description:播放器核心插件
 * Version: 1.1.0
 * Author: Created by wujinfeng
 * CreateTime: 2016/05/6
 */

define ( [
    '../../common/helper',
    './player'
], function ( helper ) {
    'use strict';
    var defaultP2pOptions = {
        //播放类型 type:
        // 1、auto   2、p2p  3、rtmp  4、hls，
        // 如果在auto的情况下，优先使用p2p，p2p无法播放，会切换至rtmp
        type            : "auto",
        //流类型 streamType:  1、vod(点播)  2、live(直播)
        streamType      : "vod",
        //流地址 streamUrl:   播放路径
        streamUrl       : "",
        //flash播放相对路径
        swfUrl          : "",
        //元素id replaceElemIdStr : flash 对象要替换的dom元素id
        replaceElemIdStr: "",
        //播放器宽度 width
        width           : "640",
        //播放器高度 height
        height          : "480",
        //是否自动播放
        autoPlay        : true,
        //是否启用侧边栏
        sidebarBtn      : false,
        //是否启用共享按钮
        shareBtn        : false,
        //是否启用关灯按钮
        lightBtn        : false,
        //是否启用快进按钮
        speedBtn        : false,
        //是否启用清晰度切换按钮
        streamBtn       : true
    };
    var defaultInitConfig = {
        /**
         * 初始播放起始点
         * @type int
         */
        startAt: 0
    };

    /**
     * @constructor 播放器核心属性
     */
    function Kernel() {
        /**
         * 构造器
         * @type Kernel
         */
        this.constructor = this;
        /**
         * 当前flash播放器对象
         * @type p2pPlayer
         */
        this.swfObject = null;
        /**
         * 是否加载完成视频流
         * @type Boolean
         */
        this.__isReadyStreamCompleted = false;
        /**
         * 是否初始化成功
         * @type Boolean
         */
        this.__isInitSuccess = false;
        /**
         * 是否第一次触发加载流
         * @type Boolean
         */
        this.__isInvokeLoadStream = false;
        /**
         * 播放器设置选项
         * @type {{
         * type: string,
         *  streamType: string,
         * streamUrl: string, s
         * wfUrl: string,
         * replaceElemIdStr: string,
         * width: string,
         * height: string
         * }}
         */
        this.p2pOptions = {
            //播放类型 type:
            // 1、auto   2、p2p  3、rtmp  4、hls，
            // 如果在auto的情况下，优先使用p2p，p2p无法播放，会切换至rtmp
            type            : "auto",
            //流类型 streamType:  1、vod(点播)  2、live(直播)
            streamType      : "vod",
            //流地址 streamUrl:   播放路径
            streamUrl       : "",
            //flash播放相对路径
            swfUrl          : "",
            //元素id replaceElemIdStr : flash 对象要替换的dom元素id
            replaceElemIdStr: "",
            //播放器宽度 width
            width           : "640",
            //播放器高度 height
            height          : "480",
            //是否自动播放
            autoPlay        : true,
            //是否启用侧边栏
            sidebarBtn      : false,
            //是否启用共享按钮
            shareBtn        : false,
            //是否启用关灯按钮
            lightBtn        : false,
            //是否启用快进按钮
            speedBtn        : false,
            //是否启用清晰度切换按钮
            streamBtn       : true
        };
        /**
         * 初始化配置
         * @type Object
         */
        this.initConfig = {
            startAt: 0
        };
        /**
         * 监听配置
         * @type Object
         */
        this.monitorConfig = {
            /**
             * 状态监听器
             * @param  {string} state
             * @param  {Kernel} kernel
             */
            stateListener  : function ( state, kernel ) {
                helper.log ( state );
            },
            /**
             * 初始播放点设置监听器
             * @param  {int} timestamp
             * @param  {Kernel} kernel
             */
            startAtListener: function ( kernel ) {
                var setStartAt           = function ( _kernel ) {
                    var total = _kernel.getDuration ();
                    if ( !helper.isUndefined ( total ) && total > 0 ) {
                        var startAt                = _kernel.initConfig.startAt <= 0 ? 0 : parseInt ( _kernel.initConfig.startAt );
                        _kernel.initConfig.startAt = (startAt >= parseInt ( total )) ? 0 : startAt;
                        _kernel.play ( _kernel.initConfig.startAt );
                        if ( _kernel.monitorConfig.streamCompleted ) _kernel.monitorConfig.streamCompleted ( _kernel );
                        helper.clearInterval ( _kernel.__startAtInterval );
                        _kernel.__startAtInterval = undefined;
                    }
                };
                kernel.__startAtInterval = helper.setInterval ( function () {
                    setStartAt ( kernel );
                }, 800 );
                //用于销毁对象时，销毁定时器
                kernel.__setIntervalProperty ( "__startAtInterval" );
            },
            /**
             * 初始化完成
             * @param  {Kernel} kernel
             */
            initCompleted  : function ( kernel ) {

            },
            /**
             * 播放流初次加载完成
             * @param kernel
             */
            streamCompleted: function ( kernel ) {

            }
        };
        /**
         * 定时器属性存放存储对象
         */
        this.intervalProperties = [];
    }

    Kernel.prototype = {
        /**
         * 设置定时器编号所在的属性名称
         * @param  {String} pro
         */
        __setIntervalProperty: function ( pro ) {
            this.intervalProperties.push ( pro );
        },
        /**
         * 初始化flash播放器
         * @param {any} replaceElemIdStr 播放器容器
         * @param {any} streamUrl 视频流主机
         * @param {any} swfUrl 视频流地址
         * @param {any} type 类型
         * @param {any} streamType 播放流类型
         * @param {any} width 播放器宽度
         * @param {any} height 播放器高度
         * @param {any} p2p_option 播放器配置
         * @param {any} startAt 启动初始播放刻度
         * @param {any} initCallback 初始化回调
         * @returns
         */
        init                 : function ( replaceElemIdStr,
                                          streamUrl,
                                          swfUrl,
                                          type,
                                          streamType,
                                          width,
                                          height,
                                          p2p_option,
                                          startAt,
                                          initCallback ) {
            var kernel = this;
            if ( !helper.isString ( replaceElemIdStr ) ) {
                return;
            }
            if ( !helper.isString ( streamUrl ) || helper.isEmptyString ( streamUrl ) ) {
                return;
            }
            if ( typeof (swfUrl) != "string" || helper.isEmptyString ( swfUrl ) ) {
                return;
            }
            if ( !helper.isFunction ( initCallback ) ) {
                return;
            }

            kernel.monitorConfig.initCompleted = initCallback;
            kernel.p2pOptions.replaceElemIdStr = replaceElemIdStr;
            kernel.p2pOptions.streamUrl        = streamUrl;
            kernel.p2pOptions.swfUrl           = swfUrl;
            if ( type ) {
                kernel.p2pOptions.type = type;
            }
            if ( streamType ) {
                kernel.p2pOptions.streamType = streamType;
            }
            if ( width ) {
                kernel.p2pOptions.width = width;
            }
            if ( height ) {
                kernel.p2pOptions.height = height;
            }
            if ( startAt ) {
                kernel.initConfig.startAt = startAt;
            }
            $.extend ( kernel.p2pOptions, p2p_option );
            //创建播放器容器
            createContainer ( kernel );
            //初始化播放器
            p2pPlayerInit ( kernel );
        },
        /**
         * 获取当前播放状态，"not_ready", "not_open", "playing", "pause", "end"
         * @returns {String} 播放状态，"not_ready", "not_open", "playing", "pause", "end"
         */
        getState             : function () {
            if ( this.__isInitSuccess ) {
                return this.swfObject.getState ();
            }
            return undefined;
        },
        /**
         * 播放视频或将视频跳转到某刻度播放，不提供刻度时从当前刻度开始播放
         * @param t{number} 视频刻度，单位秒
         * @returns {Kernel}
         */
        play                 : function ( t ) {
            if ( this.__isInitSuccess ) {
                if ( helper.isNumber ( t ) ) {
                    this.swfObject.seek ( t );
                } else {
                    this.swfObject.resume ();
                }
            }
            return this;
        },
        /**
         * 暂停视频
         * @returns {Kernel}
         */
        pause                : function () {
            if ( this.__isInitSuccess ) {
                this.swfObject.pause ();
            }
            return this;
        },
        /**
         * 停止视频，断开视频流连接
         * @returns {Kernel}
         */
        close                : function () {
            if ( this.__isInitSuccess ) {
                this.swfObject.close ();
            }
            return this;
        },
        /**
         * 获取当前播放时间，单位秒
         * @returns {number} 播放刻度，秒
         */
        getTime              : function () {
            if ( this.__isInvokeLoadStream )
                try {
                    return this.swfObject.getTime ();
                } catch ( e ) {
                    return undefined;
                }
            return undefined;
        },
        /**
         * 获取当前视频长度，单位秒
         * @returns {number} 视频长度，秒
         */
        getDuration          : function () {
            if ( this.__isInvokeLoadStream ) {
                try {
                    return this.swfObject.getDuration ();
                } catch ( ex ) {
                    return undefined;
                }
            }
            return undefined;
        },
        /**
         * 获取音量
         * @returns {number} 音量
         */
        getVolume            : function () {
            if ( this.__isInitSuccess ) {
                return this.swfObject.getVolume ();
            }
            return undefined;
        },
        /**
         * 设置音量，v为0-100
         * @param v 音量0-100
         * @returns {swfPlayer}
         */
        setVolume            : function ( v ) {
            if ( this.__isInitSuccess ) {
                if ( v && helper.isNumber ( v ) ) {
                    v = Math.abs ( v % 100 );
                    this.swfObject.setVolume ( v );
                }
            }
            return this;
        },
        /**
         * 是否静音状态，true(静音)，false(不静音)
         * @returns {boolean} true(静音)，false(不静音)
         */
        getMute              : function () {
            if ( this.__isInitSuccess )
                return this.swfObject.getMute ();
            return undefined;
        },
        /**
         * 设置静音状态
         * @param v true(静音)，false(不静音)
         * @returns {swfPlayer}
         */
        setMute              : function ( v ) {
            if ( this.__isInitSuccess ) {
                if ( helper.isBoolean ( v ) )
                    this.swfObject.setMute ( v );
            }
            return this;
        },

        /**
         * 获取所有码流配置
         * @returns 所有码流列表
         */
        getDefinitions  : function () {
            return this.swfObject.getDefinitions ();
        },
        /**
         * 设置播放码率名称
         * @param {string} name
         */
        setDefinition   : function ( name ) {
            this.swfObject.setDefinition ( name );
        },
        /**
         * 获取播放器版本
         * @returns {String} 播放器版本
         */
        getPlayerVersion: function () {
            if ( this.__isInitSuccess ) {
                return this.swfObject.getVersion ();
            }
            return "none";
        },
        /**
         * 播放器设置
         * @param property 属性
         * @param value 值
         * @returns {SWFPlayer}
         */
        setOption       : function ( property, value ) {
            if ( this.__isInitSuccess ) {
                this.swfObject.setOption ( property, value );
            }
            return this;
        },
        /**
         * 重置当前对象
         */
        reset           : function () {
            //销毁所有定时器
            var properties = this.intervalProperties;
            for ( var i in properties )
                helper.clearInterval ( this[properties[i]] );
            this.intervalProperties          = [];
            this.__isReadyStreamCompleted    = false;
            this.__isInitSuccess             = false;
            this.__isInvokeLoadStream        = false;
            this.swfObject                   = null;
            this.p2pOptions                  = defaultP2pOptions;
            this.initConfig                  = defaultInitConfig;
            this.monitorConfig.stateListener = function ( state, kernel ) {
                helper.log ( state );
            };
            this.monitorConfig.initCompleted = function ( kernel ) {
            };
        },
        /**
         * 销毁对象
         */
        destroy         : function () {
            this.reset ();
            window.swfPlayer = null;
        },
        /**
         * 设置状态监听器
         */
        setStateListen  : function ( fn ) {
            if ( !helper.isFunction ( fn ) ) {
                helper.error ( "fn is not a Function!" );
                return;
            }
            this.monitorConfig.stateListener = fn;
        }
    };
    /**
     * 创建播放器容器
     * @param  {Kernel} kernel
     */
    function createContainer( kernel ) {
        var containerId = kernel.p2pOptions.replaceElemIdStr;
        if ( !helper.isString ( containerId ) ) {
            helper.error ( "flash containerId is not string" );
            return;
        }
        var insiderContainerId = containerId + "_insider";
        var flashContainer     = document.getElementById ( insiderContainerId );
        if ( flashContainer ) {
            flashContainer.parentNode.removeChild ( flashContainer );
            flashContainer = undefined;
        }
        flashContainer    = document.createElement ( "div" );
        flashContainer.id = insiderContainerId;
        var title         = document.createElement ( "h2" );
        title.innerHTML   = "我们需要Flash player 10.1或以上版本来播放。";
        flashContainer.appendChild ( title );
        var adobeContainer = document.createElement ( "p" );
        var adobeLink      = document.createElement ( "a" );
        adobeLink.href     = "http://www.adobe.com/go/getflashplayer";
        var img            = document.createElement ( "img" );
        img.src            = "http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif";
        img.alt            = "安装最新的Flash player";
        adobeLink.appendChild ( img );
        adobeContainer.appendChild ( adobeLink );
        flashContainer.appendChild ( adobeContainer );
        var outsiderContainer = document.getElementById ( containerId );
        outsiderContainer.appendChild ( flashContainer );
        kernel.p2pOptions.replaceElemIdStr = insiderContainerId;
    }

    /**
     * 初始化flash播放器
     * @param  {Kernel} kernel
     */
    function p2pPlayerInit( kernel ) {
        var flashvars  = {
                auto_play        : (kernel.p2pOptions.autoPlay ? 1 : 0),
                no_side_bar      : (kernel.p2pOptions.sidebarBtn ? 0 : 1),
                no_share         : (kernel.p2pOptions.shareBtn ? 0 : 1),
                no_light         : (kernel.p2pOptions.lightBtn ? 0 : 1),
                enable_speed_btn : (kernel.p2pOptions.speedBtn ? 1 : 0),
                enable_stream_btn: (kernel.p2pOptions.streamBtn ? 1 : 0),
                seek_mode        : 'accuracy'
            },
            params     = {
                allowFullScreen  : true,
                allowScriptAccess: "always",
                wmode            : "transparent"
            },
            attributes = {};

        window.p2psr_embed ( kernel.p2pOptions.type,
            kernel.p2pOptions.streamType,
            kernel.p2pOptions.streamUrl,
            kernel.p2pOptions.swfUrl,
            kernel.p2pOptions.replaceElemIdStr,
            kernel.p2pOptions.width,
            kernel.p2pOptions.height,
            "10.1.0", "expressInstall.swf",
            flashvars,
            params,
            attributes,
            function ( obj ) {
                p2pPlayerInitCallback ( obj, kernel );
            } );
    }

    /**
     * 播放器初始化回调
     * @param  {p2p} obj
     * @param  {Kernel} kernel
     */
    function p2pPlayerInitCallback( obj, kernel ) {
        var message = "播放器初始化失败！";
        if ( obj.success === true ) {
            //扩展函数
            var ref                = obj.ref;
            ref.getDefinitions     = function () {
                return this.p2ps_get ( 'definitions' );
            };
            ref.setDefinition      = function ( profileName ) {
                this.p2ps_set ( 'definition', profileName );
            };
            message                = "播放器初始化成功！";
            kernel.__isInitSuccess = true;
            kernel.swfObject       = document.getElementById ( obj.id );
            kernel.swfObject.setEventListener ( "__playerEventListener" );

            if ( kernel.p2pOptions.autoPlay ) {
                kernel.swfObject.resume ();
            }
            excFunction ( kernel.monitorConfig.initCompleted ) ( kernel );
            excFunction ( kernel.monitorConfig.startAtListener ) ( kernel );
        }
        helper.log ( message );
    }

    /**
     * p2p播放器事件监听
     * @param  {string} event
     * @param  {Kernel} kernel
     */
    function p2pEventListener( event, kernel ) {
        var playState;

        switch ( event.type ) {
            case 'eventPlayerReady':
                $ ( 'body' ).css ( {
                    cursor: 'wait'
                } )
                break;
            case 'eventPlayStart':
                $ ( 'body' ).css ( {
                    cursor: 'default'
                } )
                break;
            case 'eventPlayOpen':
                if ( !kernel.__isInvokeLoadStream ) {
                    excFunction ( kernel.monitorConfig.stateListener ) ( 'start', kernel );
                    kernel.__isInvokeLoadStream     = true;
                    kernel.__isReadyStreamCompleted = true;
                }
                playState = "play";
                break;
            case 'eventPlaySeek':
                playState = "seek";
                break;
            case 'eventPlayPause':
                playState = "pause";
                break;
            case 'eventStreamEnd':
                //如果是关闭流
                playState = "end";
                break;
            case 'eventPlayClose':
                playState = "close";
                break;
            case 'eventPlayResume':
                playState = "resume";
                break;
        }

        excFunction ( kernel.monitorConfig.stateListener ) ( playState, kernel );
    }

    /**
     * 执行一个有效的函数
     * @param  {Function} fn
     */
    function excFunction( fn ) {
        if ( helper.isFunction ( fn ) ) return fn;
        return function () {
        };
    }

    /**
     * 播放器事件，用于p2p播放器调用
     * @param  {string} event
     */
    window.__playerEventListener = function ( event ) {
        p2pEventListener ( event, swfPlayer );
    };

    //window.__playerStatListener = function (info) {
    //    helper.log(info);
    //};

    var kernel       = new Kernel ();
    window.swfPlayer = kernel;
    window.onunload  = function () {
        swfPlayer.destroy ();
    };

    return kernel;
} );
