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

    try {
        /*
         * Comprobamos el estado justo antes
         * de enviar la solicitud.
         */
        const queueBefore =
            musicManager.getQueueSize(
                guildId
            );

        const wasPlaying =
            musicManager.isPlaying(
                guildId
            );

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
         * Si ya había reproducción o canciones
         * pendientes antes de esta solicitud,
         * esta canción pertenece a la cola.
         */
        if (
            wasPlaying ||
            queueBefore > 0
        ) {
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

        /*
         * Primera canción.
         */
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