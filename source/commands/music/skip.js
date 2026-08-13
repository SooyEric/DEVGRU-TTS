import {
    errorNoVoiceChannel,
    errorNothingPlaying
} from '../../embeds/errors.js';

import {
    successSkipped
} from '../../embeds/success.js';

export async function execute(
    message,
    args,
    musicManager
) {
    const voiceChannel =
        message.member?.voice?.channel;

    if (!voiceChannel) {
        return message.reply({
            embeds: [
                errorNoVoiceChannel()
            ]
        });
    }

    const guildId =
        message.guild.id;

    const currentTrack =
        musicManager.getCurrentTrack(
            guildId
        );

    if (
        !musicManager.isPlaying(
            guildId
        ) ||
        !currentTrack
    ) {
        return message.reply({
            embeds: [
                errorNothingPlaying()
            ]
        });
    }

    const skipped =
        musicManager.skip(
            guildId
        );

    if (!skipped) {
        return message.reply({
            embeds: [
                errorNothingPlaying()
            ]
        });
    }

    return message.reply({
        embeds: [
            successSkipped(
                currentTrack
            )
        ]
    });
}