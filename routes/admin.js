var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var multer=require('multer');
var FuzzySearch=require('fuzzy-search');
var passport=require('passport'),
LocalStrategy=require('passport-local');
var router=express();
// var User=require('../models/user');
var Stuff=require('../models/shop');
var Admin=require('../models/admin');
// mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });



//passport authentication
router.use(require('express-session')({
    secret:"secrethashing",
    resave:false,
    saveUninitialized:false
}));

router.use(passport.initialize());
router.use(passport.session());
passport.use('local-1',new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

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

router.get('/admin',isLoggedIn,(req,res)=>{

    Stuff.find({},(err,stuff)=>{

        if(err)
        console.log(err)
        else{
            res.render('admin/index',{stuff:stuff});
        }
    })
   
})

router.get('/admin/login',(req,res)=>{
    res.render('admin/login');
});

router.get('/admin/stuffenter',isLoggedIn,(req,res)=>{
    res.render('admin/stuffenter');
})

router.post("/admin/shoppingstuff", upload.single('image'),(req,res,next)=>{

    var newproduct=new Stuff(req.body);
    newproduct.image=req.file.filename;
    newproduct.save((err,newproduct)=>{
        if(err)
        {
            console.log(err)
            res.redirect('/Admin/admin/stuffenter')
        }
        else
        {
            res.redirect('/Admin/admin/stuffenter')
        }
    })
    console.log(newproduct);
   });


   router.post('/admin/search',(req,res)=>{

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
              res.render('admin/productfound',{founddata:result})
            // res.send(result);
        
        }
    })
   })





//-----------------------------------------------------------------------------
//register (backend)
//-----------------------------------------------------------------------------

router.post("/admin/register",(req,res)=>{
    var newAdmin=new Admin({username:req.body.username});
    Admin.register(newAdmin,req.body.password,(err,user)=>{
         if(err)
         {
             console.log(err);
             return res.redirect('/Admin/admin/login');
         }
         passport.authenticate("local-1")(req,res,()=>{
             console.log(user);
             res.redirect("/Admin/admin");
         })
    })
});


router.post("/admin/login",
passport.authenticate("local-1",{
    successRedirect:"/Admin/admin",
    failureRedirect:"/Admin/admin/login"
}),
(req,res)=>{
});
router.get("/admin/logout",(req,res)=>{
    req.logOut();
    res.redirect('/Admin/admin/login');
});

 ///middleware to authenticate and  open secret page 
 function isLoggedIn(req,res,next)
 {
     if(req.isAuthenticated()){
         return next();
     }
     res.redirect("/Admin/admin/login");
 }

module.exports=router;