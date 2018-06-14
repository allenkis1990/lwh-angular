
var fs = require('fs'),
    path = require('path');

function Config() {}

Config.prototype = {
    dot: '.',
    relative: './',
    temp: '.temp',
    script: 'js',
    html: 'html',
    styles: 'styles',
    dist: 'public',
    views: 'views',
    app: 'app',
    scriptBase: './app/js/',
    images: 'images',
    build: 'build',
    things: 'things',

    utfEncoding: { encoding: 'utf-8' },
    // rewrites 重写规则是否打开日志
    rewriteRule: {
        log: false
    },
    /// apps
    portal: 'portal',
    admin: 'admin',
    login: 'login',
    center: 'center',

    apps: ['admin',
    // 'portal',
    'center', 'login', 'play'],

    dev: {
        port: 9000
    },

    static: {
        port: 9002
    },

    test: {
        port: 1457
    },

    proxies: [{
        target: "http://172.17.0.149", //开发
        context: '/web',
        port: "8080"
    }],
    /**
     *
     */
    getBase: function (dir) {
        return [this.dot, this.app, dir, ''].join('/');
    },
    /**
     *
     */
    getScriptBase: function (dir) {
        return [this.dot, this.app, dir, ''].join('/');
    },
    /**
     *
     */
    getTemplateBase: function (appName, dir) {
        return [this.dot, this.app, appName, dir, ''].join('/');
    },
    /**
     *
     * @param dir
     * @returns {string}
     */
    getHtmlBase: function (dir) {
        return [this.dot, this.html, dir, ''].join('/');
    },
    /**
     *
     * @param dir
     * @returns {string}
     */
    getViewsTemplateBase: function (appName, dir) {
        return [this.dot, this.app, appName, dir, this.views, ''].join('/');
    },
    /**
     *
     * @param dir
     * @returns {string}
     */
    getStylesCompiledBase: function (appName, dir) {
        return [this.dot, this.temp, appName, dir, ''].join('/');
    },
    /**
     *
     * @param dir
     * @returns {string}
     */
    getLessBase: function (appName, dir) {
        return [this.dot, this.app, appName, dir, this.styles, ''].join('/');
    },
    /**
     *
     * @param dir
     * @returns {string}
     */
    getImagesBase: function (appName, dir) {
        return [this.dot, this.app, this.images, appName, dir, ''].join('/');
    },

    /**
     *
     * @returns {string}
     */
    getPublicBase: function () {
        return [this.dot, this.dist, ''].join('/');
    },
    /**
     *
     * @returns {string}
     */
    getBuildBase: function () {
        return [this.dot, this.build, ''].join('/');
    },

    getThingsBase: function (dir) {
        return [this.dot, this.things, dir, ''].join('/');
    },

    compileJs: function () {
        var compileReg = /{{(.*)}}/;
    },
    /**
     *
     * @param dirs
     * @returns {Array}
     */
    getSubDirectories: function (dirs, base) {
        var realDirs = [];
        var that = this;
        // 获取文件夹
        dirs.map(function (item) {
            var fileStats = fs.statSync((base || '') + item);
            fileStats.isDirectory() && realDirs.push(item);
        });
        return realDirs;
    },
    findSubDirectory(filePath) {
        var directories = [];
        fs.readdirSync(filePath).forEach(function (item, index) {
            var subPath = filePath + '/' + item;
            fs.lstatSync(subPath).isDirectory() && directories.push(item);
        });
        return directories;
    }
};

module.exports = new Config();

//# sourceMappingURL=config-compiled.js.map