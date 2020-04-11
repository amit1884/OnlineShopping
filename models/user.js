var mongoose=require('mongoose');
// var Cart=require('./cart')
var passportLocalMongoose=require('passport-local-mongoose');
var UserSchema=new mongoose.Schema({
    username:{ 
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    first:{
        type:String,
        required:true
    },
    last:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    mobile:{
        type:String,
        unique:true,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    cart:[
        {
            cartitem:String
            
        }
    ],
    orders:[{
        name:String,
        category:String,
        price:String,
        description:String,
        image:String,
        owner:String
    }],
    notification:[{
        message:String
    }]
});
UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',UserSchema);

// type:mongoose.Schema.Types.ObjectId,
            // ref:"Cart"