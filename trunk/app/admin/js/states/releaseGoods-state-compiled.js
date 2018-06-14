define(['modules/releaseGoods/main'], function (controllers) {
    'use strict';

    angular.module('app.states.releaseGoods', []).config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('states.releaseGoods', {
            url: '/releaseGoods/:copyId',
            sticky: true,
            views: {
                'contentView@': {
                    templateUrl: 'views/releaseGoods/index.html',
                    controller: 'app.admin.states.releaseGoods.indexCtrl'
                }
            }
        });
    }]);
});

//# sourceMappingURL=releaseGoods-state-compiled.js.map