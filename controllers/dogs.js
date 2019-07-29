const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const User    = require("../models/users");
const Dog     = require("../models/dogs");

module.exports = router;

//dog index
router.get('/', (req, res)=>{
    console.log(req.session, ' req.session in index or dogs')
    Dog.find({}, (err, foundDogs)=>{
      if(err){
        res.send(err);
      } else {
        res.render('dogs/index.ejs', {
          dogs: foundDogs
        });
      }
  
    })
  });

//create dogs

router.get('/new', (req, res)=>{
    User.find({}, (err, allUsers) => {
      if(err){
        res.send(err);
      } else {
        res.render('dogs/new.ejs', {
          users: allUsers
        });
      }
    })
});

router.post('/', (req, res)=>{
    Dog.create(req.body, (err, createdDog)=>{
      if(err){
        res.send(err);
      } else {
        console.log(req.body)
        User.findById(req.body.userId, (err, foundUser) => {
          console.log(foundUser, ' <-- foundUser in dog create route')
          foundUser.dogs.push(createdDog);
          foundUser.save((err, savedUser) => {
            res.redirect('/dogs');
          });
        });
      }
  
    });
  });

//show dogs

router.get('/:id', (req, res)=>{
    console.log(req.params.id)
    User.findOne({'dogs': req.params.id})
      .populate('dogs')
      .exec((err, foundUser) => {
  
        let dog = {};
  
        for (let i = 0; i < foundUser.dogs.length; i++){
          // compare mongoID's we have to use the toString method
          // the ids have to be converted to strings
          // thats just how mongo works
          if(foundUser.dogs[i]._id.toString() === req.params.id.toString()){
            dog = foundUser.dogs[i]
            console.log(dog, " < the dog")
          }
        }
  
        console.log('===============================');
        console.log(foundUser, ' in  show')
        console.log('===============================');
        res.render('dogs/show.ejs', {
          user: foundUser,
          dog: dog
        })
        })
});
  
  
  
