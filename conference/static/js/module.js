/*jshint curly:true, indent:4, strict:true*/

var webrtc = angular.module('webrtc', ['ngRoute', 'pascalprecht.translate']);

webrtc.run(function($rootScope) {
    $rootScope.test = new Date();
});

webrtc.config(['$translateProvider', function ($translateProvider) {
    $translateProvider
        .useStaticFilesLoader({
            prefix: '/static/i18n/locale-',
            suffix: '.json'
        })
        .preferredLanguage('en');
}]);

webrtc.config(function($routeProvider) {
    $routeProvider
        .when('/',{
            templateUrl: "./index.html",
            //controller
        });
});
