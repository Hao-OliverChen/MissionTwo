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

app.get('/register', isLoggedOut, (req, res) => {
  const response = {
    title: "Register",
    error: req.query.error
  }

  res.render('register', response);
});

app.get('/citizen-registration', (req, res) => {
  const response = {
    title: "Citizen Registraion",
    error: req.query.error
  }

  res.render('citizenRegistration', response);
});

app.get('/citizen-deletion', (req, res) => {
  const response = {
    title: "Citizen Deletion",
    error: req.query.error
  }

  res.render('citizenDeletion', response);
});


/*
------------------------------------------------------------------------------------------------------------
POST 
 */
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login?error=true'
}));

// handle register
app.post('/register', async (req, res) => {
  // check for validation
  const exists = await User.exists({ serialNum: req.body.serialNum });
  if (!exists) {
    res.redirect('/register?error=true');
    return;
  };

  // encrypt the safeCode
  const hashedPwd = await bcrypt.hash(req.body.safeCode, 10);

  // get the data
  const doc = await User.findOne({ serialNum: req.body.serialNum });
  // update the username
  doc.safeCode = hashedPwd;
  await doc.save();

  // after registration redirect back to login
  res.redirect('/login')

});

// handle citizen registration
app.post('/citizen-registration', async (req, res) => {
  // check for duplicate
  const exists = await User.exists({ serialNum: req.body.serialNum });
  if (exists) {
    res.redirect('/citizen-registration?error=true');
    return;
  };

  // create and store the new user
  const result = await User.create({
    serialNum: req.body.serialNum,
    safeCode: "_EMPTY_",
    candidate:"Unknown"
  });

  result.save();

  // after registration redirect back to login
  res.redirect('/citizen-registration')

});

// handle citizen deletion
app.post('/citizen-deletion', async (req, res) => {
  // check for validation
  const exists = await User.exists({ serialNum: req.body.serialNum });
  if (!exists) {
    res.redirect('/citizen-deletion?error=true');
    return;
  };

  // delete citizen
  User.deleteOne({ serialNum: req.body.serialNum })
  .then(function () {
    console.log("Citizen " + req.body.serialNum + " is deleted"); // success
  }).catch(function (error) {
    console.log(error); // Failure
  });

  // after registration redirect back to login
  res.redirect('/citizen-deletion')

});

// handle voting
app.post('/vote-submission', async (req, res) => {

  // get the data
  const doc = await User.findOne({ serialNum: currentLogin });
  // update the username
  doc.candidate = req.body.candidate;
  await doc.save();

  console.log("Successfully submitted candidate:" + req.body.candidate)

  // after registration redirect back to login
  res.redirect('/')

});


// check connection and port
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port 3000");
  });
})
