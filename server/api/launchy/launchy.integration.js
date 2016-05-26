let app = require('../..');
import request from 'supertest';

let newLaunchy;
let monitorStub = {
	nuser: 'fakeuser',
	url: 'http://www.jimei.gov.cn/xxgk/F394/rsxx/zkzp/',
	jqpath: 'table.h30.mar_t10 a',
	blockname: 'fakeblock',
	emails: ['fakeemail@qq.com'],
};


describe('Launchy API:', function () {

	describe('POST /api/launchies with new launch', function () {
		beforeEach(function (done) {
			this.timeout(10000);
			let { nuser, url, jqpath, blockname, emails } = monitorStub;
			request(app)
      .post('/api/launchies')
      .send({ nuser, url, jqpath, blockname, emails })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
					if (err) {
						return done(err);
        }
				newLaunchy = res.body;
				done();
      });
    });

		it('should respond with the newly created launchy', function () {
        expect(newLaunchy.launched).to.equal(true);
        expect(newLaunchy.emails).to.deep.equal(['fakeemail@qq.com']);
        expect(newLaunchy.emails).to.deep.equal(global.executors[monitorStub.url + monitorStub.jqpath].emails);
    });
  });

  describe('POST /api/launchies with already launched', function () {
    beforeEach(function (done) {
      this.timeout(10000);
      let { nuser, url, jqpath, blockname } = monitorStub;
      let emails = ['anotheremail.gmail.com'];
      request(app)
      .post('/api/launchies')
      .send({ nuser, url, jqpath, blockname, emails })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
          if (err) {
            return done(err);
        }
        newLaunchy = res.body;
        done();
      });
    });

    it('should respond with the newly created launchy', function () {
        expect(newLaunchy.launched).to.equal(true);
        expect(newLaunchy.emails).to.deep.equal(['fakeemail@qq.com', 'anotheremail.gmail.com']);
        expect(newLaunchy.emails).to.deep.equal(global.executors[monitorStub.url + monitorStub.jqpath].emails);
    });
  });

  // describe('GET /api.launchies/:monitor', function() {
  //   var launchy;

  //   beforeEach(function(done) {
  //     request(app)
  //       .get('/api.launchies/' + newLaunchy._id)
  //       .expect(200)
  //       .expect('Content-Type', /json/)
  //       .end((err, res) => {
  //         if (err) {
  //           return done(err);
  //         }
  //         launchy = res.body;
  //         done();
  //       });
  //   });

  //   afterEach(function() {
  //     launchy = {};
  //   });

  //   it('should respond with the requested launchy', function() {
  //     expect(launchy.name).to.equal('New Launchy');
  //     expect(launchy.info).to.equal('This is the brand new launchy!!!');
  //   });

  // });

  // describe('DELETE /api.launchies/:monitor', function() {

  //   it('should respond with 204 on successful removal', function(done) {
  //     request(app)
  //       .delete('/api.launchies/' + newLaunchy._id)
  //       .expect(204)
  //       .end((err, res) => {
  //         if (err) {
  //           return done(err);
  //         }
  //         done();
  //       });
  //   });

  //   it('should respond with 404 when launchy does not exist', function(done) {
  //     request(app)
  //       .delete('/api.launchies/' + newLaunchy._id)
  //       .expect(404)
  //       .end((err, res) => {
  //         if (err) {
  //           return done(err);
  //         }
  //         done();
  //       });
  //   });

  // });

});
