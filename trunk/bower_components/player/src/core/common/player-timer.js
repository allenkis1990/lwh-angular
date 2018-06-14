/**
 * Plug-in Name:Timer
 * Plug-in Description:播放器定时器
 * Version: 1.1.0
 * Author: Created by wujinfeng
 * CreateTime: 2016/05/6
 */
define ( [
    '../../common/helper'
], function ( helper ) {
    'use strict';

    function Timer( factory ) {
        if ( !(factory instanceof TimerFactory) ) {
            helper.error ( "factory must be TimerFactory's instance" );
            return;
        }
        /**
         * 定时器名称，同一个工厂的唯一标识
         */
        this.name = '';
        /**
         * 定时器延迟时间，单位:毫秒
         */
        this.delay = -1;
        this.__factory = factory;
        this.currentId = undefined;
        this.trigger   = function () {
        };
        /**
         * 启动定时器
         */
        this.start = function () {
            var timer = this;
            if ( timer.currentId == undefined ) {
                timer.currentId = window.setInterval ( timer.trigger, timer.delay );
                helper.log ( "Timer:" + timer.name + " is start" );
            }
            else
                helper.log ( "Timer:" + timer.name + " is started" );
        };
        /**
         * 停止定时器
         */
        this.stop = function () {
            var timer = this;
            if ( timer.currentId ) {
                window.clearInterval ( timer.currentId );
                timer.currentId = undefined;
                helper.log ( "Timer:" + timer.name + " is shutdown" );
            }
        };
        /**
         * 获取创建当前定时器的工厂
         */
        this.getFactory = function () {
            return this.__factory;
        };
        /**
         * 当前定时器是否是指定的工厂创建
         */
        this.isFactory = function ( factory ) {
            return this.__factory === factory;
        }
    }

    function TimerFactory() {
        this.__currentTimers = {};
        this.constructor     = this;
        this.init            = function ( kernel ) {
            kernel.timerFactory = this;
        };
        /**
         * 使用当前工厂创建一个定时器
         */
        this.create = function ( name, delay, fn ) {
            if ( !helper.isString ( name ) ) {
                helper.error ( "name is not String" );
                return;
            }

            if ( this.__currentTimers[name] ) {
                helper.error ( "Timer:" + name + " is exist!" );
                return;
            }

            if ( !helper.isNumber ( delay ) ) {
                helper.error ( "TimerFactory:delay is not Number" );
                return;
            }

            if ( !helper.isFunction ( fn ) ) {
                helper.error ( "TimerFactory:fn is not Function" );
                return;
            }

            var timer                  = new Timer ( this );
            timer.delay                = delay;
            timer.trigger              = fn;
            timer.name                 = name;
            this.__currentTimers[name] = timer;
        };
        /**
         * 重置定时器
         * @param name
         * @param delay
         * @param fn
         */
        this.reset = function ( name, delay, fn ) {
            if ( !helper.isString ( name ) ) {
                helper.error ( "TimerFactory.reset:name is not String" );
                return;
            }

            if ( !helper.isNumber ( delay ) ) {
                helper.error ( "TimerFactory.reset:delay is not Number" );
                return;
            }

            if ( !helper.isFunction ( fn ) ) {
                helper.error ( "TimerFactory.reset:fn is not Function" );
                return;
            }

            if ( this.__currentTimers[name] ) {
                var timer = this.get ( name );
                timer.stop ();
                timer.delay   = delay;
                timer.triggle = fn;
                if ( delay > 0 )timer.start ();
                return timer;
            }
            else {
                this.create ( name, delay, fn );
                helper.error ( "Timer:" + name + " isn't exist!Now Create!" );
            }
        };
        /**
         * 获取定时器
         */
        this.get = function ( name ) {
            return this.__currentTimers[name];
        };
        /**
         * 销毁当前的定时器工厂
         */
        this.destroy = function () {
            //stop all timers
            var timers = this.__currentTimers;
            for ( var name in timers ) {
                var timer = timers[name];
                if ( timer instanceof Timer )
                    timer.stop ();
            }
            this.__currentTimers = {};
        };
        /**
         * 启动工厂中的所有定时器
         */
        this.allStart = function () {
            var timers = this.__currentTimers;
            for ( var name in timers ) {
                var timer = timers[name];
                if ( timer instanceof Timer )
                    timer.start ();
            }
        };
        /**
         * 停止所有定时器
         */
        this.allStop = function () {
            var timers = this.__currentTimers;
            for ( var name in timers ) {
                var timer = timers[name];
                if ( timer instanceof Timer )
                    timer.stop ();
            }
        }
    }

    return TimerFactory;
} );
