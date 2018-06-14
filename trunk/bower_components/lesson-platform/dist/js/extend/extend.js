/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
define ( {
    // 服務獲取地址前缀
    prefixUrl       : "/",
    // 获取课程信息地址
    lessonUrl       : function ( isLearn ) {
        return isLearn ? 'web/portal/play/getCourseInfo' : 'web/portal/play/getCourseInfo';
    },
    // 获取登录信息
    loginInfoUrl    : 'web/login/login/loginInfo.action',
    // 学习模式下面与服务器不断链接
    communicationUrl: "web/login/login/loginInfo.action",

    // 获取播放参数
    playParamsUrl: function ( isLearn ) {
        return isLearn ? "web/portal/play/getPlayParams" : "web/portal/play/getPlayParams";
    },

    // 返回课程界面的地址
    lessonPageUrl: '/center/#/myRealClass/',

    // 獲取當前课程的学习进度
    askLessonScheduleUrl: 'web/portal/play/getLessonSchedule',

    // 保存当前已经学习时长
    mediaLearnTimeUrl   : '192.168.1.6:2071'
    // 多长时间去保存播放时间   单位（s）
    // timeToSaveMediaLearTime: 10
} );
