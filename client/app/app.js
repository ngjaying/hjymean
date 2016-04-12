'use strict';

angular.module('hjymeanApp', [
  'hjymeanApp.auth',
  'hjymeanApp.admin',
  'hjymeanApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
