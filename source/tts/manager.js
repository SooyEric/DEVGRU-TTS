import { TTSQueue } from './queue.js';
import { TTSPlayer } from './player.js';
import {
    generateTTS,
    deleteTTSDirectory
} from './engine.js';

import { logger } from '../utils/logger.js';

export class TTSManager {
    constructor() {
        this.player = new TTSPlayer();
        this.queues = new Map();
    }

    getQueue(guildId) {
        let queue = this.queues.get(guildId);

        if (!queue) {
            queue = new TTSQueue(guildId);
            this.queues.set(guildId, queue);
        }

        return queue;
    }

    async handleMessage(message) {
        if (!message) {
            return;
        }

        if (message.author?.bot) {
            return;
        }

        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return;
        }

        const guildId = message.guild.id;
        const queue = this.getQueue(guildId);

        const item = {
            text: message.content.trim(),
            voiceChannel,
            userId: message.author.id,
            username: message.author.username
        };

        if (!item.text) {
            return;
        }

        queue.add(item);

        logger.info(
            `Mensaje TTS agregado por ${item.username} en ${message.guild.name}.`
        );

        if (!queue.isProcessing) {
            await this.processQueue(guildId);
        }
    }

    async processQueue(guildId) {
        const queue = this.queues.get(guildId);

        if (!queue || queue.isProcessing) {
            return;
        }

        queue.setProcessing(true);

        try {
            while (!queue.isEmpty) {
                const item = queue.next();

                if (!item) {
                    continue;
                }

                await this.processItem(item);
            }
        } catch (error) {
            logger.error(
                `Error procesando la cola TTS de ${guildId}.`,
                error
            );
        } finally {
            queue.setProcessing(false);

            if (queue.isEmpty) {
                this.queues.delete(guildId);
            }
        }
    }

    async processItem(item) {
        let audio = null;

        try {
            audio = await generateTTS(item.text);

            await this.player.play(
                item.voiceChannel,
                audio.path
            );
        } catch (error) {
            logger.error(
                `Error reproduciendo TTS de ${item.username}.`,
                error
            );

            if (audio?.path) {
                await deleteTTSDirectory(audio.path);
            }
        }
    }

    disconnect(guildId) {
        const queue = this.queues.get(guildId);

        if (queue) {
            queue.clear();
            this.queues.delete(guildId);
        }

        return this.player.disconnect(guildId);
    }

    stop(guildId) {
        const queue = this.queues.get(guildId);

        if (queue) {
            queue.clear();
        }

        return this.player.stop(guildId);
    }

    isConnected(guildId) {
        return this.player.isConnected(guildId);
    }

    getQueueSize(guildId) {
        const queue = this.queues.get(guildId);

        return queue?.size || 0;
    }
}