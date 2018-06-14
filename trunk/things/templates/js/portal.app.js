/**
 * Created by wengpengfei on 2016/8/8.
 */
define ( [
    '$$moduleName$$/js/common/si',
    'css!../' + require.local_config_data_for_cms.themes[require.config_data_for_cms.theme],
    'angular',
    'uiRouterExtras',
    'oclazyload',
    'angularUiRouter'
], function ( lazyLoad ) {
    'use strict';
    angular.module ( 'app', ['ui.router', 'oc.lazyLoad', 'ct.ui.router.extras'] )
        .constant ( 'modules', lazyLoad.modules )
        .constant ( 'futureStates', lazyLoad.futureStates )
        .config ( ['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$futureStateProvider', 'modules', 'futureStates',
            function ( $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $futureStateProvider, modules, futureStates ) {
                $ocLazyLoadProvider.config ( {
                    //debug: true,
                    jsLoader     : requirejs,
                    //events: true,
                    loadedModules: ['states'],
                    modules      : modules
                } );

                var ocLazyLoadStateFactory = ['$q', '$ocLazyLoad', 'futureState',
                    function ( $q, $ocLazyLoad, futureState ) {
                        var deferred = $q.defer ();
                        $ocLazyLoad.load ( futureState.module ).then ( function () {
                            deferred.resolve ();
                        }, function () {
                            deferred.reject ();
                        } );
                        return deferred.promise;
                    }];

                $futureStateProvider.stateFactory ( 'ocLazyLoad', ocLazyLoadStateFactory );

                $futureStateProvider.addResolve ( ['$q', '$injector', '$http', function ( $q ) {
                    var deferd  = $q.defer (),
                        promise = deferd.promise;
                    angular.forEach ( futureStates, function ( futureState ) {
                        $futureStateProvider.futureState ( futureState );
                    } );
                    deferd.resolve ( futureStates );
                    return promise;
                }] );

                $urlRouterProvider
                    .otherwise ( '/$$moduleName$$' );
                $stateProvider.state ( 'states', {
                    url     : '',
                    abstract: true
                } )
            }] )
} );
