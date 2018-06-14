/**
 * Created by 46607 on 2017/6/3.
 */


var requirejs = require('requirejs'),
    through2 = require('through2'),
    path = require('path'),
    fs = require('fs'),
    gulp = require('gulp'),
    File = require('vinyl'),
    config = require('../../things/config/config.js');


gulp.task('vendorAdminAbility', function () {
    var buildPath = 'app/admin/';
    return gulp.src(buildPath + 'js/ability/ability.main.js')

        .pipe(through2.obj(function (file, sex, next) {
            requirejs.optimize({
                baseUrl: buildPath + 'js/',
                out: '.temp/js/ability/ability.tmp.js',
                name: 'ability/ability.main',
                keepAmdefine: false,
                optimize: 'none',
                paths: {
                    angular: __dirname + '/../../bower_components/angular/angular',
                    artDialog: __dirname + '/../../bower_components/art-dialog/dist/dialog',
                    webuploader: __dirname + '/../../bower_components/webuploader_fex/dist/webuploader',
                    jquery: __dirname + '/../../bower_components/jquery/dist/jquery',
                    prometheus: __dirname + '/../../bower_components/prometheus/dist',
                    jqueryKnob: __dirname + '/../../bower_components/jquery-knob/js/jquery.knob'
                },
                exclude: ['angular', 'jquery', 'webuploader']
            }, function (text) {
                file.contents = new Buffer(text);
                this.push(file);
                next();
            }.bind(this))
        }))
        .pipe((function () {
            return through2.obj(function (file, sex, next) {
                let fileContent = fs.readFileSync(`.temp/js/ability/ability.tmp.js`).toString();
                // 在hash环境下面，生成的id与自己文件名称一样会导致循环替换致使替换不成功，故直接把这个id替换成空避免这个问题
                fileContent = fileContent.replace(/'ability\/ability\.main',/g, ' ');
                let newFile = new File();
                newFile.path = path.resolve('app', 'admin/js/ability/ability.main.js');
                newFile.contents = new Buffer(fileContent);
                this.push(newFile);
                next()
            })
        })())

        .pipe(env.util.ngAnnotate())

        .pipe(env.util.uglify_())

        .pipe(env.taskLoader.Chuizi())

        .pipe(gulp.dest(`${env.buildPath}`))
});

gulp.task('vendorCenterAbility', function () {
    var buildPath = 'app/center/';
    return gulp.src(buildPath + 'js/ability/ability.main.js')

        .pipe(through2.obj(function (file, sex, next) {
            requirejs.optimize({
                baseUrl: buildPath + 'js/',
                out: '.temp/js/ability/ability.tmpCenter.js',
                name: 'ability/ability.main',
                keepAmdefine: false,
                optimize: 'none',
                paths: {
                    angular: __dirname + '/../../bower_components/angular/angular',
                    artDialog: __dirname + '/../../bower_components/art-dialog/dist/dialog',
                    webuploader: __dirname + '/../../bower_components/webuploader_fex/dist/webuploader',
                    jquery: __dirname + '/../../bower_components/jquery/dist/jquery',
                    prometheus: __dirname + '/../../bower_components/prometheus/dist',
                    jqueryKnob: __dirname + '/../../bower_components/jquery-knob/js/jquery.knob'
                },
                exclude: ['angular', 'jquery', 'webuploader']
            }, function (text) {
                file.contents = new Buffer(text);
                this.push(file);
                next();
            }.bind(this))
        }))
        .pipe((function () {
            return through2.obj(function (file, sex, next) {
                let fileContent = fs.readFileSync(`.temp/js/ability/ability.tmpCenter.js`).toString();
                // 在hash环境下面，生成的id与自己文件名称一样会导致循环替换致使替换不成功，故直接把这个id替换成空避免这个问题
                fileContent = fileContent.replace(/'ability\/ability\.main',/g, ' ');
                let newFile = new File();
                newFile.path = path.resolve('app', 'center/js/ability/ability.main.js');
                newFile.contents = new Buffer(fileContent);
                this.push(newFile);
                next()
            })
        })())

        .pipe(env.util.ngAnnotate())

        .pipe(env.util.uglify_())

        .pipe(env.taskLoader.Chuizi())

        .pipe(gulp.dest(`${env.buildPath}`))
});