import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import * as executor from './executor';
import Promise from 'bluebird';

let monitor = ((function () {
	let api = {};
	let	transporter;
	const monitorSchema = new mongoose.Schema({ // eslint-disable-line new-cap
		nuser: {
			type: String,
			index: true,
		},
		url: {
			type: String,
			index: true,
		},
		jqpath: {
			type: String,
			index: true,
		},
		blockname: String,
		notifiers: {
			emails: [String],
			wechats: [String],
		},
	});
	monitorSchema.statics.findAndModifyAsync = function (query, sort, doc, options) {
		let m = this;
		return new Promise((resolve, reject) => {
			m.collection.findAndModify(query, sort, doc, options, (err, model) => {
				if(err) {
					reject(err);
				}else{
					resolve(model);
				}
			});
		});
	};
	let MonitorModel = mongoose.model('Monitor', monitorSchema);

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
	/*	@notifiers an array of email address
	 *	@url
	 *	@blockname
	 *	@value
	 *  callback: error, info
	 */
	api.sendEmail = async ({notifiers, url, blockname, value}) => {
		let mailOptions = {
			from: 'xhjappadmin@163.com', // sender address
			to: notifiers.join(', '),
			subject: `${blockname || url}有更新`,
			text: `${url} 新内容:\n${value}`, // plaintext body
			html: `<a href='${url}'>${blockname}</a> 新内容:\n${value}`,
		};
		createSMTP();
		//send mail with defined transport object
		let info = await transporter.sendMailAsync(mailOptions).catch((err) => { throw err; });
		console.log(`Message sent: ${info.response}`);
		return info;
	};
	// Return the monitor
	function checkMonitor(id) {
		if (!global.executors) global.executors = {};
		return global.executors[id];
	}
	/*
	 * monitor: monitorSchema like
	 *	callback: error
	 */
	api.restartMonitor = (m) => {
		api.stopMonitor(m);
		api.startMonitor(m);
	};

	api.stopMonitor = ({url, jqpath}) => {
		let id = url + jqpath;
		let exe = checkMonitor(id);
		if (exe) {
			exe.clear();
		}
	};

	api.startMonitor = async ({url, jqpath, notifiers, blockname}) => {
		let id = url + jqpath;
		let exe = checkMonitor(id);
		if (!exe) {
			console.log(`create new monitor with ${executor}`);
			exe = executor.runInSchedule(async (value) => {
				console.log(`${url} has update!`);
				if(notifiers.emails) {
					await api.sendEmail({
						notifiers: notifiers.emails,
						url, value, blockname,
					});
					console.log(`Email sent to ${notifiers.emails}\nurl: ${url}`);
				}
				if(notifiers.wechats) {
					//TODO
				}
			}, {url, jqpath});
		}
		global.executors[id] = exe;
	};

	// function compareNotifiers(a, b) {
	// 	var result = true;
	// 	if (!a.emails) {
	// 		result = !b.emails;
	// 	} else if (a.emails.length) {
	// 		result = b.emails.length && a.emails.length == b.emails.length;
	// 		if (result) {
	// 			result = a.emails.every(function(ele, ind) {
	// 				return ele == b.emails[ind];
	// 			});
	// 		}
	// 	}
	// 	if (!result) return result;

	// 	if (!a.wechats) {
	// 		result = !b.wechats;
	// 	} else if (a.wechats.length) {
	// 		result = b.wechats.length && a.wechats.length == b.wechats.length;
	// 		if (result) {
	// 			result = a.wechats.every(function(ele, ind) {
	// 				return ele == b.wechats[ind];
	// 			});
	// 		}
	// 	}
	// 	return result;
	// }

	/*
	 * opts: monitorSchema like
	 *	callback: error
	 */
	api.addOrUpdateMonitor = async ({url, jqpath, nuser, notifiers, blockname}) => {
		let m = await MonitorModel.findAndModifyAsync({
			url, jqpath, nuser,
		}, [], {
			$setOnInsert: {
				notifiers,
				blockname,
			},
		}, {
			new: true,
			upsert: true,
		}).catch((err) => { throw err; });
		api.restartMonitor(m.value);

		// MonitorModel.find({
		// 	url: opts.url,
		// 	jqpath: opts.jqpath,
		// 	nuser: opts.user
		// }, function(err, models) {
		// 	if (err)
		// 		return callback(err);
		// 	if (models.length > 0 && compareNotifiers(models[0].notifiers, opts.notifiers)) {
		// 		models[0].notifiers = opts.notifiers;
		// 		models[0].save(function(err, b) {
		// 			if (err)
		// 				return console.error(err);
		// 			callback();
		// 		});
		// 	} else if (models.length == 0) {
		// 		var newModel = new MonitorModel(opts);
		// 		newModel.save(function(err, b) {
		// 			if (err)
		// 				return console.error(err);
		// 			callback();
		// 		});
		// 	}
		// });
	};

	api.findMonitors = function () {

	};

	api.deleteMonitors = function () {

	};

	return api;
})());
export default monitor;
