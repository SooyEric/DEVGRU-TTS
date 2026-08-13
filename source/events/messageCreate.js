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

    /*
     * ─────────────────────────────
     * TTS
     * ─────────────────────────────
     */

    if (
        config.ttsChannelId &&
        message.channel.id ===
            config.ttsChannelId
    ) {
        await client.ttsManager
            .handleMessage(message);

        return;
    }

    /*
     * ─────────────────────────────
     * COMANDOS
     * ─────────────────────────────
     */

    if (
        !message.content.startsWith(
            config.prefix
        )
    ) {
        return;
    }

    await client.commandHandler
        .handle(message);
}