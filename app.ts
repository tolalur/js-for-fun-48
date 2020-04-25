const Telegraf = require('telegraf')

const bot = new Telegraf('414766630:AAFIiCodXtCIFsC36vv9r96obnZw1rhc53c')
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', Telegraf.reply('λ'))
bot.launch()