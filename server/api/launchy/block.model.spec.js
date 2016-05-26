import app from '../..';
import Block from './block.model';
import md5 from 'md5';

let block;
function genBlock() {
	block = new Block({
		url: 'http://www.jimei.gov.cn/xxgk/F394/rsxx/zkzp/',
    																			jqpath: 'table.h30.mar_t10 a',
    																			value: 'new value',
	});
	return block;
}

describe('Block Model', function () {
	before(function () {
		return Block.remove().exec();
	});

	beforeEach(function () {
		genBlock();
	});

	afterEach(function () {
		return Block.remove().exec();
	});

	it('should begin with no blocks', function () {
		return expect(Block.find({}).exec()).to
			.eventually.have.length(0);
	});

	it('should have only one url and jqpath', function () {
		return expect(block.save().then(function () {
			let blockDup = genBlock();
			blockDup.value = 'another value';
			return blockDup.save();
		}).then(function () {
			return Block.find({
				url: block.url,
				jqpath: block.jqpath,
			}).exec();
		})).to.be.rejected;
	});

	it('should have md5 calculated', function () {
		let oldValue = block.value;
		return expect(block.save().then(function () {
			block.value = 'another value';
			return block.save();
		}).then(function () {
			return Block.find({
				url: block.url,
				jqpath: block.jqpath,
			}).exec();
		})).eventually.to.have.deep.property('[0].oldMD5', md5(oldValue));
	});

	it('should not create md5 for new save', function () {
		return expect(block.save()
			.then(function () {
				let blockDup = genBlock();
				blockDup.url = 'http://myurl';
				blockDup.value = 'another value';
				return blockDup.save();
			}).then(function () {
				return Block.find({
					url: block.url,
					jqpath: block.jqpath,
				}).exec();
			})).eventually.to.have.deep.property('[0].oldMD5', '');
	});

	describe('#validation', function () {
		it('#missing url', function () {
			block.url = '';
			return expect(block.save()).to.be.rejected;
		});

		it('#missing jqpath', function () {
			block.jqpath = '';
			return expect(block.save()).to.be.rejected;
		});

		it('#missing value', function () {
			block.value = null;
			return expect(block.save()).to.be.rejected;
		});

		it('#preset oldMD5', function () {
			block.oldMD5 = 'anymd5';
			return expect(block.save()).to.be.rejected;
		});
	});

});
