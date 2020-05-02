import { SlackAnswer, Message } from 'types/slack-answer';
import * as fs from 'fs';
import axios from 'axios';
import * as Telegram from 'telegraf/telegram';
import Tokens from './tokens';
import SlackChannel from './slackChannel';

const telegram = new Telegram(Tokens.telega);

const allMessageUrl = (token: string, channel:string) => `https://slack.com/api/conversations.history?token=${token}&channel=${channel}`;

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
            url: m.attachments[0].actions[0].url })
            )
}

const main = async (slackChannel: string, slackToken: string, lastMessageIdFileName: string) => {
    let messages: SlackAnswer;
    const lastMessageId: string = fs.readFileSync(lastMessageIdFileName, "utf8");

    if (lastMessageId) {
        messages = await getMessages(messageFromUrl(lastMessageId, slackChannel, slackToken)).then(res => res.data);
        console.log('есть lastMessageId: ', messages && messages.ok && messages.messages.length)
    } else {
        messages = await getMessages(allMessageUrl(slackToken, slackChannel)).then(res => res.data);
    }

    if (messages && messages.ok && messages.messages && messages.messages.length) {
        fs.writeFile(lastMessageIdFileName, messages.messages[0].ts, { encoding: "utf8" }, (e) => console.log)

        let data = prepareMessagesForTelegrm(messages.messages);
        const text = (data: { text: string, taskName: string, url: string }) => `
        Вам телега, господа: <b>${data.text}</b>\n<code>Задачка-хуячка:</code> <a href="${data.url}">${data.taskName}</a>`
        console.log(text(data[0]));
        await Promise.all(data.map(d => telegram.sendMessage('-1001498144190', text(d), { parse_mode: 'HTML' })))
    } else {
        console.log(`Не удалось загрузить сообщения ${JSON.stringify(messages)}`);
        telegram.sendMessage('-1001498144190', `Похоже пидоры из слака, заблочили интеграцию... ${JSON.stringify(messages)}`)
    }
};

main(SlackChannel.projectX, Tokens.slack, 'lastMessageIdProjectX.txt');
main(SlackChannel.boroda, Tokens.slack, 'lastMessageIdBoroda.txt');