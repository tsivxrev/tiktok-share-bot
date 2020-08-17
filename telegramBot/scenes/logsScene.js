const Composer = require('telegraf/composer')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const { logger, streamLogs } = require('../../module/logger')


const stepHandler = new Composer()
stepHandler.action('logsFromOneDay', async (ctx) => {
    logger.info(`Request to receive logs at: ${ctx.from.id}`, {label: 'Telegram'})
    await ctx.deleteMessage(),
	await ctx.replyWithMarkdown("*Лог-лист* за последний день: \n\n `" + await streamLogs() + '`')
    return ctx.scene.leave()
})

stepHandler.action('logsFromOneWeek', async (ctx) => {
    logger.info(`Request to receive logs at: ${ctx.from.id}`, {label: 'Telegram'})
    await ctx.deleteMessage(),
	await ctx.replyWithDocument({
        source: 'logs/application-info.log',
        filename: 'logs.txt'
    }, 
    {
        caption: "*Лог-лист* за последнюю неделю",
        parse_mode: 'Markdown'
    })
    return ctx.scene.leave()
})

stepHandler.action('logsFromCustomPeriod', async (ctx) => {
    logger.info(`Request to receive logs at: ${ctx.from.id}`, {label: 'Telegram'})
    await ctx.deleteMessage(),
	await ctx.replyWithMarkdown("_Временно недоступно :(_")
    return ctx.scene.leave()
})

stepHandler.action('logsLeaveScene', async (ctx) => {
    logger.info(`leave logs scene`, {label: 'Telegram'})
    await ctx.deleteMessage(),
    await ctx.replyWithMarkdown("Хорошо")
    return ctx.scene.leave()
})

const logsSceneWizard = new WizardScene('logs-wizard',
    (ctx) => {
        console.info(ctx.from.id)
        if(!process.env.ADMIN_IDS_TG.includes(ctx.from.id)) {
            ctx.replyWithMarkdown('_Access denied_')
            return ctx.scene.leave()
        }

        ctx.reply('Период', Markup.inlineKeyboard([
            [Markup.callbackButton('Получить логи за последний день', 'logsFromOneDay')],
            [Markup.callbackButton('Получить логи за последнюю неделю', 'logsFromOneWeek')],
            [Markup.callbackButton('Выбрать количество дней', 'logsFromCustomPeriod')],
            [Markup.callbackButton('Отмена', 'logsLeaveScene')]
        ]).extra())
        
    return ctx.wizard.next()
    },
    stepHandler 
)


module.exports = {
    logsSceneWizard
}