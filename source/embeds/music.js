import { EmbedBuilder } from 'discord.js';

import { config } from '../utils/config.js';
import { formatDuration, truncate } from '../utils/formatters.js';

export function createNowPlayingEmbed(track, username) {
    const duration = track.duration
        ? formatDuration(track.duration)
        : 'En vivo';

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Reproduciendo ahora')
        .setDescription(
            `**[${truncate(track.title, 200)}](${track.url})**`
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
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}

export function createAddedToQueueEmbed(
    track,
    position,
    username
) {
    const duration = track.duration
        ? formatDuration(track.duration)
        : 'En vivo';

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Añadido a la cola')
        .setDescription(
            `**[${truncate(track.title, 200)}](${track.url})**`
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
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}