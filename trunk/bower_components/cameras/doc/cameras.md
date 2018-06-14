## 拍照插件

## 安装

1. `bower install cameras --save `
2. 引入方式

`( 普通`
````
	<script src="../bower_components/cameras/dist/cameras.js"></script>
````
`( requirejs`
````
	requirejs.config({

		paths: {
			cameras: '../bower_components/cameras/dist/cameras'
		},
		shim: {
			cameras: {exports: 'Cameras'}
		}
	})

	define(['cameras' , function () {
	    .....
	}])
````

####使用

````
	    var theCamera = new Camera ( {

            compareUrl: 'datas/compare.json',

            uploadUrl: 'http://172.17.0.102:8080/uploadBase64ToPrivateFile'
            // uploadUrl: 'http://192.168.28.254:8080/uploadBase64ToPrivateFile'
        } );
````

#### 参数说明

| 参数 | 描述 | 值 |
|--------|--------|--------|
|aspectRatio        | 比例(默认 5/7)         | 1/2 、 3/4 ... |
|uploadUrl        | 上传地址        | ./ |
|dealWay        | 处理方式 默认(truncate = “裁剪”)       | ./ |
|cropperAble        | 是否有裁剪 （默认有）       | true/false |
|compareUrl        | 照片比对地址(有传的话将会在上传之后做比对)       |  |
|takeOver        | 托管(一旦托管模式开启将不会有任何cameras内部的ui生成)      |  |
|-> containerId         | 托管渲染的摄像头容器id     |  |
|-> cropperContainerId        | 托管渲染的裁剪对象id     |  |
|-> cropperPreview        | 托管预览的容器id      |  |
|context        | {platformId: '', }  (6个字段)|  |
|cameraSet        | {platformId: '', }  (6个字段)|  |
|-> swfUrl        | flash加载地址      |  |
| libPath         | 新增libPath指示当前的库存在哪里，主要用来给FlashCanvas加载swf用|
|closeAble      | 增加closeAble是否可关闭选项|
|captureUrl| captureUrl拍照地址， 在ie8下面有用，将会先请求此地址生成图片展示在页面上面，|
|previewUrl| previewUrl拍照地址， 在ie8下面有用，将会先请求此地址生成图片展示在页面上面，|
|deleteUrl| deleteUrl拍照地址，执行preview后删除图片，|


#### 方法

##### upload (上传)

````
	theCamera.upload();
````

##### destroy 销毁

````
    theCamera.destroy(); // 多页面上面都有用摄像的话会有无法使用的情况
````

##### getEvent( eventName )  // 获取事件

````
	theCamera.getEvent( '' );
````


##### capture // 拍照

````
	theCamera.capture();
````

##### on (eventName, callback)



````
	/**
    	     'live',   // 摄像头激活的时候
             'error', // 摄像头加载失败
             'compare', // 上传完成对比完成后
             'upload' // 上传后
    */
	theCamera.on( 'live' ); ...
````


#### ie8下面需要将webcam。js里面的catch改变写法


##### 2017-3-16 15:35:00 修复在重拍的时候一直用的上一个图片
##### 2017-3-29 13:37:00 修复在ie8下面拍照base64长度过长，在ie8下面拍照使用先上传再返回预览地址，然后删除临时文件的方式， 其他浏览器正常




