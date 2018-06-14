var path = require('path'),
    gulp = require('gulp'),
    jade = require('jade'),
    fs = require('fs');

gulp.task('directoryTree', function () {
    var files = [];

    var thePath = './html';

    function walker(cPath, cInfo) {
        fs.readdirSync(cPath).forEach(function (directoryOrFile) {
            var subPath = cPath + '/' + directoryOrFile,
                temp = {},
                split = subPath.replace(thePath, '').split('/'),

                parentId = split.slice(0, split.length - 1).join('/');
            temp.parentId = parentId || null;
            temp.name = directoryOrFile;
            temp.dir = cPath.replace(thePath, '');
            temp.path = subPath.replace(thePath, '');
            temp.id = subPath.replace(thePath, '');
            if (fs.lstatSync(subPath).isDirectory()) {
                files.push(temp);
                walker(subPath);
            } else {
                files.push(temp);
            }
        })
    }

    walker(thePath);

    var jadeTemplateContent = fs.readFileSync('./things/templates/html/directory-tree.jade', {encoding: 'UTF-8'});
    files = JSON.stringify(files).replace(/\"/g, '\'');
    fs.writeFileSync('./html/index.html', jade.compile(jadeTemplateContent, {filename: '.'})({
            tree: 'var treeList = ' + files
        })
        , {encoding: 'utf-8'});
})