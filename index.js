const { logger } = require("./module/logger")


logger.info('Initing all files and modules', { label: "main"})
logger.profile("All files and modules is up and running", {label: 'main'})

//require('./vkBot/index')
require('./telegramBot/index')
require('./db')

logger.profile("All files and modules is up and running", {label: 'main'})