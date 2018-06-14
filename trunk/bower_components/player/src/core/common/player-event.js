/**
 * Plug-in Name:StateEvent
 * Plug-in Description:播放器核心事件
 * Author: Created by wujinfeng
 * CreateTime: 2016/05/7
 */
define ( [
    '../../common/helper'
], function ( helper ) {
    'use strict';

    function validateState( state ) {
        if ( typeof state !== "string" ) {
            helper.error ( "state must is String" );
            return false;
        }
        var stateInfo = ['play', 'seek', 'pause', 'end', 'init', 'state', 'start', 'commit', 'frame', 'resume'];
        if ( state == undefined || state == "" || stateInfo.indexOf ( state ) == -1 ) {
            helper.error ( "state must be <<<<<<<<<<<<" + stateInfo.join ( ',' ) + '>>>>>>>>>>>>>>' );
            return false;
        }
        return true;
    }

    function StateEvent() {
        this.__events = {};
    }

    StateEvent.prototype = {
        /**
         * 新增一个状态事件
         */
        add          : function ( state, fn ) {
            if ( typeof state == "string" ) {
                if ( validateState ( state ) && typeof fn === "function" ) {
                    this.__events[state] = fn;
                }
            } else {
                while ( state.length > 0 ) {
                    var s            = state.shift ();
                    this.__events[s] = fn;
                }
            }
            return this;
        },
        /**
         * 获取一个状态事件
         */
        get          : function ( state ) {
            return this.__events[state];
        },
        /**
         * 获取当前状态监听事件
         */
        getStateEvent: function () {
            return this.__events['state'];
        },
        /**
         * 获取一个初始化完成的事件
         */
        getInitEvent : function () {
            return this.__events['init'];
        },
        /**
         * 销毁当前状态事件
         */
        destroy      : function () {
            this.__events = {};
        }
    };

    return StateEvent;
} );
