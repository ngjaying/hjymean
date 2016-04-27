'use strict';

var app = require('../..');
import request from 'supertest';

var newLaunchy;

describe('Launchy API:', function() {

  describe('POST /api.launchies/:id', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api.launchies/')
        .send({
          name: 'New Launchy',
          info: 'This is the brand new launchy!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newLaunchy = res.body;
          done();
        });
    });

    it('should respond with the newly created launchy', function() {
      expect(newLaunchy.name).to.equal('New Launchy');
      expect(newLaunchy.info).to.equal('This is the brand new launchy!!!');
    });

  });

  describe('GET /api.launchies/:id', function() {
    var launchy;

    beforeEach(function(done) {
      request(app)
        .get('/api.launchies/' + newLaunchy._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          launchy = res.body;
          done();
        });
    });

    afterEach(function() {
      launchy = {};
    });

    it('should respond with the requested launchy', function() {
      expect(launchy.name).to.equal('New Launchy');
      expect(launchy.info).to.equal('This is the brand new launchy!!!');
    });

  });

  describe('DELETE /api.launchies/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api.launchies/' + newLaunchy._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when launchy does not exist', function(done) {
      request(app)
        .delete('/api.launchies/' + newLaunchy._id)
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
