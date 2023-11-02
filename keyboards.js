export const replyOptions = {
    reply_markup: {
        inline_keyboard: [
        [{text: 'Оформить заказ', callback_data: 'Order'}],
        [{text: 'Фото галерея', callback_data: 'Picture'}],
        [{text: 'Поедлиться ботом с друзьями', switch_inline_query: '', callback_data: 'Share'}]
        ]
    }
};