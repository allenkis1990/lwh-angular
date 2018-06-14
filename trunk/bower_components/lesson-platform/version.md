##

## 防替学 (1.0.1) 版本

    1. 新增防替学功能
    2. 主要在playParams当中添加camera属性
          this.playParams.camera = {
            type        : 0,

			// 对比地址
            postUrl     : 'http://localhost:3111/capture',
			// webcam.swf的地址
            swfURL      : '../../../bower_components/cameras/src/webcam.swf'

            /**
                0.// 表示随机时间点， 以规定时间内的时间 随机出以capture为次数的时间点弹 captureTimes越大， 间隔差越小
                1.// 固定时间段， 此时captureTimes表示为固定时间段 每隔capture时间去弹将所有时间除
                2.// 平均时间点拍照模式 此时的captureTimes表示 次数
            */

            captureMode : 0,
            captureTimes: 10
         };

             /**
              *                                            / \                  /-\--/-\
              *                                          /    \                | ^ | ^ |
              *  --------------------------------------/       \               \__——__/
              *  判断规则                                        \               / |  \
              *      1                                           \                |
              *      2 captureMode 0 ，表明是随机时间点弹出拍照器     \_____________/___\__________________________
              *          -- 开始计算， 随机数， 将随机数放进弹出时间点集合中， 相同则继续随机直到没有相同的时间点存在   \
              *              时间点间隔差根据 launchStudy.camera.mix 或者 launchStudy.camera.captureTimes来决定  \
              *      3 captureMode 1 ，表明是固定时间拍照                                                       /
              *  -------------------------------------------------------------------------------------------/
              */

### 省会计版本 支持省会计的多个objectId提交学习服务

````
	*** 在getParamsUrl返回参数里面添加objectList， 将此objectList传输到播放sdk中与学习服务综合
````

## 1.0.2

	1. 省会计版本 支持省会计的多个objectId提交学习服务
	2. 在getParamsUrl返回参数里面添加objectList， 将此objectList传输到播放sdk中与学习服务综合


### 合并版本2.0.0

1. 调整播放器容器大小为视频兼容大小
2. 增加扩展编码形式

    `\js\extend\external.js`

````
    /**
     * Created by 亡灵走秀 on 2017/1/12.
     */
    define(["angular"], function (angular) {
        'use strict';

        angular.module('external', [])



        // 注册服务
        .factory('externalService', [function () {

        }])


        // 注册指令  ┍ - - - - - - - - - - - - - - - - ┑
                    \/                                |
        .directive('test', function () {              |
            return {                                  |
                template: '测试',                     |
                link: function ($scope) {             |
                    $scope.lesson                     |  // 可以获取整个课程对象
                    $scope.currentPlayInfo            |  // 获取当前播放的信息
                }                                     |
            }                                         |
        })                                            |
                                                      |
        // 增加一个组件 组件所对应的是一个完整的指令     |
        .run(['components', function (components) {   |
            // components.addComponents({             |
            //     name: 'test',  < - - - - - - - - - ┙
            //     className: 'ico-ml',// 按钮样式
            //     title: '测验'       // 按钮内容
            // })
        }]);
    });
````

3. playParams返回参数增加 apiType: Marker , // 定义请求的学习服务的地址 默认为  xxxx/Learning/init       增加后   xxxxx/LearningMarker/init;

## 2.0.1 版本 基于2.0.0 版本， 业务无修改，构建任务以及体现上面的调整

1. **增加内容体现在taks/player-app中， 此任务随应用发布更出去，平台需使用这个来完成课程播放的对接**

````
    1. 默认集成任务 copyPlayDirectory,
    2. 在项目构建中，拷贝项目源码的时候，需要将此任务也执行，也就是在混淆压缩的之前处理
````

## 2.0.2 版本 基于 2.0.1 版本微调

`http://192.168.1.208:18080/browse/HBJY-3009 `

> add

1. **_课程播放需要区分播放的入口，用以区分不同的入口进入所学的课程进度不同_**

> 在地址后面增加exts 参数，参数指明扩展， 此扩展会在跟平台交互的时候，以参数传递方式传给平台


