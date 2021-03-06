var mongoose = require('mongoose');

//shema
var postSchema = mongoose.Schema({
    title:{type:String, required:[true, '제목을 입력해주세요!']},
    body:{type:String, required:[true, '게시글을 입력해주세요!']},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', requeired:true}, //user colloection의 id와 연결된다.(user.id == post.author)
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
});

//models & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;