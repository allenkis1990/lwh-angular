/**
 * Created by 46607 on 2017/4/25.
 */
var fs = require('fs'),
    gulp = require('gulp'),
    path = require('path');

var files = [];
function walker(fPath) {
    fs.readdirSync(fPath).forEach(function (directoryOrFile) {
        if (directoryOrFile.indexOf('-loader.js') == -1) {
            var subPath = fPath + '/' + directoryOrFile;
            if (fs.lstatSync(subPath).isDirectory()) {
                walker(subPath);
            } else {
                files.push(subPath);
            }
        }
    })
}

var taskLoader = {};

walker('./tasks/');
/*
 只有js 文件才能加载进来
 */
files.forEach(function (directory, index) {
    directory = path.relative('./tasks', directory);
    if (/\.js$/.test(directory)) {
        taskLoader[path.basename(directory).replace(/-([A-Za-z])/g, function (item, group) {
            return group.toUpperCase()
        }).replace(/\.js$/g, '')] = require('./' + directory);
    }
});
module.exports = taskLoader;
