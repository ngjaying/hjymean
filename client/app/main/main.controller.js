'use strict';

(function() {

class MainController {

  constructor($http) {
    this.$http = $http;
  }

  launchMonitor() {    
    this.$http.get('/api/monitors/launch').then(response => {
      console.log('started');
    });
  }
}

angular.module('hjymeanApp')
  .controller('MainController', MainController);

})();
