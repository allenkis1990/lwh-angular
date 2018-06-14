/**
 * Created by 46607 on 2017/5/5.
 */

var send = require('send'),
    path = require('path'),
    fs = require('fs');

module.exports = {
    staticLoader: function (where, root, app) {
        return function (req, res, next) {
            var realPath = req.originalUrl;
            if (!fs.existsSync('./app/' + realPath.split('?')[0])) {
                var stream = send(req, req.url.split('?')[0], {
                    root: root ? root : './app/' + app + '/' + where
                });
                stream.pipe(res);
            } else {
                next();
            }
        };
    },
    // 完成开发的重定向的任务
    redirect: function (app, sub) {
        return function (req, res, next) {
            if (fs.existsSync('./app/' + app + '/modules/' + sub)) {
                res.writeHead(302, {location: '/' + app + '/modules/' + sub});
            } else {
                res.writeHead(302, {location: '/' + app + '/'});
            }
            res.end('ok');
        }
    },

    // 输入center||admin 将会根据portal里面的project.main.json的配置重定向到指定的地址去
    staticRedirect: function (app) {
        return function (req, res, next) {
            var host = req.headers.host;
            var projectConfig = require('../app/portal/project.main.json');
            var result;

            for (var i = 0; i < projectConfig.length; i++) {
                var item = projectConfig[i];
                if (host.indexOf(item.domain) !== -1) {
                    result = item;
                    break;
                }
            }
            if (result) {
                var to = app + result.baseUrl.replace(/[a-z]/, function (item) {
                        return item.toUpperCase();
                    })
                res.writeHead(302, {
                    location: '/' + app + '/modules/' + to
                });

                res.end('ok');
            } else {
                // res.writeHead(302, {
                //     location: '/' + app + '/modules/' + app + result.baseUrl.replace(/[a-z]/, function (item) {
                //         return item.toUpperCase();
                //     })
                // });
                next()
            }

        }
    }
};