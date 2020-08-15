// Dependencies
const mongoose = require('mongoose')

// Schema
const Schema = mongoose.Schema;
const userTelegramShema = new Schema({
    uId: {
        type: Number,
        unique: true,
        required: true
    },
    language_code: {
        type: String,
        default: ""
    }
},
    { timestamps: true }
)


// Exports
module.exports = mongoose.model('userTelegram', userTelegramShema)