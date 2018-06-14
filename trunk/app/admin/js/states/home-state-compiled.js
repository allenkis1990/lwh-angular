define(['angularUiRouter'], function () {
    'use strict';

    return angular.module('app.states.home', ['ui.router']).config(function ($stateProvider, $urlRouterProvider) {

        // 如果是临时用户跳转到我发起的页面
        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('states', {
            url: '',
            abstract: true,
            views: {
                'topView@': {
                    templateUrl: 'views/home/top.html',
                    controller: ['$scope', '$state', function ($scope, $state) {}]
                },
                'footerView@': {
                    templateUrl: 'views/home/footer.html',
                    controller: ['$scope', '$state', function ($scope, $state) {}]
                }
            }
        }).state('states.home', {
            url: '/home',
            sticky: true,
            views: {
                'contentView@': {
                    templateUrl: 'views/home/managerIndex.html'
                }
            }
        });
    });
});

//# sourceMappingURL=home-state-compiled.js.map