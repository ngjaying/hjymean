'use strict';

angular.module('hjymeanApp.auth', [
  'hjymeanApp.constants',
  'hjymeanApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
