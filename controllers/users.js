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
            res.redirect(`/users`);
        } 
        
    } else {
        req.session.message = "Username or password incorrect";
        res.redirect("/users");
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



router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect("/");
        }
    })
});


// show route
router.get('/:id', (req, res) => {
    console.log(req.params, " params in the show route")
    User.findById(req.params.id)
    .populate('dogs')
    .exec((err, foundUser) => {
      console.log(foundUser, ' foundAuthor in authors show page')
  
      res.render('authors/show.ejs', {
        user: foundUser
      })
    })
  });

module.exports = router;