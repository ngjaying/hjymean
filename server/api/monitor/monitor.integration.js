'use strict';

var app = require('../..');
import request from 'supertest';

let newMonitor;
let monitorStub = {
  nuser: 'fakeuser',
  url: 'http://www.jimei.gov.cn/xxgk/F394/rsxx/zkzp/',
  jqpath: 'table.h30.mar_t10 a',
  blockname: 'fakeblock',
  emails: ['fakeemail@qq.com'],
};
function compareToStub(m){
  expect(m.nuser).to.equal(monitorStub.nuser);
  expect(m.url).to.equal(monitorStub.url);
  expect(m.jqpath).to.equal(monitorStub.jqpath);
  expect(m.blockname).to.equal(monitorStub.blockname);
  expect(m.emails).to.deep.equal(monitorStub.emails);
}

describe('Monitor API:', function() {

  describe('GET /api/monitors', function() {
    let monitors;

    beforeEach(function(done) {
      request(app)
        .get('/api/monitors')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          monitors = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(monitors).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/monitors', function() {
    beforeEach(function(done) {
      let { nuser, url, jqpath, blockname, emails } = monitorStub;
      request(app)
        .post('/api/monitors')
        .send({ nuser, url, jqpath, blockname, emails })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          console.log(err);
          if (err) {
            return done(err);
          }
          newMonitor = res.body;
          done();
        });
    });

    it('should respond with the newly created monitor', function() {
      compareToStub(newMonitor);
    });

  });

  describe('GET /api/monitors/:id', function() {
    let monitor;

    beforeEach(function(done) {
      request(app)
        .get('/api/monitors/' + newMonitor._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          monitor = res.body;
          done();
        });
    });

    afterEach(function() {
      monitor = {};
    });

    it('should respond with the requested monitor', function() {
      compareToStub(monitor);
    });

  });

  describe('PUT /api/monitors/:id', function() {
    let updatedMonitor;

    beforeEach(function(done) {
      request(app)
        .put('/api/monitors/' + newMonitor._id)
        .send({
          blockname: 'Updated Block Name',
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedMonitor = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedMonitor = {};
    });

    it('should respond with the updated monitor', function() {
      expect(updatedMonitor.blockname).to.equal('Updated Block Name');
    });

  });

  describe('DELETE /api/monitors/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/monitors/' + newMonitor._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when monitor does not exist', function(done) {
      request(app)
        .delete('/api/monitors/' + newMonitor._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
