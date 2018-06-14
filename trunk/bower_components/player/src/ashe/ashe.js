/**
 * Created by wengpengfei on 2016/11/8.
 */
define ( ['cameras'], function ( Cameras, WebCam ) {
    'use strict';

    window.Webcam = WebCam;

    function Ashe( options ) {
        this.init ( options );
    }

    Ashe.prototype = {
        init      : function ( options ) {
            return this.openCamera ( options );
        },
        openCamera: function ( options ) {
            new Cameras ( {
                // id       : 'my_camera',
                // 是否自动拍照
                auto          : true,
                businessParams: options.context,
                cameraSet     : {
                    swfURL: options.swfURL || '../../../bower_components/cameras/src/webcam.swf'
                },
                events        : {
                    validateSuccess: function () {
                        options.success && options.success ();
                    }
                },
                postUrl       : options.postUrl,
                // 延迟拍照时间
                delay         : 5
            } );
            return true;
        }
    };

    return Ashe;
} );
