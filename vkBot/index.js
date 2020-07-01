const { VK, Keyboard } = require('vk-io');
const { TikTok, Uploader} = require('../module/tiktok')
const { logger, streamLogs } = require('../module/logger');
const { addUserVK } = require('../db/userVK')
const utils = require('../module/utils')
require('dotenv').config()


const vk = new VK({
  token: process.env.BOT_VKTOKEN,
  pollingGroupId: process.env.GROUP_ID
});

const { updates } = vk;
const { QuestionManager } = require('vk-io-question');
const questionManager = new QuestionManager();

updates.use(questionManager.middleware);


updates.on('message', async (context, next) => {
  const payload = context.messagePayload || {};
  context.command = payload.command;

  await next();
})

vk.updates.hear(/(https?:\/\/[^ ]*)/, async (context) => {
  const answer = await context.question(
    "Что вы хотите получить?",
    {
      keyboard: Keyboard.keyboard([
        [
          Keyboard.textButton({
            label: 'Видео c водяным знаком',
            color: 'positive',
            payload: {
              choice: 'video',
              watermark: true
            }
          })

        ],
        [
          Keyboard.textButton({
            label: 'Видео без водяного знака',
            color: 'positive',
            payload: {
              choice: 'video',
              watermark: false
            }
          })
        ],
        [
          Keyboard.textButton({
            label: 'Прямую ссылку',
            color: 'positive',
            payload: {
              choice: 'url'
            }
        }),
        ],
        [
          Keyboard.textButton({
            label: 'Отмена',
            color: 'negative',
            payload: {
              choice: 'cancel'
            }
          })
        ]
      ]).oneTime()
    }
  );

  if (!answer.payload) {
      await context.send('Отвечать нужно было нажатием на кнопку');
      return;
  }

  if (answer.payload.choice === 'url') {
    const cringeVideo = new TikTok(context.text, {});

    cringeVideo.getVideoMetaInfo().then(() => {
      const urls = cringeVideo.getRawUrls()
      context.send("Прямые ссылки на ролик" +
        "\n\nC вотермаркой: " + urls.videoUrl +
        "\n\nБез вотермарки: " + urls.videoUrlNoWaterMark);

    }).catch(err => {
      context.send("Произошла ошибка во время получения прямых ссылок")
      logger.error(err, {label: 'VK'})
    })
  }

  if (answer.payload.choice === 'cancel') {
    await context.send('Хорошо.');

    return;
  }

  if (answer.payload.choice === 'video') {
    await context.send('Загружаю видео...');

    const cringeVideo = new TikTok(context.text, {});

    cringeVideo.getVideoMetaInfo().then(() => {
      const video = new Uploader(cringeVideo)

      video.getVkAttachment(answer.payload.watermark).then(attachment => {
        context.send(
          {
            attachment: attachment
          }
        );
      }).catch(err => {
        
        logger.error(err, {label: 'VK'})
        context.send('Произошла ошибка во время загрузки видео :(');
      })
    }).catch(err => {
      
      logger.error(err, {label: 'VK'})
      context.send('Произошла ошибка во время загрузки видео :(');
    })
  }

  addUserVK( context.senderId ).catch(() => {})
});

