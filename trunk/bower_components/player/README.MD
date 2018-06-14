## 播放脚本开发文档

#### 如何使用
1.安装
````
bower install player
````
2.配置模块
````
require.config ( {
    paths   : {
        loader    : '../bower_components/player/dist/loader'
    },
    shim    : {
        loader: { exports: 'loader' }
    },
    callback: function () {
        require ( ['jquery'] );
    }
});

````
_注意_ 同时在页面中需要加载bower_components/player/dist/loader.css文件
````
<link rel="stylesheet" href="bower_components/player/dist/loader.css">
````
3.使用类库
````
var loader = new Loader();
var option ={};
loader.loaderInit(option);
````
#### 参数说明
##### playParams 播放及学习配置
````javascript
{
/* 上下文信息 */
//{bool} 系统运行环境，是否测试:true/false
test:false,
//{string} 系统平台ID
plmId:'',
//{string} 系统平台版本ID
pvmId:'',
//{string} 系统项目ID
prmId:'',
//{string} 系统子项目ID
subPrmId:'',
//{string} 系统服务单位ID
unitId:'',
//{string} 系统组织机构ID
orgId:'',
//{string} 系统业务ID
objectId:'',
//{Number} 系统业务类型
objectType:-1,
//{string} 接收学习考核消息平台或能力服务编号
originalAbilityId:'',

/* 用户相关信息 */
//{string} 学习的用户ID
usrId:'',
//{string} 学习用户姓名
//当type（播放类型）为"scorm"时，该值有效且必填。
usrName:'',

/* 学习的课件信息 */
//{Number} 播放模式，0代表预览模式|1代表学习模式|2代表浏览模式
studyMode:0,
//{string} 课程Id
courseId:'',
//{string} 课件Id
courseWareId:'',
//{string} 媒体Id或多媒体Id
multimediaId:'',
//{string} 课件名称（主要三分屏使用）
//当type（播放类型）为"three"时，该值有效且必填。
lessonName:'',
//{Array} 课程目录对象集合（主要三分屏使用）
//当type（播放类型）为"three"时，该值有效且必填。
lessonCatalog:[{
    //{string} 主键Id
    id:'',
    //{string} 章节名称
    name:'',
    //{string} 上级章节编号，顶级节点，该值必须为"0"
    parentId:'0',
    //{Number}播放时间点，单位：秒
    timePoint:0
},{....}],
//{Array} 课程讲义对象集合（主要三分屏使用）
//当type（播放类型）为"three"时，该值有效且必填。
lessonDocument:[{
    //{string}讲义编号
    id:''
    //{string}讲义路径，完整的绝对路径
    path:'',
    //{Number}播放时间点，单位：秒,该值必须与lessonCatalog中的timePoint一致
    timePoint:0,
    //{Number}讲义类型，1代表html|2代表image|3代表|4代表pdf
    type:1，
    //{Number}pdf页码，当前type为4时，该值有效（暂未实现）
    expand:0
},{....}],
//{bool}是否记录学习历史，true/false
isWriteHistory:false,
//{Array} 过滤计时列表
filterList:[{
    //{string} 课程编号
    courseId:'',
    //{string} 课件编号
    coursewareId:'',
    //{Number}实体类型，0/1/2，媒体/课件/课程
    filterType:-1,
    //过滤实体编号
    entityId:'',
    //{bool}是否过滤，true/false
    isFilter:false ,
},{....}],

/* 播放相关 */
/* {string}播放页面类型，值如下：
 * "single"  单视频
 * "three"   三分屏
 * "pdf"     PDF文档
 * "scorm"   scorm标准视频
 * "web"     web嵌入式
 */
type:'single',
//{string} 流数据域名或mfs域名（pdf）
streamHost:'',
//{string} 流数据相对路径或mfs文件路径（pdf）
streamPath:'',
//{object} 播放器容器
container: {
	//{string} dom节点id
    id: '',
    //{string} 播放器宽度，如：'648px'
    width: '100%',
    //{string} 播放器高度，如：'500px'
    height: '100%',
    //{bool} 是否可以手动跳跃
    isCanSeek:false,
    //{Number} 从哪一个起始点开始播放
    startAt:0,
    //{Number}最长可以播放至刻度点，studyMode=0时（预览模式）有效
    limit:0,
    //{Function}预览结束回调事件，studyMode=0时（预览模式）有效
    callback:function(kernel){}
}
//{object} adobeReader文件下载地址设置，默认使用官方地址
//同时设置对象的两个值时，只有fileDownloadUrl会生效
downFile:{
    //{string}下载的文件地址
    fileUrl: undefined,
    //{string}下载页面地址
    fileDownloadUrl: undefined
},
//{object} 播放器功能设置
p2pOption:{
    //{bool} 是否自动播放，默认：true
    autoPlay: true,
    //{bool} 是否启用侧边栏，默认false
    sidebarBtn: false,
    //{bool} 是否启用共享按钮，默认false
    shareBtn: false,
    //{bool} 是否启用关灯按钮，默认false
    lightBtn: false,
    //{bool} 是否启用快进按钮，默认false
    speedBtn: false,
    //{bool} 是否启用清晰度切换按钮，默认true
    streamBtn: true
}
}
````
##### eventConfig 事件监听配置
````javascript
{
    //{function}初始化完成事件
    initPlay: function (state, kernel) {
    },
    //{function}开始播放事件
    startPlay: function (state, kernel) {
    },
    //{function}结束事件
    endPlay: function (state, kernel) {
    },
    //{function}状态监听事件
    statePlay: function (state, kernel) {
    },
    //{function}重复播放监听
    repeatPlay: function (kernel) {
    },
    //{string} state当前事件状态，{object} kernel播放器核心对象，用于对播放器操作
	//{function} 提交完成事件，注：预览模式和浏览模式改事件无效
	commitAfter:function (core,kernel){
	    core对象包含的信息如下：
        {
            //{string} 多媒体学习记录编号
            multimediaRecordId,
            //{string} 课件学习记录编号
            coursewareRecordId,
            //{string} 课程学习记录编号
            courseRecordId,
            //{string} 当前播放课程编号
            courseId,
            //{string} 当前播放课件编号
            courseWareId,
            //{string} 当前播放媒体编号
            multimediaId,
            //{double} 多媒体学习进度
            mediaSchedule,
            //{double} 课件学习进度
            coursewareSchedule,
            //{double} 课程学习进度
            courseSchedule
        }
	}
}
````
##### interceptConfig 弹窗拦截配置
````javascript
{
	//{bool} 是否启用拦截监听
    isEnable:false,
	//{string} 考试平台域名地址
    examServiceUrl: '',
    //{object}拦截配置
    config: {
        /**
         * {Number}拦截模式|0/1，知识点弹题/随机题
         */
        mode: 0,
        /**
         * {Number}验证形式|0/1，答对为止/按答题次数，默认0
         */
        verificationForm: 0,
        /**
         * {Number}验证形式次数值|在VerificationForm为1时该值必填
         */
        verificationValue: -1,
        /**
         * 当验证形式（verificationForm）为1时，
         * 验证次数（verificationValue）最后一次还是错误时，
         * 是否显示答案
         */
        isShowAnswer: false,
        /**
         * {Number}触发形式|0/1/2，固定时间点/固定百分比间隔/固定时间间隔
         */
        triggerForm: 0,
        /**
         * {Number}触发形式值|在TriggerForm值不为0时，该值必填
         */
        triggerValue: 0,
        /**
         * {Boolean}是否保存答题记录，（暂未实现）
         */
        isStoreRecord: true,
        /**
         * {Boolean}是否延迟关闭窗口，默认true
         */
        isLazyClose: true,
        /**
         * {Number}当isLazyClose=true时，该值有效
         * 延迟关闭时间，单位：秒，默认5秒
         */
        timeOutSecond: 5,
        /**
         * {Array}当mode为0时，该值为题目列表，题目Id列表
         */
        questions: ['','']
    },
    message: {
        /**
         * {String}回答错误显示信息
         */
        wrongAnswer: "回答错误!",
        /**
         * {String}回答错误，可重试显示信息
         */
        wrongAnswerRetry: "回答错误，请重新作答！",
        /**
         * {String}回答正确显示信息
         */
        correctAnswer: "回答正确！",
        /**
         * {String}回答错误，包含可重试次数显示信息,#count#表示剩余可作答次数
         */
        wrongAnswerCount: "回答错误，请重新作答！您还可以作答#count#次。",
        /**
         * {Function}（可选项）没有选择答案，回调函数，默认：undefined
         * 指示以回调方式将信息的展示方式开放，即可以自定义如何显示提示信息和需要提示的信息
         */
        noAnswerCallback: function (event) {
            // event:
            //  { code: 100, message: '未作答', alert: true },
            //  { code: 101, message: '提交中', alert: true },
            //  { code: 102, message: '保存答案报错[系统异常]', alert: true },
            //  { code: 103, message: '保存答案报错[业务异常]', alert: true },
            //  { code: 104, message: '保存答案成功' },
            //  { code: 105, message: '获取试题成功' },
            //  { code: 106, message: '答题中...' },
            //  { code: 107, message: '获取试题出现异常...', alert: true }
        },
        /**
         * {Array}（可选项）没有选择答案，提示信息数组，默认：undefined
         * 提供显示信息的数组，显示信息的方式由内部定义，该对象与noAnswerCallback只可选一项
         * 若noAnswerCallback与noAnswerMessage两者都提供，以noAnswerCallback生效为主；
         * 若两者都不提供，以内部的alert显示默认信息
         * 若提供多个相同code的信息，则优先选择第一个
         */
        noAnswerMessage: [
        //  { code: 100, message: '未作答' },
        //  { code: 101, message: '提交中' },
        //  { code: 102, message: '保存答案报错[系统异常]' },
        //  { code: 103, message: '保存答案报错[业务异常]' },
        //  { code: 104, message: '保存答案成功' },
        //  { code: 105, message: '获取试题成功' },
        //  { code: 106, message: '答题中...' },
        //  { code: 107, message: '获取试题出现异常...' }
        ]
    }
}
````
#### 使用示例
##### 1.预览模式
支持用户只能预览视频其中一段
````javascript
var playParams = {
studyMode:2,
//{string} 流数据域名或mfs域名（pdf）
streamHost:'',
//{string} 流数据相对路径或mfs文件路径（pdf）
streamPath:'',
//{object} 播放器容器
container: {
	//{string} dom节点id
    id: 'media-container',
    //{string} 播放器宽度，如：'648px'
    width: '100%',
    //{string} 播放器高度，如：'500px'
    height: '100%'
    //{Number} 预览秒数或预览的页数
    limit:30,
    callback:function(kernel){
        alert("you can play 30 seconds,in preview mode.");
    }
}
};

