const Composer = require('telegraf/composer')
const Markup = require('telegraf/markup')
const WizardScene = require('telegraf/scenes/wizard')
const { TikTok } = require('../../module/tiktok')
const { logger } = require('../../module/logger')


const stepHandler = new Composer()
stepHandler.action('videoNoWatermark', async (ctx) => {
    try {
        let hiddenCringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await hiddenCringeVideo.getVideoMetaInfo()
        let rawUrls = hiddenCringeVideo.getRawUrls()
        Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithVideo({url: rawUrls.videoUrlNoWaterMark }, {caption: hiddenCringeVideo.getFullDescription()}),
            await ctx.answerCbQuery("🎉 Done")
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        Promise.all([
            await ctx.deleteMessage(),
            ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video'))
        ])
    }
    return ctx.scene.leave()
})

stepHandler.action('url', async (ctx) => {
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()
        let rawUrls = cringeVideo.getRawUrls()
        console.log(rawUrls);
        Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.msg.raw_urls', {
                    video_url_watermark: rawUrls.videoUrl, 
                    video_url_no_watermark: rawUrls.videoUrlNoWaterMark
                }),
                { disable_web_page_preview: true }
            ),
            await ctx.answerCbQuery("🎉 Done")
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.deleteMessage()
        ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_urls'))
    }
    
    return await ctx.scene.leave()
})

stepHandler.action('videoWatermark', async (ctx) => {
    try {
        let cringeVideo = new TikTok(ctx.wizard.state.videoUrl, {})
        await cringeVideo.getVideoMetaInfo()
        let rawUrls = cringeVideo.getRawUrls()
        Promise.all([
            await ctx.deleteMessage(),
            await ctx.replyWithVideo({url: rawUrls.videoUrl }, {caption: cringeVideo.getFullDescription()}),
            await ctx.answerCbQuery("🎉 Done")
        ])
    } catch (error) {
        logger.error(error, {label: 'Telegram'})
        await ctx.deleteMessage()
        ctx.replyWithMarkdown(ctx.i18n.t('cringeScene.errors.error_get_video'))
    }
    return ctx.scene.leave()
})

const superWizard = new WizardScene('super-wizard',
  (ctx) => {
    ctx.wizard.state.videoUrl =  ctx.message.text;
    ctx.reply(ctx.i18n.t('cringeScene.msg_start'), Markup.inlineKeyboard([
      [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_urls'), 'url')],
      [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_video_no_watermark'), 'videoNoWatermark')],
      [Markup.callbackButton(ctx.i18n.t('cringeScene.button_get_video_watermark'), 'videoWatermark')]
    ]).extra())
    return ctx.wizard.next()
  },
  stepHandler
)


module.exports = {
    superWizard
}