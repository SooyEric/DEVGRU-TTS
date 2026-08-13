import { EmbedBuilder } from 'discord.js';

import { config } from '../utils/config.js';
import { formatDuration, truncate } from '../utils/formatters.js';

export function createQueueEmbed(
    currentTrack,
    tracks,
    page = 1,
    totalPages = 1
) {
    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('📋 Cola de reproducción');

    if (currentTrack) {
        embed.addFields({
            name: '🎵 Reproduciendo ahora',
            value: `**${truncate(
                currentTrack.title,
                200
            )}**`,
            inline: false
        });
    }

    if (!tracks || tracks.length === 0) {
        embed.setDescription(
            'No hay canciones pendientes en la cola.'
        );
    } else {
        const list = tracks
            .map((track, index) => {
                const duration = track.duration
                    ? formatDuration(track.duration)
                    : 'En vivo';

                return `**${index + 1}.** ${truncate(
                    track.title,
                    150
                )} — \`${duration}\``;
            })
            .join('\n');

        embed.setDescription(list);
    }

    embed.setFooter({
        text: `Página ${page}/${totalPages}`
    });

    return embed;
}