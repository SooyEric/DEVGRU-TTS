import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel
} from '@discordjs/voice';

import {
    createReadStream
} from 'node:fs';

import {
    deleteTTSFile
} from './engine.js';

export class TTSPlayer {
    constructor() {
        this.connections = new Map();
        this.players = new Map();
    }

    async connect(voiceChannel) {
        const guildId = voiceChannel.guild.id;

        const existing =
            this.connections.get(guildId);

        if (existing) {
            const currentChannel =
                existing.joinConfig.channelId;

            if (
                currentChannel === voiceChannel.id
            ) {
                return existing;
            }

            existing.destroy();
            this.connections.delete(guildId);
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
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

    getPlayer(guildId) {
        let player =
            this.players.get(guildId);

        if (player) {
            return player;
        }

        player = createAudioPlayer({
            behaviors: {
                noSubscriber:
                    NoSubscriberBehavior.Stop
            }
        });

        this.players.set(
            guildId,
            player
        );

        return player;
    }

    async play(voiceChannel, filePath) {
        const guildId =
            voiceChannel.guild.id;

        const connection =
            await this.connect(voiceChannel);

        const player =
            this.getPlayer(guildId);

        connection.subscribe(player);

        const resource =
            createAudioResource(
                createReadStream(filePath),
                {
                    metadata: {
                        filePath
                    }
                }
            );

        return new Promise(
            (resolve, reject) => {
                const cleanup = async () => {
                    player.removeListener(
                        AudioPlayerStatus.Idle,
                        onIdle
                    );

                    player.removeListener(
                        'error',
                        onError
                    );

                    await deleteTTSFile(
                        filePath
                    );
                };

                const onIdle = async () => {
                    await cleanup();
                    resolve();
                };

                const onError = async error => {
                    await cleanup();
                    reject(error);
                };

                player.once(
                    AudioPlayerStatus.Idle,
                    onIdle
                );

                player.once(
                    'error',
                    onError
                );

                player.play(resource);
            }
        );
    }

    stop(guildId) {
        const player =
            this.players.get(guildId);

        if (!player) {
            return false;
        }

        player.stop();

        return true;
    }

    disconnect(guildId) {
        const connection =
            this.connections.get(guildId);

        if (connection) {
            connection.destroy();
        }

        this.connections.delete(guildId);
        this.players.delete(guildId);

        return true;
    }

    isConnected(guildId) {
        return this.connections.has(guildId);
    }
}