const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    name: String,
    dogId: String,
    requestorName: String,
    requestorEmail: String,
    requestorPhone: String,
    requestorLocation: String,
    requestorUsername: String,
    requestorMessage:String
});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;