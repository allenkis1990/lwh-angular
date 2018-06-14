/**
 * Created by 亡灵走秀 on 2017/2/22.
 *
 *
 * @ 模块控制播放器在播放的时候安全控制
 */
define(function (mod) {
    'use strict';

    window.console && console.log('安全模式启动..');

    function Security() {
        this.disableF12();
        this.disableContextMenu();
    }

    Security.prototype = {
        constructor: Security,
        /**
         * 禁用鼠标有单击
         */
        disableContextMenu: function () {
            document.oncontextmenu = function (event) {
                event.returnValue = false;
            }
        },
        /**
         * 启用右单击
         */
        enableContextMenu: function () {
            document.oncontextmenu = true;
        },
        /**
         * 禁用f12
         */
        disableF12: function () {
            document.onkeydown = function (event) {
                var e = e || window.event || event;
                if (e.keyCode === 123) {
                    e.returnValue = false;
                }
            }
        }
    }

    return new Security();
});
