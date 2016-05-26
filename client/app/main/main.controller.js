'use strict';

(function() {

class MainController {

  constructor($http) {
    this.$http = $http;
  }

  launchMonitor() {  
  	let monitorStub = {
		url: 'http://www.xmws.gov.cn/sydwzk/policy/policy.jsp?TypeID=7',
    	jqpath: 'form[name=formRight] table:nth-of-type(5) td a',
		blockname: 'fakeblock2',
		emails: ['johnnyyellow@gmail.com'],
	};
  
    // this.$http.get('/api/monitors/launch').then(response => {
    //   console.log('started');
    // });
    this.$http.post('/api/launchies/', monitorStub ).then(res => {
    	console.log('Launched?: ' + res.launched + ' emails:' + res.emails);
    });
  }
}

angular.module('hjymeanApp')
  .controller('MainController', MainController);

})();
