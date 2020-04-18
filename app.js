var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var adminRouter=require('./routes/admin.js');
var userRouter=require('./routes/user.js');
var FuzzySearch=require('fuzzy-search');
var Stuff=require('./models/shop');
var mongoose=require('mongoose')
var app=express();
// mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });
mongoose.connect('mongodb+srv://amit:raj@cluster0-hny5q.mongodb.net/test',{useNewUrlParser: true,useUnifiedTopology: true }).then(()=>{
    console.log('databse connected')
}).catch(()=>{
    console.log(' database not connected')
});


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
app.post('/search',(req,res)=>{

    var text=req.body.search;
    console.log(text);
    Stuff.find({},(err,foundproducts)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/');
        }
        else{
            const searcher = new FuzzySearch(foundproducts, ['name','category'], {
                caseSensitive: false,
              });
              const result = searcher.search(text);
              console.log(result);
              res.render('productfound',{founddata:result})
            // res.send(result);
        
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
// app.listen(process.env.PORT,process.env.IP,()=>{
//     console.log('server running');
// })