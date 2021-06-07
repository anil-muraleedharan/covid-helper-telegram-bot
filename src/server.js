const { logger, welcomeUser, initialAction, startAction, stateAction, districtAction, undefinedMessageAction } = require("./handlers");
const {Telegraf} = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// bot.use(logger);
bot.command('start', logger, welcomeUser)
bot.hears('register', logger, initialAction)
bot.action('start registration', logger, startAction)
bot.action(/state (.+) (.+)/, logger, stateAction)
bot.action(/district (.+) (.+)/, logger, districtAction)
bot.hears(/.*/, logger, undefinedMessageAction)

bot.launch().then(() => console.log('the bot is launched'));