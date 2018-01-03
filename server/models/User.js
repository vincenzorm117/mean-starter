

module.exports = function(mongoose) {
	const Schema = mongoose.Schema;

	var UserSchema = new Schema({
		name: {
			type: String
		},
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			unique: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
		},
		date_created: { 
			type: Date, 
			default: Date.now 
		},
	});

	return mongoose.model('User', UserSchema);
}





