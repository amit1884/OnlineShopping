var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var mongoose=require('mongoose')
var app=express();

app.set("view engine","ejs");
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));



app.get('/',(req,res)=>{

    res.render('index');
})





app.listen(3000,(err)=>{
    if(err)
    console.log(err)
    else{
        console.log('server running');
    }
})