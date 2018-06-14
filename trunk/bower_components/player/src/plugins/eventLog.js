/**
 * Created by 亡灵走秀 on 2017/2/27.
 */


define ( ['../common/helper', '../common/const'], function ( Helper, Const ) {
    'use strict';

    function EventLog( options ) {

        this.options = options;
        $.extend ( {}, this.options, options );

    }

    EventLog.prototype = {
        constructor: EventLog,

        genCommitLogInfo: function () {
            var objList = [];
            for ( var i = 0; i < this.options.context.markers.length; i++ ) {
                var mark = this.options.context.markers[i];
                objList.push ( {
                    objectId: mark.value,
                    type    : mark.key
                } )
            }

            var commitLogInfo = {
                userId      : this.options.context.userId,
                courseId    : this.options.context.courseId,
                courseWareId: this.options.context.courseWareId,
                mediaId     : this.options.context.mediaId,
                objectList  : objList,
                type        : type
            };

            return commitLogInfo;
        },

        logPop: function ( type, question, popTime, useful ) {

            var commitLogInfo = this.genCommitLogInfo ();

            if ( type === Const.popQuestionLogType.init ) {
                this.options.config.useful = useful;
                commitLogInfo.initMessage  = this.options.config;
            } else {
                if ( question.popQuestionType === 'notPoppedQuestion' ) {
                    commitLogInfo.initMessage = {
                        popQuestionType: 'recycleType',
                        popTime        : popTime
                    }
                }
                commitLogInfo.questionId = question.id || 'The random question type has no id!'
            }
            Helper.ajax ( this.options.examServiceUrl + '/web/popQuiz/popQuestionLog', commitLogInfo );
        }
    }
} );