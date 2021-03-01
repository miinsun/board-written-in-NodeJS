var express = require('express');
var router = express.Router();
var passport = require('../config/passport');

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});

// Login // 2
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login // 3
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }

    if(isValid){
      //폼의 유효함을 위한 callback
      next();
    }
    else {
      // 유효하지 않으면 login view로 redirect
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    //poassport local strategy를 호출해서 로그인을 진행
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout // 4
router.get('/logout', function(req, res) {
  req.logout(); //passport에서 제공하는 함수
  res.redirect('/');
});


module.exports = router;