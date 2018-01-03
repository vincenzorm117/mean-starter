#!/usr/local/bin/node

require('dotenv').config({path: '../../.env'})

var db = require('../db.js');
var chai = require('chai');
var expect = chai.expect;
var User = db.models.User;

before(function(done) {
	db.connect(process.env.MONGO_DB, done);
})

describe('db user creation', function() {
	var email = 'email@example.com';

	it('Database connected', function() {
		expect(db.state.code).to.equal(1);
	})

	it('User is created', function(done) {
		db.user.create({
			name: '',
			email: email,
		}, function(err) {
			if(err) done(err);
			
			db.user.get({ email: email }, function(err, user) {
				if(err) return done(err)
				if( user.email == email ) {
					done();
				} else {
					done(new Error('email\'s don\'t match'));
				}
			})
		})
	})

	after(function(done){
		console.log('after started');
		db.user.remove({ email: email }, function(){
			console.log('after finishing')
			done()
		})
	})
})