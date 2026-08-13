import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

export function createQueueButtons(
    currentPage = 0,
    totalPages = 1
) {
    const previousButton = new ButtonBuilder()
        .setCustomId(`queue_previous_${currentPage}`)
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 0);

    const nextButton = new ButtonBuilder()
        .setCustomId(`queue_next_${currentPage}`)
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages - 1);

    return new ActionRowBuilder().addComponents(
        previousButton,
        nextButton
    );
}