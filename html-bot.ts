import Telegraf from 'telegraf';

const bot = new Telegraf('414766630:AAFIiCodXtCIFsC36vv9r96obnZw1rhc53c');

bot.on('text', ({ replyWithHTML }) => replyWithHTML(
    `
    Aleksey completed a task in <a href="https://app.asana.com/0/1172081950609769/list|Project X">task</a>
`
));
bot.launch();