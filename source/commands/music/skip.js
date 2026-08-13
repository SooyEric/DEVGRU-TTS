import {
    errorNoVoiceChannel,
    errorNothingPlaying
} from '../../embeds/errors.js';

import { successSkipped } from '../../embeds/success.js';

export async function execute(message, args, musicManager) {
    const voiceChannel = message.member?.voice?.channel;

    if (!voiceChannel) {
        return message.reply({
            embeds: [errorNoVoiceChannel()]
        });
    }

    const guildId = message.guild.id;

    const queue = musicManager.getQueue(guildId);

    if (!queue || !queue.isPlaying()) {
        return message.reply({
            embeds: [errorNothingPlaying()]
        });
    }

    const currentTrack = musicManager.getCurrentTrack(guildId);

    const skipped = musicManager.skip(guildId);

    if (!skipped) {
        return message.reply({
            embeds: [errorNothingPlaying()]
        });
    }

    return message.reply({
        embeds: [
            successSkipped(currentTrack)
        ]
    });
}