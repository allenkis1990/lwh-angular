# 弹窗题api

##引用
    http://通用考试平台域名路径/common/js/hb.exam.js 
    
    载入这个js后。   进行实例化
### 实例化
     hbNb = new HB_NB_exam ( {
        showMark: true,// 提交的时候是否显示加载蒙版 默认false
        target: 'exam', // 要将试题内容放置的容器  '#exam', 'exam' , $('#exam')
        server: 'http://www.baidu.com:9002', // 服务保存地址
        cssUrl: '', // 样式类的请求地址 不配默认服务器的
        events: function(event) {
            event = 
               //  { code: 100, message: '未作答', alert: true },
               //  { code: 101, message: '提交中', alert: true },
               //  { code: 102, message: '保存答案报错[系统异常]', alert: true },
               //  { code: 103, message: '保存答案报错[业务异常]', alert: true },
               //  { code: 104, message: '保存答案成功' },
               //  { code: 105, message: '获取试题成功' },
               //  { code: 106, message: '答题中...' },
               //  { code: 107, message: '获取试题出现异常...', alert: true }
        },
        params: {
            quizSourceType: 1,  // 1 或者2 （1: 来源数据库题库, 2: 随机生成试题） // 必须提供
            questionId       : '0080320c-21a8-495c-9c56-c2a489dd6b8b',  // 试题id // quizSourceType = 1时， 必须提供,为2时可以不提供
            userId           : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // 必须参数 // 用户id
            platformId       : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // *
            platformVersionId: '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // *
            projectId        : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // *
            subProjectId     : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // *
            unitId           : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6', // *
            organizationId   : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6',
            courseId         : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6',
            courseWareId     : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6',
            mediaId          : '00319e2a-d58a-4a60-864f-fb3d28ccc5e6'
            objectList: [],
        }
    } );
    
### 回调

    // 保存数据
       hbNb.saveAnswer ().then ( function ( data ) {
                   console.log ( data );
               } )
               
### 判断是否正确
    
    hbNb.lastAnswerIsPass();

### 在ui上面标志试题正确与否

      hbNb.markResult ();
      
      eg:     hbNb.saveAnswer ().then ( function () { // 保存成功并且返回的时候
                          hbNb.markResult (); // 调用标志结果
                      } )
                      
                      
### 判断是否在提交中，避免提交多次。。。

    hbNb.isSubmitting();
    
    
### 标志页面上面正确错误的选项

    hbNb.markCorrectFalseAnswer();
    
### 清除页面上面正确错误的选项

    hbNb.markCorrectFalseAnswer();
    
### 获取正确答案数组

    hbNb.getCorrectAnswer();
    
    return  ['A', 'B'];
    
    
### 显示正确答案和你的答案

    hbNb.showResult();
    
### 效果
 
1. 正确
![ui展示](../../../common/images/mds/ui-pass.jpg)
2. 错误
![ui展示](../../../common/images/mds/ui-error.jpg)
