
define ( function ( mod ) {
    'use strict';
    return {
        indexCtrl: ['$scope','$state',
            function ($scope,$state) {


                $scope.fn=function(){
                    $state.go('states.index.teleUs');
                }

            }]
    };
} );
