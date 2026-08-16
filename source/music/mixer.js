import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} from '@discordjs/voice';

import {
    PassThrough
} from 'node:stream';

export class AudioMixer {
    constructor() {
        this.connections = new Map();
        this.players = new Map();
        this.streams = new Map();
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

        try {
            await entersState(
                connection,
                VoiceConnectionStatus.Ready,
                15_000
            );
        } catch (error) {
            connection.destroy();
            throw error;
        }

        this.connections.set(
            guildId,
            connection
        );

        return connection;
    }

    async attach(voiceChannel) {
        const guildId =
            voiceChannel.guild.id;

        const connection =
            await this.connect(
                voiceChannel
            );

        let player =
            this.players.get(guildId);

        if (!player) {
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
        }

        connection.subscribe(
            player
        );

        return {
            connection,
            player
        };
    }

    createStream(guildId) {
        let stream =
            this.streams.get(guildId);

        if (stream) {
            return stream;
        }

        stream =
            new PassThrough();

        this.streams.set(
            guildId,
            stream
        );

        return stream;
    }

    playStream(
        voiceChannel,
        stream
    ) {
        return this.attach(
            voiceChannel
        ).then(
            ({ player }) => {
                const guildId =
                    voiceChannel.guild.id;

                const resource =
                    createAudioResource(
                        stream,
                        {
                            inputType:
                                StreamType.Raw
                        }
                    );

                player.play(
                    resource
                );

                this.streams.set(
                    guildId,
                    stream
                );

                return resource;
            }
        );
    }

    stop(guildId) {
        const player =
            this.players.get(
                guildId
            );

        if (!player) {
            return false;
        }

        player.stop();

        return true;
    }

    disconnect(guildId) {
        const player =
            this.players.get(
                guildId
            );

        if (player) {
            player.stop();
        }

        const stream =
            this.streams.get(
                guildId
            );

        if (stream) {
            stream.destroy();
        }

        const connection =
            this.connections.get(
                guildId
            );

        if (connection) {
            connection.destroy();
        }

        this.players.delete(
            guildId
        );

        this.streams.delete(
            guildId
        );

        this.connections.delete(
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

    getPlayer(guildId) {
        return this.players.get(
            guildId
        );
    }
}