import { config } from '../utils/config.js';

export default async function messageCreate(
    message,
    client
) {
    if (message.author.bot) {
        return;
    }

    if (!message.guild) {
        return;
    }

    if (
        !config.ttsChannelId ||
        message.channel.id !==
            config.ttsChannelId
    ) {
        return;
    }

    await client.ttsManager
        .handleMessage(message);
}