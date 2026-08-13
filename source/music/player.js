import {
    Player,
    QueryType
} from 'discord-player';

import {
    logger
} from '../utils/logger.js';

export class MusicPlayer {
    constructor(client) {
        this.player = new Player(client);

        this.setupEvents();
    }

    setupEvents() {
        /*
         * ─────────────────────────────
         * CUANDO EMPIEZA A REPRODUCIR
         * ─────────────────────────────
         */
        this.player.events.on(
            'playerStart',
            (queue, track) => {
                logger.info(
                    `▶️ Reproduciendo: ${track.title}`
                );

                logger.info(
                    `Fuente: ${track.source}`
                );

                logger.info(
                    `Extractor: ${track.extractor}`
                );

                logger.info(
                    `URL: ${track.url}`
                );

                logger.info(
                    `Duración: ${track.duration}`
                );

                logger.info(
                    `Duración MS: ${track.durationMS}`
                );
            }
        );

        /*
         * ─────────────────────────────
         * CUANDO SE AÑADE A LA COLA
         * ─────────────────────────────
         */
        this.player.events.on(
            'audioTrackAdd',
            (queue, track) => {
                logger.info(
                    `➕ Track añadido: ${track.title}`
                );

                logger.info(
                    `Fuente: ${track.source}`
                );

                logger.info(
                    `Extractor: ${track.extractor}`
                );

                logger.info(
                    `URL: ${track.url}`
                );

                logger.info(
                    `Duración: ${track.duration}`
                );

                logger.info(
                    `Duración MS: ${track.durationMS}`
                );
            }
        );

        /*
         * ─────────────────────────────
         * CUANDO TERMINA UNA CANCIÓN
         * ─────────────────────────────
         */
        this.player.events.on(
            'playerFinish',
            (queue, track) => {
                logger.info(
                    `⏹️ Finalizó: ${track.title}`
                );
            }
        );

        /*
         * ─────────────────────────────
         * ERROR GENERAL DEL REPRODUCTOR
         * ─────────────────────────────
         */
        this.player.events.on(
            'error',
            (queue, error) => {
                logger.error(
                    'Error del reproductor:',
                    error
                );
            }
        );

        /*
         * ─────────────────────────────
         * ERROR DURANTE LA REPRODUCCIÓN
         * ─────────────────────────────
         */
        this.player.events.on(
            'playerError',
            (queue, error) => {
                logger.error(
                    'Error reproduciendo audio:',
                    error
                );
            }
        );

        /*
         * ─────────────────────────────
         * DESCONEXIÓN
         * ─────────────────────────────
         */
        this.player.events.on(
            'disconnect',
            queue => {
                logger.info(
                    `🔌 Música desconectada en ${queue.guild.id}.`
                );
            }
        );
    }

    /*
     * ─────────────────────────────
     * REPRODUCIR
     * ─────────────────────────────
     */
    async play(
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

                        bufferingTimeout: 15000,

                        skipOnNoStream: true
                    }
                }
            );

        if (result?.track) {
            logger.info(
                `Track encontrado: ${result.track.title}`
            );

            logger.info(
                `Fuente: ${result.track.source}`
            );

            logger.info(
                `Extractor: ${result.track.extractor}`
            );

            logger.info(
                `URL: ${result.track.url}`
            );

            logger.info(
                `Duración: ${result.track.duration}`
            );

            logger.info(
                `Duración MS: ${result.track.durationMS}`
            );
        }

        return result;
    }

    /*
     * ─────────────────────────────
     * OBTENER COLA
     * ─────────────────────────────
     */
    getQueue(guildId) {
        return this.player.nodes.get(
            guildId
        );
    }

    /*
     * ─────────────────────────────
     * CANCIÓN ACTUAL
     * ─────────────────────────────
     */
    getCurrentTrack(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.currentTrack ?? null;
    }

    /*
     * ─────────────────────────────
     * CANCIONES EN COLA
     * ─────────────────────────────
     */
    getTracks(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.tracks.toArray() ?? [];
    }

    /*
     * ─────────────────────────────
     * TAMAÑO DE LA COLA
     * ─────────────────────────────
     */
    getQueueSize(guildId) {
        const queue =
            this.getQueue(guildId);

        return queue?.tracks.size ?? 0;
    }

    /*
     * ─────────────────────────────
     * ¿ESTÁ REPRODUCIENDO?
     * ─────────────────────────────
     */
    isPlaying(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.isPlaying();
    }

    /*
     * ─────────────────────────────
     * ¿ESTÁ PAUSADO?
     * ─────────────────────────────
     */
    isPaused(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.isPaused();
    }

    /*
     * ─────────────────────────────
     * SKIP
     * ─────────────────────────────
     */
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

    /*
     * ─────────────────────────────
     * PAUSAR
     * ─────────────────────────────
     */
    pause(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(true);
    }

    /*
     * ─────────────────────────────
     * REANUDAR
     * ─────────────────────────────
     */
    resume(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        return queue.node.setPaused(false);
    }

    /*
     * ─────────────────────────────
     * DETENER
     * ─────────────────────────────
     */
    stop(guildId) {
        const queue =
            this.getQueue(guildId);

        if (!queue) {
            return false;
        }

        queue.delete();

        return true;
    }

    /*
     * ─────────────────────────────
     * DESTRUIR COLA
     * ─────────────────────────────
     */
    destroy(guildId) {
        return this.stop(guildId);
    }

    /*
     * ─────────────────────────────
     * ¿ESTÁ CONECTADO?
     * ─────────────────────────────
     */
    isConnected(guildId) {
        const queue =
            this.getQueue(guildId);

        return Boolean(queue);
    }
}