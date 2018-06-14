define(['typxmis/js/modules/home/main', 'angularSanitize'], function (controllers) {
    'use strict';

    angular.module('app.front.states.index', ['ngSanitize']).config(['$stateProvider', '$sceProvider', function ($stateProvider, $sceProvider) {
        $sceProvider.enabled(false);
        $stateProvider.state('states.index', {
            url: '/index',
            views: {
                "contentView@": {
                    templateUrl: 'typxmis/views/home/index.html',
                    controller: 'app.front.states.index.indexCtrl'
                },
                'topView@': {
                    templateUrl: 'typxmis/views/home/top.html',
                    controller: 'app.front.states.index.topCtrl'
                },
                'footerView@': {
                    templateUrl: 'typxmis/views/home/footer.html'
                }
            }
        });
    }]);
});

//# sourceMappingURL=index-state-compiled.js.map