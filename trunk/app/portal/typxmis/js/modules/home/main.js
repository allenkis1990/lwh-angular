define(['typxmis/js/modules/home/controllers/home-ctrl',
        'typxmis/js/modules/home/services/home-service',
        'typxmis/js/modules/home/controllers/top-ctrl'],
    function (controllers, homeService, topCtrl) {
        'use strict';
        return angular.module('app.front.states.index.main', [])
            .controller('app.front.states.index.indexCtrl', controllers.indexCtrl)
            .controller('app.front.states.index.topCtrl', topCtrl)


    });