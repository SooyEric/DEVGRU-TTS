import {
    EmbedBuilder
} from 'discord.js';

import {
    config
} from '../utils/config.js';

import {
    formatDuration,
    truncate
} from '../utils/formatters.js';

function getTrackDuration(track) {
    /*
     * Primero intentamos utilizar duration.
     */
    if (
        track?.duration &&
        track.duration !== '00:00'
    ) {
        return track.duration;
    }

    /*
     * Si duration no existe, utilizamos
     * durationMS.
     */
    if (
        Number.isFinite(
            track?.durationMS
        ) &&
        track.durationMS > 0
    ) {
        return formatDuration(
            track.durationMS
        );
    }

    /*
     * Si tampoco existe duración,
     * probablemente sea un stream en vivo.
     */
    return 'En vivo';
}

export function createNowPlayingEmbed(
    track,
    username
) {
    const duration =
        getTrackDuration(track);

    const embed =
        new EmbedBuilder()
            .setColor(config.color)
            .setTitle(
                '🎵 Reproduciendo ahora'
            )
            .setDescription(
                `**[${truncate(
                    track.title,
                    200
                )}](${track.url})**`
            )
            .addFields(
                {
                    name: 'Duración',
                    value: duration,
                    inline: true
                },
                {
                    name: 'Solicitado por',
                    value: username,
                    inline: true
                }
            );

    if (track.thumbnail) {
        embed.setThumbnail(
            track.thumbnail
        );
    }

    return embed;
}

export function createAddedToQueueEmbed(
    track,
    position,
    username
) {
    const duration =
        getTrackDuration(track);

    const embed =
        new EmbedBuilder()
            .setColor(config.color)
            .setTitle(
                '🎵 Añadido a la cola'
            )
            .setDescription(
                `**[${truncate(
                    track.title,
                    200
                )}](${track.url})**`
            )
            .addFields(
                {
                    name: 'Posición',
                    value: `#${position}`,
                    inline: true
                },
                {
                    name: 'Duración',
                    value: duration,
                    inline: true
                },
                {
                    name: 'Solicitado por',
                    value: username,
                    inline: true
                }
            );

    if (track.thumbnail) {
        embed.setThumbnail(
            track.thumbnail
        );
    }

    return embed;
}