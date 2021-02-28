var mongoose = require('mongoose');

//shema
var postSchema = mongoose.Schema({
    title:{type:String, required:true},
    body:{type:String, required:true},
    createdAt:{type:Date, default:Date.now},
    updatedAt:{type:Date},
});

//models & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;