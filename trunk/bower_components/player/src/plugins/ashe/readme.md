# 使用最新版播放器sdk详解

[TOC]

## 示例

````
    this.playParams.camera = {
        captureMode   : 3,
        duration: 20,
        captureTimes  : 10,
        takeover      : {
            asheTimePoints: [{
                time: 5
            }, {
                time: 50
            }],
            type          : 'percent'
        },
        examServiceUrl: 'http://test.exam.ihbedu.com:1457/',
        begin         : true,
        compareUrl    : 'http://localhost:1254/picCompare',
        uploadUrl     : 'http://172.17.0.102:8080/uploadBase64ToPrivateFile',
        swfURL        : '../../../bower_components/cameras/src/webcam.swf'
    }
````

## 参数说明

### captureMode  弹窗模式
**`0: random 随机时间点`**
_duration_ 表示在随机时间点的基础上面弹几次, 如果不提供默认按总时长/总时长的百分之25的
**`1: fixed 固定时间点`**
_duration_ 表示在固定时间点的基础上面弹总时长/固定段的次数， 如： 总时长100秒，固定时间点为10秒一次， 就是弹10次
**`2: average 总时间平均时间点`**
_duration_ 表示平均值， 及总时长算出平均值的时间点 再以总时长除以此值得次数
**`3: takeover 托管给用户提供`**
_type_ 必须 ，
_asheTimePoints_ 必须提供 [{time: 20}] 数组， 弹窗时间点集合
_generator_ 如果有提供将覆盖默认的构造方式放回时间点集合
1. 默认是时间点，即每到time点弹出
2. **_percent_** 百分比点， 以总时长乘以time 计算出时间点再做弹窗

### examServiceUrl
 日志记录服务地址
### begin
 是否在播放开始的时候弹窗 默认false
### compareUrl
 上传拍照完成的图像的对比地址
### uploadUrl
 上传拍照完成的图像的地址
### swfURL
 拍照对象的flash地址


## 上传图片

````
Form Data;

contentType: application/x-www-form-urlencoded; charset=UTF-8

base64Data: base64
context:{"platformId":"4028812b569c57e001569c5a71a00000","platformVersionId":"4028812b569c57e001569c5a727f0001","projectId":"4028812b569c57e001569c5a73d70004","subProjectId":"4028812b569c57e001569c5a74240006","unitId":"-1","organizationId":"-1"}
needOperate:[{"x":97.92857142857143,"y":26.09999999999999,"width":149.14285714285714,"height":208.8,"rotate":0,"type":"truncate"}]

````

## 比對

````

contentType: text/plain

request payload
{"context":"{\"platformId\":\"4028812b569c57e001569c5a71a00000\",\"platformVersionId\":\"4028812b569c57e001569c5a727f0001\",\"projectId\":\"4028812b569c57e001569c5a73d70004\",\"subProjectId\":\"4028812b569c57e001569c5a74240006\",\"unitId\":\"-1\",\"organizationId\":\"-1\"}","imageUrl":"/private/file/2c9180e65a3c0019015ab65ffa091798.jpg","compareData":{"primaryKey":"51254a615baf40478791d7218b15696c","studySchedule":61.34,"studyCurrentScale":468,"studyStatus":1,"lessonStatus":"not attempted","token":"818720bcc4c942f3b944e31207ce2f0d","isRepeatPlay":0,"coursewareSchedule":61.34,"courseSchedule":61.34,"mediaTotalTimeLength":0,"courseId":"1124ccd2ac634fc9b1223d663f21b9fc","courseWareId":"752fa2bb3cae4826bacfe0ed76e1f22e","multimediaId":"f94519ebe8c74d1d97463cd4cbe08b14","courseRecordId":"f5e6270484e4464da2e88230facc912f","coursewareRecordId":"6ee1f3da48d3486c89c23225dec1c932","lessonId":"1124ccd2ac634fc9b1223d663f21b9fc","lessonLocation":"","studyMode":1,"studyLastScale":458,"timingMode":"schedule","intervalTime":0,"type":"single", userId: \"\","popInfo":{
"playTime": 播放器的时间,"captureMode":0
 popCaptureTime: 实际要弹的时间),
}
}}
````




