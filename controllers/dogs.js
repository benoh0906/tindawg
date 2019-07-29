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
        User.findById(req.session.userId, (err, foundUser) => {
          console.log(foundUser, ' <-- foundUser in dog create route')
          foundUser.dogs.push(createdDog);
          foundUser.save((err, savedUser) => {
            res.redirect(`/users/${req.session.userId}`);
          });
        });
      }
    });
  });

//delete dogs


router.delete('/:id', async (req, res)=>{
    // when we delete an article, we want to remove that
    // article from the authors array
    try{
    const findRemoveDog = await Dog.findByIdAndRemove(req.params.id)
    const findUserWithDog = await User.findOne({'dogs':req.params.id})
    
    findUserWithDog.dogs.remove(req.params.id)
    findUserWithDog.save()
    
    res.redirect(`/users/${req.params.id}`)
    
    } catch (err){
        res.send(err)
    }


    // Article.findByIdAndRemove(req.params.id, (err, response)=>{
    //   Author.findOne({'articles': req.params.id}, (err, foundAuthor) => {
    //         if(err){
    //           res.send(err);
    //         } else {
    //           console.log(foundAuthor, ' foundauthor in delete');
    //           foundAuthor.articles.remove(req.params.id);
    //           // since we're dealing with a document
    //           // we have to save it
    //           foundAuthor.save((err, updatedAuthor) => {
    //             console.log(updatedAuthor, '<-- updatedAuthor')
    //             res.redirect('/articles');
    //           });
    //         }
    //   })
  
  
    // });
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
  
  
  
