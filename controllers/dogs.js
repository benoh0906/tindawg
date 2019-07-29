const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");


// Dog index
router.get("/", async (req, res) => {
    try {
        const foundDogs = await Dog.find({});
        console.log(foundDogs, "<---- foundDogs");
        res.render("dogs/index.ejs",{
            dog: foundDogs
        }
        );
    } catch (err) {
        res.send(err);
    }
});


//create dogs

router.get("/new", async (req, res) => {
    try {
        const allUsers = await User.find({});
        res.render("dogs/new.ejs", {
            users: allUsers
        });
    } catch (err) {
        res.send(err);
    }
});


router.post("/", async (req, res) => {
    try {
        const createdDog = await Dog.create(req.body);
        const foundUser = await User.findById(req.session.userId);
        foundUser.dogs.push(createdDog)
        foundUser.save();
        console.log(foundUser, "<--- foundUser")
        res.redirect(`/users/${req.session.userId}`);
    } catch (err) {
        res.send(err);
    } 
  });

//delete dogs


router.delete('/:id', async (req, res)=>{
    try{
    const findRemoveDog = await Dog.findByIdAndRemove(req.params.id)
    const findUserWithDog = await User.findOne({'dogs':req.params.id})
    
    findUserWithDog.dogs.remove(req.params.id)
    findUserWithDog.save()
    
    res.redirect(`/users/${findUserWithDog._id}`)
    
    } catch (err){
        res.send(err)
    }

  });


//show dogs

router.get("/:id", async (req, res) => {
    try {
        const findUser = await User.findOne({'dogs': req.params.id}).populate('dogs');
        console.log(findUser, "<-- findUser!!!")
        let dog = {};
        for (let i = 0; i < findUser.dogs.length; i++){
                    if(findUser.dogs[i]._id.toString() === req.params.id){
                        dog = findUser.dogs[i]
                    }
                } 
        res.render("dogs/show.ejs", {
            user: findUser,
            dog: dog
        });
    } catch(err) {
        console.log(err);
    }
});



module.exports = router;