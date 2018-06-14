/**
 * 二次封装validationEngine为模块, 提供更为简单的校验接口
 *
 * @author: choaklin
 * @version: 0.0.1
 * @since:  2013/7/16
 */
define(function (require, exports, module) {
    "use strict";
    var config = {
        showOneMessage: true,
        promptPosition: 'topLeft',
        ajaxFormValidation: true,
        ajaxFormValidationMethod: 'post',
        autoHidePrompt: true,
        autoHideDelay: 2000
    };

    module.exports = {
        /**
         *
         *  @param $formId      需要校验的form表单
         *  @param formConfig   当前表单校验的全局配置
         */
        installFormValidation: function ($formId, formConfig) {
            formConfig = $.extend(config, formConfig);
            $formId.validationEngine('attach', formConfig);
        },

        /**
         * 注销表单的校验
         * @param $formId
         */
        uninstallFormValidation: function ($formId) {
            $formId.validationEngine('detach');
        },

        /**
         *  当一个表单重复使用校验，应在完成后清除校验的缓存项，保障可以正常使用
         *  @param $formId
         */
        clearValidateCache: function ($formId) {
            $formId.validationEngine('clearAjaxCache');
        },

        /**
         *  使用原装样式展示在具体位置提示信息
         *  @param $fieldId 提示框存放的位置的控件ID
         *  @param options  提示选项
         */
        showTipPrompt: function ($fieldId, options) {
            $fieldId.validationEngine(
                'showPrompt',
                options.promptText || '',
                options.type || 'error',
                options.position || 'topRight',
                options.showArrow || true,
                options.autoHidePrompt || true,
                options.autoHideDelay || 2000
            );
        },

        /**
         *  使用原装样式隐藏在具体位置提示信息
         *  @param $fieldId 提示框存放的位置的控件ID
         */
        hideTipPrompt: function ($fieldId) {
            $fieldId.validationEngine("hide");
        },

        /**
         *  获取最后的校验结果
         *  @param $formId
         *  @return {*} 校验结果
         */
        getFinalResult: function ($formId) {
            return $formId.validationEngine('validate');
        }
        // 特殊校验可以自定义并实现即可
    };
});

