# tasks 目录说明

1. task-loader.js 为任务加载器， gulpfile.js 以加载这个扫描tasks下面的任务文件列表，一并注册到gulp任务当中
    `命名规范 , file-version  ---> 生成任务名称 ---> fileVersion `
    `以-loader.js 结尾的不包括将不被任务加载器加载`