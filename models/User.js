var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema
var userSchema = mongoose.Schema({
  /*
      간단한 regex 규칙
      1. regex는 / ~ / 안에 작성한다.
      2. ^는 문자열의 시작 위치를 나타낸다.
      3. .는 어떠한 문자열이라도 상관없다는 뜻
      4. {2, 10} 2이상 10이하의 숫자 길이
      5. $는 문자열의 끝 위치를 나타낸다.
  */
  // trim은 문자열 앞 뒤의 빈간을 제거

  username:{
    type:String,
    required:[true,'유저 이름을 입력해주세요'],
    match:[/^.{4,12}$/,'4-12 이내의 이름을 입력해주세요'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'비밀번호를 입력해주세요'],
    select:false
  },
  name:{
    type:String,
    required:[true,'이름을 입력해주세요'],
    match:[/^.{4,12}$/,'4-12 이내의 이름을 입력해주세요'],
    trim:true
  },
  email:{
    type:String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'유효한 이메일 주소가 필요합니다.'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});


// virtuals // 2
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = '영어, 숫자 조합으로 8자 이상의 비밀번호를 입력해주세요';

userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', '확인 비밀번호가 필요합니다.');
    }

    if(!passwordRegex.test(user.password)){ // 정규 표현식을 통과하면 true
      user.invalidate('password', passwordRegexErrorMessage); // model.invalidate 함수를 호출한다.
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '비밀번호가 서로 일치하지 않습니다.');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', '현재 비밀번호가 필요합니다.');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      // user.currenPassword는 사용자에게 입력받은 text, user.originalPassword가 기존에 있던 pw
      // text를 hash롤 바꿔 그 값이 일치 하는지 서로 확인
      user.invalidate('currentPassword', '유효하지 않은 비밀번호 입니다.');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '확인용 비밀번호와 일치 하지 않습니다.');
    }
  }
});

//hash password
userSchema.pre('save', function (next){
  // 'save' 함수가 발생하기 전에 실행, 즉 user를 생성하거나 수정한뒤 save 하기 전에 실행
  var user = this;
  if(!user.isModified('password')){ // db 값과 비교해서 변경된 경우 true를 반환
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); //pw의 hash 값을 db에 저장
    return next();
  }
});

userSchema.methods.authenticate = function (password) {
  //user의 pw해시 값과 입력 받은 text 값을 비교하는 함수
  var user = this;
  return bcrypt.compareSync(password,user.password);
};


// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;