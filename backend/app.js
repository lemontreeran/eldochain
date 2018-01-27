//Express
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');

app.use(express.static(__dirname + '/public'));

var dotenv = require('dotenv');
dotenv.load();


//Passport
var passport = require('passport');
require('./config/passport')(passport); // pass passport for configuration

//Cookie and session
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(session({
  secret: 'this is the secret',
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

//Body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); //for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator()); // Add this after the bodyParser middleware!
app.use(cookieParser());

//Load .env file
var dotenv = require('dotenv');
dotenv.load();

// routes ======================================================================
require('./routes/auth.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./routes/product.js')(app, passport); 
require('./routes/role.js')(app, passport); 

module.exports = app;