var init = new Loader();
//这里初始化脚本
init.loaderInit(playParams);

````
##### 2.浏览模式
仅仅播放视频不做任何操作
````javascript

var init = new Loader();
var playParams = {
studyMode:3,
//{string} 流数据域名或mfs域名（pdf）
streamHost:'',
//{string} 流数据相对路径或mfs文件路径（pdf）
streamPath:'',
//{object} 播放器容器
container: {
	//{string} dom节点id
    id: 'media-container',
    //{string} 播放器宽度，如：'648px'
    width: '100%',
    //{string} 播放器高度，如：'500px'
    height: '100%'
}
};

//这里初始化脚本
init.loaderInit(playParams);
````
##### 3.学习模式
正常播放和学习一个媒体
````javascript

//包含所有参数
var playParams = {
studyMode:1,
//包含所有参数
.......
};
var init = new Loader();
//这里初始化脚本
init.loaderInit(playParams);
````

#### 浏览器UI兼容
由于弹窗使用的是样式兼容，所以在使用SDK页面(_即播放页面_)中需要将`<html>`标签替换为
````html
<!--[if IE 8]> <html class="lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html> <!--<![endif]-->
````
#### 后端服务版本依赖
player     | 学习服务版本
 --------- | -----------
 1.0.0     |    1.8.0


