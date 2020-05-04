import { SlackAnswer, Message } from 'types/slack-answer';
import * as fs from 'fs';
import axios from 'axios';
import * as Telegram from 'telegraf/telegram';
import Tokens from './tokens';
import SlackChannel from './slackChannel';

const telegram = new Telegram(Tokens.telega);

const allMessageUrl = (token: string, channel: string) => `https://slack.com/api/conversations.history?token=${token}&channel=${channel}`;

const messageFromUrl = (lastMessageid: string, slackChannel: string, token: string) => `https://slack.com/api/conversations.history?token=${token}&channel=${slackChannel}&oldest=${lastMessageid}`;

const getMessages = async (url: string) => axios.get(url);

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

const main = async (slackChannel: string, slackToken: string, lastMessageIdAdress: string) => {
    let messages: SlackAnswer;
    let lastMessageId: string

    try {
        lastMessageId = await axios.get<{ messageId: string }>(lastMessageIdAdress).then(res => res.data.messageId)
    } catch (e) {
        console.log('отвалились при запросе id сообщения', e)
    }

    if (lastMessageId) {
        try {
            messages = await getMessages(messageFromUrl(lastMessageId, slackChannel, slackToken)).then(res => res.data);
        } catch (e) {
            console.log('отвалились при запросе сообщений', e)
        }

        console.log('есть lastMessageId: ', messages && messages.ok && messages.messages.length)
    } else {
        try {
            messages = await getMessages(allMessageUrl(slackToken, slackChannel)).then(res => res.data);
        } catch (e) {
            console.log('отвалились при запросе сообщений', e)
        }
    }

    if (messages && messages.ok && messages.messages && messages.messages.length) {

        await axios.post(lastMessageIdAdress, { messageId: messages.messages[0].ts })

        let data = prepareMessagesForTelegrm(messages.messages);
        const text = (data: { text: string, taskName: string, url: string }) => `
        Вам телега, господа: <b>${data.text}</b>\n<code>Задачка-хуячка:</code> <a href="${data.url}">${data.taskName}</a>`
        console.log(text(data[0]));

        try {
            await Promise.all(data.map(d => telegram.sendMessage('-1001498144190', text(d), { parse_mode: 'HTML' })))
        } catch (e) {
            console.log('отвалились при отправке сообщений в телегу', e)
        }

    } else {
        console.log(`Не удалось загрузить сообщения ${JSON.stringify(messages)}`);
        telegram.sendMessage('-1001498144190', `Похоже пидоры из слака, заблочили интеграцию... ${JSON.stringify(messages)}`)
    }
};

main(SlackChannel.projectX, Tokens.slack, 'http://localhost:3000/"project-x');
main(SlackChannel.boroda, Tokens.slack, 'http://localhost:3000/boroda');