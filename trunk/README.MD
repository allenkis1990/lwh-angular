## 用来处理简单的
1. 文件夹结构说明

````
	trunk
		.temp
		app
		bower_components
		node_modules
		html
		public
		things
		build
		bower.json
		gulpfile.js
		package.json
		README.MD
````

## 项目结构构件过程

````
                     gulp --p moduleName --a appName(执行项目构建)
                            --p 模板名称(例:mod1)
                            --a 应用名称(例:front)
                                        |
                                        v
                               clean (build & public)
                                        |
                                        v	       to
                   copy (things(js)、view、styles、images) ---- > .temp 目录
                                        |
                                        v
                                Angular annotated
                                        |
                                        v
                            removeLogs --// 删除console.log
                                        |
                                        v
                                   minifiler (js)
                                    	|
                                        v		  then
                            	autoprefixer (css) ---- > minifier(css);
                                		|
                                        v
                                  minifier (html)

                                        |
                                        v
                                  FileReversion
                                        |
                                        v
                FileReversion replace contents 替换文件版本化后内容引用
                                        |
                                        v
                                  zip (project)
										|
                                        v
                                      Clean
````


###

	说明：info.json在打包压缩完成后为后台开发人员提供模板信息，  当后台人员解压这个模板的时候，读取内容，获取分别是入口文件main,
		主题内容路径themes ..等

	前端获取的时候，  根据指定的请求获取请求的入口文件， 和请求的主题模板样式为哪里进行模板主题定制等。。。

# 主要命令

`gulp` -- > 用来打包整个app的指令
`gulp -a admin` -- > 打包某个app/admin的指令
`gulp -a front -p mod1` -- > 打包某个app/front/mod1 的指令
`gulp createModule -a front -n mod2` -- > 创建一个模板的指令
`gulp removeModule -a front -n mod2` -- > 删除一个模板的指令
`gulp serve -- > 开发启动本地前端服务`


### 项目构建上面需要注意的地方(连载...)

1. 在打包一个模板的时候， 模板下面的文件名称最好整个模板内容唯一.
	`如: 当mod1下面有app.js 倘若某个地方引用了app.js 并且字符串中有app这个单词，则这个单词会被替换成app.js rev后的名字.`
	`解决方案： 将app.js命名为front.app.js`




# Attensions    `文件版本化需要注意项`

1. js 文件夹下面不能有简单文件名出现 如app.js 需要命名成 admin.app.js
2. 同级目录下面不允许存在一个文件名字带有另外一个文件名的全称 如 (job-edit.js -- job-edit-new.js) job-edit-new 改成job-create


## 项目改动 (DEPRECATED),

-- 16:42 2017/7/5
. 增加代码段， 判断命令行是否有传输参数进来 参数格式 gulp --ext images:min,doRevReplace,...
. 以逗号分隔， 即： 将命令行提供的命令从执行列表中删除掉， 如果是doRevReplace，则比较特殊要，将这个任务替换成拷贝任务，
. 将所有文件从 build/拷贝到public/下面


// 测试的目前只有将images:min 或者 doRevReplace 任务排除运行正常

命令 ： `gulp --ext images:min,doRevReplace`
````
        // 如果有设置排除项
        if (options.ext) {
            var exts = options.ext.split(',');
            if (/doRevReplace/.test(options.ext)) {
                tasks.splice(tasks.indexOf('"doRevReplace"'), 1, '"copyJs"');
            }
            exts.forEach(function (item) {
                var foundIndex = tasks.indexOf('"' + item + '"');
                if (foundIndex !== -1) {
                    tasks.splice(foundIndex, 1);
                }
            })
        }
````

## 项目改动  2017 - 08 - 10  14:50

1. 播放器目录在试听和预览的情况下面显示文字从100% 分别改为试听、预览
2. 播放器地址增加可扩展参数，提供平台识别平台播放课程的业务性 地址 为原先的 如:
    `/play/#/learn/{trainClassId}/{lessonId}/{courseWareId}?exts=i_am_exts`

    i_am_exts 将会在请求平台请求的时候以参数形式传给平台

## 项目改动，增加 app/workflow目录   [2017-09-07 11:45]

1. gulpfile任务，在主流程执行hash任务之前将不会把此目录的任何文件拷贝到public下面
2. hash完成后，启一个tasks/workflow.js内任务workflow执行将workflow的文件目录拷贝到相应的public/workflow下面
3. 研发开发时候的serve调整 ,将workflow文件夹访问的内容不重定向到portal下面