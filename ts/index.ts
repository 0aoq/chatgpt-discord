/**
 * @file Library entry point
 * @name index.ts
 */

// load dotenv
import { config } from "dotenv";
config();

// import others
import crypto from "node:crypto";

import Eris, { Constants } from "eris";
import { ChatGPTAPI } from "chatgpt";

// create bot
const client = Eris(process.env.DISCORD_BOT_TOKEN as string, {
    intents: [Constants.Intents.guildMessages],
});

// create api
const api = new ChatGPTAPI({
    sessionToken: process.env.CHATGPT_TOKEN as string,
});

// start client
client.editStatus({
    name: "you",
    type: Constants.ActivityTypes.WATCHING,
});

client.on("ready", async () => {
    console.log(
        `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_BOT_ID}&scope=bot&permissions=3072`
    );
});

// listen for command uses
let userConvos: { [key: string]: any } = {}; // store user conversations by the user id
client.on("messageCreate", async (ev) => {
    if (ev.author.id === client.user.id) return; // don't reply to our own messages

    // get content
    const { content } = ev;
    if (!content.startsWith(">")) return;
    if (content.startsWith(">!")) {
        client.createMessage(ev.channel.id, {
            messageReference: {
                messageID: ev.id,
                guildID: ev.guildID || undefined,
                channelID: ev.channel.id,
            },
            content: "Cleared conversation history.",
        });

        // clear history
        delete userConvos[ev.author.id];

        return;
    }

    // send typing
    client.sendChannelTyping(ev.channel.id);
    ev.addReaction("\u{1F4AC}");

    // send prompt
    const promptId = crypto.getRandomValues(new Uint16Array(32))[0];

    console.log(
        `{${promptId}} Received prompt: "${content.slice(
            1,
            content.length
        )}" from user "${ev.author.username}#${ev.author.discriminator}"`
    );

    // set user conversation if it doesn't already exist
    if (!userConvos[ev.author.id])
        userConvos[ev.author.id] = await api.getConversation();

    // send message
    const convo = userConvos[ev.author.id];
    const res = await convo.sendMessage(content.slice(1, content.length), {
        timeoutMs: 2 * 60 * 1000,
    });

    console.log(`{${promptId}} Finished prompt: "${res}"`);

    // reply
    ev.removeReaction("\u{1F4AC}", client.user.id);
    ev.addReaction("\u{2705}");
    client.createMessage(
        // message will upload text as a file if it is too long
        ev.channel.id,
        {
            messageReference: {
                messageID: ev.id,
                guildID: ev.guildID || undefined,
                channelID: ev.channel.id,
            },
            content:
                res.length < 2000
                    ? res
                    : "I've uploaded this response as a file because it was too long.",
        },
        res.length >= 2000
            ? {
                  name: `chatgpt-response-${new Date().toISOString()}.txt`,
                  file: res,
              }
            : undefined
    );
});

// connect
client.connect();
