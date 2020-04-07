var mongoose=require('mongoose');
// var campground=require('./models/campground');
var CartSchema = mongoose.Schema(
    {
      text:String
    }
);
module.exports=mongoose.model('Cart',CartSchema);