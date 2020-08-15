const mongoose = require('mongoose');
const { logger } = require("../module/logger");
require('dotenv').config()


const profiler = logger.startTimer();

mongoose.connect(process.env.MONGO_URL, 
    { 
        useNewUrlParser: true,
        useCreateIndex: true, 
        useUnifiedTopology: true,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    }
).catch(error => { logger.error(error, {label: 'DB'}) })

mongoose.connection.on('connected', () =>  profiler.done({ message: "Mongo: Connected", label: 'DB'}))