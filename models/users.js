const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    phone: String,
    location: String,
    dogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;