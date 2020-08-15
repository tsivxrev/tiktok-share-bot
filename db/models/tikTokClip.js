// Dependencies
const mongoose = require('mongoose')

// Schema
const Schema = mongoose.Schema;
const TikTokClipShema = new Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    VKattachmentWatermark: {
        type: String,
        default: "",
        required: false,
    },
    VKattachmentNoWatermark: {
        type: String,
        default: "",
        required: false,
    },
},
    { timestamps: true }
)


// Exports
module.exports = mongoose.model('tikTokClip', TikTokClipShema)