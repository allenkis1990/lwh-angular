/**
 * Created by Administrator on 2015/7/9.
 */
define ( function () {

    return ['Restangular', function ( Restangular ) {

        var base = Restangular.withConfig ( function ( config ) {
            config.setBaseUrl ( '/web/login/login' );
        } );
        var basePorTalUser = Restangular.withConfig ( function ( config ) {
            config.setBaseUrl ( '/web/portal/userNorthMessage' );
        } );
        var basePortalInfo = Restangular.withConfig ( function ( config ) {
            config.setBaseUrl ( '/web/portal/info' );
        } );
        var basePortalIndex = Restangular.withConfig ( function ( config ) {
            config.setBaseUrl ( '/web/portal/index' );
        } );
        return {



        };

    }]
} );
