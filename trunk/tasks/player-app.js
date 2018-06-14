/**
 * Created by 46607 on 2017/6/14.
 ${customer.Address}
 */

var send = require('send'),
    fs = require('fs'),
    uglify = require('gulp-uglify'),       // js压缩混淆
    removeLogs = require('gulp-removelogs'),   // 删除console.log
    ngAnnotate = require('gulp-ng-annotate'),
    cssmin = require('gulp-clean-css'),   // css压缩
    htmlmin = require('gulp-htmlmin');      // html压缩

/**
 * 起因： 避免在更新课程播放包的时候，用户将内容更改导致版本不一致，所以将原来app/play下面的文件全部都删除掉，
 *         项目当中执行bower install lessonPlatform --save 将成为组件的play下载下来，
 * 问题： play除了/js/extend/extend.js之外没有别的文件，地址访问的时候必然会报404
 * 解决：研发期间 ---- > 当前文件处理在研发的时候，前端服务找不到文件的时候，将文件目录引用定位到
 *      bower_components/lesson-platform/dist/下面去，找得到的时候不处理
 *      交付测试 ---- > 项目构建的时候将会执行以下任务
 *          1. 执行构建的时候将原有的拷贝执行流程更改，先不拷贝./app/play下面的所有文件
 *          2. copyLessonPlatform 将/bower_components/lesson-platform/dist/下面的所有文件拷贝到build目录下面
 *          3. 然后copyPlayDirectory 将会把 ./app/play下面的所有文件拷贝到build下面， 覆盖组件内容，保证内容合并成业务需求的
 *              东西
 *
 * @param req
 * @param res
 * @param next
 */
var gulp = require('gulp');

gulp.task('copyLessonPlatform', ['lessonPlatform:js', 'lessonPlatform:images', 'lessonPlatform:html', 'lessonPlatform:css'], function () {

});

gulp.task('lessonPlatform:js', function () {
    return gulp.src('./bower_components/lesson-platform/dist/**/*.js')
        .pipe(removeLogs())
        .pipe(ngAnnotate())
        .pipe(uglify({
            compress: {screw_ie8: false},
            mangle: {screw_ie8: false},
            output: {screw_ie8: false}
        }))
        .pipe(gulp.dest('./public/play'))
})
gulp.task('lessonPlatform:css', function () {
    return gulp.src('./bower_components/lesson-platform/dist/**/*.css')
        .pipe(cssmin({
            //避免在清除的时候将文件路径重新定位
            rebase: false,
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public/play'))
})
gulp.task('lessonPlatform:images', function () {
    return gulp.src('./bower_components/lesson-platform/dist/**/*.{jpg,png,gif,jpeg,ico,icon}')
        .pipe(gulp.dest('./public/play'))
})
gulp.task('lessonPlatform:html', function () {
    return gulp.src('./bower_components/lesson-platform/dist/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest('./public/play'))
})

gulp.task('copyPlayDirectory', ['copyLessonPlatform'], function () {
    return gulp.src('./app/play/**/*.*')

        .pipe(gulp.dest('./public/play'))
});

module.exports = function (req, res, next) {
    if (/^\/play/.test(req.url)) {
        var realPath = req.originalUrl;
        if (!fs.existsSync('./app/' + realPath.split('?')[0])) {
            req.url = req.url.replace(/^\/play\//, '');
            var stream = send(req, req.url.split('?')[0], {
                root: './bower_components/lesson-platform/dist'
            });
            stream.pipe(res);
        } else {
            next();
        }
    } else {
        next();
    }
};