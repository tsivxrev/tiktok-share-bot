const Composer = require('telegraf/composer')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const { TikTok } = require('../../module/tiktok')
const { logger } = require('../../module/logger')
const { addUserTelegram } = require('../../db/userTelegram')

const stepHandler = new Composer()


stepHandler.action('videoWatermark', async (ctx) => {
    logger.info(`Cringe scene: get video with watermark. User ID: ${ctx.from.id}`, {label: 'Telegram'})
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()
        
        await Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithVideo({
                source: await cringeVideo.getBuffer(true)
            }, {
                caption: cringeVideo.getFullDescriptionMarkDown()
            }),

            await ctx.answerCbQuery("🎉 Done"),
            logger.info('Successfully upload and sent video for ' + ctx.from.id, {label: 'Telegram'})
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video'))
    }
    return ctx.scene.leave()
})

stepHandler.action('videoNoWatermark', async (ctx) => {
    logger.info(`Cringe scene: get video without watermark. User ID: ${ctx.from.id}`, {label: 'Telegram'})
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()

        await Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithVideo({
                source: await cringeVideo.getBuffer()
            }, {
                caption: cringeVideo.getFullDescriptionMarkDown()
            }),

            await ctx.answerCbQuery("🎉 Done"),
            logger.info('Successfully upload and sent video for ' + ctx.from.id, {label: 'Telegram'})
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video'))
    }
    return ctx.scene.leave()
})

stepHandler.action('videoGetFile', async (ctx) => {
    logger.info(`Cringe scene: get video file. User ID: ${ctx.from.id}`, {label: 'Telegram'})
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()

        await Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithDocument({
                    source: await cringeVideo.getBuffer(true),
                    filename: "tiktok_share_" + Math.random().toString(16).substr(2) + '.mp4',
                },
                {
                    disable_content_type_detection: true,
                    caption: "With *love* from [@tt_get_bot](@tt_get_bot) ❤️",
                    parse_mode: 'Markdown'
                }),

            await ctx.answerCbQuery("🎉 Done"),
            logger.info('Successfully upload and sent video file for ' + ctx.from.id, {label: 'Telegram'})
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video_file'))
    }
    return ctx.scene.leave()
})

stepHandler.action('videoGetFileNoWatermark', async (ctx) => {
    logger.info(`Cringe scene: get video file. User ID: ${ctx.from.id}`, {label: 'Telegram'})
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()

        await Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithDocument({
                    source: cringeVideo.getBuffer(),
                    filename: "tiktok_share_" + Math.random().toString(16).substr(2) + '.mp4',
                },
                {
                    disable_content_type_detection: true,
                    caption: "With *love* from [@tt_get_bot](@tt_get_bot) ❤️",
                    parse_mode: 'Markdown'
                }),

            await ctx.answerCbQuery("🎉 Done"),
            logger.info('Successfully upload and sent video file for ' + ctx.from.id, {label: 'Telegram'})
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video_file'))
    }
    return ctx.scene.leave()
})

stepHandler.action('cringeLeaveScene', async (ctx) => {
    logger.info(`Cringe scene: canceled. User ID: ${ctx.from.id}`, {label: 'Telegram'})
    await ctx.deleteMessage(),
    await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.msg.cancel_msg'))
    return ctx.scene.leave()
})

const superWizard = new WizardScene('super-wizard',
  (ctx) => {
    ctx.wizard.state.videoUrl =  ctx.message.text;
    
    ctx.reply(ctx.i18n.t('cringeScene.msg_start'), Markup.inlineKeyboard([
        [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_video_watermark'), 'videoWatermark')],
        [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_video_no_watermark'), 'videoNoWatermark')],
        [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_file'), 'videoGetFile')],
        [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_file_no_watermark'), 'videoGetFileNoWatermark')],
        [Markup.callbackButton(ctx.i18n.t('cringeScene.button_cancel'), 'cringeLeaveScene')]
    ]).extra())
    
    addUserTelegram(ctx.from.id, ctx.from.language_code).catch(err => { 
        logger.error(err, {label: 'Telegram'})
    });
    
    return ctx.wizard.next()
  },
  stepHandler
)


module.exports = {
    superWizard
}