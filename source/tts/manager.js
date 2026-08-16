import { TTSQueue } from './queue.js';
import { TTSPlayer } from './player.js';

import { generateTTS } from './engine.js';

import {
    logger
} from '../utils/logger.js';


export class TTSManager {
    constructor(musicManager) {
        this.musicManager =
            musicManager;

        this.player =
            new TTSPlayer();

        this.queues =
            new Map();
    }


    getQueue(guildId) {
        let queue =
            this.queues.get(
                guildId
            );

        if (!queue) {
            queue =
                new TTSQueue();

            this.queues.set(
                guildId,
                queue
            );
        }

        return queue;
    }


    async handleMessage(message) {
        if (
            !message ||
            message.author.bot ||
            !message.guild
        ) {
            return;
        }


        const voiceChannel =
            message.member?.voice?.channel;


        if (!voiceChannel) {
            return;
        }


        const text =
            message.content.trim();


        if (!text) {
            return;
        }


        const guildId =
            message.guild.id;


        const queue =
            this.getQueue(
                guildId
            );


        queue.add({
            text,
            voiceChannel,
            username:
                message.author.username
        });


        logger.info(
            `TTS recibido de ${message.author.username}.`
        );


        if (!queue.isProcessing) {
            await this.processQueue(
                guildId
            );
        }
    }


    async processQueue(guildId) {
        const queue =
            this.queues.get(
                guildId
            );


        if (
            !queue ||
            queue.isProcessing
        ) {
            return;
        }


        queue.setProcessing(
            true
        );


        try {
            while (
                !queue.isEmpty
            ) {
                const item =
                    queue.next();


                if (!item) {
                    continue;
                }


                await this.processItem(
                    item
                );
            }
        } finally {
            queue.setProcessing(
                false
            );


            if (
                queue.isEmpty
            ) {
                this.queues.delete(
                    guildId
                );
            }
        }
    }


    async processItem(item) {
        let filePath =
            null;


        try {
            filePath =
                await generateTTS(
                    item.text
                );


            const guildId =
                item.voiceChannel
                    .guild.id;


            const mixer =
                this.musicManager
                    .getMixer(
                        guildId
                    );


            await this.player.play(
                item.voiceChannel,
                filePath,
                mixer
            );

        } catch (error) {
            logger.error(
                `Error procesando TTS de ${item.username}.`,
                error
            );
        }
    }


    stop(guildId) {
        const queue =
            this.queues.get(
                guildId
            );


        if (queue) {
            queue.clear();
        }


        return this.player.stop(
            guildId
        );
    }


    disconnect(guildId) {
        const queue =
            this.queues.get(
                guildId
            );


        if (queue) {
            queue.clear();

            this.queues.delete(
                guildId
            );
        }


        return this.player.disconnect(
            guildId
        );
    }


    isConnected(guildId) {
        return this.player.isConnected(
            guildId
        );
    }
}