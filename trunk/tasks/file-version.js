
var fs = require('fs'),
    fileSystem = require('file-system'),
    crypto = require('crypto'),
    gulp = require('gulp'),
    path = require('path'),
    _ = require('lodash');

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
var fileList = [],
    times = 0,
    directoryMap = {},
    hashChangeFiles = [],
    hashLog = {};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

function doLastThings(workPlace) {
    var changeFiles = [],

        some = {},

        last_ = {};

    Object.keys(hashLog).forEach(function (log) {

        hashLog[log].forEach(function (removeItem) {

            if (fs.existsSync(removeItem.sourcePath)) {
                fs.unlinkSync(removeItem.sourcePath);
            }

            changeFiles.push(removeItem.hashPath);

            var outFileName = removeItem.hashPath,
                dire = path.dirname(outFileName),
                itemName = outFileName.split('/'),
                fileName = itemName[itemName.length - 1],
                lastHash = fileName.split('_'),
                lastFileName = lastHash[0] + '_' + lastHash[lastHash.length - 1],
                sufix = lastHash[lastHash.length - 1].split('.')[1];

            some[dire + '/' + lastHash[0] + '.' + sufix] = {
                hash: lastHash,
                dir: dire,
                holName: outFileName,
                fileName: lastFileName
            };
        })
    });

    Object.keys(some).forEach(function (item) {

        var source = some[item],
            hash = source['hash'],
            dir = source['dir'],
            fileName = source['fileName'],
            thePath = dir + '/' + hash.join('_');

        fs.renameSync(thePath, dir + '/' + fileName);
        last_[thePath] = dir + '/' + fileName;
    });

    Object.keys(last_).forEach(function (newFile) {
        var ext = path.extname(newFile),
            te = newFile.split('_')[0],
            fileName = te + ext;

        Object.keys(directoryMap).forEach(function (directory) {
            if (fileName === workPlace + '/' + directory + '/' + fileName.split('/')[fileName.split('/').length - 1]) {
                fs.renameSync(last_[newFile], fileName);
                last_[newFile] = fileName;
            }
        });
    });

    Object.keys(directoryMap).forEach(function (directory) {

        var reg = new RegExp('^' + workPlace + '/' + directory);

        Object.keys(last_).forEach(function (fuck) {

            if (reg.test(fuck)) {
                var fileContents = fs.readFileSync(last_[fuck]).toString();
                Object.keys(last_).forEach(function (fuckU) {
                    var ext = path.extname(fuckU),
                        fileReg = new RegExp('(.*)\\' + ext + '$');
                    var theKey = fuckU
                            .replace(fileReg, '$1')
                            .replace(workPlace + '/' + directory + '/js/', '')
                            .replace(workPlace + '/' + directory + '/', ''),

                        joinKey = last_[fuckU]
                            .replace(fileReg, '$1')
                            .replace(workPlace + '/' + directory + '/js/', '')
                            .replace(workPlace + '/' + directory + '/', '');

                    fileContents = fileContents.split(theKey)
                        .join(joinKey);
                });

                fs.writeFileSync(last_[fuck], fileContents, {encoding: 'UTF-8'});
            }

        })
    })
}
function readFile(outPath) {

    var theFiles = [];

    function doRead(path) {
        var fsStat = fs.statSync(path);
        if (fsStat.isDirectory()) {
            var dirs = fs.readdirSync(path);

            dirs.forEach(function (directory) {
                doRead(path + '/' + directory)
            })

        } else {
            theFiles.push({
                sourcePath: path,
                buffer: fs.readFileSync(path)
            });
        }
    }

    doRead(outPath);

    return theFiles;
}

function resetDirectoryMap(workPlace) {
    var result = {},
        directories = [];

    getSubDirectory(workPlace).forEach(function (fileOrDirectory) {
        var fileStats = fs.statSync(workPlace + '/' + fileOrDirectory);
        fileStats.isDirectory() && directories.push(fileOrDirectory);
    });

    directories.forEach(function (directory) {
        result[directory] = {};
    });

    return result;
}

/**
 *执行任务
 * @param fileArray
 * @param srcPath
 * @param destPath
 */
function rev_replace(fileArray, workPlace) {
    this.workPlace = workPlace;
    this.manifest = {};
    console.log(times + '************************************************************************************************************');
    directoryMap = {};
    var me = this;

    directoryMap = resetDirectoryMap(workPlace);

    hashChangeFiles = [];

    ////////////////////////////////////
    ////////////////////////////////////
    doHash.call(this, fileArray);
    ////////////////////////////////////
    ////////////////////////////////////

    ////////////////////////////////////
    ////////////////////////////////////
    makeManifestFile.call(this);
    ////////////////////////////////////
    ////////////////////////////////////

    ////////////////////////////////////
    ////////////////////////////////////
    genDirectoryMap.call(this, null);
    ////////////////////////////////////
    ////////////////////////////////////

    ////////////////////////////////////
    ////////////////////////////////////
    replaceContent.call(this, fileArray);
    ////////////////////////////////////
    ////////////////////////////////////

    if (hashChangeFiles.length > 0) {
        hashLog[times] = hashChangeFiles;
        hashChangeFiles.forEach(function (changeFile) {
            changeFile.sourcePath = changeFile.hashPath;
        });

        times++;
        rev_replace(hashChangeFiles, workPlace);
    }
}

