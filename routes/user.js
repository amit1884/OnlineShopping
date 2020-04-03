var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var multer=require('multer');
var passport=require('passport'),
LocalStrategy=require('passport-local');
var router=express();
var User=require('../models/user');
var Stuff=require('../models/shop');
// var Admin=require('../models/admin');
mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });



//passport authentication
router.use(require('express-session')({
    secret:"Rusty is best and cutest dog",
    resave:false,
    saveUninitialized:false
}));

router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.use((req,res,next)=>{
    res.locals.currentUser=req.user;
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

router.use((req,res,next)=>{
    res.locals.currentAdmin=req.Admin;
    next();
});

router.use(express.static("public"));
router.use(bodyparser.urlencoded({extended:true}));

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
    res.render('user/login');
});

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







//-----------------------------------------------------------------------------
//register (backend)
//-----------------------------------------------------------------------------

router.post("/user/register",(req,res)=>{
    var newAdmin=new Admin({username:req.body.username});
    Admin.register(newAdmin,req.body.password,(err,user)=>{
         if(err)
         {
             console.log(err);
             return res.redirect('/User/user/login');
         }
         passport.authenticate("local")(req,res,()=>{
             console.log(user);
             res.redirect("/User/user/login");
         })
    })
});


router.post("/user/login",
passport.authenticate("local",{
    successRedirect:"/User/user",
    failureRedirect:"/User/user/login"
}),
(req,res)=>{
});
router.get("/user/logout",(req,res)=>{
    req.logOut();
    res.redirect('/User/user/login');
});

 ///middleware to authenticate and  open secret page 
 function isLoggedIn(req,res,next)
 {
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/User/user/login");
 }

module.exports=router;