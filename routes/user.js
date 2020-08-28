var express=require('express');
var path=require('path');
var bodyparser=require('body-parser');
var mongoose=require('mongoose');
var cookie=require('cookie-parser');
var flash=require('connect-flash');
var multer=require('multer');
var bcrypt=require('bcrypt');
var FuzzySearch=require('fuzzy-search');
var router=express();
var Comment=require('../models/comment')
var User=require('../models/user');
var Stuff=require('../models/shop');
// mongoose.connect('mongodb://localhost/online_shopping',{useNewUrlParser: true,useUnifiedTopology: true });
// mongoose.connect('mongodb+srv://amit:raj@cluster0-hny5q.mongodb.net/test',{useNewUrlParser: true,useUnifiedTopology: true });

router.use(cookie());
router.set('trust proxy', 1) // trust first proxy

router.use(require('express-session')({
    secret:"secrethashing",
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false}
}));
router.use(flash());
const saltRounds = 10;
var sess,flashmsg;
var itemarr=[];

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
    flashmsg=req.flash();
    res.render('user/login',{message:flashmsg});
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

   
   router.get('/user/profile/:id',isLoggedIn,(req,res)=>{
       var user=req.params.id;
       console.log(user);
       User.find({username:user},(err,userfound)=>{
           if(err)
           res.redirect('/User/user')
           else{
                console.log(userfound);
                res.render('user/profile',{user:userfound});
           }
       })
   })

   router.get('/user/product_details/:id',isLoggedIn,(req,res)=>{

    Stuff.findById(req.params.id).populate("comments").exec ((err,foundproduct)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log(foundproduct);
            res.render("user/product_details",{product:foundproduct});
        }
       });
   })




   router.post('/user/add_address/:id',isLoggedIn,(req,res)=>{

   var id =req.params.id;
   var add=req.body.address;
   User.findById(id,(err,fuser)=>{
    fuser.address=add;
    if(err)
    console.log(err)
    else{
        fuser.save((err,suser)=>{
            if(err)
            console.log(err)
            else{
                console.log(suser);
                res.redirect('/User/user/profile/'+fuser.username);
            }
        })
    }
   })
   })




router.post('/user/addtocart/:id',isLoggedIn,(req,res)=>{
    var userid =req.params.id;
    var prid=req.body.add;
    console.log(prid);
    
    User.findOne({username:userid},(err,userfound)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/User/user')
        }
        else{
           userfound.updateOne({$push:{cart:[{cartitem:prid}]}},(err,cartadd)=>{
               if(err)
               {
                console.log(err);
                res.redirect('/User/user')
               }
               else{
                   console.log(cartadd);
                   res.redirect('/User/user')
               }
           })
        }
    });
})




router.get('/user/cartdetails/:id',isLoggedIn,(req,res)=>{
    var id =req.params.id;
    User.findById(id,(err,userfound)=>{
       if(err)
       console.log(err)
       else{
            for(var i=0;i<userfound.cart.length;i++)
            {
                console.log("id  :"+i+" "+userfound.cart[i].cartitem);
                Stuff.findById(userfound.cart[i].cartitem,(err,itemfound)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                    else{
                        itemarr.push(itemfound);
                    }
                    
                })
            }
            console.log(itemarr);
            res.render('user/mycart',{items:itemarr});
        //    res.send(itemarr);
            itemarr=[];
       }    
    })
})





router.post('/user/review/:id',isLoggedIn,(req,res)=>{

    // console.log(req.body);
    var prid=req.params.id;
    newcomment=new Comment(req.body);
    newcomment.date=new Date();
    Stuff.findById(req.params.id,(err,foundproduct)=>{
        if(err)
        {
            console.log(err);
            res.redirect("/User/user");
        }
        else{
            console.log(req.body.comment);
            Comment.create(newcomment,(err,comment)=>{
                if(err)
                console.log(err);
                else
                {
                    foundproduct.comments.push(comment);
                    foundproduct.save();
                    res.redirect("/User/user/product_details/"+prid);
                }
            });
        }
    });
})





router.post('/user/search',isLoggedIn,(req,res)=>{

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
              res.render('user/productfound',{founddata:result})
            // res.send(result);
        
        }
    })
   })




router.get('/user/notification',(req,res)=>{
    res.render('user/notification');
})

router.post('/user/delcartproduct/:id',(req,res)=>{

    console.log(req.body.remove);
    var username=req.body.remove;
    console.log(req.params.id);
   User.findOne({username:username},(err,userfound)=>{
       if(err)
       console.log(err)
       else
       {
           console.log('Before deletion  ')
           console.log(userfound.cart);
            itemarr=[];
            for(var i=0;i<userfound.cart.length;i++)
            {
                if(userfound.cart[i].cartitem!=req.params.id)
                itemarr.push(userfound.cart[i]);
            }
            console.log('New Array');
            console.log(itemarr);

            userfound.cart=itemarr;
            userfound.save((err,upuser)=>{
                if(err)
                {
                console.log(err)
                res.redirect('/User/user/profile/'+username);
                }
                else{
                    console.log(upuser);
                    res.redirect('/User/user/profile/'+username);
                }
            });
       }
   })
})