/**
 * hash生成
 * @param fileArray
 * @param manifest
 */
var hashMap = {};
function doHash(fileArray) {

    var me = this;

    fileArray.forEach(function (file) {
        // 将源地址保存
        var oldFilePath = file.sourcePath,

            // 新的地址将指向到构建目录下面
            newFilePath = file.sourcePath;

        // 如果file对象中不存在buffer 则手动去加载buffer文件流
        if (!file.buffer) {
            file.buffer = fs.readFileSync(file.sourcePath);
        }

        // 获取文件的后缀名;
        var ext = path.extname(file.sourcePath),

            // hash整个文件内容, 如果文件内容较上一次有变更则hash将跟上一次的不同
            hash = crypto.createHash('md5')
                .update(file.buffer.toString())
                .digest('hex').slice(0, 10);

        if (!hashMap[newFilePath]) {
            hashMap[newFilePath] = {
                hashHistory: []
            }
        }

        hashMap[newFilePath].hashHistory.unshift(hash);

        // 生成新的文件地址， 使用hash追加
        newFilePath = newFilePath.replace(new RegExp(ext + '$'), '_' + hash + ext);

        // 保存文件生成的hash目录到hashPath当中供后面使用
        file.hashPath = newFilePath;

        // 将文件从源来的目录下面拷贝到新的目录下面
        // .copyFileSync ( oldFilePath, newFilePath );
        fs.renameSync(oldFilePath, newFilePath);

        // 将生成的新的hash地址保存到manifest[旧地址]映射
        me.manifest[oldFilePath] = newFilePath;
    });
}

/**
 * 保存manifest到{destPath}/manifest.json中...
 * @returns {*}
 */
function makeManifestFile() {
    return fs.writeFileSync(this.workPlace + '/manifest.json',
        JSON.stringify(this.manifest), {encoding: 'UTF-8'});
}

/**
 *
 * @param manifest
 * @returns {*}
 */
function genDirectoryMap() {
    var me = this;

    Object.keys(this.manifest).forEach(function (srcFilePath) {
        for (var directory in directoryMap) {
            var publicReg = new RegExp('^' + me.workPlace + '/' + directory + '/', 'ig');
            if (publicReg.test(srcFilePath)) {
                directoryMap[directory][srcFilePath]
                    = me.manifest[srcFilePath];
            }
        }
    });
}

/**
 *
 * @param ext
 * @returns {boolean}
 */
function isTxt(ext) {
    return ['.js', '.html', '.css', '.json'].indexOf(ext) !== -1;
}
/**
 * 替换每个转换过hash的文件引用内容
 * @param fileArray
 * @param mapInfo
 */
function replaceContent(fileArray) {
    var me = this;
    Object.keys(directoryMap).forEach(function (directory) {
        // 执行文件内容替换
        var publicReg = new RegExp('^' + me.workPlace + '/' + directory);

        fileArray.forEach(function (file) {
            if (publicReg.test(file.sourcePath)) {
                if (isTxt(path.extname(file.sourcePath))) {
                    var fileContents = file.buffer.toString();
                    // 判断文件夹是否带是portal/、admin/、login/、center/、开头
                    Object.keys(directoryMap[directory]).forEach(function (manifestKey) {

                        var ext = path.extname(manifestKey),
                            someHow = manifestKey
                                .replace(me.workPlace + '/' + directory + '/js/', '')
                                .replace(me.workPlace + '/' + directory + '/', ''),
                            fileReg = new RegExp('(.*)\\' + ext + '$');

                        var theKey = someHow.replace(fileReg, '$1'),
                            joinKey = directoryMap[directory][manifestKey]
                                .replace(fileReg, '$1')
                                .replace(me.workPlace + '/' + directory + '/js/', '')
                                .replace(me.workPlace + '/' + directory + '/', '');

                        if (fileContents.indexOf(theKey) !== -1 &&
                            manifestKey
                                .replace(new RegExp('^' + me.workPlace + '/'), '')
                                .indexOf(directory + '/index') === -1) {

                            var findOut = _.find(hashChangeFiles, function (toto) {
                                return toto.sourcePath === file.sourcePath;
                            });

                            if (!findOut) {
                                hashChangeFiles.push({
                                    sourcePath: file.sourcePath,
                                    hashPath: file.hashPath
                                });
                            }

                            fileContents = fileContents.split(theKey)
                                .join(joinKey);
                        }
                    });
                    fs.writeFileSync(file.hashPath, fileContents, {encoding: 'UTF-8'});
                }
            }
        });
    });
}

function getSubDirectory(workPlace) {
    return fs.readdirSync(workPlace);
}

module.exports = {
    doRevReplace: function (options) {
        var tempFileList = readFile(`${env.buildPath}`);

        tempFileList.forEach(function (file) {
            fileSystem.copyFileSync(file.sourcePath,
                file.sourcePath.replace(/^build\//, options.workPlace + '/'));
        });

        fileList = readFile(options.workPlace);

        rev_replace(fileList, options.workPlace || `${env.deployPath}`);

        doLastThings(options.workPlace);
    },
    doRenameIndex: function (options) {
        gulp.src(options.workPlace + '')
    }
}
