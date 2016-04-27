import mongoose from 'mongoose';
import md5 from 'md5';

let BlockSchema = new mongoose.Schema({
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
	value: {
		type: String,
		required: true,
	},
	oldMD5: String,
});

BlockSchema.index({url: 1, jqpath: 1}, {unique: true});

function validatePresent(o){
	return o && o.length;
}

BlockSchema.path('oldMD5').validate((oldMD5) => {
	return !validatePresent(oldMD5);
}, 'oldMD5 must not present');

/*
*	Save if the value is changed and save old value as md5
*/
BlockSchema.post('init', function(){
	this._oldValue = this.value;
});

BlockSchema.pre('save', function(next){
	if(this.isModified('value')){
		if(this._oldValue){
			this.oldMD5 = md5(this._oldValue);	
		}else{
			this.oldMD5 = '';
		}	
		this._oldValue = this.value;
	}
	next();
});

export default mongoose.model('Block', BlockSchema);