#### 升级
1.2.0 步骤
1. bower install player#1.2.0 --save-dev
2. 播放页面需要加载bower_components/player/dist/loader.css文件，如：
````
<link rel="stylesheet" href="bower_components/player/dist/loader.css">
````


## 当前版本修复bug

#### 1.3.4

1. bug

   `弹窗题10秒弹窗间隔， 在弹窗的时候会将后台的提交进度定时器暂停， 导致30秒一次的提交无法正确执行`

2. 修改

	1) 将loader.js 改成项目名称player.js
	2) 原来构建生成的目录
    ````
        - 1.x.x
            - /dist
            - /main
    ````
   _改成_
	````

        - 1.x.x
            - /dist
            - /src
	````


#### 1.3.6

1. 增加在学习的时候弹窗的之前提交弹窗的信息到服务端
2. 弹窗popConfig => 添加字段logEnable 为true的时候打开记录日志的功能
	(主要在流加载完成的时候讲弹窗信息提交到服务器中)



#### 1.3.8

1. 对pdf的计时优化
	- 以pdf的页码来考量 (废弃： 由于ie8下面无法获取当前播放的pdf的页码是多少， 亦或者是pdf的总页码是多少所以废弃)
	- 以设定pdf的总学习时间为考量 （采用）

2. 增加参数
	- playParams.container.docTime // 文档的总时间 pdf提供总时长
		因为可能会影响之前的版本， 故如果这个pdf给的时间时长为0 ， 将会在下次提交的时候将进度调整为百分百

3. 没有摄像头的话就不要提供camera配置

1 疑在提交弹窗信息的时候marker未提交正确
2. 修复pdf播放的时候当前播放时间计算错误的
3. 修复在1.3.81 版本上面pdf播放的时候初始化时间bug， 以及频繁弹窗的bug


1. 2017-4-5 15:25:00 -
    修复:
        1 在学习模式下面随机防假学弹窗守护进程未关闭
        2 在ie8下面events获取keycode导致代码bug
    优化: 在学习模式下面进度达到百分百后不再弹出防假学弹窗

1. 2017-4-6 09:42:00 -

    修复在ie8下面pdf无法正常的使用播放进度条


1. 2017-4-6 19:19:00 -

    修复在ie8下面popQuestionLog的时候没有返回数据执行parseJson的时候报错的bug

2.  2017-4-10 13:45:00 -

    修复修复在播放pdf的时候不会自动跳到下面去



