var config = require('../../things/config/config'),
    fs = require('fs'),
    gulp = require('gulp'),
    through2 = require('through2');
/**
 * 文件在每次压缩完成后app.js之类的文件的文件名称随之改变，
 * 避免每次改变完成后服务端的配置跟着变化。将文件内容编写置index.html内容全局变量
 */
gulp.task('collectInfo', function () {
    var reg = /(<script\s*id="app_config_info">)(.|\n|\t|\s)*?(<\/script>)/gi;

    // 获取portal下面的目录
    var portalBase = './app/portal/',
        directories = config.findSubDirectory(portalBase);

    var portalFileMapperLister = [];
    // 收集文件信息.

    directories.forEach(function (directory, index) {
        var path = portalBase + directory,
            styles = config.findSubDirectory(path + '/styles/'),
            themeMapper = {};
        // 收集主题
        styles.forEach(function (style, index) {
            themeMapper[style] = directory + '/styles/' + style + '/webstyle.css';
        });

        var mapper = {
            name: directory,
            themes: themeMapper,
            main: directory + '/main.app.js',
            version: '0.0.1'
        };

        portalFileMapperLister.push(mapper);
    });

    var portalIndex = './app/portal/index.html';

    return gulp.src(portalIndex)

        .pipe(function () {
            return through2.obj(function (file, ex, next) {
                var sourceFileContent = file.contents.toString();
                sourceFileContent = sourceFileContent.replace(reg, ('$1define("_app_config_infos_", function () {"use strict"; return ' + JSON.stringify(portalFileMapperLister) + ' }) $3'));
                fs.writeFileSync(portalIndex, sourceFileContent, config.utfEncoding);
                next();
            })
        }());
});
