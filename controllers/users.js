const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");
const Request   = require("../models/requests");

router.get('/',(req,res)=>{
    if(req.session.logged === true){
        req.session.authorIndexView+=1;
    }
    User.find({},(err,foundUser)=>{
        try{
            res.render('users/index.ejs',{
                user: foundUser,
                isLogged: req.session.logged,
                username: req.session.username,
                userId : req.session.userId
            })
        } catch(err){
            res.send(err)
        }
    })
})

router.get("/register",(req,res)=>{
    res.render("users/register.ejs", {
        message : req.session.message,
        isLogged: req.session.isLogged
    })
});


router.post("/login", async (req, res) => {
    try {
        const foundUser = await User.findOne({username: req.body.username});
        console.log("foundUser", "<--- Found User");
    
    if (foundUser) {
        
        if (bcrypt.compareSync(req.body.password, foundUser.password)) {
            req.session.userId = foundUser._id;
            req.session.username = foundUser.username;
            req.session.name=foundUser.name;
            req.session.email=foundUser.email;
            req.session.phone=foundUser.phone;
            req.session.location=foundUser.location;
            req.session.password=foundUser.password;
            req.session.logged = true;
            res.redirect(`/users/${req.session.userId}`);
            req.session.message = ""
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



router.post("/register", 

async (req, res) => {
    const password = req.body.password;
    const passConfirm = req.body.confirmPassword;
    if (password !== passConfirm){
        req.session.message = "Passwords don't match"
        res.redirect("/users/register")
    } else {
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        
        console.log(hashedPassword);
    
        req.body.password = hashedPassword;
    
        try {
            const createdUser = await User.create(req.body);
            console.log(createdUser, "<--- Created User");
    
            req.session.userId = createdUser._id;
            req.session.username = createdUser.username;
            req.session.logged = true;
            req.session.message = "Account Created"
            res.redirect("/dogs");
         } catch (err) {
            req.session.message = "Wrong Input"
            res.redirect("/users/register");
         }
    }


});

router.get("/:id/edit", async (req, res) => {
    try {
        const findUser = await User.findById(req.params.id);
        res.render("users/edit.ejs", {
            user: findUser,
            isLogged: req.session.logged,
            username: req.session.username,
            userId : req.session.userId,
            password: req.session.password
        })
    } catch(err){
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
});


//delete Request

router.delete('/requests/:id', async (req, res) => {
    try {
      const findRemoveReq = await Request.findOneAndDelete({_id: req.params.id});
      const findUserWithReq = await User.findOne({'requests':req.params.id})

      findUserWithReq.requests.remove(req.params.id)
      findRemoveReq.save()
        res.redirect(`/users/${req.session.userId}`);
    } catch(err){
        console.log(err)
      res.send(err)
    }
});



//delete route

router.delete('/:id', async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({_id: req.params.id});
      const deletedDogs = await Dog.remove({
          _id: {
            $in: deletedUser.dogs
          }
        });
        res.redirect('/');
    } catch(err){
      res.send(err)
    }
});




// Edit Page


router.put("/:id", async (req, res) => {
    try {
        const editUser = await User.findByIdAndUpdate(req.params.id, req.body);
        req.session.username=req.body.username
        res.redirect("/users/" + req.params.id);
    } catch(err){
        send(err);
    }
}); 

// show route
router.get('/:id', async (req, res) => {
    try{
        const findUser = await User.findById(req.params.id).populate('dogs').exec();
        const findReq = await User.findById(req.params.id).populate('requests').exec();
        console.log(findReq,'<---FINDREQ HERE')
        
        res.render("users/show.ejs",{
            user: findUser,
            request:findReq,

            isLogged: req.session.logged,
            username: req.session.username,
            userId : req.session.userId,
        });
    } catch (err){
        res.send(err)
    }
});


//make requests

router.post("/:id/request", async (req, res) => {
    try {
        const requestFrom = await Request.create(req.body)
        const requestTo = await User.findById(req.params.id);
        requestTo.requests.push(requestFrom)
        requestTo.save((err, dog) => {
            console.log(err, dog)
        });
        console.log(requestFrom, "<--- REQUESTING DOG")
        res.redirect(`/dogs/${req.body.dogId}`);
    } catch (err) {
        console.log(err)
    } 
  });



module.exports = router;