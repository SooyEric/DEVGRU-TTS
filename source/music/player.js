import {
    Player,
    QueryType
} from 'discord-player';

import { logger } from '../utils/logger.js';

export class MusicPlayer {
    constructor(client) {
        this.player = new Player(client);
    }

    async play(voiceChannel, query, metadata = {}) {
        const result = await this.player.play(
            voiceChannel,
            query,
            {
                searchEngine: QueryType.AUTO,
                nodeOptions: {
                    metadata,
                    leaveOnEmpty: false,
                    leaveOnEnd: false,
                    leaveOnStop: false
                }
            }
        );

        logger.info(
            `Reproduciendo "${result.track.title}".`
        );

        return result;
    }

    getQueue(guildId) {
        return this.player.nodes.get(guildId);
    }

    getCurrentTrack(guildId) {
        const queue = this.getQueue(guildId);

        return queue?.currentTrack ?? null;
    }

    getTracks(guildId) {
        const queue = this.getQueue(guildId);

        return queue?.tracks.toArray() ?? [];
    }

    getQueueSize(guildId) {
        const queue = this.getQueue(guildId);

        return queue?.tracks.size ?? 0;
    }

    isPlaying(guildId) {
        const queue = this.getQueue(guildId);

        return Boolean(
            queue &&
            queue.isPlaying()
        );
    }

    skip(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue || !queue.isPlaying()) {
            return false;
        }

        return queue.node.skip();
    }

    pause(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(true);
    }

    resume(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(false);
    }

    stop(guildId) {
        const queue = this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.delete();
    }

    destroy(guildId) {
        return this.stop(guildId);
    }

    isConnected(guildId) {
        const queue = this.getQueue(guildId);

        return Boolean(queue);
    }
}