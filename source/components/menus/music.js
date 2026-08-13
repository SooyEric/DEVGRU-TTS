import {
    ActionRowBuilder,
    StringSelectMenuBuilder
} from 'discord.js';

export function createMusicMenu() {
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('music_menu')
            .setPlaceholder('Selecciona una opción')
            .addOptions(
                {
                    label: 'Pausar / continuar',
                    description: 'Controla la reproducción actual.',
                    value: 'pause',
                    emoji: '⏯️'
                },
                {
                    label: 'Siguiente canción',
                    description: 'Omite la canción actual.',
                    value: 'skip',
                    emoji: '⏭️'
                },
                {
                    label: 'Detener',
                    description: 'Detiene la reproducción.',
                    value: 'stop',
                    emoji: '⏹️'
                },
                {
                    label: 'Ver cola',
                    description: 'Muestra las canciones pendientes.',
                    value: 'queue',
                    emoji: '📋'
                }
            )
    );
}