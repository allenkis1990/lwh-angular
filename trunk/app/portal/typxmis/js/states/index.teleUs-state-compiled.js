define(function () {
    'use strict';

    angular.module('app.front.states.index.teleUs', []).config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('states.index.teleUs', {
            url: '/index.teleUs',

            views: {
                'contentView@': {
                    templateUrl: 'typxmis/views/teleUs/teleUs.html',
                    controller: [function () {}]
                }
            }
        });
    }]);
});

//# sourceMappingURL=index.teleUs-state-compiled.js.map