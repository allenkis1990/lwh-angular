/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
define(["angular"], function (angular) {
    'use strict';

    angular.module('external', [])

        .factory('externalService', [function () {

        }])

        // .directive('test', function () {
        //     return {
        //         template: '测试',
        //         link: function ($scope) {
        //
        //             console.log($scope.currentPlayInfo);
        //
        //         }
        //     }
        // })

        .run(['components', function (components) {
            // components.addComponents({
            //     name: 'test',
            //     className: 'ico-ml',
            //     title: '测验'
            // })
        }]);
});
