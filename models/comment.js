var mongoose=require('mongoose');
// var campground=require('./models/campground');
var CommentSchema = mongoose.Schema(
    {
        review:String,
        author:String,
        date: String
    }
);
module.exports=mongoose.model('Comment',CommentSchema);