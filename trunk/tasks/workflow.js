/**
 * Created by 小灰灰 on 2017/9/8.
 ${customer.Address}
 */

let [gulp, uglify, removeLogs, ngAnnotate, cssmin, htmlmin, less, fs] =
    [require('gulp'), require('gulp-uglify'),
        require('gulp-removelogs'), require('gulp-ng-annotate'),
        require('gulp-clean-css'), require('gulp-htmlmin'), require('gulp-less'), require('fs')];

gulp.task('workflow', ['workflow:html', 'workflow:js', 'workflow:css', 'workflow:images']);
/**
 * 将workflow下面的js拷贝到public目录下面
 */
gulp.task('workflow:js', () => {
    return gulp.src(`${env.appPath}/workflow/**/*.js`)
        .pipe(removeLogs())
        .pipe(ngAnnotate())
        .pipe(uglify({
            compress: {screw_ie8: false},
            mangle: {screw_ie8: false},
            output: {screw_ie8: false}
        }))
        .pipe(gulp.dest(`${env.deployPath}/workflow`))
});
/**
 * 将workflow下面的html拷贝到public目录下面
 */
gulp.task('workflow:html', () => {
    return gulp.src(`${env.appPath}/workflow/**/*.html`)
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(`${env.deployPath}/workflow`))
});
/**
 * 将workflow下面的images拷贝到public目录下面
 */
gulp.task('workflow:images', () => {
    return gulp.src(`${env.appPath}/workflow/**/*.{jpg,png,gif,jpeg,ico,icon}`)
        .pipe(gulp.dest(`${env.deployPath}/workflow`))
});
/**
 * 将workflow下面的css拷贝到public目录下面
 */
gulp.task('workflow:css', () => {
    return gulp.src(`${env.appPath}/workflow/**/*.less`)
        .pipe(less())
        .pipe(cssmin({
            //避免在清除的时候将文件路径重新定位
            rebase: false,
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest(`${env.deployPath}/workflow`))
});

/**
 * 将workflow下面的css拷贝到public目录下面
 */
gulp.task('workflow:mapperGenerator', () => {
    var workflowsSubDirs = fs.readdirSync(`${env.appPath}/workflow/workflows`),
        jsonObjects = [];

    workflowsSubDirs.forEach(function (item) {
        jsonObjects.push({
            key: item,
            version: '',
            id: ''
        })
    });

    fs.writeFileSync(`${env.appPath}/workflow/mapperViewer/data/workflows.json`, JSON.stringify(jsonObjects), {encoding: 'UTF-8'});
});
