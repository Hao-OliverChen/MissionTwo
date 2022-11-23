const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cookie = require('cookie-session');
const hbs = require('express-handlebars').engine;
const cors = require('cors');
const app = express();
var amIloggedIn = false;
var currentLogin = "";
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


function isAuthenticated(username, password){
  if(username != "John" || password != "123"){
    amIloggedIn = false
  } 
  else amIloggedIn = true;
  return amIloggedIn;
}

// login check
function isLoggedIn(req, res, next) {
  if (amIloggedIn) return next();
  res.redirect('/login');
}

// log out check
function isLoggedOut(req, res, next) {
  if (!amIloggedIn) return next();
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
    res.redirect('/')
  }
  else res.redirect('/login?error=true')
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port 3000");
});

