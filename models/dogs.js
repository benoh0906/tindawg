const mongoose = require("mongoose");

const dogSchema = mongoose.Schema({
    name: String,
    gender: String,
    age: Number,
    breed: String,
    description: String,
    img: [String],
});

const Dog = mongoose.model("Dog", dogSchema);

module.exports = Dog;