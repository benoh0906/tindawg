const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    name: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    phone: String,
    location: String,
    dogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dog'
    }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;