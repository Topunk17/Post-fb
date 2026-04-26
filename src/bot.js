require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { exec } = require('child_process');
const fetch = require('node-fetch');

const TOKEN = process.env.BOT_TOKEN;
const TARGET_BOT = process.env.TARGET_BOT;

const bot = new TelegramBot(TOKEN, { polling: true });

let groups = JSON.parse(fs.readFileSync('./groups.json')).groups;
let currentIndex = 0;

// FOTO
bot.on('photo', async (msg) => {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;

    const res = await fetch(url);
    const buffer = await res.arrayBuffer();

    fs.writeFileSync('./data/media.jpg', Buffer.from(buffer));
    bot.sendMessage(msg.chat.id, '✅ Foto disimpan');
});

// MESSAGE
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // forward link
    if (msg.text && msg.text.startsWith('http')) {
        try {
            await bot.forwardMessage(TARGET_BOT, chatId, msg.message_id);
            return bot.sendMessage(chatId, '✅ Link di-forward');
        } catch {
            return bot.sendMessage(chatId, '❌ Gagal forward');
        }
    }

    if (msg.text === '/start') {
        return bot.sendMessage(chatId, 'Kirim foto, caption lalu tekan Start', {
            reply_markup: {
                inline_keyboard: [[{ text: '▶️ Start', callback_data: 'start' }]]
            }
        });
    }

    if (msg.text) {
        fs.writeFileSync('./data/caption.txt', msg.text);
        bot.sendMessage(chatId, '📝 Caption disimpan');
    }
});

// BUTTON
bot.on('callback_query', async (q) => {
    const chatId = q.message.chat.id;

    if (q.data === 'start') {
        currentIndex = 0;
        sendGroup(chatId);
    }

    if (q.data === 'next') {
        currentIndex++;
        sendGroup(chatId);
    }

    if (q.data === 'stop') {
        bot.sendMessage(chatId, '⛔ Stop');
    }

    bot.answerCallbackQuery(q.id);
});

function sendGroup(chatId) {
    if (currentIndex >= groups.length) {
        return bot.sendMessage(chatId, '🎉 Selesai');
    }

    const url = groups[currentIndex];
    exec(`node src/openGroup.js "${url}"`);

    bot.sendMessage(chatId, `Grup ${currentIndex + 1}\n${url}`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⏭ Next', callback_data: 'next' },
                    { text: '⛔ Stop', callback_data: 'stop' }
                ]
            ]
        }
    });
        }
