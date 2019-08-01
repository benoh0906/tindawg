const express        = require("express");
const methodOverride = require("method-override");
const bodyParser     = require("body-parser");
const {check, validationResult} = require('express-validator/check')
const session        = require("express-session");
const app            = express()

require('dotenv').config()
const PORT = process.env.PORT

require("./db/db.js")


const dogsController  = require("./controllers/dogs");
const usersController = require("./controllers/users");


app.use(session({
    secret: "THIS IS A RANDOM SECRET STRING",
    resave: false, 
    saveUninitialized: false 
  }));


app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride("_method"));

app.use((req,res,next)=>{
    if(!req.session.initialised){
        req.session.initialised = true
        req.session.isLogged = false
        req.session.username = ''
        req.session.userId = ''
    }
    next()
})
app.use("/dogs", dogsController);
app.use("/users",usersController);
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index.ejs", {
        message : req.session.message,
        isLogged: req.session.isLogged
    })
});



app.listen(PORT, ()=>{
    console.log("Listening on port 3000");
})

