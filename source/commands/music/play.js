import {
    errorNoVoiceChannel,
    errorNoQuery,
    errorPlayback,
    errorInvalidFile
} from '../../embeds/errors.js';

import {
    createNowPlayingEmbed,
    createAddedToQueueEmbed
} from '../../embeds/music.js';

import { getAttachmentAudio } from '../../utils/parser.js';

export async function execute(message, args, musicManager) {
    const voiceChannel = message.member?.voice?.channel;

    if (!voiceChannel) {
        return message.reply({
            embeds: [errorNoVoiceChannel()]
        });
    }

    const attachment = getAttachmentAudio(message.attachments);

    let query = args.join(' ').trim();

    if (!query && attachment) {
        query = attachment.url;
    }

    if (!query) {
        return message.reply({
            embeds: [errorNoQuery()]
        });
    }

    try {
        const result = await musicManager.play(
            voiceChannel,
            query,
            {
                requestedBy: message.author
            }
        );

        const track = result?.track;

        if (!track) {
            return message.reply({
                embeds: [errorPlayback()]
            });
        }

        const queue = musicManager.getQueue(message.guild.id);

        const isPlaying = queue?.isPlaying?.() ?? false;
        const queueSize = musicManager.getQueueSize(
            message.guild.id
        );

        if (isPlaying && queueSize > 0) {
            return message.reply({
                embeds: [
                    createAddedToQueueEmbed(
                        track,
                        queueSize,
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
        console.error('Error en -play:', error);

        return message.reply({
            embeds: [errorPlayback()]
        });
    }
}