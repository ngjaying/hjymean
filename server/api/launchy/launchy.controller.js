import nodemailer from 'nodemailer';
import Block from './block.model';
import request from 'request';
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import later from 'later';
import tracer from 'tracer';
import md5 from 'md5';
import Promise from 'bluebird';

Promise.promisifyAll(request, {multiArgs: true});
let logger = tracer.colorConsole();
let transporter;
let reqOptions = {
  		headers: {
  			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1)' +
    ' AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36',
  },
	encoding: null,
	url: null,
};

function respondWithResult(res, entity) {
  res.status(200).json(entity);
}

function checkMonitor(id) {
	if (!global.executors) global.executors = {};
	return global.executors[id];
}

async function getValues({charset, url, jqpath}) {
	logger.log('getValues');
	let result = [];
	let c = charset;
	reqOptions.url = url;
	let [res, body] = await request.getAsync(reqOptions).catch((err) => { throw err; });
	if (res.statusCode === 200) {
// Get the encoding of the html
		if (!c) {
			let arr = String(body).match(/<meta([^>]*?)>/g);
			if (arr) {
				for(let val of arr) {
					let match = val.match(/charset\s*=\s*(.+)"/);
					if (match && match[1]) {
						if (match[1].substr(0, 1) === '"') match[1] = match[1].substr(1);
						c = match[1].trim();
						logger.log(c);
						break;
          					}
        				}
      			}
    		}

		if (c) {
			body = iconv.decode(new Buffer(body), c);
    		}

		let $ = cheerio.load(body);
		$(jqpath).each((i, elem) => {
			result.push($(elem).text().replace(/[\r\n]/g, '').trim());
    		});
		return result;
  	}
	throw new Error('Could not get the result');
}

async function compare({charset, url, jqpath, value}) {
	logger.log(`url ${url}`);
	let blocks = await Block.find({
		url,
		jqpath,
  	}).exec().catch((err) => { throw err; });
	logger.log(`blocks.length: ${blocks.length}, value: ${JSON.stringify(blocks[0])}`);
	if (blocks.length > 0) {
			let currentMD5 = md5(blocks[0].value);
			if (md5(value) === currentMD5) {
				return {
					changed: false,
					value,
      				};
    			}
			blocks[0].value = value;
			//blocks[0].oldMD5 = currentMD5;
			await blocks[0].save().catch((err) => { throw err; });
			logger.log('Writtern to db');
			return {
			changed: true,
			value,
    		};
  		}
	let newBlock = new Block({charset, url, jqpath, value});
	await newBlock.save().catch((err) => { throw err; });
	logger.log('Writtern to db');
	return {
		changed: true,
		value,
  };
}

async function run(changeCallback, {charset, url, jqpath}) {
	try{
		let arr = await getValues({charset, url, jqpath});
		let {changed, value } = await compare({
      charset, url, jqpath, value: arr.join('\n'),
    });
		logger.log(`changed: ${changed}, new value: ${value}`);
		if(changed) {
			changeCallback(value);
    }
	} catch(err) {
  	throw err;
  }
}

function createSMTP() {
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: 'smtp.163.com',
			port: 465,
			secure: true,
			auth: {
				user: 'xhjappadmin@163.com',
				pass: 'devc0re4',
      			},
    		});
		Promise.promisifyAll(transporter);
  	}
}

async function sendEmail({notifiers, url, blockname, value}) {
	let mailOptions = {
		from: 'xhjappadmin@163.com', // sender address
		to: notifiers.join(', '),
		subject: `${blockname || url}有更新`,
		text: `${url} 新内容:\n${value}`, // plaintext body
		html: `<a href='${url}'>${blockname}</a> 新内容:\n${value}`,
  	};
	createSMTP();
  //send mail with defined transport object
  let info = await transporter.sendMailAsync(mailOptions).
    catch((err) => { throw err; });
	logger.log(`Message sent: ${info.response}`);
	return info;
}

async function runInSchedule(changeCallback, {charset, url, jqpath}) {
	logger.log('runInSchedule');
	await run(changeCallback, {charset, url, jqpath}).
    catch((err) => { throw err; });
	let s = later.parse.recur()
  .every(1).hour().between(0, 12);
  //var s = later.parse.recur().every(30).second();
  later.date.UTC(); // eslint-disable-line new-cap
  // var occurrences = later.schedule(s).next(10);

  // for (var i = 0; i < 10; i++) {
  //  console.log(occurrences[i]);
  // }

	let timer = later.setInterval(function () {
  	logger.log(new Date());
  	run(changeCallback, {charset, url, jqpath})
      .catch((err) => { throw err;})
  }, s);
  return timer;
}

// Gets a the staus of a launchy, could be true/false (running or not)
export function showStatus(req, res) {

}

// Launch a monitor with url and jqpath. If it already running, do nothing.
export function launch(req, res) {
	let {url, jqpath, emails, blockname} = req.body;
	let id = url + jqpath;
	let exe = checkMonitor(id);
	logger.debug('monitor id %s', id);
	if (!exe) {
		logger.debug('new executor');
		exe = {};
		exe.emails = [...new Set(emails)];
		runInSchedule((value) => {
			logger.log(`${url} has update!`);
			let newEmails = global.executors[id].emails;
			if(newEmails) {
				sendEmail({
					emails: newEmails, url, value, blockname,
        }).then(() => {
          logger.log(`Email sent to ${emails}\nurl: ${url}`);
        });
      }
    }, {url, jqpath}).then((timer) => {
      logger.debug('timer has been updated ');
      exe.timer = timer;
      exe.launched = true;
      global.executors[id] = exe;
      respondWithResult(res, exe);
    });
  } else {
  	logger.debug('existing executor');
  	exe.emails = [...new Set([...exe.emails, ...emails])];
  	logger.debug('concat emails, new list %d', exe.emails.length);
    respondWithResult(res, exe);
  }
}

// Stop a monitor
export function stop(req, res) {

}
