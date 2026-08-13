import { EmbedBuilder } from 'discord.js';

import { config } from '../utils/config.js';

function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(config.color)
        .setTitle(`❌ ${title}`)
        .setDescription(description);
}

export function errorNoVoiceChannel() {
    return createErrorEmbed(
        'Canal de voz requerido',
        'Debes estar conectado a un canal de voz para utilizar este comando.'
    );
}

export function errorNoQuery() {
    return createErrorEmbed(
        'Falta la canción',
        'Debes indicar una canción, URL o adjuntar un archivo de audio.'
    );
}

export function errorPlayback() {
    return createErrorEmbed(
        'Error de reproducción',
        'No pude reproducir esa canción o archivo de audio.'
    );
}

export function errorNothingPlaying() {
    return createErrorEmbed(
        'Nada está reproduciéndose',
        'Actualmente no hay ninguna canción reproduciéndose.'
    );
}

export function errorInvalidFile() {
    return createErrorEmbed(
        'Archivo no válido',
        'El archivo adjunto no es un formato de audio compatible.'
    );
}

export function errorNotFound() {
    return createErrorEmbed(
        'No encontrado',
        'No pude encontrar resultados para tu búsqueda.'
    );
}