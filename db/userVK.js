//const mongoose = require('mongoose');
const { userVK } = require("./models");
const { logger } = require("../module/logger");


const findUserVK = async (uId) => {
    const user = await userVK.findOne( { uId } )
    //mongoose.disconnect()
    return user
}

const addUserVK = async (uId) => {
    const profiler = logger.startTimer();
    const user = new userVK( { uId } )
    const dbuser = await user.save()
    // Return the user
    profiler.done({ message: "Added new user (VK) with ID: " + dbuser.uId, label: 'DB'})
    //mongoose.disconnect()
    return dbuser
}

module.exports = {
    findUserVK, addUserVK
}