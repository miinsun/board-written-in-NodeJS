var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');

// serialize & deserialize User
passport.serializeUser(function(user, done){
    done(null, user.id); //user.id를 세션에 저장
});

passport.deserializeUser(function(id, done){ //user를 object로 저장
    User.findOne({_id:id}, function(err, user){
        done(err, user);
    });
});

//local strategy
passport.use('local-login',
    new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, username, password, done){ //로그인 시에 이 함수가 호출
        User.findOne({username:username}) // DB에서 해당 유저를 찾고
        .select({password:1})
        .exec(function(err, user){
            if(err) return done(err);

            if(user && user.authenticate(password)){ //비밀번호가 일치하면
                return done(null, user); // user를 done에 담아서 return
            }
            else{ //비밀번호가 일치하지 않으면
                req.flash('username', username);
                req.flash('errors', {login: 'username, password 가 옳지 않습니다.'});
                return done(null, false);  //done에 false를 담아 리턴
            }
        });
    }
    )
);

module.exports = passport;