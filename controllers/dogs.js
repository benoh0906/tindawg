const express = require("express");
const router  = express.Router();
const User    = require("../models/users");
const Dog     = require("../models/dogs");
const Request   = require("../models/requests");


// Dog index
router.get("/", async (req, res) => {
    try {
        const foundDogs = await Dog.find({});
        console.log(foundDogs, "<---- foundDogs");
        res.render("dogs/index.ejs",{
            dog: foundDogs,
            isLogged: req.session.logged,
            username: req.session.username,
            userId : req.session.userId
        }
        );
    } catch (err) {
        res.send(err);
    }
});


//Create dogs
router.get("/new", async (req, res) => {
    try {
        const allUsers = await User.find({});
        
        res.render("dogs/new.ejs", {
            users: allUsers,
            userId : req.session.userId,
            isLogged: req.session.logged,
            username: req.session.username
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

//Delete dogs
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


//Show dogs
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
            dog: dog,

            userId : req.session.userId,
            isLogged: req.session.logged,
            username: req.session.username,
            name: req.session.name,
            location:req.session.location,
            phone: req.session.phone,
            email: req.session.email,

        });
    } catch(err) {
        console.log(err);
    }
});



//edit
router.get('/:id/edit', (req, res)=>{
    Dog.findById(req.params.id, (err, foundDog)=>{
      if(err){
        res.send(err);
      } else {
        res.render('dogs/edit.ejs', {
          dog: foundDog,
          userId : req.session.userId,
          isLogged: req.session.logged,
          username: req.session.username
        });
      }
  
    });
  });


router.put('/:id', async (req, res)=>{

    try{
        const editDog = await Dog.findByIdAndUpdate(req.params.id, req.body)
        const findUserWithDog = await User.findOne({'dogs':req.params.id})
    
        res.redirect(`/users/${findUserWithDog._id}`)
        
    } catch(err){
        res.send(err)
    }
});
  
module.exports = router;