router.get('/user/deleteall/:id',(req,res)=>{
    var user=req.params.id;
    console.log(user);
    User.findOne({username:user},(err,userfound)=>{
        if(err)
        {
            console.log(err)
            res.redirect('/User/user/profile/'+user);
        }
        else{
            console.log(userfound);
            userfound.updateOne( { $set: { cart: [] }}, function(err, affecteduser){
                console.log('affected: ', affecteduser);
            });
        }
    })
})


router.get('/user/uploadedproduct/:id',isLoggedIn,(req,res)=>{

    var user=req.params.id;
    console.log(user);
    User.findOne({username:user},(err,userfound)=>{

        if(err)
        {
            console.log(err);
            res.redirect('/User/user/profile/'+user);
        }
        else{
            var email=userfound.email;
            console.log(email);
            Stuff.find({owner:email},(err,productsfound)=>{

                if(err)
                {
                    console.log(err)
                    res.redirect('/User/user/profile/'+user);
                }
                else{
                    res.render('user/uploadedproducts',{products:productsfound});
                }
            })
        }
    })
})


router.post('/user/deleteproduct/:id',isLoggedIn,(req,res)=>{
    var id=req.params.id;
    console.log(id);
    // Stuff.findByIdAndDelete(id,(err,products)=>{
    //     if(err)
    //     {
    //         console.log(err)
    //         res.redirect('/User/user');
    //     }
    //     else{
    //         console.log(products);
    //         res.redirect('/User/user')
    //     }
    // })

    Stuff.findByIdAndUpdate(id,{isDeleted:"1"},(err,products)=>{
        if(err)
        {
            console.log(err)
            res.redirect('/User/user');
        }
        else{
            console.log(products);
            res.redirect('/User/user')
        }
    })
})







router.post('/user/buyproduct/:id',isLoggedIn,(req,res)=>{

    console.log(req.params.id);
    console.log(req.body.product);
    Stuff.findById(req.body.product,(err,product)=>{

        if(err)
        {
            console.log(err)
        }
        else{
            product.flag=1;
            product.save();
            User.findOne({username:req.params.id},(err,userfound)=>{
                if(err)
                {
                    console.log(err)
                }
                else{
                    userfound.updateOne({$push:{orders:[{name:product.name,category:product.category,price:product.price,decription:product.description,image:product.image,owner:product.owner}]}},(err,users)=>{

                        if(err)
                        {
                            console.log(err)
                        }else{
                            console.log(users);
                            User.findOne({username:req.params.id},(err,fuser)=>{
                                if(err)
                                {
                                    console.log(err)
                                }
                                else{
                                    User.findOne({email:product.owner},(err,owner)=>{
                                        if(err)
                                        {
                                            console.log(err)
                                        }
                                        else{
                                            console.log()
                                            owner.updateOne({$push:{notification:[{message:fuser.first+' '+fuser.last+' has bought your product '+ product.name}]}},(err,updated)=>{
                                                if(err)
                                                {
                                                    console.log(err)
                                                }
                                                else{
                                                    console.log(updated);
                                                    res.render('user/buydetails',{buyer:fuser,product:product,seller:owner})
                                                }
                                            });
                                        
                                        }
                                    })
                                }
                            })
                        }
                    })
                        
                }
            })
            
        }
    })
})



router.get('/user/notification/:id',isLoggedIn,(req,res)=>{

    var id=req.params.id;
    console.log(id);
    User.findOne({username:id},(err,userfound)=>{
        if(err)
        {
            console.log(err)
        }
        else{
            console.log(userfound);
            res.render('user/notification',{user:userfound});
        }
    })
})



router.get('/user/myorders/:id',isLoggedIn,
(req,res)=>{

    var id=req.params.id;
    console.log(id);
    User.findOne({username:id},(err,userfound)=>{
        if(err)
        {
            console.log(err)
            res.redirect('/User/user/profile/'+id);
        }
        else{
            console.log(userfound);
            res.render('user/myorders',{user:userfound});
        }
    })
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
           {
            // console.log(err);
            flashmsg=req.flash('error','Some error occurred')
            res.redirect('/User/user/login')
           }
           else{
               console.log(user);
               console.log('register ho gaya');
               flashmsg=req.flash('success','Registered Successfull')
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
                        flashmsg=req.flash('success','Login Successfull')
                      res.redirect('/User/user')
                    }
                    else{
                       
                        console.log('wrong password');
                        flashmsg=req.flash('error','Password wrong')
                        res.redirect('/User/user/login')
                    }
                })
           }
           else{
               console.log('no user found');
               flashmsg=req.flash('error','No user found')
               res.redirect('/User/user/login')
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
    flashmsg=req.flash('error','Login Required')
    res.redirect('/User/user/login');
}

module.exports=router;