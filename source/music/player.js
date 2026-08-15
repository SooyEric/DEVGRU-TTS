import {
    Player,
    QueryType
} from 'discord-player';

import {
    logger
} from '../utils/logger.js';

export class MusicPlayer {
    constructor(client) {
        this.player =
            new Player(client);

        this.playLocks =
            new Map();

        this.setupEvents();
    }

    setupEvents() {
        this.player.events.on(
            'playerStart',
            (queue, track) => {
                logger.info(
                    `▶️ Reproduciendo: ${track.title}`
                );
            }
        );

        this.player.events.on(
            'audioTrackAdd',
            (queue, track) => {
                logger.info(
                    `➕ Track añadido: ${track.title}`
                );
            }
        );

        this.player.events.on(
            'playerFinish',
            (queue, track) => {
                logger.info(
                    `⏹️ Finalizó: ${track.title}`
                );
            }
        );

        this.player.events.on(
            'error',
            (queue, error) => {
                logger.error(
                    'Error del reproductor:',
                    error
                );
            }
        );

        this.player.events.on(
            'playerError',
            (queue, error) => {
                logger.error(
                    'Error reproduciendo audio:',
                    error
                );
            }
        );

        this.player.events.on(
            'disconnect',
            queue => {
                logger.info(
                    `🔌 Música desconectada en ${queue.guild.id}.`
                );
            }
        );
    }

    async play(
        voiceChannel,
        query,
        metadata = {}
    ) {
        const guildId =
            voiceChannel.guild.id;

        const previous =
            this.playLocks.get(guildId) ||
            Promise.resolve();

        const current =
            previous
                .catch(() => {})
                .then(
                    () =>
                        this.executePlay(
                            voiceChannel,
                            query,
                            metadata
                        )
                );

        this.playLocks.set(
            guildId,
            current
        );

        try {
            return await current;
        } finally {
            if (
                this.playLocks.get(
                    guildId
                ) === current
            ) {
                this.playLocks.delete(
                    guildId
                );
            }
        }
    }

    async executePlay(
        voiceChannel,
        query,
        metadata = {}
    ) {
        const result =
            await this.player.play(
                voiceChannel,
                query,
                {
                    searchEngine:
                        QueryType.AUTO,

                    nodeOptions: {
                        metadata,

                        leaveOnEmpty: false,
                        leaveOnEnd: false,
                        leaveOnStop: false,

                        bufferingTimeout: 10000,

                        skipOnNoStream: true,

                        volume: 100
                    }
                }
            );

        if (result?.track) {
            logger.info(
                `Track encontrado: ${result.track.title}`
            );

            logger.info(
                `Duración: ${result.track.duration}`
            );
        }

        return result;
    }

    getQueue(guildId) {
        return this.player.nodes.get(
            guildId
        );
    }

    getCurrentTrack(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.currentTrack ?? null;
    }

    getTracks(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.tracks.toArray() ?? [];
    }

    getQueueSize(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.tracks.size ?? 0;
    }

    isPlaying(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.isPlaying();
    }

    isPaused(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.isPaused();
    }

    skip(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        if (!queue.node.isPlaying()) {
            return false;
        }

        queue.node.skip();

        return true;
    }

    pause(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(true);
    }

    resume(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(false);
    }

    stop(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        queue.delete();

        return true;
    }

    destroy(guildId) {
        return this.stop(guildId);
    }

    isConnected(guildId) {
        const queue =
            this.getQueue(guildId);

        return Boolean(queue);
    }
}