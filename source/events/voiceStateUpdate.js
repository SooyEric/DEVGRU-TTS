const leaveTimers = new Map();

const LEAVE_DELAY = 30_000;

export default async function voiceStateUpdate(
    oldState,
    newState,
    client
) {
    const guild =
        newState.guild || oldState.guild;

    if (!guild) {
        return;
    }

    const botMember =
        guild.members.me;

    if (!botMember) {
        return;
    }

    const botChannel =
        botMember.voice.channel;

    if (!botChannel) {
        return;
    }

    const botChannelId =
        botChannel.id;

    if (
        oldState.id === client.user.id &&
        !newState.channel
    ) {
        const timer =
            leaveTimers.get(botChannelId);

        if (timer) {
            clearTimeout(timer);

            leaveTimers.delete(
                botChannelId
            );
        }

        return;
    }
    
    if (
        oldState.channelId ===
        newState.channelId
    ) {
        return;
    }

    const member =
        newState.member ||
        oldState.member;

    if (!member || member.user.bot) {
        return;
    }

    if (
        newState.channelId ===
        botChannelId
    ) {
        const timer =
            leaveTimers.get(botChannelId);

        if (timer) {
            clearTimeout(timer);

            leaveTimers.delete(
                botChannelId
            );

            console.log(
                '[VOICE] Un usuario volvió al VC. Temporizador cancelado.'
            );
        }

        return;
    }

    if (
        oldState.channelId !==
        botChannelId
    ) {
        return;
    }

    const humans =
        botChannel.members.filter(
            voiceMember =>
                !voiceMember.user.bot
        );

    if (humans.size > 0) {
        return;
    }

    if (
        leaveTimers.has(botChannelId)
    ) {
        return;
    }

    console.log(
        '[VOICE] El bot quedó solo. Saldrá en 30 segundos.'
    );

    const timer = setTimeout(
        async () => {
            leaveTimers.delete(
                botChannelId
            );

            const currentBotChannel =
                guild.members.me?.voice.channel;

            if (
                !currentBotChannel ||
                currentBotChannel.id !==
                    botChannelId
            ) {
                return;
            }

            const currentHumans =
                currentBotChannel.members.filter(
                    voiceMember =>
                        !voiceMember.user.bot
                );

            if (currentHumans.size > 0) {
                return;
            }

            console.log(
                '[VOICE] Pasaron 30 segundos sin usuarios. Desconectando DEVGRU-TTS.'
            );

            try {

                const guildId =
                    guild.id;

                if (
                    client.ttsManager
                        ?.isConnected(guildId)
                ) {
                    client.ttsManager
                        .disconnect(guildId);
                }
                
                if (
                    guild.members.me?.voice
                        .channel
                ) {
                    await guild.members.me.voice
                        .disconnect();
                }
            } catch (error) {
                console.error(
                    '[VOICE] Error al desconectar el bot:',
                    error
                );
            }
        },
        LEAVE_DELAY
    );

    leaveTimers.set(
        botChannelId,
        timer
    );
}