vk.updates.hear(
{
  text:'/logs',
}, 
async (context) => {

  if (!process.env.ADMIN_IDS_VK.includes(context.senderId)) {
    await context.send('Недоступно');
    return;
  }

  const answer = await context.question(
    "Период:",
    {
      keyboard: Keyboard.keyboard([
        [
          Keyboard.textButton({
            label: 'Получить логи за последний день',
            color: 'positive',
            payload: {
              choice: 'logsFromOneDay'
            }
          })

        ],
        [
          Keyboard.textButton({
            label: 'Получить логи за последнюю неделю',
            color: 'positive',
            payload: {
              choice: 'logsFromOneWeek'
            }
          })
        ],
        [
          Keyboard.textButton({
            label: 'Выбрать количество дней',
            color: 'positive',
            payload: {
              choice: 'logsFromCustomPeriod'
            }
        }),
        ],
        [
          Keyboard.textButton({
            label: 'Отмена',
            color: 'negative',
            payload: {
              choice: 'cancel'
            }
          })
        ]
      ]).oneTime()
    }
  );

  if (!answer.payload) {
      await context.send('Отвечать нужно было нажатием на кнопку');
      return;
  }

  if (answer.payload.choice === 'logsFromOneDay') {
    logger.info(`Request to receive logs at: ${context.senderId}`, {label: 'VK'})
    context.send("Лог-лист за последний день: \n\n " + await streamLogs())
  }

  if (answer.payload.choice === 'logsFromOneWeek') {
    logger.info(`Request to receive logs at: ${context.senderId}`, {label: 'VK'})
    context.sendDocuments({ 
      value: 'logs/application-info.log',
      filename: 'logs.txt'
    }, 
    {
      message: "Лог-лист за последнюю неделю"
    })
  }

  if (answer.payload.choice === 'logsFromCustomPeriod') {
    logger.info(`Request to receive logs at: ${context.senderId}`, {label: 'VK'})
    context.send('Временно недоступно :(')
  }
  
  if (answer.payload.choice === 'cancel') {
    await context.send('Хорошо.');

    return;
  }
});

updates.hear((value, context) => {
    return context.command === 'help' || context.text === '/help';
  },
  async (context) => {
    await context.send('TikTok Share - бот при помощи которого можно делиться роликами из TikTok.'
      +'\nВы отправляете боту ссылку на ролик, а он вам возвращает видео, которым можно делиться с друзьями.'
      +'\nТакже с помощью бота можно самостоятельно скачивать ролики на локальное устройство.\n\nДля начала работы отправь мне ссылку на видео TikTok.');
});

updates.hear((value, context) => {
  return context.command === 'start' || context.text === '/start';
},
async (context) => {
  await context.send('TikTok Share - бот при помощи которого можно делиться роликами из TikTok.'
    +'\nВы отправляете боту ссылку на ролик, а он вам возвращает видео, которым можно делиться с друзьями.'
    +'\nТакже с помощью бота можно самостоятельно скачивать ролики на локальное устройство.\n\nДля начала работы отправь мне ссылку на видео TikTok.'
  );
});

updates.hear((value, context) => {
    return context.command === 'about' || context.text === '/about';
  },
  async (context) => {
    try {
      await context.send(
        {
          message: `TikTok Share - делиcь видео с TikTok не выходя из Вконтакте.\n\n`+
            `\nВремя с момента запуска: ${utils.uptime()}`+
            `\nGit hash: ${utils.getGitCommitHash(false)}\n\n`
          ,
          disable_mentions: 1
        });
      }
    catch (error) {
      logger.error(error, {label: 'VK'});
    }
});

updates.hear(['/uptime', '/stat'], async (context) => {
    logger.info(`Executed command 'uptime' at: ${context.senderId}`, {label: 'VK'});
    await context.send(`Uptime: ${ utils.uptime()}`);
});

updates.hear(['/git', '/hash'], async (context) => {
    try {
      logger.info(`Executed command 'git' at: ${context.senderId}`, {label: 'VK'});
      await context.send(`Git: ${utils.getGitCommitHash(false)}`);
    } catch (error) {
      await context.send(`Git: None`);
      logger.error(error, {label: 'VK'})
    }
});

updates.setHearFallbackHandler(async (context) => {
  addUserVK( context.senderId ).catch(() => {})
  if (!context.isChat) {
    await context.send({
      message: "Неизвестная команда!",
      keyboard: Keyboard.keyboard([
        [
          Keyboard.textButton({
              label: 'Начать',
              color: 'positive',
              payload: {
                command: 'start'
              }
          })
        ],[
          Keyboard.textButton({
            label: 'Получить помощь',
            color: Keyboard.POSITIVE_COLOR,
            payload: {
              command: 'help'
            }
          })
        ],
        [
          Keyboard.textButton({
            label: 'О боте',
            color: Keyboard.POSITIVE_COLOR,
            payload: {
              command: 'about'
            }
          })
        ]
      ]).oneTime()
    })
  }
});


const profiler = logger.startTimer();
updates.startPolling().then(() => {
  profiler.done({ message: `Bot is up and running`, label: 'VK'});
}).catch(e => {
  logger.error(`Bot launch error: ${e}`, {label: 'VK'})
})