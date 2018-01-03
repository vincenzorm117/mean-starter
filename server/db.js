
// Get modules
const mongoose = require('mongoose');
const states = mongoose.connection.states;
const Schema = mongoose.Schema;
// Get models
const User = require('./models/User')(mongoose);

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// DataBase API Core

// Init database controller
var db = {
	state: {
		code: 0,
		message: states[0]
	},
	states: states,
	mongoose: mongoose,
};

// Setup basic db functions
db.on = function(channel, fn) {
	mongoose.connection.on(channel, function() {
		if( fn instanceof Function ) {
			fn.bind(db)()
		}
	})
},
db.connect = function(uri, fn) {
	mongoose.connect(uri, { useMongoClient: true }, function() {
		db.state.code = mongoose.connection.readyState;
		db.state.message = states[db.state.code]
		if( fn instanceof Function ) {
			fn.bind(db)()
		}
	});
}



////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// User API

db.user = {};

//////////////////////////////////////////
// Find or create User
db.user.findOrCreate = ({ name, email }, cb) => {
	function FindUser(err, user){
		// return if error
		if(err) return cb(err);
		// return if user doesn't exist
		if(!user) {
			return db.user.create({ 
				name: name, 
				email: email.toLowerCase() 
			}, function(err, user){
				cb(null, user)
			});
		} else {
			return cb(null, user);
		}
	}

	if( email !== undefined ) {
		return User.findOne({ email: email.toLowerCase() }, FindUser);
	}
	cb(new Error('invalid arguments'));
}

//////////////////////////////////////////
// Create User
db.user.create = ({ name, email }, cb) => {
	var user = new User({
		name: name,
		email: email.toLowerCase(),
	});
	return user.save(cb);
}

//////////////////////////////////////////
// Get User
db.user.get = ({ id, email }, cb) => {
	if( id !== undefined ) {
		return User.findById(id, cb);
	}
	if( email !== undefined ) {
		return User.findOne({ email: email.toLowerCase() }, cb);
	}
	cb(new Error({ status: 404, message: 'user not found' }));
}

//////////////////////////////////////////
// Update User
db.user.update = ({ id, name }, cb) => {
	if( id !== undefined ) {
		return User.findById(id, (err, user) => {
			if(err) return cb(err);
			// return if user doesn't exist
			if(!user) {
				return cb(null, user);
			}
			if( typeof(name) == typeof('') ) {
				user.name = name;
			}
			user.save(cb);
		});
	}
	cb(new Error({ status: 404, message: 'user not found' }));
}

db.user.getAll = (cb) => {
	User.find({}, cb);
}


module.exports = db;
