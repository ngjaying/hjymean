'use strict';

import request from 'request';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import md5 from 'md5';
import later from 'later';
import Promise from 'bluebird';
import mongoose from 'mongoose';
Promise.promisifyAll(request, {multiArgs: true});

let reqOptions = {
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
	},
	encoding: null,
	url: null,
};

let blockSchema = new mongoose.Schema({
	url: {
		type: String,
		index: true
	},
	jqpath: {
		type: String,
		index: true
	},
	value: String,
	oldMD5: String
});
let Block = mongoose.model('Block', blockSchema);

/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 */
async function getValues({charset, url, jqpath}) {
	let result = [];
	reqOptions.url = url;
	let [res, body] = await request.getAsync(reqOptions).catch((err) => {throw err;});
	if (res.statusCode == 200) {
		//Get the encoding of the html
		if (!charset) {

			let arr = String(body).match(/<meta([^>]*?)>/g);
			if (arr) {
				for(let val of arr) {
					let match = val.match(/charset\s*=\s*(.+)\"/);
					if (match && match[1]) {
						if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
						charset = match[1].trim();
						console.log(charset);
						break;
					}
				}
			}
		}

		if (charset) {
			body = iconv.decode(new Buffer(body), charset);
		}

		let $ = cheerio.load(body);
		$(jqpath).each((i, elem) => {
			result.push($(elem).text().replace(/[\r\n]/g, "").trim());
		});
		return result;
	}else {
		throw 'Could not get the result';
	}
}

/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *		value

 */
async function compare({charset, url, jqpath, value}) {
	console.log(`url ${url}`);
	let blocks = await Block.find({
		url,
		jqpath
	}).exec().catch((err) => {throw err;});
	console.log(`blocks.length: ${blocks.length}, value: ${JSON.stringify(blocks[0])}`);
	if (blocks.length > 0) {
		let currentMD5 = md5(blocks[0].value);
		if (md5(value) == currentMD5) {
			return {
				changed: false,
				value,
			};
		} else {
			blocks[0].value = value;
			blocks[0].oldMD5 = currentMD5;
			await blocks[0].save().catch((err) => {throw err;});
			console.log("Writtern to db");
			return {
				'changed': true,
				value,
			};
		}
	} else {
		let newBlock = new Block({charset, url, jqpath, value});
		await newBlock.save().exec().catch((err) => {throw err;});
		console.log("Writtern to db");
		return {
			'changed': true,
			value,
		};
	}
}
/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *	@callback
 *		result, new value
 */
async function run(changeCallback, {charset, url, jqpath}) {
	try{
		let arr = await getValues({charset, url, jqpath});
		let {changed, value } = await compare({charset, url, jqpath, value: arr.join('\n')});
		if(changed){
			changeCallback(value);
		}
	} catch(err){
		throw err;
	}
}

/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *	@callback
 *		result, new value
 */
function runInSchedule(changeCallback, {charset, url, jqpath}) {
	run(changeCallback, {charset, url, jqpath});
	//var s = later.parse.recur()
	//	.every(1).hour().between(0, 12);
	var s = later.parse.recur().every(30).second();
	later.date.UTC();
	// var occurrences = later.schedule(s).next(10);

	// for (var i = 0; i < 10; i++) {
	// 	console.log(occurrences[i]);
	// }

	var timer = later.setInterval(function() {
		console.log(new Date());
		run(changeCallback, {charset, url, jqpath});
	}, s);
	return timer;
}

export {getValues, compare, run, runInSchedule};
