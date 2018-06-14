/**
 * lesson-platform - 
 * @author wengpengfeijava <wengpengfeijava@163.com>
 * @version v2.0.2
 * @link 
 * @license ISC
 */
require({
    paths: {
        angular: '../../../bower_components/angular/angular',
        angularUiRouter: '../../../bower_components/angular-ui-router/release/angular-ui-router',
        angularAnimate: '../../../bower_components/angular-animate/angular-animate',
        angularStorage: '../../../bower_components/angular-local-storage/dist/angular-local-storage',
        prometheus: '../../../bower_components/prometheus/main',
        // loader         : 'http://192.168.1.72:3166/src/dist/loader',
        player: '../../../bower_components/player/dist/player',
        es5ShimForIe: '../../../bower_components/es5-shim/es5-shim',
        artDialog: '../../../bower_components/artDialog/dist/dialog-min',
        jquery: '../../../bower_components/jquery/dist/jquery',
        jqueryJson: '../../../bower_components/jquery-json/dist/jquery.json.min',
        cameras: '../../../bower_components/cameras/dist/js/cameras',
        particles: '../../../bower_components/particles.js/particles'
    },
    shim: {
        angular: {exports: 'angular'},
        angularAnimate: {deps: ['angular']},
        artDialog: {deps: ['jquery'], exports: 'artDialog'},
        angularStorage: {deps: ['angular']},
        angularUiRouter: {deps: ['angular']},
        loader: {exports: 'loader'}
    },

    callback: function () {
        require(['./play.app', 'es5ShimForIe'], function () {
            angular.bootstrap(document.getElementsByTagName('html')[0], ['app']);
        })
    }
});
