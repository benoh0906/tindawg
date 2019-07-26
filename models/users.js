const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true, index: {unique: true}},
    phone: String,
    location: String,
    dogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;