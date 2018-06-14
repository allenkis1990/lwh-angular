/**
 * prometheus - 普罗米修斯
 * @author 
 * @version v1.0.8
 * @link 
 * @license MIT
 */
define(["webuploader","angular","lodash"],function(e,i,t){"use strict";function o(e,i,t,o,n,a,s,r,l,u,c,d,f){this.version="0.0.0.1",this.$compile=s,this.$timeout=a,this.services=d,this.$scope=e,this.$log=o,this.HB_notification=f,this.$ngModelCtrl=n,this.name="Hb_uploader",this.$targetElement=i,this.targetAttributes=t,this.hbWebUploaderFactory=u,this.uploadFileCollections=c,this.lessonManageService=r,this.hbBasicData=l,this.events={beforeFileQueued:"beforeFileQueued",fileQueued:"fileQueued",fileDequeued:"fileDequeued",uploadFinished:"uploadFinished",uploadStart:"uploadStart",uploadProgress:"uploadProgress",uploadError:"uploadError",uploadSuccess:"uploadSuccess",uploadComplete:"uploadComplete",error:"提示"},this.defaultConfiguration=$.extend({},{pick:{id:i,innerHTML:t.buttonText||"选择文件",multiple:!1},formData:{context:l.imageSourceConfig.params.context,requestContext:l.imageSourceConfig.params.requestContext},prepareNextFile:!0,accept:{title:"files",extensions:"doc,docx,xls,xlsx,ppt,pdf,txt,flv,mp4,avi,mpeg,mpg,wmv,zip"},compress:!1,timeout:0,auto:!1,swf:"/bower_components/webuploader_fex/dist/Uploader.swf",threads:1},t),this.__init()}function n(){var o=this,n=o.uploaderInstance;o.$scope.Hb_uploadFile=function(){var e=n.getFiles(),t=!0;e.length<=0?o.HB_notification.error("提示","请选择要上传的文件!"):(i.forEach(e,function(e){return e.nameNull?e.nameRepeat?e.nameToo?void 0:(o.HB_notification.error("提示","课件名称不能太长!"),t=!1,!1):(o.HB_notification.error("提示","课件名称不能重复!"),t=!1,!1):(o.HB_notification.error("提示","课件名称不能为空!"),t=!1,!1)}),t&&n.upload())},o.$scope.Hb_deleteFile=function(e){o.HB_notification.confirm("提示","文件正在上传是否需要删除课件",function(){if(e.courseOutlineId)o.lessonManageService.deleteCourseOutline(e.courseOutlineId).then(function(i){return i.status?(t.remove(o.$ngModelCtrl.$viewValue,function(i){return i.id===e.id}),o.HB_notification.closeAlert(),!1):void o.HB_notification.error("提示",i.info)});else{if(e.record)return t.remove(o.$ngModelCtrl.$viewValue,function(i){return i.id===e.id}),i.forEach(o.$scope.model.coursewareList,function(i){if(i.id==e.id)return i.select=!1,!1}),!1;o.HB_notification.closeAlert(),n.removeFile(e,!0)}})},n.on(o.events.fileQueued,function(i){i.ufCollectionIndex=o.uploadFileCollections.addUf(i),o.$timeout(function(){var t=o.$scope.model.courseOutlines[o.$scope.model.selectIndex],n=0;t.subCourseOutlines.length>0&&(n=t.subCourseOutlines[t.subCourseOutlines.length-1].sort),i.progress=0,i.renameName=i.name.substring(0,i.name.lastIndexOf(".")),i.type=s(i.ext),i.formatSize=e.formatSize(i.size),i.uploadSuccess=!1,i.liveStatus=0,0===i.name.length?i.nameNull=!1:i.nameNull=!0,i.name.length>32?i.nameToo=!1:i.nameToo=!0,i.nameRepeat=!0,i.sort=++n,o.$ngModelCtrl.$viewValue.push(i)}),o._log("文件<<<<"+i.name+">>>>>被加入到上传队列中")}),n.on(o.events.uploadProgress,function(e,i){o.$timeout(function(){e.progress=1===i?100:(100*i).toFixed(2),100===e.progress&&(e.liveStatus=2,o._log("文件<<<<"+e.name+">>>>>上传进度执行到100%"))})}),n.on(o.events.uploadSuccess,function(e,t){o.uploadFileCollections.deleteUf(e.ufCollectionIndex),o.$timeout(function(){e.endUploadTiming=(new Date).getTime(),o._log("文件<<<<"+e.name+">>>>>上传成功"),e.liveStatus=3,e.successUploadTime=(new Date).getTime();var a=i.fromJson(t);if(i.isObject(a)){var s={videoClarityList:e.videoClarityList,supplierId:o.$scope.model.supplierId,coursewareResourcePath:a.newPath,expandData:e.formatSize,name:e.name};o.lessonManageService.createCourseware(s).then(function(i){i.status?(e.uploadSuccess=!0,e.cweId=i.info,e.liveStatus=4):(e.liveStatus=-2,n.removeFile(e,!0))})}})}),n.on("uploadBeforeSend",function(e,i,t){if((o.checkIsBigFile(e.file.size)||"big"===o.targetAttributes.standard)&&!o.isIe()){var n=e.chunks,a=e.chunk;i.guid=e.file.guid,i.md5=e.file.md5,i.originalFileName=e.file.name+"."+e.file.ext,n>1&&(i.chunks=n,i.chunk=a,i.chunkMd5=e.file.chunkMd5,i.chunkSize=e.blob.size)}}),n.on(o.events.uploadStart,function(e){e.name=e.renameName,e.beginUploadTiming=(new Date).getTime()}),n.on(o.events.error,function(e){var i="";switch(e){case"Q_TYPE_DENIED":i="文件格式不支持!"}o.HB_notification.error("提示",i)}),n.on(o.events.beforeFileQueued,function(t){var s=a(n,t),r=t.ext,l="avi rmvb rm asf divx mpg mpeg mpe wmv mp4 mkv vob",u=!1,c=t.name.substring(0,t.name.lastIndexOf(".")),d=l.indexOf(r),f=o.isIe(),p=o.checkIsBigFile(t.size);return 1610612736<t.size&&f?(o.HB_notification.error("提示","想体验超爽超大文件上传，请用chrome或者firefox主流浏览器...."),!1):p&&"big"!==o.targetAttributes.standard&&!f?(o.HB_notification.error("提示","当前上传文件大小定义属于大文件，请配置规格standard为big模式....."),!1):"big"!==o.targetAttributes.standard||p||f?s?(o.HB_notification.error("提示","已经有选中的文件在队列中!"),!1):(i.forEach(o.$scope.model.courseOutlines[o.$scope.model.selectIndex].subCourseOutlines,function(e){if(e.renameName==c)return u=!0,o.HB_notification.error("提示,","文件的名称不能重复!"),!1}),!u&&void(d!==-1&&(t.formatSize=e.formatSize(t.size),o.$scope.$$file=t,o.$scope.$$file.videoClarityList=[],o.$scope.__choose_media_options={title:!1,resizable:!1,draggable:!1,modal:!0,width:402,height:445,open:function(e){var i=this.element,t=i.parent();t.css({top:"50%",left:"50%",marginTop:"-205px",marginLeft:"-200px",position:"fixed!important"})},content:"templates/common/choose-media.html"},o.$scope.checkBoxCheck=function(e){if(e.currentTarget.checked)o.$scope.$$file.videoClarityList.push(e.currentTarget.value);else{var i=o.$scope.$$file.videoClarityList.indexOf(e.currentTarget.value);o.$scope.$$file.videoClarityList.splice(i,1)}},o.$scope.checkSpan=function(e){var i=$(e.target).prev();if(i.is(":checked")){var t=o.$scope.$$file.videoClarityList.indexOf(i.val());o.$scope.$$file.videoClarityList.splice(t,1),i.prop("checked",!1)}else o.$scope.$$file.videoClarityList.push(i.val()),i.prop("checked",!0)},o.$scope.closeWindow=function(){n.removeFile(o.$scope.$$file,!0),o.$scope.__choose_media_window.close()},o.$scope.saveAddToQueue=function(){return null==o.$scope.$$file.videoClarityList||0==o.$scope.$$file.videoClarityList.length?(o.HB_notification.error("提示","请选择转码参数!"),!1):void o.$scope.__choose_media_window.close()},$("html").append(o.$compile('<div kendo-window="__choose_media_window" k-options="__choose_media_options"></div>')(o.$scope))))):(o.HB_notification.error("提示","当前上传文件大小定义属于小文件，请配置规格standard为small模式或者不配置.....!"),!1)}),n.on(o.events.fileDequeued,function(e){o.uploadFileCollections.deleteUf(e.ufCollectionIndex),o._log("文件<<<<"+e.name+">>>>>从队列中删除"),o.$timeout(function(){var i=e.__hash;t.remove(o.$ngModelCtrl.$viewValue,function(e){return e.__hash===i})})}),n.on(o.events.uploadError,function(e,i,t){o.$log.error(e,i,t)}),o.$scope.$on("$destroy",function(){n.stop(!0)})}function a(e,i){var o=e.getFiles();if(o.length<=0)return!1;var n=t.find(o,function(e){return e.name===i.name&&e.size===i.size&&i.ext===e.ext});return"undefined"!=typeof n}function s(e){return"zip"==e?3:"doc"==e||"docx"==e||"xls"==e||"xlsx"==e||"ppt"==e||"txt"==e?1:2}o.prototype.__init=function(){function i(e,i){s.uploaderInstance.trigger("uploadProgress",e,1),s.uploaderInstance.trigger("uploadComplete",e),s.uploaderInstance.trigger("uploadSuccess",e,i),s.uploaderInstance.trigger("uploadFinished",e)}function t(e){s.$log.log("%c"+e,"color:gray;font-weight:bold;font-size:16px;background:pink;")}function o(){s.hbWebUploaderFactory.registed=!0;var t=new e.Runtime.Html5.Md5({});e.Uploader.register({"before-send-file":"beforeSendFile","before-send":"beforeSend"},{beforeSendFile:function(o){var n=$.Deferred(),a=o.size;return o.guid=e.Base.guid(),s.$timeout(function(){o.liveStatus=1}),o.md5=t.md5String([o.lastModifiedDate.getTime(),o.name,o.size].join("-")),s.checkIsBigFile(a)&&!s.isIe()?($.ajax({type:"post",url:s.uploadUseInfo.md5CheckUrl,data:{md5:o.md5,guid:o.guid,originalFileName:o.name,context:s.hbBasicData.imageSourceConfig.params.context,requestContext:s.hbBasicData.imageSourceConfig.params.requestContext},cache:!1,dataType:"json",success:function(e){e.exists?(i(o,e),s.uploaderInstance.skipFile(o),n.reject(),o.newPath=e.newPath):n.resolve()},error:function(){n.resolve()}}),n.resolve()):(s.$timeout(function(){o.liveStatus=2}),n.resolve()),$.when(n)},beforeSend:function(e){var i=$.Deferred();if(s.checkIsBigFile(e.file.size)&&!s.isIe()){e.file.chunkMd5=t.md5String([e.file.lastModifiedDate.getTime(),e.file.name,e.chunk,e.file.size].join("-"));var o={md5:e.file.md5,guid:e.file.guid,originalFileName:e.file.name,size:e.file.size,context:s.hbBasicData.imageSourceConfig.params.context,requestContext:s.hbBasicData.imageSourceConfig.params.requestContext},n=e.chunks,a=e.chunk;n>1?(o.chunks=n,o.chunk=a,o.chunkMd5=e.file.chunkMd5,o.chunkSize=e.blob.size,$.ajax({type:"post",url:s.uploadUseInfo.blockMd5CheckUrl,data:o,cache:!1,dataType:"json"}).then(function(e){e.exists?i.reject():i.resolve()},function(){i.resolve()})):i.resolve()}else i.resolve();return $.when(i)}})}this.md5Object=new e.Runtime.Html5.Md5({}),this.checkIsBigFile=function(e){return e>=20},this.isIe=function(){return function(e){var i=e.match(/MSIE\s([\d\.]+)/)||e.match(/(?:trident)(?:.*rv:([\w.]+))?/i);return i&&parseFloat(i[1])}(navigator.userAgent)},this.uploadUseInfo={},this.uploadUseInfo.md5CheckUrl=this.hbBasicData.imageSourceConfig.md5CheckUrl,this.uploadUseInfo.blockMd5CheckUrl=this.hbBasicData.imageSourceConfig.blockMd5CheckUrl,this.uploadUseInfo.uploadBigFileUrl=this.hbBasicData.imageSourceConfig.uploadBigImageUrl,this.uploadUseInfo.uploadSmallFileUrl=this.hbBasicData.imageSourceConfig.uploadImageUrl,this.uploaderInstance={};var a=this.isIe(),s=this;this.hbWebUploaderFactory.registed||o(),this.defaultConfiguration.server=this.uploadUseInfo.uploadSmallFileUrl,this.isIe()||"big"!==this.targetAttributes.standard||(this.defaultConfiguration.server=this.uploadUseInfo.uploadBigFileUrl),a?this.defaultConfiguration.runtimeOrder="flash":"big"===this.targetAttributes.standard&&(this.defaultConfiguration.chunked=!0,this.defaultConfiguration.chunkRetry=0,this.defaultConfiguration.chunkSize=52428800),this.uploaderInstance=e.create(this.defaultConfiguration),this.$scope.uploadFileInstances=this.$scope.uploadFileInstances||[],s.targetAttributes.id&&this.$scope.uploadFileInstances.push({fileInstanceId:s.targetAttributes.id,instance:this.uploaderInstance}),n.call(this),this._log=t};var r=["$timeout","$compile","$log","lessonManageService","hbBasicData","hbWebUploaderFactory","uploadFileCollections","$interval","$http","HB_notification",function(e,i,t,n,a,s,r,l,u,c){return{require:"ngModel",restrict:"A",link:function(d,f,p,h){if(s.keepSessionCommunication(),!h)throw new Error("元素节点上面必须要有ngModel指定对象!");e(function(){new o(d,f,p,t,h,e,i,n,a,s,r,{$interval:l,$http:u},c)},100),d.$on("$destroy",function(){s.closeSessionCommunication()})}}}],l=i.module("hb.webuploader",[]);l.directive("uploadFiles",r),l.factory("hbWebUploaderFactory",["$http","$interval","$log",function(e,i,t){function o(){e.get(n.keepOnLineUrl,function(e){})}var n={};return n.registed=!1,n.keepOnLineTime=6e5,n.keepOnLineUrl="/gateway/web/home/login/getUserInfo.action",n.keepSessionInterval=null,n.closeSessionCommunication=function(){t.info("关闭与服务器的通信!"+(new Date).toLocaleString()),i.cancel(this.keepSessionInterval),this.keepSessionInterval=null},n.keepSessionCommunication=function(){this.keepSessionInterval||(o(),t.info("开始与服务器保持通信，避免在上传过程中session出现失效导致上传大文件不能及时保存!"+(new Date).toLocaleString()),this.keepSessionInterval=i(function(){t.info("与服务器通信中......当前通信时间为"+(new Date).toLocaleString()),o()},n.keepOnLineTime))},n}])});