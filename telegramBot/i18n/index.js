const TelegrafI18n = require('telegraf-i18n')
const path = require('path')


const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, // Default true
  directory: path.resolve(__dirname, 'locales')
})


module.exports = i18n