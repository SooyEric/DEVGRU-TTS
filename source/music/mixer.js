import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} from '@discordjs/voice';

export class AudioMixer {
    constructor() {
        this.connections = new Map();
        this.players = new Map();
        this.resources = new Map();
    }

    async connect(voiceChannel) {
        const guildId =
            voiceChannel.guild.id;

        let connection =
            this.connections.get(guildId);

        if (connection) {
            const currentChannel =
                connection.joinConfig.channelId;

            if (
                currentChannel === voiceChannel.id
            ) {
                return connection;
            }

            connection.destroy();
            this.connections.delete(
                guildId
            );
        }

        connection =
            joinVoiceChannel({
                channelId:
                    voiceChannel.id,

                guildId,

                adapterCreator:
                    voiceChannel.guild
                        .voiceAdapterCreator,

                selfDeaf: true,
                selfMute: false
            });

        await entersState(
            connection,
            VoiceConnectionStatus.Ready,
            15_000
        );

        this.connections.set(
            guildId,
            connection
        );

        return connection;
    }

    getPlayer(guildId) {
        let player =
            this.players.get(guildId);

        if (player) {
            return player;
        }

        player =
            createAudioPlayer({
                behaviors: {
                    noSubscriber:
                        NoSubscriberBehavior.Play
                }
            });

        this.players.set(
            guildId,
            player
        );

        return player;
    }

    async attach(voiceChannel) {
        const guildId =
            voiceChannel.guild.id;

        const connection =
            await this.connect(
                voiceChannel
            );

        const player =
            this.getPlayer(guildId);

        connection.subscribe(
            player
        );

        return {
            connection,
            player
        };
    }

    play(
        guildId,
        stream,
        options = {}
    ) {
        const player =
            this.players.get(
                guildId
            );

        if (!player) {
            throw new Error(
                'El mixer no está conectado.'
            );
        }

        const resource =
            createAudioResource(
                stream,
                {
                    inputType:
                        options.inputType ??
                        StreamType.Raw,

                    inlineVolume:
                        options.inlineVolume ??
                        false
                }
            );

        this.resources.set(
            guildId,
            resource
        );

        player.play(
            resource
        );

        return resource;
    }

    stop(guildId) {
        const player =
            this.players.get(guildId);

        if (!player) {
            return false;
        }

        player.stop();

        this.resources.delete(
            guildId
        );

        return true;
    }

    disconnect(guildId) {
        const player =
            this.players.get(guildId);

        if (player) {
            player.stop();
        }

        const connection =
            this.connections.get(guildId);

        if (connection) {
            connection.destroy();
        }

        this.players.delete(
            guildId
        );

        this.connections.delete(
            guildId
        );

        this.resources.delete(
            guildId
        );

        return true;
    }

    isConnected(guildId) {
        return this.connections.has(
            guildId
        );
    }

    getConnection(guildId) {
        return this.connections.get(
            guildId
        );
    }

    getPlayerInstance(guildId) {
        return this.players.get(
            guildId
        );
    }
}