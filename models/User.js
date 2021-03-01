var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// schema // 1
var userSchema = mongoose.Schema({
  username:{type:String, required:[true,'Username is required!'], unique:true},
  password:{type:String, required:[true,'Password is required!'], select:false},
  name:{type:String, required:[true,'Name is required!']},
  email:{type:String}
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

// password validation // 3
userSchema.path('password').validate(function(v) {
  var user = this; // 3-1

  // create user // 3-3
  if(user.isNew){ // 3-2
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }

  // update user // 3-4
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', 'Current Password is required!');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){ 
      // user.currenPassword는 사용자에게 입력받은 text, user.originalPassword가 기존에 있던 pw
      // text를 hash롤 바꿔 그 값이 일치 하는지 서로 확인
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

    if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
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