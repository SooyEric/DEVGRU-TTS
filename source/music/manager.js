import { MusicPlayer } from './player.js';
import { registerExtractors } from './sources/index.js';
import { logger } from '../utils/logger.js';

export class MusicManager {
    constructor(client) {
        this.client = client;
        this.musicPlayer = new MusicPlayer(client);
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        logger.info('Inicializando sistema de música...');

        await registerExtractors(this.musicPlayer.player);

        this.initialized = true;

        logger.success('Sistema de música inicializado.');
    }

    async play(voiceChannel, query, metadata = {}) {
        if (!this.initialized) {
            throw new Error(
                'El sistema de música todavía no ha sido inicializado.'
            );
        }

        return await this.musicPlayer.play(
            voiceChannel,
            query,
            metadata
        );
    }

    skip(guildId) {
        return this.musicPlayer.skip(guildId);
    }

    getQueue(guildId) {
        return this.musicPlayer.getQueue(guildId);
    }

    getCurrentTrack(guildId) {
        return this.musicPlayer.getCurrentTrack(guildId);
    }

    getTracks(guildId) {
        return this.musicPlayer.getTracks(guildId);
    }

    getQueueSize(guildId) {
        return this.musicPlayer.getQueueSize(guildId);
    }

    isPlaying(guildId) {
        return this.musicPlayer.isPlaying(guildId);
    }

    async destroy(guildId) {
        return await this.musicPlayer.destroy(guildId);
    }
}