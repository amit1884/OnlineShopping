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
});
module.exports=mongoose.model('Shop',ShopSchema);