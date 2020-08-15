//const mongoose = require('mongoose');
const { tikTokClip } = require('./models');
const { logger } = require("../module/logger");


const findClip = async (videoId) => {
    const profiler = logger.startTimer();
    let clip = await tikTokClip.findOne({ videoId })

    if (clip === null) {
        clip = new tikTokClip({ videoId })
        clip = await clip.save()

        profiler.done({ message: "Added new tiktok clip with video ID: " + videoId, label: 'DB'});
    }
    
    return clip;
}

const addVKAttachWithWatermark = async (videoId, videoString) => {
    const doc = await tikTokClip.findOne({ videoId });

    // Sets `name` and unsets all other properties
    doc.VKattachmentWatermark = videoString
    await doc.save();
    //mongoose.disconnect()
    return doc
}

const addVKAttachWithoutWatermark = async (videoId, videoString) => {
    const doc = await tikTokClip.findOne({ videoId });

    // Sets `name` and unsets all other properties
    doc.VKattachmentNoWatermark = videoString
    await doc.save();
    //mongoose.disconnect()
    return doc
}

module.exports = {
    findClip, addVKAttachWithWatermark, addVKAttachWithoutWatermark
}