/**
 * Created by admin on 2016/5/13.
 * 常量
 */

define ( ['./ie-extension'], function () {
    "use strict";

    var allConst = {
        Timing            : { commit: "CommitTiming", 'break': "BreakTiming" },
        Document          : { exchange: "ExchangeTiming" },
        File              : { exam: 'common/js/hb.exam.js' },
        // RemoteService     : {
        //     "init"  : "api/LearningMarker/Initing",
        //     "single": "api/LearningMarker/Timing",
        //     "three" : "api/LearningMarker/Timing",
        //     "scorm" : "api/LearningMarker/ScormTiming",
        //     "pdf"   : "api/LearningMarker/DocumentTiming",
        //     "web"   : "api/LearningMarker/Timing"
        // },
        RequestHead       : {
            appVersion : '1.0.0',
            osPlatform : 'web',
            requestTime: (function () {
                return new Date ().Format ( "yyyy-MM-dd HH:mm:ss" );
            }) ()
        },
        popQuestionLogType: {
            init  : 1,
            timing: 2
        },
        popQuestionType   : {
            random: 1,
            normal: 0
        },
        getService        : function ( type ) {
            type = type || '';
            return {
                init  : "api/Learning" + type + "/Initing",
                single: "api/Learning" + type + "/Timing",
                three : "api/Learning" + type + "/Timing",
                scorm : "api/Learning" + type + "/ScormTiming",
                pdf   : "api/Learning" + type + "/DocumentTiming",
                web   : "api/Learning" + type + "/Timing"
            }
        }
    };
    return allConst;
} );
