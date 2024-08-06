const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { setGlobalOptions } = require("firebase-functions/v2");
const line = require("@line/bot-sdk");
require('dotenv').config();

setGlobalOptions({ region: "asia-east1" });

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

line.middleware({
    channelSecret: process.env.CHANNEL_SECRET
});

async function handleEvent(event) {
    if (event.type !== "message" || event.message.type !== "text") {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const userId = event.source.userId;
    
    
    await client.showLoadingAnimation({
        chatId: userId,
        loadingSeconds: 5,
    });

    // create an echoing text message
    const echo = { type: "text", text: event.message.text };

    // use reply API
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
        //messages: [echo, { type: "text", text: "耶穌愛你" }]
    });
}

exports.callback = onRequest((request, response) => {
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }

    // 解析請求體中的事件
    const events = request.body.events;

    // 處理每個事件
    Promise.all(events.map(handleEvent))
        .then((result) => response.json(result))
        .catch((err) => {
            console.error(err);
            response.status(500).end();
        });
});

exports.helloWorld = onRequest((request, response) => {
    //   logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
});

