const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");
const Request   = require("../models/requests");

//List of all users
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

//registration 
router.get("/register",(req,res)=>{
    res.render("users/register.ejs", {
        message : req.session.message,
        isLogged: req.session.isLogged
    })
});


router.post("/register", 

async (req, res) => {
    const password = req.body.password;
    const passConfirm = req.body.confirmPassword;
    if (password !== passConfirm){
        req.session.message = "Password don't match"
        res.redirect("/users/register")
    } else {
        const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        
        console.log(hashedPassword);
    
        req.body.password = hashedPassword;
    
        try {
            const createdUser = await User.create(req.body);
            console.log(createdUser, "<--- Created User");
    

            req.session.message = "Account Created. Please Log In"
            res.redirect("/");
         } catch (err) {
             console.log(err)
            req.session.message = "Wrong Input"
            res.redirect("/users/register");
         }
    }
});

//Log in
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
            
            req.session.message = "Password Incorrect";
            res.redirect("/");
        } 
        
    } else {
        req.session.message = "Username Does Not Exist";
        res.redirect("/");
    }
    } catch(err) {
        res.send(err);
    }
});



//Change Password
router.get("/:id/edit/password", async (req, res) => {
    
    try {
        const findUser = await User.findById(req.params.id);
        res.render("users/password.ejs", {
            user: findUser,
            isLogged: req.session.logged,
            username: req.session.username,
            userId : req.session.userId,
            password: req.session.password,
            message: req.session.message
        })
    } catch(err){
        res.send(err);
    }
});


router.put("/:id/edit/password", async (req, res) => {
    const oldPassword = req.body.password;
    const newPassword= req.body.newPassword;
    const newPasswordConfirm = req.body.newPasswordConfirm;
    const foundUser = await User.findOne({username: req.body.username});
    if (foundUser) {
        
        if (bcrypt.compareSync(oldPassword, foundUser.password)) {

            if (newPassword !== newPasswordConfirm){
                req.session.message = "New Passwords don't match"
                res.redirect(`/users/${req.params.id}/edit/password`)
            } else {
                const hashedPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                            
                req.body.password = hashedPassword;
            
                try {
                    const editUser = await User.findByIdAndUpdate(req.params.id, req.body);
                    req.session.message = "Password Update Success"
                    res.redirect(`/users/${req.params.id}/edit/password`);
                } catch(err){
                    send(err);
                }
            }

        
        } else {
            
            req.session.message = "Old Password incorrect";
            res.redirect(`/users/${req.params.id}/edit/password`);
        } 
        
    } else {
        req.session.message = "Username Does Not Exist";
        res.redirect(`/users/${req.params.id}/edit/password`);
    }

    
}); 

//Edit info

router.get("/:id/edit", async (req, res) => {
    try {
        const findUser = await User.findById(req.params.id);
        res.render("users/edit.ejs", {
            user: findUser,
            isLogged: req.session.logged,
            username: req.session.username,
            userId : req.session.userId,
        })
    } catch(err){
        res.send(err);
    }
});



router.put("/:id", async (req, res) => {
    try {
        const editUser = await User.findByIdAndUpdate(req.params.id, req.body);
        req.session.username=req.body.username
        req.session.name=req.body.name;
        req.session.email=req.body.email;
        req.session.phone=req.body.phone;
        req.session.location=req.body.location;
        req.session.password=req.body.password;
        res.redirect("/users/" + req.params.id);
    } catch(err){
        send(err);
    }
}); 


//log out

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
        res.redirect(`/users/${req.session.userId}/request`);
    } catch(err){
        console.log(err)
      res.send(err)
    }
});



//delete user

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

//show requests

router.get('/:id/request', async (req, res) => {
    try{
        const findUser = await User.findById(req.params.id).populate('dogs').exec();
        const findReq = await User.findById(req.params.id).populate('requests').exec();
        
        res.render("users/request.ejs",{
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


module.exports = router;