import { MusicPlayer } from './player.js';
import { MusicQueue } from './queue.js';
import { registerExtractors } from './sources/index.js';

import { logger } from '../utils/logger.js';

export class MusicManager {
    constructor(client) {
        this.player =
            new MusicPlayer(client);

        this.queue =
            new MusicQueue(
                this.player
            );

        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        logger.info(
            'Inicializando sistema de música...'
        );

        await registerExtractors(
            this.player.player
        );

        this.initialized = true;

        logger.success(
            'Sistema de música inicializado.'
        );
    }

    async play(
        voiceChannel,
        query,
        metadata = {}
    ) {
        return this.player.play(
            voiceChannel,
            query,
            metadata
        );
    }

    skip(guildId) {
        return this.player.skip(
            guildId
        );
    }

    getQueue(guildId) {
        return this.queue.get(
            guildId
        );
    }

    getCurrentTrack(guildId) {
        return this.queue.getCurrent(
            guildId
        );
    }

    getTracks(guildId) {
        return this.queue.getTracks(
            guildId
        );
    }

    getQueueSize(guildId) {
        return this.queue.getSize(
            guildId
        );
    }

    isPlaying(guildId) {
        return this.queue.isPlaying(
            guildId
        );
    }

    pause(guildId) {
        return this.player.pause(
            guildId
        );
    }

    resume(guildId) {
        return this.player.resume(
            guildId
        );
    }

    stop(guildId) {
        return this.player.stop(
            guildId
        );
    }

    destroy(guildId) {
        return this.player.destroy(
            guildId
        );
    }

    isConnected(guildId) {
        return this.player.isConnected(
            guildId
        );
    }

    getMixer(guildId) {
        return this.player.getMixer(
            guildId
        );
    }

    getConnection(guildId) {
        return this.player.getConnection(
            guildId
        );
    }

    getVoicePlayer(guildId) {
        return this.player.getVoicePlayer(
            guildId
        );
    }
}