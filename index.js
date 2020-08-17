const { logger } = require("./module/logger")


logger.info('Initing all files and modules', { label: "main"})
const profiler = logger.startTimer();

//require('./vkBot/index')
require('./telegramBot/index')
require('./db')

profiler.done({message: "All files and modules is up and running", label: 'main'})