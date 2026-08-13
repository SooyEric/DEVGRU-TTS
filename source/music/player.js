import { Player } from 'discord-player';
import { logger } from '../utils/logger.js';

export class MusicPlayer {
    constructor(client) {
        this.client = client;

        this.player = new Player(client, {
            skipFFmpeg: false
        });

        this.setupEvents();
    }

    setupEvents() {
        this.player.events.on('playerStart', (queue, track) => {
            logger.info(
                `Reproduciendo "${track.title}" en ${queue.guild.name}`
            );
        });

        this.player.events.on('playerFinish', (queue, track) => {
            logger.info(
                `Finalizó "${track.title}" en ${queue.guild.name}`
            );
        });

        this.player.events.on('playerSkip', (queue, track) => {
            logger.info(
                `Se omitió "${track.title}" en ${queue.guild.name}`
            );
        });

        this.player.events.on('emptyQueue', queue => {
            logger.info(
                `La cola de ${queue.guild.name} está vacía`
            );
        });

        this.player.events.on('emptyChannel', queue => {
            logger.info(
                `El canal de voz quedó vacío en ${queue.guild.name}`
            );
        });

        this.player.events.on('error', (queue, error) => {
            logger.error(
                `Error en la cola de ${queue.guild.name}`,
                error
            );
        });

        this.player.events.on('playerError', (queue, error, track) => {
            logger.error(
                `Error reproduciendo "${track?.title || 'desconocido'}"`,
                error
            );
        });
    }

    async play(voiceChannel, query, metadata = {}) {
        if (!voiceChannel) {
            throw new Error('No se proporcionó un canal de voz.');
        }

        if (!query) {
            throw new Error('No se proporcionó una canción.');
        }

        const result = await this.player.play(
            voiceChannel,
            query,
            {
                nodeOptions: {
                    metadata,

                    leaveOnEnd: true,
                    leaveOnEndCooldown: 15000,

                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 30000,

                    leaveOnStop: true,
                    leaveOnStopCooldown: 5000,

                    selfDeaf: true,

                    disableHistory: true,

                    skipOnNoStream: true
                }
            }
        );

        return result;
    }

    getQueue(guildId) {
        return this.player.nodes.get(guildId);
    }

    getOrCreateQueue(guildId, options = {}) {
        return this.player.nodes.create(guildId, {
            ...options
        });
    }

    skip(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        if (!queue.isPlaying()) {
            return false;
        }

        return queue.node.skip();
    }

    isPlaying(guildId) {
        const queue = this.getQueue(guildId);

        return Boolean(queue?.isPlaying());
    }

    getCurrentTrack(guildId) {
        const queue = this.getQueue(guildId);

        return queue?.currentTrack || null;
    }

    getTracks(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return [];
        }

        return queue.tracks.toArray();
    }

    getQueueSize(guildId) {
        const queue = this.getQueue(guildId);

        return queue?.tracks.size || 0;
    }

    async destroy(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        queue.delete();

        return true;
    }
}