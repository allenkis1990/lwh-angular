# 通用课程播放api对接
[TOC]


## 版本
| 版本  | 更新内容| 编辑人 |  发布时间 |
|--------|---|----|-------|
| V1.0.0 | 同步企业版V3接口|  翁鹏飞 | 2016-09-30    |

<h1 style=color:red;>对应player版本 -- 1.3.1 -- </h1>

##通用课程播放页面


###1.获取课程
`获取课程目录列表`

**URL**
`
http://www.xxxx.xxxx/getLesson?lessonId=''&trainClassId=''
`

**支持格式**
`json`

**HTTP请求方式**
`get`

**请求参数**
```
lessonId                     --- 课程id
trainClassId                 --- 培训班id

```
| 参数名称 | 必选 | 数据类型|描述|
|--------|--------|------|---|
|课程id|true|主键id||
||||||

**返回结果**
```
{
    info: {
      lesson: {
        id: 009c2926710942a4b6e677eae1f10398,
        name: 三分屏pdf,
        numbers: 1,
        schedule: 39,
        goTestMustFinishLearn: false,
        teacher: [
          阎 修洁,
          李 天宇
        ],
              // 测验列表
               tests: [
                        {
                          id: sdfsfsdfsdfsdf,
                          href: http://www.baidu.com,
                          name: 百度测试,
                          configId: configIdconfigIdconfigId,
                          objectList: [{
                          objectId: false,
                          type: 7
                          }]
                        }
                      ],
        chapterList: [
          {
            id: 57194744-6e6f-4162-967b-e076fbc8d8ea,
            name: threeeeeeeeeeeeeeeeeeeeeeeeeee,
            courseWareList: [
              {
                id: 05738586043d4e46a9a6c5afdd42a5c6,
                name: pdf,
                mediaList: [
                  {
                    id: 7bc6bb4e9db042d9974cb9e8c33208a5,
                    name: threeeeeeeeeeeeeeeeeeeeeeeeeee,
                    time: 2337,
                    schedule: 64,
                    alreadyPlayTime: 3530,
                    allowPlayTimes: 1,
                    listenTime: 50,
                    mode: 2,
                    isBuy:true,
                    type: 3
                  }
                ]
              }
            ]
          }
        ],
        pic: http://lorempixel.com/400/300,
        lastPlayInfo: {
          courseWareId: dd6b1b62372a4503859cde50362b4bb5,
          mediaId: 46d6730610554e5a954452bf8dd89b4b
        }
      },
      originalAbilityId: -1,
      userId: 2c9181e555e804fe0155ec55915100ed,
      currentDomain:,
      resourcePath:,
      studyServicePath: http://test.study.com:2035
    },
    status: true,
    code: 200
  }
```
| 元素名称 | 数据类型 | 元素意义|其他说明|
|--------|--------|------|------|
|numbers|string|共几讲||
|schedule|double|课件进度|学员有选择课程是实时进度，没选择时，是0.0|
|goTestMustFinishLearn|boolean|点击测验的时候是否要完成学习|有测验列表的时候有效|
|teacher|Array|教师||
|pic|string|图片地址||
|tests|Array|测验||
|{-|-|-|-|
|id|string|id||
|name|string|名称||
|href|string|跳转地址||
|configId|string|配置id||
|objectList|array|object集合||
|}-|-|-|-|
|chapterList|object|章节集合||
|courseWareList|object|课件集合||
|mediaList|object|媒体结合||
|[{-|-|-|-|
|time|int|时长|-|
|schedule|double|媒体进度|-|
|isBuy|boolean|是否已经购买|当mode=3的时候需要判断|
|alreadyPlayTime|int|已经播放时长|-|
|allowPlayTimes|int|允许播放次数|-|
|mode|int|播放模式|1.支持试听  2.不支持试听  3.购买后播放|
|type|int|媒体类型|1.pdf 2.单视频 3.三分 4.web |
|listenTime|int|试听时间|限制试听的时候的时长|
|}]-|-|-|-|
|lastPlayInfo|object|最后一次播放信息|当且不提供courseWareId的时候从此处提取信息|
|{-|-|-|-|
|courseWareId|string|課件id||
|mediaId|string|媒体id||
|chapterId|string|章节id||
|time|int|时长||
|}-|-|-|-|
|studyServicePath|string|学习服务地址||
|originalAbilityId|string|培训班id||
|currentDomain|string|当前域名|三分屏有效|
|resourcePath|string|资源路径|三分屏有效|
|userId|string|用户id||


###2.获取播放参数
` 根据课程id获取课程详情 `

**是否需要登录**
`是`

**URL**
`
http://www.xxxx.xxxx/getPlayParams?courseWareId=''&mediaId=''&trainClassId=''
`

**支持格式**
`json`

**HTTP请求方式**
`get`

| 参数名称 | 必选 | 数据类型|
|--------|--------|------|
|courseWareId|true|课件id|
|mediaId|true|媒体id|
|trainClassId|true|培训班id|

