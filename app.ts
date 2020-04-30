import { SlackAnswer, Message } from 'types/slack-answer';
import * as fs from 'fs';
import axios from 'axios';
import * as Telegram from 'telegraf/telegram';
import Tokens from './tokens';

const telegram = new Telegram(Tokens.telega);
const allMessageUrl = `https://slack.com/api/conversations.history?token=${Tokens.slack}&channel=C012VTU8DFT`;
const messageFromUrl = (id: string) => `https://slack.com/api/conversations.history?token=${Tokens.slack}&channel=C012VTU8DFT&oldest=${id}`;
const getMessages = async (url: string) => axios.get(url);
const lastMessageIdFileName = 'lastMessageId.txt';
const lastMessageId: string = fs.readFileSync(lastMessageIdFileName, "utf8");
let messages: SlackAnswer;
const prepareMessagesForTelegrm = (data: Message[]) => {
    return data.filter(m => m.bot_id && m.bot_id == 'B012HFLTUH1'
        && m.attachments && m.attachments.length && m.attachments[0].title
        && m.attachments[0].actions && m.attachments[0].actions.length && m.attachments[0].actions[0].url
    )
        .map(m => ({ text: m.text.replace(/<https:\/\/|>/gm, ''), taskName: m.attachments[0].title, url: m.attachments[0].actions[0].url }))
}

const main = async () => {
    if (lastMessageId) {
        messages = await getMessages(messageFromUrl(lastMessageId)).then(res => res.data);
        console.log('есть lastMessageId: ', messages && messages.ok && messages.messages.length)
    } else {
        messages = await getMessages(allMessageUrl).then(res => res.data);
        console.log(messages);
    }
    if (messages && messages.ok && messages.messages && messages.messages.length) {
        fs.writeFile(lastMessageIdFileName, messages.messages[0].ts, { encoding: "utf8" }, (e) => console.log)
        console.log(prepareMessagesForTelegrm(messages.messages));

        let data = prepareMessagesForTelegrm(messages.messages);
        const text = (data: { text: string, taskName: string, url: string }) => `
        Вам телега, господа: <b>${data.text}</b> <br>
        Задачка-хуячка: <a href="${data.url}">${data.taskName}</a>`
        console.log(text(data[0]));
        await Promise.all(data.map(d => telegram.sendMessage('-1001498144190', text(d), { parse_mode: 'HTML' })))
    } else {
        console.log(`Не удалось загрузить сообщения ${JSON.stringify(messages)}`);
        telegram.sendMessage('-1001498144190', `Похоже пидоры из слака, заблочили интеграцию... ${JSON.stringify(messages)}`)
    }
};

main();