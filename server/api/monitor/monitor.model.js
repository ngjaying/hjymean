import mongoose from 'mongoose';

let MonitorSchema = new mongoose.Schema({ // eslint-disable-line new-cap
	nuser: {
		type: String,
		index: true,
	},
	url: {
		type: String,
		required: true,
		minlength: 8,
	},
	jqpath: {
		type: String,
		required: true,
		minlength: 1,
	},
	blockname: String,
	emails: [String],
});

MonitorSchema.index({nuser: 1, url: 1, jqpath: 1}, {unique: true});

export default mongoose.model('Monitor', MonitorSchema);
