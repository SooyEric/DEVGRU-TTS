import { EmbedBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { formatDuration, truncate } from '../utils/formatters.js';

export function createQueueEmbed(queue, currentTrack = null) {
    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Cola de reproducción');

    if (currentTrack) {
        embed.addFields({
            name: '▶️ Reproduciendo ahora',
            value: `**${truncate(currentTrack.title || 'Desconocido', 200)}**`,
            inline: false
        });
    }

    if (!queue || queue.length === 0) {
        embed.setDescription(
            currentTrack
                ? 'No hay más canciones en la cola.'
                : 'La cola está vacía.'
        );

        return embed;
    }

    const tracks = queue.slice(0, 10);

    const description = tracks
        .map((track, index) => {
            const duration = track?.duration
                ? typeof track.duration === 'number'
                    ? formatDuration(track.duration)
                    : track.duration
                : null;

            const durationText = duration
                ? ` \`[${duration}]\``
                : '';

            return `**${index + 1}.** ${truncate(
                track?.title || 'Canción desconocida',
                70
            )}${durationText}`;
        })
        .join('\n');

    embed.addFields({
        name: '📋 Próximas canciones',
        value: description,
        inline: false
    });

    if (queue.length > 10) {
        embed.setFooter({
            text: `Mostrando 10 de ${queue.length} canciones`
        });
    } else {
        embed.setFooter({
            text: `${queue.length} canción${queue.length === 1 ? '' : 'es'} en cola`
        });
    }

    return embed;
}