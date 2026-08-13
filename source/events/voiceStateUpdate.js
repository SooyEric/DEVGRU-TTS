export default async function voiceStateUpdate(
    oldState,
    newState,
    client
) {
    const botId =
        client.user.id;

    if (
        oldState.id !== botId ||
        newState.channel
    ) {
        return;
    }

    const guildId =
        oldState.guild.id;

    if (
        client.musicManager
            .isConnected(guildId)
    ) {
        client.musicManager
            .destroy(guildId);
    }

    if (
        client.ttsManager
            .isConnected(guildId)
    ) {
        client.ttsManager
            .disconnect(guildId);
    }
}