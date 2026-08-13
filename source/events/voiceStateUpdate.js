export default async function voiceStateUpdate(
    oldState,
    newState,
    client
) {
    const guildId = newState.guild.id;

    const musicConnected =
        client.musicManager.isConnected(guildId);

    const ttsConnected =
        client.ttsManager.isConnected(guildId);

    if (!musicConnected && !ttsConnected) {
        return;
    }

    const botId = client.user.id;

    // El bot salió de un canal de voz.
    if (
        oldState.id === botId &&
        !newState.channel
    ) {
        client.musicManager.destroy(guildId);
        client.ttsManager.disconnect(guildId);

        return;
    }

    // Si el bot sigue conectado, no hacemos nada.
}