var mongoose=require('mongoose');

var ShopSchema=new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    owner:{
        type:String,
        required:true
    },
    flag:{
        type:String,
        default:0
    },
    isDeleted:{
        type:String,
        default:0
    },
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});
module.exports=mongoose.model('Shop',ShopSchema);