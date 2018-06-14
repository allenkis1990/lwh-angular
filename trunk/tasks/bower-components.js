/**
 * Created by 46607 on 2017/6/15.
 ${customer.Address}
 */

var gulp = require('gulp'),
    path = require('path'),
    config = require('../things/config/config'),
    copy = require('gulp-copy'),
    fs = require('fs'),
    File = require('vinyl'),
    CleanCSS = require('clean-css'),
    through2 = require('through2');


gulp.task('collectBowerRequire', function () {
    // 正则paths: { //内容    } 内容
    let jsContentTakeReg = /paths[\S\s]*?\{[\S\s]*?([\S\s]*?)\}/;
    // 正则 单引号或者双引号
    let replaceQuotes = /[\"|\']/g;
    // 正则获取被 ' *  '   或者 "  *  " 或者 " * ' 或者 ' * " 的 * 内容
    let getQuotesWrap = /[\"|\']([\S\s]*?)[\"|\']/g;
    // 正则 ../../../  或者 ../../ 或者 ../ 或者 ./
    let directiveRelativeReplace = /^(\.?\.?\/)+/g;
    let regs = {
        bower_components: /bower_components/,
        kendo: /KendoUI/i,
        prometheus: /prometheus/,
        http: /https?:\/\//g,
        takeLink: /<link.*?\/?>/g,
        takeScript: /<script.*?\/?>/g,
        takeLinkContent: /<link(?:.*?)href=[\"\'](.+?)[\"\'](?!<)(?:.*)\>(?:[\n\r\s]*?)(?:<\/link>)*/gm,
        takeScriptContent: /<script(?:.*?)src=[\"\'](.+?)[\"\'](?!<)(?:.*)\>(?:[\n\r\s]*?)(?:<\/script>)*/gm
    }
    let requirements = [];
    requirements.push('./bower_components/KendoUI/js/kendo.web');
    requirements.push('./bower_components/KendoUI/js/messages/kendo.messages.zh-CN');
    requirements.push('./bower_components/KendoUI/js/cultures/kendo.culture.zh-CN');
    requirements.push('./bower_components/requirejs/require');
    return gulp.src(['./app/**/*main.config.js', './app/**/index.html'])

        .pipe(through2.obj((file, sex, next) => {
            if (/\.html$/.test(file.path)) {
                let indexContent = file.contents.toString().match(regs.takeLink);
                if (indexContent && indexContent.length) {
                    indexContent.forEach(function (item) {
                        var content = item.replace(regs.takeLinkContent, '$1').replace(directiveRelativeReplace, './');
                        if (requirements.indexOf(content) === -1 && regs.bower_components.test(content)) {
                            requirements.push(content)
                        }
                    })
                }
                let indexJsContent = file.contents.toString().match(regs.takeScript);
                if (indexJsContent && indexJsContent.length) {
                    indexJsContent.forEach(function (item) {
                        var content = item.replace(regs.takeScriptContent, '$1').replace(directiveRelativeReplace, './');
                        if (requirements.indexOf(content) === -1 && regs.bower_components.test(content)) {
                            requirements.push(content)
                        }
                    })
                }
            } else {
                let content = file.contents.toString();
                let theMatch = content.match(jsContentTakeReg)[1].match(getQuotesWrap);
                theMatch.forEach((item) => {
                    let result = item.replace(replaceQuotes, '')
                        .replace(directiveRelativeReplace, '/');
                    // 只处理bower_components的内容
                    // 剔除KendoUI 和prometheus ， 将会单独处理
                    if (!regs.http.test(result) &&
                        regs.bower_components.test(result) && !regs.kendo.test(result) && !regs.prometheus.test(result)) {
                        requirements.indexOf(result) === -1 && requirements.push(result.replace(/^\//, './'));
                    }
                });
            }
            next()
        }, function (next) {

            requirements.forEach((theFile) => {

                if (/\.css$/.test(theFile)) {
                    let file = new File();
                    file.contents = new Buffer(new CleanCSS({compatibility: 'ie8'}).minify(fs.readFileSync(theFile).toString()).styles);
                    file.path = theFile;
                    this.push(file);
                } else {
                    let isMin = /\.min$/.test(theFile);

                    theFile = theFile.replace(/(.*?)\.js\?(.*?)+/, '$1')

                    theFile += '.js';
                    if (fs.existsSync(theFile)) {
                        let file = new File();
                        if (!isMin) {
                            // ugly
                            let newPath = theFile.replace(/\.js$/, '.min.js')

                            if (fs.existsSync(newPath)) {
                                file.contents = new Buffer(fs.readFileSync(newPath))
                            } else {
                                file.contents = fs.readFileSync(theFile)
                            }
                        } else {
                            file.contents = new Buffer(fs.readFileSync(theFile))
                        }
                        file.path = theFile;
                        this.push(file);
                    }
                }
            });

            // fs.writeFileSync('./build.json', JSON.stringify(requirements), 'utf-8')
            next()
        }))

        .pipe(gulp.dest(`${env.buildPath}`))
});
/**
 *
 */
gulp.task('copyKendo', ['collectBowerRequire'], function () {
    return gulp.src('./bower_components/KendoUI/dist/styles/{Bootstrap,fonts,textures}/**/*.*')

        .pipe(gulp.dest(`${env.buildPath}/bower_components/KendoUI/dist/styles/`))
});


/**
 *
 */
gulp.task('copyPrometheus', ['copyKendo'], function () {
    return gulp.src(`./bower_components/prometheus/dist/**/*.*`)

        .pipe(gulp.dest(`${env.buildPath}/bower_components/prometheus/dist/`))
});

gulp.task('copyPdf', ['copyPrometheus'], function () {
    return gulp.src(`./bower_components/pdf*/**/*.*`)

        .pipe(gulp.dest(`${env.buildPath}/bower_components`))
});

gulp.task('copySWF', ['copyPdf'], function () {
    return gulp.src([`./bower_components/**/*.swf`, './bower_components/**/*es5-shim.min.js'])

        .pipe(gulp.dest(`${env.buildPath}/bower_components`))
});

gulp.task('copyBootstrapFonts', function () {
    return gulp.src([`./bower_components/bootstrap/dist/fonts/*.*`])

        .pipe(gulp.dest(`${env.buildPath}/bower_components/bootstrap/dist/fonts/`))
});


gulp.task('bowerSolution', ['copySWF', 'copyBootstrapFonts'], function () {

});
