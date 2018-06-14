/**
 * Plug-in Name:FrameListening
 * Plug-in Description:播放器帧监听器
 * Version: 1.0.0
 * Author: Created by wujinfeng
 * CreateTime: 2016/04/30
 */

define ( [
    '../../common/helper'
], function ( helper ) {
    'use strict';
    var win = window;

    function listening( single, player, event ) {
        var tp = player.getTime ();
        helper.log ( "current time is:" + tp );
        if ( event ) event ( tp, single, player );
    }

    var FrameListening = function () {
        this.currentState  = "none";
        this.currentPlayer = undefined;
        this.init          = function ( single, kernel ) {
            if ( kernel.frameListen )
                kernel.frameListen.destroy ();
            this.currentPlayer = kernel;
            this.currentModule = single;
            kernel.frameListen = this;
            return this;
        };
        this.delayFunction = function () {
        };
        this.__listeningId = undefined;
        this.isInit        = function () {
            return this.currentPlayer && typeof this.currentPlayer == "object";
        };
        this.listening     = function ( fn ) {
            if ( fn != undefined && typeof fn == "function" ) {
                this.delayFunction = fn;
            }
            if ( !this.__listeningId ) {
                helper.log ( "Start frame listening..." );
                var that = this;
                if ( that.delayFunction ) {
                    that.__listeningId = win.setInterval ( function () {
                        //helper.log("Invoke frame listening!");
                        listening ( that.currentModule, that.currentPlayer, that.delayFunction );
                    }, 1000 );
                    this.currentState  = "listening";
                }
            }
        };
        this.stopListen    = function () {
            if ( this.__listeningId ) {
                helper.log ( "Stop frame listening..." );
                win.clearInterval ( this.__listeningId );
                this.__listeningId = undefined;
                this.currentState  = "none";
            }
        };
        this.destroy       = function () {
            this.stopListen ();
            this.currentPlayer = undefined;
            this.currentModule = undefined;
        };
    };
    return FrameListening;
} );
