import app from '../..';
import Monitor from './monitor.model';

let monitor;
function genMonitor(){
	monitor = new Monitor({
		nuser: 'fakeuser',
		url: 'http://www.jimei.gov.cn/xxgk/F394/rsxx/zkzp/',
    	jqpath: 'table.h30.mar_t10 a',
    	blockname: 'fakeblock',
    	emails: ['fakeemail@qq.com'],
	});
	return monitor;
};

describe('Monitor Model', function(){
	before(function() {
		return Monitor.remove().exec();
	});

	beforeEach(function(){
		genMonitor();
	});

	afterEach(function(){
		return Monitor.remove().exec();
	});

	it('should begin with no monitors', function(){
		return expect(Monitor.find({}).exec()).to
			.eventually.have.length(0);
	});

	it('should have only one nuser, url and jqpath', function(){
		return expect(monitor.save().then(function(){
				let monitorDup = genMonitor();
				monitorDup.blockname = 'another value';
				return monitorDup.save();
			})).to.be.rejected;
	});

	it('#findAndModify', function(){
		let {url, jqpath, nuser, blockname, emails} = monitor;
		return expect(monitor.save().then(function(){
			blockname = monitor.blockname = 'another value';
			return Monitor.findOneAndUpdate({
					url, jqpath, nuser
				}, {
					$set: {
						emails,
						blockname,
					},
				}, {
					new: true,
					upsert: true,
				});
		}).then(function(m){
			console.log(m.blockname);
			return Monitor.find({
				url, jqpath, nuser
			}).exec();
		})).eventually.to.have.length(1)
			.to.have.deep.property('[0].blockname', 'another value');
	});

	describe('#validation', function(){
		it('#missing url', function(){
			monitor.url = '';
			return expect(monitor.save()).to.be.rejected;
		});

		it('#missing jqpath', function(){
			monitor.jqpath = '';
			return expect(monitor.save()).to.be.rejected;
		});

	});
	
});
