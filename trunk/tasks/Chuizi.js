/**
 * Created by 46607 on 2017/7/14.
 ${customer.Address}
 */

let through2 = require('through2'),
    File = require('vinyl'),
    gulp = require('gulp'),
    fs = require('fs'),
    path = require('path');

function getSubDirectories(path) {
    let directories = [];
    fs.readdirSync(path).forEach(function (item, index) {
        let subPath = path + '/' + item;
        fs.lstatSync(subPath).isDirectory() && directories.push(item);
    });
    return directories;
}

let directories = getSubDirectories('./app');
let directoryMapper = {},
    modulesDirectoryMapper = {};

directories.forEach((item) => {
    let sub;
    if (/admin|center/.test(item)) {
        sub = getSubDirectories(`./app/${item}/modules`);
    }
    directoryMapper[item] = directoryMapper[item] || {};
    modulesDirectoryMapper[item] = modulesDirectoryMapper[item] || {};
    if (sub) {
        sub.forEach((subItem) => {
            directoryMapper[item][subItem] = {};
            modulesDirectoryMapper[item][subItem] = {};
        })
    } else {
        directoryMapper[item] = {}
    }
});

module.exports = (options) => {
    return through2.obj(function (file, sex, next) {
        let matcher = file.path.match(/.*?\\?app\\(admin|center)\\modules\\((admin|center).*?)\\(.*?)+/);
        if (!matcher) {
            Object.keys(directoryMapper).forEach((directory) => {
                if (new RegExp(`app\\\\*?${directory}\\\\`, 'g').test(file.path)) {
                    if (/center|admin/.test(directory)) {
                        Object.keys(directoryMapper[directory]).forEach((sbDir) => {
                            let $newFile = new File();
                            $newFile.contents = file.contents;
                            $newFile.path = file.path;
                            directoryMapper[directory][sbDir][file.path] = $newFile
                        })
                    } else {
                        let $newFile = new File();
                        $newFile.contents = file.contents;
                        $newFile.path = file.path;
                        directoryMapper[directory][file.path] = $newFile
                    }
                }
            })
        } else {
            Object.keys(modulesDirectoryMapper).forEach((directory) => {
                if (new RegExp(`app\\\\*?${directory}\\\\`, 'g').test(file.path)) {
                    Object.keys(modulesDirectoryMapper[directory]).forEach((sbDir) => {
                        let $newFile = new File();
                        $newFile.contents = file.contents;
                        $newFile.path = file.path;
                        if (matcher[2] === sbDir) {
                            modulesDirectoryMapper[directory][sbDir] = modulesDirectoryMapper[directory][sbDir] || {};
                            modulesDirectoryMapper[directory][sbDir][file.path.replace(/.*?\\?app\\(admin|center)\\modules\\((admin|center).*?)\\(.*?)/g, '$4')] = $newFile;
                        }
                    })
                }
            })
        }
        next()
    }, function (next) {

        Object.keys(modulesDirectoryMapper).forEach((item) => {
            Object.keys(modulesDirectoryMapper[item]).forEach((sbItem) => {
                Object.keys(modulesDirectoryMapper[item][sbItem]).forEach((grandSbItem) => {
                    let _path = path.resolve('./app', `${item}/${grandSbItem}`);
                    let $newFile = new File();
                    $newFile.path = _path;
                    $newFile.contents = modulesDirectoryMapper[item][sbItem][grandSbItem].contents;
                    if (!directoryMapper[item][sbItem][_path]) {
                        directoryMapper[item][sbItem][_path] = $newFile
                    }
                })
            })
        });

        Object.keys(directoryMapper).forEach((directory) => {
            if (/center|admin/.test(directory) && directory !== 'center2') {
                Object.keys(directoryMapper[directory]).forEach((sbDir) => {
                    Object.keys(directoryMapper[directory][sbDir]).forEach((filePath) => {
                        let $newFile = new File();
                        let $file = directoryMapper[directory][sbDir][filePath];
                        let match = $file.path.replace(/.*?\\?app\\(admin|center)\\(.*?)/g, '$2');
                        if (modulesDirectoryMapper[directory][sbDir][match]) {
                            $newFile.contents = modulesDirectoryMapper[directory][sbDir][match].contents;
                        } else {
                            $newFile.contents = $file.contents;
                        }
                        $newFile.path = $file.path.replace(new RegExp('(.*?\\\\*?app\\\\' + directory + ')', 'g'), `./${sbDir}`);
                        this.push($newFile)
                    })
                })
            } else {
                if (directory !== 'center2') {
                    Object.keys(directoryMapper[directory]).forEach((filePath) => {
                        let $file = directoryMapper[directory][filePath];
                        $file.path = $file.path.replace(/\\app\\/, '\\')
                        this.push($file)
                    })
                }
            }
        });
        next()
    })
};


/**
 * 分析states下面的文件，
 */
gulp.task('analyzeStateMapper', function () {

    ['admin'].forEach(function (directory) {
        // 获取母版的states集合
        var directories = getSubDirectories(`./app/${directory}/modules`);

        const motherStates = fs.readdirSync(`./app/${directory}/js/states/`),
            stateMapper = {
                modules: [],
                futureStates: []
            };

        directories.forEach((item, index) => {
            var myStates = [];

            var subStates = fs.readdirSync(`${env.buildPath}/${item}/js/states/`);
            /*
             * 1. 如果当前模板存在和此母块的配置信息的话，将母块当中的信息覆盖成自己模板的信息  √
             * 2. 如果母快中有子中没有的配置信息，将母的保留，√
             * 3. 如果子中有母中没有的信息， 将子的信息保存进去，√
             * 。。。完成配置
             */

            // 将子的全部丢进集合
            myStates = subStates;

            // 循环母版集合， 如果不存在子中，将元素丢进以存在的mStates中..
            motherStates.forEach((mItem, mIndex) => {
                if (subStates.indexOf(mItem) === -1) {
                    myStates.push(mItem);
                }
            });


            /**
             * modules[n] = {
         *       "reconfig": true,
         *       "name": "app.admin.states.home",
         *       "files": ["states/home-state"]
         *   }
             * futureStates[n] = {
         *      "module": "app.admin.states.home",
         *      "stateName": "states.home",
         *      "url": "/home",
         *      "type": "ocLazyLoad"
         *   }
             */
            myStates.forEach((rItem, rindex) => {
                var name = rItem.replace(/-state.js$/g, ''),
                    fileNameWithoutExt = rItem.replace(/.js$/, ''),
                    moduleName = 'app.' + name + '.states.' + name;

                stateMapper.modules.push({
                    reconfig: true,
                    name: moduleName,
                    files: ['states/' + fileNameWithoutExt]
                });
                stateMapper.futureStates.push({
                    module: moduleName,
                    stateName: 'states.' + name,
                    url: '/' + name,
                    type: 'ocLazyLoad'
                });
            });

            var content = 'define(function() {"use strict"; return ' + JSON.stringify(stateMapper) + '})';
            fs.writeFileSync(`${env.buildPath}/${item}/js/common/stateMapper.js`, content, {encoding: 'UTF-8'});
        });
    })
});
