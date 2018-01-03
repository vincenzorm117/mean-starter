


const dotenv = require('dotenv')
const express = require('express')
const fileUpload = require('express-fileupload')

// Setup configuration variables
dotenv.config()

// Initialize router
const router = express.Router()


router.use(fileUpload())


module.exports = function(db) {


	router.get('/user', (req, res, next) => {
		db.user.get({ id: req.user._id }, (err, user) => {
			if(err) return res.status(400).send();
			if(!user) return res.status(404).send();
			return res.status(200).json({
				name: user.name,
				email: user.email,
				date_created: user.date_created,
			})
		});
	});


	router.all('/*', (req, res, next) => {
		console.log('API HIT 😛');
		res.status(200).json({});
	});


	return { router }
}


