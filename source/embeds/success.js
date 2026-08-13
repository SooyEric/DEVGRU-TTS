import { EmbedBuilder } from 'discord.js';

import { config } from '../utils/config.js';
import { truncate } from '../utils/formatters.js';

function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`✅ ${title}`)
        .setDescription(description);
}

export function successSkipped(track) {
    if (!track) {
        return createSuccessEmbed(
            'Canción omitida',
            'La canción actual fue omitida.'
        );
    }

    return createSuccessEmbed(
        'Canción omitida',
        `Se omitió **${truncate(
            track.title,
            200
        )}**.`
    );
}

export function successStopped() {
    return createSuccessEmbed(
        'Reproducción detenida',
        'La reproducción fue detenida.'
    );
}