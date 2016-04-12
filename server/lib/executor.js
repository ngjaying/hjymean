'use strict';
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var md5 = require('md5');
var later = require('later');

var reqOptions = {
	'headers': {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
	},
	'encoding': null
};

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var blockSchema = mongoose.Schema({
	url: {type: String, index: true},
	jqpath: {type: String, index: true},
	value: String,
	oldMD5: String
});
var Block = mongoose.model('Block', blockSchema);
/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *	@callback
 *		result: string array
 */
function getValues(options, callback) {
	var result = [];
	var charset = options.charset;
	reqOptions.url = options.url;
	request.get(reqOptions, function(err, res, body) {
		if (err) {
			console.log(err);
			callback(err, result);
			return;
		}
		if (res.statusCode == 200) {
			//Get the encoding of the html
			if (!charset) {

				var arr = String(body).match(/<meta([^>]*?)>/g);
				if (arr) {
					arr.forEach(function(val) {
						var match = val.match(/charset\s*=\s*(.+)\"/);
						if (match && match[1]) {
							if (match[1].substr(0, 1) == '"') match[1] = match[1].substr(1);
							charset = match[1].trim();
							console.log(charset);
							return false;
						}
					})
				}
			}

			if (charset) {
				body = iconv.decode(new Buffer(body), charset);
			}

			var $ = cheerio.load(body);
			$(options.jqpath).each(function() {
				result.push($(this).text().replace(/[\r\n]/g, "").trim());
			});
			callback(null, result);
		}

	});
}

/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *		value
 *	@callback
 *		result, changed boolean; value: new value
 */
function compare(options, callback) {
	Block.find({
		url: options.url,
		jqpath: options.jqpath
	}, function(err, blocks) {
		console.log('into find ' + blocks);
		if (err)
			throw err;
		if (blocks.length > 0) {
			var currentMD5 = md5(blocks[0].value);
			if (md5(options.value) == currentMD5) {
				callback(null, {
					'changed': false,
					'value': options.value
				});
			} else {
				blocks[0].value = options.value;
				blocks[0].oldMD5 = currentMD5;
				blocks[0].save(function(err, b) {
					if (err)
						return console.error(err);
					console.log("Writtern to db");
					callback(null, {
						'changed': true,
						'value': options.value
					});
				});

			}
		} else {
			var newBlock = new Block(options);
			newBlock.save(function(err, b) {
				if (err)
					return console.error(err);
				console.log("Writtern to db");
				callback(null, {
					'changed': true,
					'value': options.value
				});
			});
		}
	});
}
/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *	@callback
 *		result, new value
 */
function run(options, onChangeCallback, stillCallback) {
	getValues(options, function(err, arr) {
		if (err)
			return console.log('error get values');
		options.value = arr.join('\n');
		compare(options, function(err, result) {
			console.log(result);
			if (result.changed) {
				onChangeCallback(null, result.value);
			} else {
				stillCallback();
			}
		});
	});


}

/*
 *	@options 
 *		charset
 *		url
 *		jqpath
 *	@callback
 *		result, new value
 */
function runInSchedule(options, onChangeCallback, stillCallback) {
	run(options, onChangeCallback, stillCallback);
	var s = later.parse.recur()
		.every(1).hour().between(0, 12);
	//var s = later.parse.recur().every(30).second();
	later.date.UTC();
	// var occurrences = later.schedule(s).next(10);

	// for (var i = 0; i < 10; i++) {
	// 	console.log(occurrences[i]);
	// }

	var timer = later.setInterval(function() {
		console.log(new Date());
		run(options, onChangeCallback, stillCallback);
	}, s);
	return timer;
}

module.exports = {
	getValues: getValues,
	compare: compare,
	run: run,
	runInSchedule: runInSchedule
};