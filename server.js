const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cookie = require('cookie-session');
const hbs = require('express-handlebars').engine;
const cors = require('cors');
const app = express();
var amIloggedIn = false;
var currentLogin = "";
var isAnswered = false; // boolean checker for secret answer
dotenv.config();

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
app.use(cors());

// for authenticating the username & password combo
function isAuthenticated(username, password){
  if(username != "John" || password != "123"){
    amIloggedIn = false
  } 
  else amIloggedIn = true;
  return amIloggedIn;
}

// for checking if the answer is correct
function isAnswerCorrect(answer){
  if(answer != "Zane"){
    isAnswered = false
  } 
  else isAnswered = true;
  return isAnswered;
}


// login check
function isLoggedIn(req, res, next) {
  if (amIloggedIn && isAnswered) return next();
  res.redirect('/login');
}

// log out check
function isLoggedOut(req, res, next) {
  if (!amIloggedIn || !isAnswered) return next();
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
    title: "User Dashboard",
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

app.get('/secretQA', (req, res) => {
  const response = {
    title: "Login",
    error: req.query.error
  }

  res.render('SecretAnswer', response);
});

// swap to post if have time
app.get('/logout', (req, res) =>
{
  currentLogin = ""
  amIloggedIn = false;
  res.redirect('/login');
});

/*
------------------------------------------------------------------------------------------------------------
POST 
 */
app.post('/login', (req, res) => {
  console.log("Username:" + req.body.username);
  console.log("Password:" + req.body.password);
  console.log("IP Address --- " + req.socket.remoteAddress);
  if (isAuthenticated(req.body.username, req.body.password)) {
    currentLogin = req.body.username;
    res.redirect('/secretQA')
  }
  else res.redirect('/login?error=true')
});

app.post('/secretQA', (req, res) => {
  console.log("Answer:" + req.body.answer);
  if (isAnswerCorrect(req.body.answer)) {
    res.redirect('/')
  }
  else res.redirect('/secretQA?error=true')
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port 3000");
});

