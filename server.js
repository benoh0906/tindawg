const express= require("express")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")
const session        = require("express-session");
const app = express()

require("./db/db.js")


const dogsController=require("./controllers/dogs")
const usersController=require("./controllers/users")


app.use(session({
    secret: "THIS IS A RANDOM SECRET STRING",
    resave: false, 
    saveUninitialized: false 
  }));


app.use(bodyParser.urlencoded({extended:false}))
app.use(methodOverride('_method'));

app.use("/dogs/", dogsController)
app.use("/auth",usersController)
app.use(express.static("public"))

app.get("/",(req,res)=>{
    res.render('index.ejs')
})

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})