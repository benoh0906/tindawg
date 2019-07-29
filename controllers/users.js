const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");

router.get('/',(req,res)=>{
    if(req.session.logged === true){
        req.session.authorIndexView+=1;
    }

    User.find({},(err,foundUser)=>{
        try{
            res.render('users/index.ejs',{
                users: foundUser
            })
        } catch(err){
            res.send(err)
        }
    })
})

router.post("/login", async (req, res) => {
    try {
        const foundUser = await User.findOne({username: req.body.username});
        console.log("foundUser", "<--- Found User");
    
    if (foundUser) {
        
        if (bcrypt.compareSync(req.body.password, foundUser.password)) {
            req.session.userId = foundUser._id;
            req.session.username = foundUser.username;
            req.session.logged = true;
            res.redirect(`/users/${req.session.userId}`);
        
        } else {
            req.session.message = "Username or password incorrect";
            res.redirect("/");
        } 
        
    } else {
        req.session.message = "Username or password incorrect";
        res.redirect("/");
    }
    } catch(err) {
        res.send(err);
    }
});



router.post("/register", async (req, res) => {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    
    console.log(hashedPassword);

    req.body.password = hashedPassword;

    try {
        const createdUser = await User.create(req.body);
        console.log(createdUser, "<--- Created User");

        req.session.userId = createdUser._id;
        req.session.username = createdUser.username;
        req.session.logged = true;
        res.redirect("/users");
     } catch (err) {
         res.send(err);
     }
});



router.get("/logout", async (req, res) => {
    try{
        const loggingOut = await req.session.destroy()
        res.redirect("/")
    } catch(err){
        res.send(err);
    }


    // req.session.destroy((err) => {
    //     if (err) {
    //         res.send(err);
    //     } else {
    //         res.redirect("/");
    //     }
    // })
});


// show route
router.get('/:id', async (req, res) => {

    try{
        const findUser = await User.findById(req.params.id).populate('dogs').exec();
        res.render("users/show.ejs",{
            user: findUser
        });
    } catch (err){
        res.send(err)
    }




    // User.findById(req.params.id)
    // .populate('dogs')
    // .exec((err, foundUser) => {
    //   console.log(foundUser, ' foundUser in users show page')
  
    //   res.render('users/show.ejs', {
    //     user: foundUser
    //   })
    // })
  });

module.exports = router;