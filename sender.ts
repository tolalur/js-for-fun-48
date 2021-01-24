import { SlackAnswer, Message } from 'types/slack-answer';
import axios from 'axios';
import * as Telegram from 'telegraf/telegram';
import Tokens from './tokens';
import SlackChannel from './slackChannel';

const telegram = new Telegram(Tokens.telega);

const allMessageUrl = (token: string, channel: string) => `https://slack.com/api/conversations.history?token=${token}&channel=${channel}`;

const messageFromUrl = (lastMessageid: string, slackChannel: string, token: string) => `https://slack.com/api/conversations.history?token=${token}&channel=${slackChannel}&oldest=${lastMessageid}`;

const getMessages = async (lastMessageId: string, slackChannel: string, slackToken: string) => axios.get(
  lastMessageId ? messageFromUrl(lastMessageId, slackChannel, slackToken) : allMessageUrl(slackToken, slackChannel)
);

const prepareMessagesForTelegrm = (data: Message[]) => {
  return data.filter(m => m.bot_id && m.bot_id == 'B012HFLTUH1'
    && m.attachments && m.attachments.length && m.attachments[0].title
    && m.attachments[0].actions && m.attachments[0].actions.length && m.attachments[0].actions[0].url
  )
    .map(m => ({
      text: m.text.replace(/<https:\/\/|>/gm, '').replace(/app\.asana\.com(\/\d\/\d*\/)|(\d*\/\w\|)|(\w*\|)/gi, ''),
      taskName: m.attachments[0].title,
      url: m.attachments[0].actions[0].url
    })
    )
}

function CustomException(message: string, e: ExceptionInformation) {
  this.message = message;
  this.originalException = e

  this.toString = function () {
    return this.message + this.originalException
  };
}

const main = async (slackChannel: string, slackToken: string, lastMessageIdAdress: string) => {
  let messages: SlackAnswer;
  let lastMessageId: string

  try {
    lastMessageId = await axios.get<{ messageId: string }>(lastMessageIdAdress)
      .then(res => res.data.messageId)
      .catch(e => { throw CustomException('отвалились при запросе id сообщения', e) });

    messages = await getMessages(lastMessageId, slackChannel, slackToken)
      .then(res => res.data)
      .catch(e => { throw CustomException('отвалились при запросе сообщений', e) });

  } catch (e) { return console.log(e) }


  if (messages && messages.ok && messages.messages && messages.messages.length) {

    let data = prepareMessagesForTelegrm(messages.messages);

    const text = (data: { text: string, taskName: string, url: string }) => `<b>${data.text}</b>\n<code>Задачка-хуячка:</code> <a href="${data.url}">${data.taskName}</a>`

    try {
      await telegram.sendMessage('-1001498144190', 'Вам телега, господа:\n' + data.map(t => text(t)).join('\n\n'), { parse_mode: 'HTML' });
      await axios.post(lastMessageIdAdress, { messageId: messages.messages[0].ts })
    } catch (e) {
      console.log('отвалились при отправке сообщений в телегу', e)
    }

  }

  if (messages && messages.ok && messages.messages && !messages.messages.length) {
    console.log('Новых сообщений нет, проект: ', lastMessageIdAdress);
  }

  if (messages && !messages.ok) {
    console.log(`Не удалось загрузить сообщения ${JSON.stringify(messages)}`);

    try {
      await telegram.sendMessage('-1001498144190', `Похоже пидоры из слака, заблочили интеграцию... ${JSON.stringify(messages)}`);
    } catch (e) {
      console.log('Отвалились на отправке сообщений в телегу');
      console.warn(e)
    }
  }
};

main(SlackChannel.projectX, Tokens.slack, 'http://localhost:3000/project-x');
main(SlackChannel.boroda, Tokens.slack, 'http://localhost:3000/boroda');