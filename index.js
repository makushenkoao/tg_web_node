const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6044054585:AAFut3IMQkLTnecgGHhi_n_L161BrycKOEM';
const webAppUtl = 'https://serene-sherbet-aa7969.netlify.app'
const bot = new TelegramBot(token, {polling: true});
const app = express();
app.use(express.json())
app.use(cors())

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '/start') {
        await bot.sendMessage(chatId,'To purchase a product, you need to fill out a form', {
            reply_markup: {
                keyboard: [
                    [{text: 'Fill out a form', web_app: {url: webAppUtl + '/form'}}],
                ],
            }
        })
    }

    if (text !== '/start') {
        bot.sendMessage(chatId, 'This command is unknown to me. Try again :D');
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data)
            await bot.sendMessage(chatId,'thanks for the feedback')
            await bot.sendMessage(chatId,'Your information from the form:' +
                '\n' + `- ${data?.name}` +
                '\n' + `- ${data?.lastName}` +
                '\n' + `- ${data?.number}` +
                '\n' + `- ${data?.city}` +
                '\n' + `- ${data?.street}` +
                '\n' + `- ${data?.delivery}`
            )
        } catch (error) {
            console.log(error)
        }
    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Successful Purchase',
            input_message_content: {message_text: 'Congratulations on your purchase, you have purchased an item worth ' + totalPrice + 'grn'}
        })
        return res.status(200).json({});
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Not a successful purchase',
            input_message_content: {message_text: 'Failed to purchase item, please try again'}
        })
        return res.status(500).json({});
    }
})
const PORT = 8000;
app.listen(PORT, () => console.log('ok'))