/**
 * Plug-in Name:loader
 * Plug-in Description:used to loading the viewer of media or pdf
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2015/03/03
 */

define ( [
    './bond',
    './helper'
], function ( bond, helper ) {
    "use strict";

    /**
     * arr contains item
     * @param arr
     * @param item
     * @returns {boolean}
     * @private
     */
    function contains( arr, item ) {
        for ( var i in arr ) {
            if ( arr[i] === item ) return true;
        }
        return false;
    }

    /**
     * use jQuery.ajax request to service get data
     * @param url
     * @param data
     * @param dataType
     * @param callback
     * @param jsonpCallback
     * @param context
     * @private
     */
    function ajax( url, data, dataType, callback, jsonpCallback, context ) {
        data     = data || null;
        dataType = dataType || "json";
        callback = callback || function () {
            };

        $.ajax ( url, {
            type         : "GET",
            data         : data,
            dataType     : dataType,
            success      : callback,
            jsonpCallback: jsonpCallback,
            error        : function ( errorMessage ) {
                helper.error ( errorMessage );
            },
            context      : context
        } );
    }

    /**
     * value is defined and have value
     * @param p
     * @private
     * @returns {boolean}
     */
    function isContainVal( p ) {
        if ( p === undefined || p === null ) return false;
        if ( typeof p == "string" ) {
            if ( p && p != "" && p != null )
                return true;
            return false;
        }
        return true;
    }

    /**
     * check data is legal
     * @param data
     * @param ignoreProperties
     * @ignore
     */
    function checkMetaData( data, ignoreProperties ) {
        if ( !(ignoreProperties instanceof Array) ) ignoreProperties = [ignoreProperties];
        for ( var p in data ) {
            if ( contains ( ignoreProperties, p ) ) continue;
            if ( !isContainVal ( data[p] ) )
                helper.error ( p + " isn't must null or empty." );
        }
    }

    /**
     *  to load other things
     * @param studyMode 0/1 预览/正常
     * @param type      播放类别 single/pdf/scorm/three
     * @private
     */
    function withoutCheckList( studyMode, type ) {
        var whiteList = "undefined";
        if ( studyMode === helper.playMode.listen ) {
            switch ( type ) {
                case helper.playType.single:
                    whiteList = ["plmId", "pvmId", "prmId", "subPrmId",
                        "unitId", "orgId", "usrId", "usrName",
                        "courseId", "courseWareId", "multimediaId", "originalAbilityId",
                        "lessonName", "pdfHtmlAddress"];
                    break;
                case helper.playType.pdf:
                    whiteList = ["plmId", "pvmId", "prmId", "subPrmId",
                        "unitId", "orgId", "usrId", "usrName",
                        "courseId", "courseWareId", "multimediaId", "originalAbilityId",
                        "lessonName"];
                    break;
                case helper.playType.scorm:
                    whiteList = ["plmId", "pvmId", "prmId", "subPrmId",
                        "unitId", "orgId", "usrId", "usrName",
                        "courseId", "courseWareId", "multimediaId", "originalAbilityId",
                        "lessonName", "pdfHtmlAddress"];
                    break;
                case helper.playType.three:
                    whiteList = ["plmId", "pvmId", "prmId", "subPrmId",
                        "unitId", "orgId", "usrId", "usrName",
                        "courseId", "courseWareId", "multimediaId", "originalAbilityId",
                        "lessonName", "pdfHtmlAddress"];
                    break;
                case helper.playType.web:
                    whiteList = ["plmId", "pvmId", "prmId", "subPrmId",
                        "unitId", "orgId", "usrId", "usrName",
                        "courseId", "courseWareId", "multimediaId", "originalAbilityId",
                        "lessonName", "pdfHtmlAddress","streamPath"];
                    break;
            }
        } else if ( studyMode === helper.playMode.learn ) {
            switch ( type ) {
                case helper.playType.single:
                    whiteList = ["pdfHtmlAddress"];
                    break;
                case helper.playType.pdf:
                    whiteList = ["lessonName"];
                    break;
                case helper.playType.scorm:
                    whiteList = ["pdfHtmlAddress"];
                    break;
                case helper.playType.three:
                    whiteList = ["lessonName", "pdfHtmlAddress"];
                    break;
                case helper.playType.web:
                    whiteList = ["pdfHtmlAddress","streamPath"];
                    break;
            }
        }
        return whiteList;
    }

    /**
     * to load other things
     * @param initData
     * @param event
     * @private
     */
    function _loadInit( initData ) {
        //0|1|2 预览 |正常
        if ( initData.studyMode === helper.playMode.learn ) {
            if ( initData.initURL == undefined || initData.initURL == "" || initData.initURL.indexOf ( "http" ) != 0 ) {
                helper.error ( "服务器地址参数错误！" );
            }
        }
        bond.initBond ( initData );
    }

    /**
     * Loader 构造函数
     *
     * *Example*
     *
     *      define(['loader'],function(Loader) {
         *
         *          var loader_instance = new Loader();
         *
         *          loader_instance.loaderInit(options);
         *
         *      })
     *
     * @public
     */
    function Loader() {
        this.initData   = {
            isWriteHistory   : false,
            test             : false,
            pdfHtmlAddress   : helper.Const.rootPath,
            plmId            : "",
            pvmId            : "",
            prmId            : "",
            subPrmId         : "",
            unitId           : "",
            orgId            : "",
            guid             : "",
            usrId            : "",
            usrName          : "",
            courseId         : "",
            courseWareId     : "",
            multimediaId     : "",
            type             : helper.playType.single,
            originalAbilityId: "",
            studyMode        : "1",
            streamHost       : "",
            streamPath       : "",
            initURL          : "",
            container        : { id: "", width: 0, height: 0, limit: 0 },
            downFile         : { fielUrl: undefined, fileDownloadUrl: undefined },
            lessonName       : "",
            lessonCatalog    : [],
            lessonDocument   : [],
            filterList       : []
        };
        this.loaderInit = function ( data, eventConfig, interceptConfig ) {
            var options   = {
                //初始化完成事件
                initPlay  : function ( state, swfPlayer ) {
                },
                //开始播放事件
                startPlay : function ( state, swfPlayer ) {
                },
                //结束事件
                endPlay   : function ( state, swfPlayer ) {
                },
                //状态监听事件
                statePlay : function ( state, swfPlayer ) {
                },
                //重复播放监听
                repeatPlay: function ( swfPlayer ) {
                }
            };
            var event     = $.extend ( {}, options, eventConfig ),

                // 根据观看模式获取白名单
                whiteList = withoutCheckList ( data.studyMode, data.type );

            checkMetaData ( data, whiteList );

            $.extend ( this.initData, data );
            this.initData.event     = event;
            this.initData.intercept = interceptConfig;
            _loadInit ( this.initData );
        };
    }

    return Loader;
} );
