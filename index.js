const { logger } = require("./module/logger")


logger.profile("All files and modules is up and running", {label: 'main'})

require('./telegramBot/index')
require('./db')

logger.profile(`All files and modules is up and running`, {label: 'main'})