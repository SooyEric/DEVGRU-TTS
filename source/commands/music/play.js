import {
    errorNoVoiceChannel,
    errorNoQuery,
    errorPlayback
} from '../../embeds/errors.js';

import {
    createNowPlayingEmbed,
    createAddedToQueueEmbed
} from '../../embeds/music.js';

import {
    getAttachmentAudio
} from '../../utils/parser.js';

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

    const attachment =
        getAttachmentAudio(
            message.attachments
        );

    let query =
        args.join(' ').trim();

    if (!query && attachment) {
        query = attachment.url;
    }

    if (!query) {
        return message.reply({
            embeds: [
                errorNoQuery()
            ]
        });
    }

    const guildId =
        message.guild.id;

    const wasPlaying =
        musicManager.isPlaying(
            guildId
        );

    const queueBefore =
        musicManager.getQueueSize(
            guildId
        );

    try {
        const result =
            await musicManager.play(
                voiceChannel,
                query,
                {
                    channel:
                        message.channel,

                    requestedBy:
                        message.author
                }
            );

        const track =
            result?.track;

        if (!track) {
            return message.reply({
                embeds: [
                    errorPlayback()
                ]
            });
        }

        /*
         * Si ya había una canción
         * reproduciéndose, la nueva
         * canción fue añadida a la cola.
         */
        if (wasPlaying || queueBefore > 0) {
            const position =
                queueBefore + 1;

            return message.reply({
                embeds: [
                    createAddedToQueueEmbed(
                        track,
                        position,
                        message.author.username
                    )
                ]
            });
        }

        return message.reply({
            embeds: [
                createNowPlayingEmbed(
                    track,
                    message.author.username
                )
            ]
        });
    } catch (error) {
        console.error(
            'Error en -play:',
            error
        );

        return message.reply({
            embeds: [
                errorPlayback()
            ]
        });
    }
}