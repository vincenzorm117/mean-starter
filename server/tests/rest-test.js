#!/usr/local/bin/node

require('dotenv').config({path: '../../.env'})

const http = require('request');


describe('REST endpoints', function() {
	this.timeout(10000);

	it('GET User with id', function(done) {
		http.get(`http://localhost:4321/api/users/1`, function(err, res, body) {
			if(err) done(err);
			console.log(res.statusCode)
			if( res.statusCode == 404 ) {
				return done()
			}
			done(new Error('wrong status code'));
		})
	})

})