**返回结果**
```
 {
      guid: 9a6db5b90e9f451281aef6745b35195d,
      type: 2,
      popConfig: {
        mode: 0,
        times: 0,
        triggerForm: 1,
        triggerValue: 0.5,
        timeClose: ,
        examServiceUrl: http://test.exam.com:8080/,
        questions: [
          {
            id: 6c215d02-3bc8-4076-8757-3be9caca9350,
            time: 3275,
            times: 0,
            rule: {
              wrongTimes2_show_answer: ""
            }
          },
          {
            id: d37ed68a-da06-43c4-8f15-ee173081c78a,
            time: 3280,
            times: 5,
            rule: {
              wrongTimes2_show_answer:  ""
            }
          },
          {
            id: 650fe70e-3dfa-4016-a99f-261fa59de579,
            time: 3285,
            times: 2,
            rule: {
              wrongTimes2_show_answer:  ""
            }
          },
          {
            id: 94a42d52-5835-4f31-a66a-53d805efe7a5,
            time: 3290,
            times: 3,
            rule: {
              wrongTimes2_show_answer:  ""
            }
          }
        ]
      },
      streamPath: /query/6qVqQcar2xJjDLd3RhTePgHQJvvPY0_YRPM3JO1g0GY=,
      streamHost: http://192.168.1.227:9083,

      apiType: Marker , // 定义请求的学习服务的地址 默认为  xxxx/Learning/init       增加后   xxxxx/LearningMarker/init;

      unitId: -1,
      objectId: -1, --- 》 （DEPRECATE）
      objectType: -1,  --- 》 （DEPRECATE）
      objectList: [
        {key: '', value: ''}
      ],
      organizationId: -1,
      platformId: 402881c74e70559e014e7055ade40000,
      platformVersionId: 402881c74e705744014e705751b40000,
      projectId: 402881c74ea1976f014ea19779710000,
      subProjectId: 402881c74ea1976f014ea1977a4d0002
    }
```
| 元素名称 | 数据类型 | 元素意义|备注|
|--------|--------|------|------|
|guid	 |String|guid||
|lessonId|String|课程id||
|chapterId|String|章节id||
|courseWareId	 |String|课件id||
|mediaId	 |String|媒体id||
|type	 |int|媒体类型|1.pdf 2.单视频 3.三分 4. web|
|popConfig|OBject|弹窗配置||
|streamPath|String|流媒体播放地址|</font>|
|streamHost|String|流媒体播放host|</font>|
|unitId|String|单位id||
|objectId(DEPRECATED)|String|对象id||
|objectType(DEPRECATED)|String|对象类型||
|objectList[n].key (objectType)|String|字符创||
|objectList[n].value (objectId)|String|字符创||
|organizationId|String|组织id||
|platformId|String|平台id|-|
|platformVersionId|String|平台版本id|- |
|projectId|String|项目id|-|
|subProjectId|String|子项目id|-|
|apiType|String|定义学习服务的调取, 默认xxxx/Learning/init|会计- "Marker" xxxx/LearningMarker/init|


<span style=color:red;font-weight:bold;>popConfig特别介绍</span>


| 元素名称 | 数据类型 | 元素意义|备注|
|--------|--------|------|------|
|mode	 |int|弹窗模式|1 随机题 0 常规题|
|times	 ||弹出次数|随机题有效|
|triggerForm|OBject|触发模式|0固定时间点1固定百分比间隔2固定时间间隔 ---随机题有效 |
|triggerValue|String|触发值|触发值--随机题有效|
|timeClose|String|关闭时间倒计时|</font>|
|objectIdList|Array|objectId集合||
|examServiceUrl|String|考试试题获取试题的地方||
|questions|Array|试题|当模式为0的时候需提供试题集合|

<span style=color:red;font-weight:bold;>questions特别介绍</span>

| 元素名称 | 数据类型 | 元素意义|备注|
|--------|--------|------|------|
|time|int|弹窗时间点||
|times|int|弹出次数||
|rule|object|规则|{wrongTimes2_show_answer：true} 是否在错误次数达到上限了显示答案 |


###3.获取用户登录信息
`如标题`

**URL**
`
http://www.xxxx.xxxx/loginInfo
`
参数名是`requestString`

**支持格式**
`json`

**HTTP请求方式**
`get`

**请求参数**
```
-
```

**返回结果**
```
{
    info: {
      login: true
    },
    status: true,
    code: 200
}
```

###4.获取课程播放进度

**URL**
`
http://www.xxxx.xxxx/askLessonSchedule?lessonId=''&trainClassId=''
`

**支持格式**
`json`

**HTTP请求方式**
`GET`

| 参数名称 |  数据类型|描述|
|--------|------|---|
|lessonId|string|课程Id||
|trainClassId|string|培训班id||


**返回结果**
```
{
    info: {
      progress: 100,
      finish: true
    },
    status: true,
    code: 200
  }
```

###5.与服务器保持链接

**URL**
`
http://www.xxxx.xxxx/xxxxxxx
`

`随便给个请求`

**支持格式**
`json`

**HTTP请求方式**
`GET`

**请求参数**

```

```


###6.保存当前学习用时

**URL**

`
http://www.xxxx.xxxx/mediaLearnTimeUrl
`


**支持格式**
`json`

**HTTP请求方式**
`post`

**请求参数**

```

lessonId:
courseWareId:
mediaId:
alreadyPlayTime:

```
## 当前播放跳转到测验练习地址
`http://test.exam.com:9008/web/examService/examination?id=2e689d7e-259d-461e-94e7-a2772519ae00&requestType=1&projectId=402881c74ea1976f014ea19779710000&subProjectId=402881c74ea1976f014ea1977a4d0002&platformId=402881c74e70559e014e7055ade40000&platformVersionId=402881c74e705744014e705751b40000&unitId=2c9180e54e7580cd014e7707b9690004&organizationId=2c91b6e54fa1ad9d014fa2f5a1b80013&userId=2c9181e555e804fe0155ec55915100ed&isAsync=true`

## 课程学习
