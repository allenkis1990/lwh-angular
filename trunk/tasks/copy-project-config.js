
var gulp = require('gulp'),
    through2 = require('through2'),
    File = require('vinyl'),
    path = require('path'),
    fs = require('fs'),
    config = require('../things/config/config');

/**
 * 该任务将门户下面的project.main.json的内容复制到各应用当中，完成域名解析
 */
gulp.task('copyProjectConfig', function () {
    var projectMainConfigJson = require('../app/portal/project.main.json');

    return gulp.src(['./app/admin/index.html'])

        .pipe(function () {
            return through2.obj(function (file, sex, next) {
                var fileContent = file.contents.toString();
                var sourceFilePath = path.relative('./app', file.path),
                    dir = path.dirname(sourceFilePath);
                fileContent = fileContent.replace(/(<script\s*id="project_main_config">)(.|\n|\t|\s)*?(<\/script>)/gi, '$1var projectMainConfig = ' + JSON.stringify(projectMainConfigJson) + ';$3')

                    .replace(/(<script\s*id="app_name_use_in_gulpfile">)(.|\n|\t|\s)*?(<\/script>)/gi, '$1var appName = "' + dir + '";$3');

                var newFile = new File();
                newFile.path = sourceFilePath;
                newFile.contents = new Buffer(fileContent);
                this.push(newFile);
                next();
            })
        }())

        .pipe(gulp.dest('./app'))

});

gulp.task('asignIndexAppName', function () {

    var appSub = config.findSubDirectory('./app'),
        mapper = {};

    appSub.forEach(function (item, index) {
        if (fs.existsSync('./app/' + item + '/modules')) {
            mapper[item] = config.findSubDirectory('./app/' + item + '/modules');
        }
    });
    var filter = [];

    Object.keys(mapper).forEach(function (item, index) {

        mapper[item].forEach(function (subItem, index) {
            filter.push('./app/' + item + '/modules/' + subItem + '/index.html');
        })
    });

    return gulp.src(filter)

        .pipe(function () {
            return through2.obj(function (file, sex, next) {
                var fileContent = file.contents.toString(),
                    sourceFilePath = path.relative('./app', file.path),
                    dir = sourceFilePath.split('\\')[2];

                if (fileContent.indexOf('app_name_use_in_gulpfile') == -1) {

                }

                fileContent = fileContent.replace(/(<script\s*id="app_name_use_in_gulpfile">)(.|\n|\t|\s)*?(<\/script>)/gi, '$1var appName = "' + dir + '";$3');

                var newFile = new File();
                newFile.path = sourceFilePath;
                newFile.contents = new Buffer(fileContent);
                this.push(newFile);
                next();
            })
        }())

        .pipe(gulp.dest('./app'))


});