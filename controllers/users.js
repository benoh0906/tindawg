const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");



router.post("/login", async (req, res) => {
    try {
        const foundUser = await User.findOne({username: req.body.username});
        console.log("foundUser", "<--- Found User");
    
    if (foundUser) {
        
        if (bcrypt.compareSync(req.body.password, foundUser.password)) {
            req.session.userId = foundUser._id;
            req.session.username = foundUser.username;
            req.session.logged = true;
            res.redirect("/users");
        
        } else {
            req.session.message = "Username or password incorrect";
            res.redirect("/users");
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

module.exports = router;