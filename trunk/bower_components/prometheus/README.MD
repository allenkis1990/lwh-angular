# 普罗米修斯
[TOC]

## Version

`1.0.2`

## Supports

> IE 8

## 修复

1. tab在处理三级导航的时候导航异常
2. uploader.js 在处理上传文件的时候，获取上传参数的时机调整

`1.0.3`

> 修复在特殊情况下的ui-view没有监控到初始化的时候的stateChangeSuccess导致视图无法正确渲染到对应的位置
> 修复在该完后无法正确关闭全部tab
> $rootScope.uploadConfigOptions 设置好上传选项后便可以正确上传文件

`1.0.4`

> 将上传组件的bower_components引用地址开启到根路径

`1.0.5`

> 添加不符合提供的文件类型的文件，导致后续的文件无法添加到队列中


`1.0.6`

> upload-image 指令自定义accept导致覆盖了参数的accpet对象为字符串，引起判断文件类型的时候报错
   将参数accpet修改成accept-file-type

`1.0.8` 适配通用管理系统版本 源 1.0.6

> placeholder 使用{{}}模板当做placeholder的内容的时候插件无法正确运行
> placeholder ie8下面一聚焦就会将值设置为空