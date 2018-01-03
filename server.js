
// Get 3rd party libs
const https = require('https')
const fs = require('fs')
const dotenv = require('dotenv')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const colors = require('colors')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')
const cron = require('node-cron')
const helmet = require('helmet')

// Setup configuration variables
dotenv.config()
const PORT = process.env.PORT || 8888
const SESSION_SECRET = process.env.SESSION_SECRET || 'MUMSTHEWORD'
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PORT = process.env.REDIS_PORT
const NG_SERVER = process.env.NG_SERVER
const SSL_FILES_PATH = process.env.SSL_FILES_PATH


// Get local libs
var db = require('./server/db')
var auth = require('./server/routes/auth')(db)
var api = require('./server/routes/api')(db)

// Connect to Mongoose server
db.connect(process.env.MONGO_DB, function(){
  console.log('DataBase connection established! 😎')
});

// Setup Express
var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');


// Setup expressjs middleware
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({ 
    secret: SESSION_SECRET,
    name:   'reykjavik',
    store:  new RedisStore({
        host: REDIS_HOST,
        port: REDIS_PORT
    }),
    proxy:  true,
    resave: true,
    saveUninitialized: true
}));
app.use('/.well-known', express.static(path.join(__dirname, 'server/public/.well-known')));
app.use('/static', express.static(path.join(__dirname, 'server/public')));

// Connect passport middleware with express
app.use(auth.passport.initialize());
app.use(auth.passport.session());

// Set CORS
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// Setup routes
app.use('/auth', auth.router)
app.use('/api/', auth.authenticate, api.router);


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

function sendToApp(req, res) {
    if( process.env.MODE == 'prod' ) {
        return res.sendFile(`${ __dirname}/server/public/index.html`);
    } else {
        return res.redirect(NG_SERVER)
    }
}

app.get('/', auth.frontendTokenRenew, (req, res) => {
    if( req.isAuthenticated() ) {
        return sendToApp(req, res);
    }
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if( req.isAuthenticated() ) {
        return sendToApp(req, res);
    }
    res.render('pages/login');
});



// Start server
// app.listen(PORT,  () => {
//   console.log(`[Listening]`.green,`URI: `, `http://localhost:${PORT}`.cyan)
// })

https.createServer({
    key: fs.readFileSync(SSL_FILES_PATH + 'privkey.pem'),
    cert: fs.readFileSync(SSL_FILES_PATH + 'fullchain.pem')
}, app).listen(443)

var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);




// Start CRON
cron.schedule('* * * * 2', () => {
    // Do some CRONing
});