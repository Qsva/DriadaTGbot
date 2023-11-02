import express, { query } from 'express';
import { PORT, TOKEN } from './config.js';
import TelegramBot from 'node-telegram-bot-api';
import { replyOptions } from './keyboards.js'
import { channels } from './channelsTG.js'

// Инициализация приложения и сохр. в переменной app
const app = express();
const bot = new TelegramBot(TOKEN, {polling: true});

const welcomeMessage = `Приветствую вас на Бот-Канале компании Driada. Рад, что вы с нами. Вот наше меню, при переходе в котором - вы можете ознакомиться с материалами для отделки бани или сауны. Если вы хотите оформить заказ - воспользуйтесь кнопкой 'order' в меню. В следующей форме - ваш номер телефона, Имя, что вас интересует или размеры вашего помещения. После обработки вашего сообщения с вами свяжутся.`;

// Коллекция заказов
const orders = [];

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, welcomeMessage, replyOptions, {disable_web_page_preview: true});
});

// Обработчик нажатия кнопок reply меню
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'Picture') {
        const menuMessage = channels.map((channel, index) => {
            return `${index + 1}. ${channel.name} - ${channel.link}`;
        }).join('\n');
        bot.sendMessage(chatId, menuMessage, replyOptions);
    }
    if (data === 'Order') {
        getOrder(chatId);
    }
});

bot.onText(/\/share/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Нажми на кнопку "Поделиться", чтобы поделиться ботом с друзьями.', replyOptions);
  });

bot.onText(/\/picture/, (msg) => {
    const chatId = msg.chat.id;
    // Формирование и отправка сообщения с меню
    const menuMessage = channels.map((channel, index) => {
        return `${index + 1}. ${channel.name} - ${channel.link}`;
    }).join('\n');
    bot.sendMessage(chatId, menuMessage);
});

bot.onText(/\/order/, (msg) => {
    const chatId = msg.chat.id;
    getOrder(chatId);
});

// Функция обработки заказа
function getOrder(idChat) {
    bot.sendMessage(idChat, 'Введите ваш номер телефона:');
    bot.once('message', (phoneMessage) => {
        const phone = phoneMessage.text;

        bot.sendMessage(idChat, 'Введите ваше имя:');
        bot.once('message', (nameMessage) => {
            const name = nameMessage.text;

            bot.sendMessage(idChat, 'Введите ваш заказ или размеры помещения:');
            bot.once('message', (orderMessage) => {
                const order = orderMessage.text;

                // Генерация серийного номера заказа
                const orderNumber = `${getCurrentDate()}_${orders.length + 1}`;

                // Добавление заказа в коллекцию
                orders.push({
                    orderNumber,
                    phone,
                    name,
                    order
                });

                // Отправка данных заказа в мессенджер
                const adminChatId = '-4095278456';
                const orderInfo = `Номер заказа: ${orderNumber}\nТелефон: ${phone}\nИмя: ${name}\nЗаказ: ${order}`;
                bot.sendMessage(adminChatId, orderInfo);

                // Отправка подтверждения заказа пользователю
                bot.sendMessage(idChat, 'Ваш заказ принят. Мы свяжемся с вами в ближайшее время.');
            });
        });
    });
};

function getCurrentDate() {
    const date = new Date();
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));