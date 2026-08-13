import { EmbedBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { formatDuration, truncate } from '../utils/formatters.js';

function getTrackDuration(track) {
    if (!track?.duration) {
        return null;
    }

    if (typeof track.duration === 'number') {
        return formatDuration(track.duration);
    }

    if (typeof track.duration === 'string') {
        return track.duration;
    }

    return null;
}

function getTrackAuthor(track) {
    return track?.author || track?.artist || 'Desconocido';
}

export function createNowPlayingEmbed(track, requester = null) {
    const duration = getTrackDuration(track);

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Reproduciendo ahora')
        .setDescription(
            `**${truncate(track?.title || 'Canción desconocida', 256)}**`
        )
        .addFields({
            name: 'Artista',
            value: truncate(getTrackAuthor(track), 1024),
            inline: true
        });

    if (duration) {
        embed.addFields({
            name: 'Duración',
            value: duration,
            inline: true
        });
    }

    if (track?.url) {
        embed.setURL(track.url);
    }

    if (track?.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    if (requester) {
        embed.setFooter({
            text: `Solicitado por ${requester}`
        });
    }

    return embed;
}

export function createAddedToQueueEmbed(
    track,
    position,
    requester = null
) {
    const duration = getTrackDuration(track);

    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Añadido a la cola')
        .setDescription(
            `**${truncate(track?.title || 'Canción desconocida', 256)}**`
        )
        .addFields({
            name: 'Posición',
            value: `#${position}`,
            inline: true
        });

    if (duration) {
        embed.addFields({
            name: 'Duración',
            value: duration,
            inline: true
        });
    }

    if (track?.url) {
        embed.setURL(track.url);
    }

    if (track?.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    if (requester) {
        embed.setFooter({
            text: `Solicitado por ${requester}`
        });
    }

    return embed;
}

export function createPlaylistAddedEmbed(
    playlist,
    tracks,
    requester = null
) {
    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Playlist añadida')
        .setDescription(
            `**${truncate(
                playlist?.title || 'Playlist',
                256
            )}**`
        )
        .addFields({
            name: 'Canciones',
            value: `${tracks || 0}`,
            inline: true
        });

    if (playlist?.thumbnail) {
        embed.setThumbnail(playlist.thumbnail);
    }

    if (requester) {
        embed.setFooter({
            text: `Solicitado por ${requester}`
        });
    }

    return embed;
}

export function createMusicStatusEmbed({
    track,
    queueSize = 0,
    paused = false
}) {
    const embed = new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🎵 Música');

    if (!track) {
        embed.setDescription('No hay ninguna canción reproduciéndose.');
        return embed;
    }

    embed.setDescription(
        `**${truncate(track.title || 'Canción desconocida', 256)}**`
    );

    embed.addFields(
        {
            name: 'Artista',
            value: truncate(getTrackAuthor(track), 1024),
            inline: true
        },
        {
            name: 'Estado',
            value: paused ? '⏸️ Pausado' : '▶️ Reproduciendo',
            inline: true
        },
        {
            name: 'En cola',
            value: `${queueSize}`,
            inline: true
        }
    );

    if (track.url) {
        embed.setURL(track.url);
    }

    if (track.thumbnail) {
        embed.setThumbnail(track.thumbnail);
    }

    return embed;
}