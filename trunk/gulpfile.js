/**
 * Created by wengpengfei on 2016/8/8.
 */

var gulp = require('gulp'),              // 基
    browserSync = require('browser-sync').create(),      // 浏览器同步服务神器
    connect = require('connect'),           // 前端静态服务器
    serveStatic = require('serve-static'),      // 文件映射
    less = require('gulp-less'),         // less编译器
    clean = require('gulp-clean'),        // 文件、文件夹 清除
    config = require('./things/config/config.js'),       // 配置文件
    copy = require('gulp-copy'),         // 拷贝文件
    minimist = require('minimist'),          // 任务获取参数
    uglify = require('gulp-uglify'),       // js压缩混淆
    zip = require('gulp-zip'),          // 压缩zip
    fs = require('fs'),                // 文件流
    cssmin = require('gulp-clean-css'),   // css压缩
    autoprefixer = require('gulp-autoprefixer'), // css前缀追加
    htmlmin = require('gulp-htmlmin'),      // html压缩
    imagemin = require('gulp-imagemin'),     // 图片压缩
    removeLogs = require('gulp-removelogs'),   // 删除console.log
    runSeque = require("gulp-run-sequence"), // 顺序执行
    path = require('path'),
    jade = require('gulp-jade'),
    through2 = require('through2'),
    httpProxy = require('proxy-middleware'),
    url = require('url'),
    __if = require('gulp-if'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    Q = require('q'),
    //////////////////////////////////////////////////////////////////
    options = minimist(process.argv.slice(2)),
    //////////////////////////////////////////////////////////////////
    staticLoader = require('./tasks/staticMi-loader'),
    dev = !!options._.length,

    taskLoader = require('./tasks/task-loader');

global.env = {
    dev: dev,
    cssDest: dev ? '.temp' : 'public',
    buildPath: './public',
    deployPath: './public',
    appPath: './app',
    taskLoader: taskLoader,
    util: {
        uglify_: uglify_,
        ngAnnotate: ngAnnotate
    }
}

function uglify_() {
    return uglify({
        compress: {screw_ie8: false},
        mangle: {screw_ie8: false},
        output: {screw_ie8: false}
    })
}

/**
 * 默认任务
 *  执行gulp 将所有的目录结构拿去做构建,
 *  执行 gulp -p mod1 -a portal 执行指定目录结构做构建
 */
gulp.task('default', function () {

    if (options.p && !options.a) {
        throw  new Error('please offer -a of arguments');
    }

    var begin = Date.now();
    console.log('┏┳━━━━━━━━━━━━┓');
    console.log('┃┃████████████┃');
    console.log('┃┃███████┏━━┓█┃');
    console.log('┣┫███████┃ 卐 ┃█┃');
    console.log('┃┃███████┃ 葵 ┃█┃');
    console.log('┃┃███████┃ 　 ┃█┃');
    console.log('┃┃███████┃ 花 ┃█┃');
    console.log('┣┫███████┃ 　 ┃█┃');
    console.log('┃┃███████┃ 宝 ┃█┃');
    console.log('┃┃███████┃ 　 ┃█┃');
    console.log('┃┃███████┃ 典 ┃█┃');
    console.log('┣┫███████┃ 卐 ┃█┃');
    console.log('┃┃███████┗━━┛█┃');
    console.log('┃┃████████████┃');
    console.log('┗┻━━━━━━━━━━━━┛');
    console.log(`系统开始任务时间: ${ new Date()}`);

    var deferred = Q.defer(),
        tasks = [
            '"clean"',
            '"stateMapper"',
            '"copyProjectConfig"',
            // 任务并行
            // '[' + '"less","uglify","html:min","images:min"' + ']',
            '"less","uglify","html:min","images:min"',
            '"analyzeStateMapper"',
            '"doRevReplace"',
            '"copy:json"',
            '"bowerSolution"',
            '"portalIndexSEOSolution"',
            function () {

                // console.log('Starting clean public directory');
                // doClean([config.getBuildBase(), './.temp']);
                //
                console.log(`运行花费成本${(Date.now() - begin) / 1000}s`);

                deferred.resolve();
            }];

    // gulp --ext images:min,doRevReplace
    // 如果有设置排除项
    if (options.ext) {
        var exts = options.ext.split(',');
        if (/doRevReplace/.test(options.ext)) {
            tasks.splice(tasks.indexOf('"doRevReplace"'), 1, '"copyJs"');
        }
        exts.forEach(function (item) {
            var foundIndex = tasks.indexOf('"' + item + '"');
            if (foundIndex !== -1) {
                tasks.splice(foundIndex, 1);
            }
        })
    }
    eval('runSeque(' + tasks.join(',') + ')');
    // runSeque.apply ( this, tasks );
    return deferred.promise;
});


gulp.task('tata', function () {
    runSeque('uglify', 'analyzeStateMapper')
})

/**
 * 执行less编译任务
 */
gulp.task('less', function () {

    return gulp.src([`${config.app}/**/*{webstyle,loginstyle}.less`
        // , `!${env.appPath}/workflow/**/*.less`
    ])

        .pipe(less())

        .pipe(__if(!env.dev, cssmin({
            //避免在清除的时候将文件路径重新定位
            rebase: false,
            compatibility: 'ie8'
        })))

        .pipe(__if(!env.dev, taskLoader.Chuizi()))


        .pipe(gulp.dest(env.cssDest + '/'));
});


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  uglify 压缩混淆任务  //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

gulp.task('copy:json', function () {
    return gulp.src([`${env.appPath}/**/*project.main.json`])
        .pipe(gulp.dest(env.buildPath))
})

/**
 * 在文件拷贝完成之后将文件目录下面的js压缩
 */
gulp.task('uglify', function () {
    return gulp.src([`${env.appPath}/**/*.js`, `!${env.appPath}/workflow/**/*.js`, `!${env.appPath}/admin/js/ability/**/*.*`, `!${env.appPath}/center/js/ability/**/*.*`])
        .pipe(through2.obj(function (file, sex, next) {
            if (file.path.indexOf('main.config') !== -1) {
                file.contents = new Buffer(file.contents.toString().replace(/\$\$dev\$\$/g, 'false'))
            }
            this.push(file)
            next()
        }))
        .pipe(removeLogs())
        .pipe(ngAnnotate())
        .pipe(uglify_())
        .pipe(taskLoader.Chuizi())
        .pipe(gulp.dest(env.buildPath))
});

/**
 *将requirejs 压缩
 */
gulp.task('requirejs:min', function () {
    return gulp.src('./public/bower_components/requirejs/require.js')

        .pipe(uglify_())

        .pipe(gulp.dest('./public/bower_components/requirejs'));
});

/**
 * html压缩
 */
gulp.task('html:min', function () {
    return gulp.src([`${env.appPath}/**/*.html`, `!${env.appPath}/workflow/**/*.html`])
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(taskLoader.Chuizi())
        .pipe(gulp.dest(env.buildPath));
});

/**
 * 压缩images
 */
gulp.task('images:min', function () {

    return gulp.src([`${env.appPath}/**/*.{jpg,png,jpeg,ico,gif}`, `!${env.appPath}/workflow/**/*.{jpg,png,jpeg,ico,gif}`])
    // .pipe(imagemin({
    //     verbose: true
    // }))
        .pipe(taskLoader.Chuizi())
        .pipe(gulp.dest(env.buildPath))
});

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////  clean               //////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

gulp.task('clean', function () {
    var deployDirectory = config.getPublicBase(),
        templateDirectory = '.temp';

    return doClean([deployDirectory, templateDirectory]);
});

/**
 * 重命名portal/index.html  -- > index.htm
 */
///////////////////////
// /(([ \t]*)<!--\s*seo:build\s*-->)(\n|\r|.)*?(<!--\s*seo:endbuild\s*-->)/gi
gulp.task('portalIndexSEOSolution', function () {
    let reg = /(seo).*?(seo)/gi,
        changeTo = '$1$2';
    return gulp.src(`${env.buildPath}/portal/index.html`)

        .pipe((function () {
            return through2.obj(function (file, some, callback) {
                let content = file.contents.toString();
                content = content.replace(reg, changeTo);
                file.contents = new Buffer(content);
                fs.unlinkSync(file.path);
                file.path = file.path.replace(/\.html$/, '.htm');
                this.push(file);
                callback();
            })
        })())

        .pipe(gulp.dest(`${env.buildPath}/portal`))
});

/**
 * 删除文件夹
 * @param where
 * @returns {*}
 */
function doClean(where) {
    return gulp.src(where)

        .pipe(clean());
}

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

gulp.task('doRevReplace', function () {
    var deferred = Q.defer();
    taskLoader.fileVersion.doRevReplace({
        workPlace: `${env.buildPath}`
    });
    deferred.resolve();
    return deferred.promise;
});

////////////////////////////////////////////////////////////////////////////////////
//////////////汉皇重色思倾国，御宇多年求不得。          //////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
/**
 * 业务逻辑开发服务器
 */
gulp.task('serve', ['less', 'copyProjectConfig', 'asignIndexAppName', 'collectInfo', 'stateMapper'], function () {

    var adminSub = config.findSubDirectory('./app/admin/modules'),

        rewrites = [];

    var rules = [
        serveStatic('./.temp'),
        taskLoader.playerApp,
        {route: '/portal/bower_components', handle: serveStatic('./bower_components')},
        function (req, res, next) {
            if (/webpage\/.?\.htm/.test(req.url)) {
                res.setHeader('Content-Type', 'text/html; charset=gb2312');
            }
            next();
        },
        function (req, res, next) {
            if (/\.*\?download$/.test(req.url)) {
                res.setHeader('Content-Disposition', 'attachment; filename="123456.pdf"');
                res.setHeader("Content-Type", "application/octet-stream");
            }
            next();
        },

        {route: '/bower_components', handle: serveStatic('./bower_components')},

        {route: '/portal', handle: serveStatic('./.temp/portal')}
    ];


    var rewriteRules = [];

    var ruleFrom = '^(?!(.*?^\/admin)|(.*?^\/bower_components)';



    adminSub.forEach(function (sub, index) {

        rules.push({
            route: '/admin/modules/' + sub + '/js',
            handle: staticLoader.staticLoader('js', undefined, 'admin')
        });
        rules.push({
            route: '/admin/modules/' + sub + '/views',
            handle: staticLoader.staticLoader('views', undefined, 'admin')
        });

        rules.push({
            route: '/admin/modules/' + sub + '/templates',
            handle: staticLoader.staticLoader('templates', undefined, 'admin')
        });

        rules.push({
            route: '/admin/modules/' + sub + '/styles',
            handle: staticLoader.staticLoader('', './.temp/admin/styles', 'admin')
        });

        rules.push({
            route: '/admin/modules/' + sub + '/images',
            handle: staticLoader.staticLoader('images', undefined, 'admin')
        });

        rules.push({
            route: '/admin/modules/' + sub + '/datas',
            handle: staticLoader.staticLoader('datas', undefined, 'admin')
        });

        ruleFrom += '|(.*?^\/' + sub + ')';

        rules.push({
            route: '/' + sub, handle: staticLoader.redirect('admin', sub)
        });
    });

    config.proxies.forEach(function (proxy) {
        var proxyOptions = url.parse(proxy.target + ':' + proxy.port + proxy.context);
        proxyOptions.route = proxy.context;
        proxyOptions.preserveHost = true;
        rules.unshift(httpProxy(proxyOptions));
        rewriteRules.push(proxy.context);
    });

    rewriteRules.forEach(function (context) {
        ruleFrom += '|(.*?\/' + context.replace('/', '') + ')';
    });

    ruleFrom += '|.*?(\.html|\.js|\.jpg|\.jpeg|\.json|\.png|\.php|\.css|\.woff|\.woff2|\.ttf|\.svg|\.eot|\.gif)).*?$';

    rewrites.push({
        // 不等于.js .html .png 不以/admin开头
        from: new RegExp(ruleFrom),
        to: '/portal/index.html'
    });

    rules.unshift(taskLoader.historyApiFallback({
        verbose: config.rewriteRule.log,
        // disableDotRule: true,
        rewrites: rewrites
    }));

    serve('./app/', rules, {
        port: config.dev.port
    });

    gulp.watch('app/**/*-state.js', ['stateMapper']);
    gulp.watch('app/**/*.less', ['less']);
});

/**
 * 静态文件开发服务器
 */
gulp.task('serve:static', ['less'], function () {
    serve('./html/', [
        serveStatic('./html'),
        serveStatic('./app'),
        serveStatic('./.temp'),
        {route: '/portal', handle: serveStatic('./.temp/portal')},
        {route: '/bower_components', handle: serveStatic('./bower_components')}
    ], {
        port: config.static.port
    });

    gulp.watch('app/**/*.less', ['less']);
    gulp.watch([config.html + '/**/*.html', '!' + config.html + '/**/index.html', '!' + config.html + '/**/index_another.html'], ['directoryTree']);
});

/**
 * 静态文件开发服务器
 */


/**
 * 生产环境
 */
gulp.task('serve:dist', function () {
    var rules = [
        serveStatic(`${env.buildPath}/portal`),
        // { route: '/bower_components', handle: serveStatic ( './public/bower_components' ) },
        // { route: '/portal', handle: serveStatic ( './.temp/portal' ) }
    ];

    var rewriteRules = [];
    config.proxies.forEach(function (proxy) {
        var proxyOptions = url.parse(proxy.target + ':' + proxy.port + proxy.context);
        proxyOptions.route = proxy.context;
        proxyOptions.preserveHost = true;
        rules.unshift(httpProxy(proxyOptions));
        rewriteRules.push(proxy.context);
    });
    var ruleFrom = '^(?!(.*?^\/admin)|(.*?^\/bower_components)';
    rewriteRules.forEach(function (context) {
        ruleFrom += '|(.*?\/' + context.replace('/', '') + ')';
    });
    ruleFrom += '|.*?(\.html|\.js|\.jpg|\.jpeg|\.json|\.png|\.php|\.css|\.gif)).*?$';
    rules.unshift(taskLoader.historyApiFallback({
        verbose: config.rewriteRule.log,
        // disableDotRule: true,
        rewrites: [
            //
            // { from: /^\/login/, to: '/login/index.html' },
            // { from: /^\/admin/, to: '/admin/index.html' },
            // { from: /^\/center/, to: '/center/index.html' },
            // 不等于.js .html .png 不以/admin开头
            {
                from: new RegExp(ruleFrom),
                to: '/portal/index.htm'
            }
        ]
    }));
    serve(`${env.buildPath}/`, rules, {
        port: config.test.port
    });
});


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////

/***
 *
 * @param baseDir
 * @param middleware
 */
function serve(baseDir, middleware, options) {
    browserSync.init({
        open: false,
        port: options.port || 3000,
        // reloadOnRestart: true,
        server: {
            baseDir: baseDir,
            middleware: middleware || []
        }
    });
}
