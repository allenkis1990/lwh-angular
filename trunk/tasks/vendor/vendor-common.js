/**
 * Created by 46607 on 2017/6/3.
 */


var requirejs = require('requirejs'),
    through2 = require('through2'),
    path = require('path'),
    gulp = require('gulp'),
    config = require('../../things/config/config.js');

var buildPath = 'app/admin/';

gulp.task('vendorCommon', function () {

    return gulp.src(buildPath + '/js/common/common.js')

        .pipe(through2.obj(function (file, sex, next) {
            requirejs.optimize({
                baseUrl: buildPath + '/js/',
                out: buildPath + '/js/common/common.js',
                name: 'common/common',
                keepBuildDir: false,
                // optimize: 'none',
                paths: {
                    angular: __dirname + '/../../bower_components/angular/angular'
                },
                exclude: ['angular']
            }, function (text) {
                file.contents = new Buffer(text);
                this.push(file);
                next();
            }.bind(this))
        }))
});