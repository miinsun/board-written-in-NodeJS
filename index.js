var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://minsun:dbsalstjs1@cluster0.uwree.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');

var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash()); //flash 함수 초기화, req.flash 함수 사용 가능
app.use(session({secret: 'minisun', resave:true, saveUninitialized:true}));

//Pass port
app.use(passport.initialize());
app.use(passport.session());

//Custom Middlewares
app.use(function(req, res, next){ // 함수 안에 반드시 next를 포함해줘야 다음으로 진행
  res.locals.isAuthenticated = req.isAuthenticated(); // 현재 로그인이 돼 있는 상태 인지 확인
  res.locals.currentUser = req.user;
  //local에 담겨진 두 변수는 ejs에서 바로 사용 가능
  next();
})

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));

// Port setting
var port = process.env.PORT || 3000;app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});