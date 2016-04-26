'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var monitorCtrlStub = {
	launch: 'monitorCtrl.launch',
};

var routerStub = {
  get: sinon.spy(),
};

var monitorIndex = proxyquire('./index', { 
	'express': {
		Router() {
			return routerStub;
		}
	},
	'./monitor.controller': monitorCtrlStub,
}).default;

describe('Monitor API Router', function(){

	it('should return an express router instance', function() {
		expect(monitorIndex).to.equal(routerStub);
	});

	describe('Get /launch', function() {

		it('should route to controller launch', function() {
			expect(routerStub.get
				.withArgs('/launch', 'monitorCtrl.launch')
			).to.have.been.calledOnce;
		});
	});
});
