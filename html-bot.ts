import Telegraf from 'telegraf';

const bot = new Telegraf('414766630:AAFIiCodXtCIFsC36vv9r96obnZw1rhc53c');

bot.on('text', ({ replyWithHTML }) => replyWithHTML(
    `
    Aleksey completed a task in <a href="https:\/\/app.asana.com\/0\/0\/1172815791483369\/f">task</a>
`
));
bot.launch();