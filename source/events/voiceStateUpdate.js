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

    /*
     * El bot no está conectado a ningún VC.
     */
    if (!botChannel) {
        return;
    }

    const botChannelId =
        botChannel.id;

    /*
     * Si el propio bot salió del VC,
     * limpiamos cualquier temporizador.
     */
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

    /*
     * Ignoramos cambios que no involucren
     * entrar/salir/cambiar de canal.
     */
    if (
        oldState.channelId ===
        newState.channelId
    ) {
        return;
    }

    /*
     * Solo nos interesa gente entrando,
     * saliendo o cambiando de canal.
     *
     * Los bots no cuentan como personas.
     */
    const member =
        newState.member ||
        oldState.member;

    if (!member || member.user.bot) {
        return;
    }

    /*
     * ─────────────────────────────
     * ALGUIEN ENTRA AL VC DEL BOT
     * ─────────────────────────────
     */

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

    /*
     * ─────────────────────────────
     * ALGUIEN SALE DEL VC DEL BOT
     * ─────────────────────────────
     */

    if (
        oldState.channelId !==
        botChannelId
    ) {
        return;
    }

    /*
     * Comprobamos cuántos usuarios humanos
     * quedan actualmente en el VC.
     */
    const humans =
        botChannel.members.filter(
            voiceMember =>
                !voiceMember.user.bot
        );

    /*
     * Todavía queda alguien.
     * No hacemos nada.
     */
    if (humans.size > 0) {
        return;
    }

    /*
     * Ya existe un temporizador.
     */
    if (
        leaveTimers.has(botChannelId)
    ) {
        return;
    }

    console.log(
        '[VOICE] El bot quedó solo. Saldrá en 30 segundos.'
    );

    /*
     * ─────────────────────────────
     * TEMPORIZADOR DE 30 SEGUNDOS
     * ─────────────────────────────
     */

    const timer = setTimeout(
        async () => {
            leaveTimers.delete(
                botChannelId
            );

            /*
             * Volvemos a obtener el canal
             * actual del bot.
             */
            const currentBotChannel =
                guild.members.me?.voice.channel;

            /*
             * El bot ya no está en ese canal.
             */
            if (
                !currentBotChannel ||
                currentBotChannel.id !==
                    botChannelId
            ) {
                return;
            }

            /*
             * Comprobamos nuevamente que
             * no haya usuarios humanos.
             */
            const currentHumans =
                currentBotChannel.members.filter(
                    voiceMember =>
                        !voiceMember.user.bot
                );

            /*
             * Alguien volvió durante los
             * últimos 30 segundos.
             */
            if (currentHumans.size > 0) {
                return;
            }

            console.log(
                '[VOICE] Pasaron 30 segundos sin usuarios. Desconectando DEVGRU-TTS.'
            );

            try {
                /*
                 * Música
                 */
                const guildId =
                    guild.id;

                if (
                    client.musicManager
                        ?.isConnected(guildId)
                ) {
                    client.musicManager
                        .destroy(guildId);
                }

                /*
                 * TTS
                 */
                if (
                    client.ttsManager
                        ?.isConnected(guildId)
                ) {
                    client.ttsManager
                        .disconnect(guildId);
                }

                /*
                 * Desconexión física del bot.
                 */
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