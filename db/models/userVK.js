// Dependencies
const mongoose = require('mongoose')

// Schema
const Schema = mongoose.Schema;
const userVKShema = new Schema({
    uId: {
        type: Number,
        unique: true,
        required: true
    }
},
    { timestamps: true }
)


// Exports
module.exports = mongoose.model('userVK', userVKShema)