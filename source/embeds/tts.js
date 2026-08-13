import { EmbedBuilder } from 'discord.js';

import { config } from '../utils/config.js';
import { truncate } from '../utils/formatters.js';

export function createTTSPlayingEmbed(
    text,
    username
) {
    return new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🔊 TTS')
        .setDescription(
            `> ${truncate(text, 4000)}`
        )
        .setFooter({
            text: `Solicitado por ${username}`
        });
}

export function createTTSQueuedEmbed(
    text,
    username,
    position
) {
    return new EmbedBuilder()
        .setColor(config.color)
        .setTitle('🔊 TTS en cola')
        .setDescription(
            `> ${truncate(text, 4000)}`
        )
        .addFields({
            name: 'Posición',
            value: `#${position}`,
            inline: true
        })
        .setFooter({
            text: `Solicitado por ${username}`
        });
}