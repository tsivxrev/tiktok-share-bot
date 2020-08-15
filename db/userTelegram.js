//const mongoose = require('mongoose');
const { userTelegram } = require('./models')
const { logger } = require("../module/logger");


const addUserTelegram = async (uId, language_code="") => {
	const profiler = logger.startTimer();
    const user = new userTelegram( { uId, language_code } );
    const dbuser = await user.save()
    // Return the user
    profiler.done({ message: "Added new user (Telegram) with ID: " + dbuser.uId + " and language_code: " + dbuser.language_code, label: 'DB'});
    //mongoose.disconnect();
    return dbuser
}


module.exports = {
    addUserTelegram
}