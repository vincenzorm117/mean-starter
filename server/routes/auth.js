
const dotenv = require('dotenv')
const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy


// Setup configuration variables
dotenv.config()
const PORT = process.env.PORT || 8888
const GOOGLE_CLIENT_ID = process.env.OAUTH2_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.OAUTH2_GOOGLE_CLIENT_SECRET
const GOOGLE_CB_PATH = process.env.OAUTH2_GOOGLE_CALLBACK_PATH
const VINCENZO_EMAIL = process.env.VINCENZO_EMAIL
const API_TIME_LIMIT = parseInt(process.env.API_TIME_LIMIT || 1000*60*10) // 10 minutes
// Initialize router
const router = express.Router()




////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
// Module exports

module.exports = function(db) {
	// Setup passport.js
	passport.serializeUser(function(user, done) {
	  	done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		return done(null, user)
	});


	////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////
	// Google Authentication API

	passport.use(
		new GoogleStrategy({
	    	clientID:     GOOGLE_CLIENT_ID,
	    	clientSecret: GOOGLE_CLIENT_SECRET,
	    	callbackURL: GOOGLE_CB_PATH,
	    	passReqToCallback: true
	  	}, function(request, accessToken, refreshToken, profile, done) {
			// Create user if it doesn't exist
			let email = profile.emails[0].value
			let name = profile.displayName

			db.user.findOrCreate({ name, email }, (err, user) => {
				console.log(err, user);
				return done(null, user);
			});
	  	})
	);


	const GoogleScope = [
	   'https://www.googleapis.com/auth/plus.login',
	   'https://www.googleapis.com/auth/plus.profile.emails.read',
	] 

	router.get('/google', 
		passport.authenticate('google', { scope: GoogleScope })
	);



	router.get('/google/callback', 
		passport.authenticate( 'google', { 
			successRedirect: '/',
			failureRedirect: '/login'
		})
	);

	function authenticate(req, res, next) {
		if( req.isAuthenticated() ) {
			return next()
		}
		if( 0 <= req.get('accept').indexOf('json') ) {
		  	return res.status(401).send();
		}
		return res.redirect('/login');
	}

	function authenticateRedirectTo(uri) {
		return function(req, res, next) {
			if( req.isAuthenticated() ) {
				return next()
			}
			if( 0 <= req.get('accept').indexOf('json') ) {
			  	return res.status(401).send();
			}
			return res.redirect(uri);
		}
	}


	function frontendAuthenticate(req, res, next) {
		if( req.isAuthenticated() ) {
			return next()
		}
		var expiration = new Date(req.session.apiUsageExperation);
		if( expiration.getTime() < Date.now() ) {
			return res.status(401).send();
		}
		return next();
	}

	function frontendTokenRenew(req, res, next) {
		if( req.isAuthenticated() ) {
			return next()
		}
		req.session.apiUsageExperation = new Date(Date.now()+API_TIME_LIMIT)
		req.session.save(() => {
			next();
		});
	}

	return { router, passport, authenticate, authenticateRedirectTo, frontendAuthenticate, frontendTokenRenew }
}










