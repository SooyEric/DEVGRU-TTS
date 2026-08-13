import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState
} from '@discordjs/voice';

import { createReadStream } from 'node:fs';
import { deleteTTSDirectory } from './engine.js';
import { logger } from '../utils/logger.js';

export class TTSPlayer {
    constructor() {
        this.players = new Map();
        this.connections = new Map();
    }

    async connect(voiceChannel) {
        if (!voiceChannel) {
            throw new Error('No se proporcionó un canal de voz.');
        }

        const guildId = voiceChannel.guild.id;

        const existingConnection = this.connections.get(guildId);

        if (existingConnection) {
            const currentChannelId = existingConnection.joinConfig.channelId;

            if (currentChannelId === voiceChannel.id) {
                return existingConnection;
            }

            existingConnection.destroy();
            this.connections.delete(guildId);
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
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

            throw new Error(
                `No se pudo conectar al canal de voz: ${error.message}`
            );
        }

        this.connections.set(guildId, connection);

        return connection;
    }

    getPlayer(guildId) {
        let player = this.players.get(guildId);

        if (!player) {
            player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Stop
                }
            });

            this.players.set(guildId, player);
        }

        return player;
    }

    async play(voiceChannel, audioPath) {
        if (!audioPath) {
            throw new Error('No se proporcionó un archivo TTS.');
        }

        const guildId = voiceChannel.guild.id;

        const connection = await this.connect(voiceChannel);
        const player = this.getPlayer(guildId);

        connection.subscribe(player);

        const resource = createAudioResource(
            createReadStream(audioPath),
            {
                inlineVolume: false
            }
        );

        return new Promise((resolve, reject) => {
            let finished = false;

            const cleanup = async () => {
                if (finished) {
                    return;
                }

                finished = true;

                player.removeListener(
                    AudioPlayerStatus.Idle,
                    onIdle
                );

                player.removeListener(
                    'error',
                    onError
                );

                await deleteTTSDirectory(audioPath);
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

            logger.info(
                `Reproduciendo TTS en ${voiceChannel.name}.`
            );
        });
    }

    stop(guildId) {
        const player = this.players.get(guildId);

        if (!player) {
            return false;
        }

        player.stop();

        return true;
    }

    disconnect(guildId) {
        const connection = this.connections.get(guildId);

        if (!connection) {
            return false;
        }

        connection.destroy();

        this.connections.delete(guildId);
        this.players.delete(guildId);

        return true;
    }

    getConnection(guildId) {
        return this.connections.get(guildId) || null;
    }

    isConnected(guildId) {
        return this.connections.has(guildId);
    }
}