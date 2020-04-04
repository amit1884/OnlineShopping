var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var multer=require('multer');
var bcrypt=require('bcrypt')
var router=express();
var User=require('../models/user');
var Stuff=require('../models/shop');
mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });


router.set('trust proxy', 1) // trust first proxy

router.use(require('express-session')({
    secret:"secrethashing",
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false}
}));
const saltRounds = 10;
var sess;

router.use((req,res,next)=>{
    sess=req.session;
    res.locals.currentUser=sess.username;
    res.locals.currentprofile=sess.image;
    next();
});



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  var upload = multer({ storage: storage }) 


router.get('/user',isLoggedIn,(req,res)=>{
    Stuff.find({},(err,stuff)=>{

        if(err)
        console.log(err)
        else{
            res.render('user/index',{stuff:stuff});
        }
    })
})
router.get('/user/login',(req,res)=>{
    res.render('user/login')
})

router.get('/user/stuffenter',isLoggedIn,(req,res)=>{
    res.render('user/stuffenter');
})

router.post("/user/shoppingstuff", upload.single('image'),(req,res,next)=>{

    var newproduct=new Stuff(req.body);
    newproduct.image=req.file.filename;
    newproduct.save((err,newproduct)=>{
        if(err)
        {
            console.log(err)
            res.redirect('/User/user/stuffenter')
        }
        else
        {
            res.redirect('/User/user/stuffenter')
        }
    })
    console.log(newproduct);
   });
   router.get('/user/profile',(req,res)=>{
       res.render('user/profile');
   })

router.post('/user/register',upload.single('avatar'),(req,res,next)=>{
    var user=req.body.username;
    var pwd=req.body.password;
    var newuser=new User(req.body);
    newuser.image=req.file.filename;
    bcrypt.hash(pwd, saltRounds, function(err, hash) {
       newuser.password=hash;
       console.log(newuser);
       newuser.save((err,user)=>{
           if(err)
           console.log(err)
           else{
               console.log(user);
               res.redirect('/User/user/login');
           }
       })
        
    });
});

router.post('/user/login',(req,res)=>{
    User.find({username:req.body.username},(err,founduser)=>{
        if(err)
        console.log(err)
        else{
           if(founduser.length>0)
           {
               console.log(req.body.password);
               console.log(founduser[0].password);
                bcrypt.compare(req.body.password,founduser[0].password).then(function(result){
                    if(result)
                    {
                        sess=req.session;
                        sess.username=req.body.username;
                        sess.image=founduser[0].image;
                        console.log('logged user :')
                        console.log(sess.username);
                      res.redirect('/User/user')
                    }
                    else{
                        console.log('wrong password');
                    }
                })
           }
           else{
               console.log('no user found');
           }
        }
    })

})







router.get('/user/logout',(req,res)=>{
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            res.redirect('/User/user/login');
        });
});

function isLoggedIn(req,res,next){

    sess=req.session;
    if(sess.username)
    return next();
    res.redirect('/User/user/login');
}

module.exports=router;