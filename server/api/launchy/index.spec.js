'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var launchyCtrlStub = {
  showStatus: 'launchyCtrl.showStatus',
  launch: 'launchyCtrl.launch',
  stop: 'launchyCtrl.stop',
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var launchyIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './launchy.controller': launchyCtrlStub
});

describe('Launchy API Router:', function() {

  it('should return an express router instance', function() {
    expect(launchyIndex).to.equal(routerStub);
  });

  describe('GET /api.launchies/:id', function() {

    it('should route to launchy.controller.showStatus', function() {
      expect(routerStub.get
        .withArgs('/:id', 'launchyCtrl.showStatus')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api.launchies/:id', function() {

    it('should route to launchy.controller.launch', function() {
      expect(routerStub.post
        .withArgs('/:id', 'launchyCtrl.launch')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api.launchies/:id', function() {

    it('should route to launchy.controller.stop', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'launchyCtrl.stop')
        ).to.have.been.calledOnce;
    });

  });

});
