var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var adminRouter=require('./routes/admin.js');
var userRouter=require('./routes/user.js');
var Stuff=require('./models/shop');
var mongoose=require('mongoose')
var app=express();
mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });


app.set("view engine","ejs");
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));
app.use('/Admin',adminRouter);
app.use('/User',userRouter);


app.get('/',(req,res)=>{

    Stuff.find({},(err,stuff)=>{

        if(err)
        console.log(err)
        else{
            res.render('index',{stuff:stuff});
            // res.send(stuff);
        }
    })
   
})




app.listen(3000,(err)=>{
    if(err)
    console.log(err)
    else{
        console.log('server running');
    }
})