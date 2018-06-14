
# 前端多模板项目结构搭建

[TOC]

1. **一个域名对应一个portal/xxxx 、 center/modules/xxx 、 admin/modules/xxx **
2. **没有任何一个项目指向到center||admin 即 ： center||admin作为母版 （当前项目center|admin的母版内容以测绘的为基）**


## 项目结构


````json

    .
    | -- app
    |    | -- admin                    -- 管理员中心
    |    |    | -- js           \
    |    |    | -- styles        |
    |    |    | -- images         > 除了modules外其余定义为模板（母版） 基准
    |    |    | -- views         |
    |    |    | -- index.html   /
    |    |    | -- modules               -- 子模板
    |    |    |    | -- adminA          -- 模板A, 命名规则 center+子模板名称
    |    |    |    |    | -- js
    |    |    |    |    |    | -- main.app.js       //  2017-05-12 (Removed) 使用 admin/js/main.app.js 统一维护
    |    |    |    |    |    | -- main.config.js    //  2017-05-12 (Removed) 使用 admin/js/main.config.js 统一维护
    |    |    |    |    | -- views
    |    |    |    |    | -- images
    |    |    |    |    | -- styles
    |    |    |    |    | -- index.html
    |    |    |    | -- adminB           -- 同上 (一个简易的完全没有任何改动的，在开发的时候结构必须是这样)
    |    |    |    |    | -- js
	|    |    |    |    |    | -- common
    |    |    |    |    |    |    | -- stateMapper.js // 一个属于自己的即使是空的stateMapper
    |    | -- center                    -- 学员中心
    |    |    | -- js           \
    |    |    | -- styles        |
    |    |    | -- images         > 除了modules外其余定义为模板（母版） 基准
    |    |    | -- views         |
    |    |    | -- index.html   /
    |    |    | -- modules               -- 子模板
    |    |    |    | -- centerA          -- 模板A, 命名规则 center+子模板名称
    |    |    |    |    | -- js
    |    |    |    |    |    | -- main.app.js       //  2017-05-12 (Removed) 使用 center/js/main.app.js 统一维护
    |    |    |    |    |    | -- main.config.js    //  2017-05-12 (Removed) 使用 center/js/main.config.js 统一维护
    |    |    |    |    | -- views
    |    |    |    |    | -- images
    |    |    |    |    | -- styles
    |    |    |    |    | -- index.html
    |    |    |    | -- centerB           -- 同上 (一个简易的完全没有任何改动的，在开发的时候结构必须是这样)
    |    |    |    |    | -- js
	|    |    |    |    |    | -- common
    |    |    |    |    |    |    | -- stateMapper.js // 一个属于自己的即使是空的stateMapper
    |    | -- portal                      -- 门户
    |    |    | -- netA                   --
    |    |    | -- netB
    .

````

## public 最终文件结构


````json
    .
    | -- public
    |    | -- bower_components
    |    | -- admin									// (Removed)
    |    | -- adminDemo1      //  (Created from center/modules/centerDemo1)
    |    | -- adminDemo2      //  (Created from center/modules/centerDemo2)
    |    | -- center									// (Removed)
    |    |    | -- js
    |    |    | -- views
    |    |    | -- styles
    |    |    | -- index.html
    |    |    | -- modules                               // (Removed)
    |    |    |    | -- centerDemo1                      // (Removed)
    |    |    |    | -- centerDemo2                      // (Removed)
    |    | -- centerDemo1      //  (Created from center/modules/centerDemo1)
    |    | -- centerDemo2      //  (Created from center/modules/centerDemo2)
    |    | -- centerDemo...n
    |    | -- portal
    |    |    | -- demo1
    |    |    | -- demo2
    .
````

## 改动点

1. 将portal.app.js ... app.js 统一改成main.app.js
2. 将路由配置的si.js 统一改成stateMapper.js

## 入口配置文件

# 注意点

1. 适用所有文件命名规范

````json
.
    错误

    | -- directory
    |    | -- filename.xxx
    |    | -- filename-1.xxx
    .

    正确

    | -- directory
    |    | -- filename-0.xxx
    |    | -- filename-1.xxx
    .

    以上导致文件发布的时候生成hash异常

````

2. center  modules下面的文件夹名称命名规范，

````json
.
    错误

    | -- modules
    |    | -- demo1
    |    | -- demo2
    .

    正确

    | -- modules
    |    | -- centerDemo1
    |    | -- centerDemo2
    .
    
    以上错误导致测试以上无法访问
    
````

## 开发中重要gulp任务




> asignIndexAppName

  **筛选app/admin/modules|app/center/modules 下面的子目录（子项目），查询子项目目录当中的index.html id 为app_name_use_in_gulpfile 的script标签， 动态生成一行代码 var appName = 'adminXXX|centerXXX', 给后续应用当中判定当前应用级别做条件**

````

app/center/modules/xxxxx/index.html
app/admin/modules/xxxxx/index.html


index.html 内容需包括 <script id="app_name_use_in_gulpfile"></script> 脚本

````

> copyProjectConfig

**将门户当中的project.main.json 内容拷贝到各app/center/index.html|app/admin/index.html 当中， 替换id
为app_name_use_in_gulpfile的内容同样声场一行代码var appName = "admin|center", 给后续应用哦当中判断当前应用做条件**

````

app/center/modules/index.html
app/admin/modules/index.html


index.html 内容需包括 <script id="project_main_config"></script> 脚本
index.html 内容需包括 <script id="app_name_use_in_gulpfile"></script> 脚本

````

## 门户跳转到学员中心

_门户应用启动完成后，会在顶层注册一个模块 _

### dynamicConfig

#### 服务

##### dynamicConfig

###### go 根据当前域名对应的目录名称，跳转到对应的center/center + （首字母大写）目录名称 的学员中心

`使用方式: dynamicConfig.go('center', '_href|_blank' )`

* 所以center下面的目录结构必须参照门户的目录结构


## 文件查找根据， 判断当前要访问的目录下面有没有此文件， 如果没有，则去母版那边查找


## 管理员登陆跳转到管理员中心

### 开发 以admin/index.html做跳板

### 测试、线上 以nginx 配置为跳板


### 模块整合中遇到的问题，以及解决完成后抛弃的问题， 和保留的解决方案

