const express= require("express")
const app = express()
const methodOverride = require("method-override")
const bodyParser = require("body-parser")

require('./db/db.js')


const dogsController=require("./controllers/dogs")
const ownersController=require("./controllers/owners")

const usersController=require("./controllers/users")


app.use(bodyParser.urlencoded({extended:false}))
app.use(methodOverride('_method'));

app.use(`/dogs/`, dogsController)
app.use('/owners/', ownersController)
app.use(express.static('public'))

app.get('/',(req,res)=>{
    res.render('index.ejs')
})

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})