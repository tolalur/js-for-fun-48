import * as fs from 'fs';
import axios from 'axios';
import { SlackAnswer, Message } from 'types/slack-answer';
import * as Telegram from 'telegraf/telegram';


const telegram = new Telegram('414766630:AAFIiCodXtCIFsC36vv9r96obnZw1rhc53c');
const allMessageUrl = 'https://slack.com/api/conversations.history?token=xoxb-609373066404-1084068762981-FuZtj1mrVIlS8kn9qV3NsTtU&channel=C012VTU8DFT';
const messageFromUrl = (id: string) => `https://slack.com/api/conversations.history?token=xoxb-609373066404-1084068762981-FuZtj1mrVIlS8kn9qV3NsTtU&channel=C012VTU8DFT&oldest=${id}`;
const getMessages = async (url: string) => axios.get(url);
const lastMessageIdFileName = 'lastMessageId.txt';
const lastMessageId: string = fs.readFileSync(lastMessageIdFileName, "utf8");
let messages: SlackAnswer;
const prepareMessagesForTelegrm = (data: Message[]) => {
    return data.map(m => ({ text: m.text, taskName: m.attachments[0].title, url: m.attachments[0].actions[0].url }))
}

const main = async () => {
    if (lastMessageId) {
        messages = await getMessages(messageFromUrl(lastMessageId)).then(res => res.data);
        console.log(messages.messages.length)
    } else {
        messages = await getMessages(allMessageUrl).then(res => res.data);
        fs.writeFile(lastMessageIdFileName, messages.messages[0].ts, { encoding: "utf8" }, (e) => console.log)
    }
    if (messages && messages.ok && messages.messages.length) {
        console.log(prepareMessagesForTelegrm(messages.messages));

        let data = prepareMessagesForTelegrm(messages.messages);
        const text = (data: { text: string, taskName: string, url: string }) => `
        Вам телега, господа: <b>${data.text}</b> <br>
        Задачка-хуячка: <a href="${data.url}">${data.taskName}</a>`
        console.log(text(data[0]));
        await Promise.all(data.map(d => telegram.sendMessage('-1001498144190', text(d))))

        // telegram.sendMessage('-1001498144190')
    }
};

main();