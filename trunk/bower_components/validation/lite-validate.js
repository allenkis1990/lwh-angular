/**
 * Created with IntelliJ IDEA.
 * User: wengpengfei
 * Date: 15-1-13
 * Time: 下午6:47
 * To change this template use File | Settings | File Templates.
 */


define(function (require, exports, module) {
    'use strict';
    /***
     *   var ve = require('validateEngine');
     *   ve.showPrompt($('#id'), {
     *       content: '提示内容',
     *       type: 'error'
     *   })
     */
    require('validateEngine');
    require('jquery');

    var g = {}, process = {};

    g.config = {
        delayClose: 3000,   // 延迟关闭
        content: '警告警告！', // 提示内容
        type: 'pass', // 提示类型
        position: 'topRight', // 提示显示的位置
        showArrow: true // 是否显示箭头
    };

    process = {
        buildPromptOnField: function(node) {
            node.validationEngine('showPrompt',
                g.config.content,
                g.config.type,
                g.config.position,
                g.config.showArrow
            );
            // 定时延迟关闭
            window.setTimeout(function() {
                node.validationEngine('hide');
            }, g.config.delayClose);
        }
    };
    module.exports = {

        showPrompt: function(node, options) {
            $.extend(g.config, options);
            process.buildPromptOnField(node);
        },

        hideAllPrompt: function() {
            $(document).validationEngine('hideAll');
        },

        hidePrompt: function(node) {
            node.validationEngine('hide');
        }
    }
});