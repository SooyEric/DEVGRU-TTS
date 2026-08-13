import { EmbedBuilder } from 'discord.js';
import { config } from '../utils/config.js';
import { truncate } from '../utils/formatters.js';

function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`✅ ${title}`)
        .setDescription(description);
}

export function successConnected(channelName) {
    return createSuccessEmbed(
        'Conectado',
        `Me conecté a **${truncate(channelName, 100)}**.`
    );
}

export function successSkipped(track = null) {
    if (track) {
        return createSuccessEmbed(
            'Canción omitida',
            `Se omitió **${truncate(track.title || 'la canción actual', 200)}**.`
        );
    }

    return createSuccessEmbed(
        'Canción omitida',
        'La canción actual fue omitida.'
    );
}

export function successQueueCleared() {
    return createSuccessEmbed(
        'Cola vaciada',
        'Se eliminaron todas las canciones pendientes de la cola.'
    );
}

export function successDisconnected() {
    return createSuccessEmbed(
        'Desconectado',
        'Me desconecté del canal de voz.'
    );
}

export function successTTS() {
    return createSuccessEmbed(
        'TTS',
        'El mensaje fue añadido a la cola de voz.'
    );
}