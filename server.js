const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cookie = require('cookie-session');
const hbs = require('express-handlebars').engine;
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const app = express();
var currentLogin = "";
dotenv.config();

// use mongoose to connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (error) {
    console.error(error);
  }
}

connectDB();

// create user schema
const UserSchema = new mongoose.Schema({
  serialNum: {
    type: String,
    required: true
  },
  safeCode: {
    type: String,
    required: true
  },
  candidate: {
    type: String,
    required: true
  }
});

const User = mongoose.model('ShueWorld_Citizen', UserSchema);

// Middleware
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/views'));
app.use(session({
  secret: "verygoodsecret",
  resave: false,
  saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// verify the login
passport.use(new localStrategy(function (serialNum, safeCode, done) {
  User.findOne({ serialNum: serialNum }, function (err, user) {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect serialNum.' });

    bcrypt.compare(safeCode, user.safeCode, function (err, res) {
      if (err) return done(err);
      if (res === false) return done(null, false, { message: 'Incorrect safeCode.' });

      // store the valid user game info
      currentLogin = serialNum;
      return done(null, user);
    });
  });
}));

// login check
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// log out check
function isLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect('/');
}

// ROUTES
/*
------------------------------------------------------------------------------------------------------------
GET
 */
app.get('/', isLoggedIn, (req, res) => {
  console.log("------------------------------------------------");
  console.log("Current Login: " + currentLogin);
  const response = {
    title: "Voting Phase",
    error: req.query.error,
    citizen: currentLogin,
  }
  res.render("index", response);
});

app.get('/login', isLoggedOut, (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error
  }

  res.render('login', response);
});

// swap to post if have time
app.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
  currentLogin = ""
});


/*
------------------------------------------------------------------------------------------------------------
POST 
 */
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=true'
}));




// check connection and port
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3000");
  });
})
