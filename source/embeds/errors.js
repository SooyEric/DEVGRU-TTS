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

export function errorDifferentVoiceChannel() {
    return createErrorEmbed(
        'Canal de voz incorrecto',
        'Debes estar en el mismo canal de voz que el bot para utilizar este comando.'
    );
}

export function errorNoQuery() {
    return createErrorEmbed(
        'Falta la canción',
        'Debes indicar una canción, URL o adjuntar un archivo de audio.'
    );
}

export function errorNoResults() {
    return createErrorEmbed(
        'Sin resultados',
        'No encontré ninguna canción que coincida con tu búsqueda.'
    );
}

export function errorPlayback() {
    return createErrorEmbed(
        'Error de reproducción',
        'No pude reproducir esa canción. Intenta nuevamente.'
    );
}

export function errorTTSNoVoice() {
    return createErrorEmbed(
        'Canal de voz requerido',
        'Debes estar conectado a un canal de voz para utilizar el TTS.'
    );
}

export function errorTTS() {
    return createErrorEmbed(
        'Error de TTS',
        'No pude generar el audio de ese mensaje. Intenta nuevamente.'
    );
}

export function errorEmptyQueue() {
    return createErrorEmbed(
        'Cola vacía',
        'No hay canciones en la cola actualmente.'
    );
}

export function errorNothingPlaying() {
    return createErrorEmbed(
        'Nada reproduciéndose',
        'No hay ninguna canción reproduciéndose actualmente.'
    );
}

export function errorInvalidFile() {
    return createErrorEmbed(
        'Archivo no compatible',
        'El archivo adjunto no es un formato de audio compatible.'
    );
}

export function errorGeneric() {
    return createErrorEmbed(
        'Ha ocurrido un error',
        'Ocurrió un error inesperado. Intenta nuevamente.'
    );
}