
import Telegraf from 'telegraf';
import Markup from 'telegraf/markup';
import fetch from 'node-fetch';

const bot = new Telegraf('414766630:AAFIiCodXtCIFsC36vv9r96obnZw1rhc53c');

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
  const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`
  const response = await fetch(apiUrl)
  const { results } = await response.json()
  const recipes = results
    .filter(({ thumbnail }) => thumbnail)
    .map(({ title, href, thumbnail }) => ({
      type: 'article',
      id: thumbnail,
      title: title,
      description: title,
      thumb_url: thumbnail,
      input_message_content: {
        message_text: title
      },
      reply_markup: Markup.inlineKeyboard([
        Markup.urlButton('Go to recipe', href)
      ])
    }))
  return answerInlineQuery(recipes)
})

bot.on('chosen_inline_result', ({ chosenInlineResult }) => {
  console.log('chosen inline result', chosenInlineResult)
})

bot.launch()