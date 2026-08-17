import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType,
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
    spawn
} from 'node:child_process';

import ffmpegPath from 'ffmpeg-static';

import {
    deleteTTSFile
} from './engine.js';


export class TTSPlayer {
    constructor() {
        this.connections =
            new Map();

        this.players =
            new Map();

        this.activePlayback =
            new Map();
    }


    async connect(voiceChannel) {
        const guildId =
            voiceChannel.guild.id;


        const existing =
            this.connections.get(
                guildId
            );


        if (existing) {
            const currentChannel =
                existing.joinConfig.channelId;


            if (
                currentChannel ===
                voiceChannel.id
            ) {
                return existing;
            }


            this.stop(
                guildId
            );


            existing.destroy();


            this.connections.delete(
                guildId
            );


            this.players.delete(
                guildId
            );
        }


        const connection =
            joinVoiceChannel({
                channelId:
                    voiceChannel.id,

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


        const player =
            createAudioPlayer({
                behaviors: {
                    noSubscriber:
                        NoSubscriberBehavior.Play
                }
            });


        connection.subscribe(
            player
        );


        this.connections.set(
            guildId,
            connection
        );


        this.players.set(
            guildId,
            player
        );


        return connection;
    }


    async play(
        voiceChannel,
        filePath
    ) {
        const guildId =
            voiceChannel.guild.id;


        await this.connect(
            voiceChannel
        );


        const player =
            this.players.get(
                guildId
            );


        if (!player) {
            throw new Error(
                'No se pudo crear el reproductor de audio.'
            );
        }


        /*
         * No debería ocurrir normalmente porque
         * TTSManager procesa la cola de forma
         * secuencial, pero evitamos dos
         * reproducciones simultáneas por seguridad.
         */
        const existingPlayback =
            this.activePlayback.get(
                guildId
            );


        if (existingPlayback) {
            existingPlayback.cancel();
        }


        const ffmpeg =
            spawn(
                ffmpegPath,
                [
                    '-hide_banner',
                    '-loglevel',
                    'error',

                    '-i',
                    'pipe:0',

                    '-f',
                    's16le',

                    '-ar',
                    '48000',

                    '-ac',
                    '2',

                    'pipe:1'
                ],
                {
                    stdio: [
                        'pipe',
                        'pipe',
                        'pipe'
                    ]
                }
            );


        const input =
            createReadStream(
                filePath
            );


        input.pipe(
            ffmpeg.stdin
        );


        const resource =
            createAudioResource(
                ffmpeg.stdout,
                {
                    inputType:
                        StreamType.Raw
                }
            );


        return new Promise(
            (resolve, reject) => {

                let started =
                    false;

                let settled =
                    false;


                const cleanup =
                    async () => {

                        try {
                            input.destroy();
                        } catch {}


                        try {
                            if (
                                ffmpeg.exitCode ===
                                    null &&
                                !ffmpeg.killed
                            ) {
                                ffmpeg.kill();
                            }
                        } catch {}


                        try {
                            ffmpeg.stdin.destroy();
                        } catch {}


                        try {
                            ffmpeg.stdout.destroy();
                        } catch {}


                        try {
                            ffmpeg.stderr.destroy();
                        } catch {}


                        try {
                            await deleteTTSFile(
                                filePath
                            );
                        } catch {}
                    };


                const removeListeners =
                    () => {

                        player.off(
                            'stateChange',
                            onStateChange
                        );

                        player.off(
                            'error',
                            onPlayerError
                        );

                        input.off(
                            'error',
                            onInputError
                        );

                        ffmpeg.off(
                            'error',
                            onFFmpegError
                        );

                        ffmpeg.off(
                            'close',
                            onFFmpegClose
                        );
                    };


                const finish =
                    async () => {

                        if (settled) {
                            return;
                        }


                        settled =
                            true;


                        removeListeners();


                        this.activePlayback.delete(
                            guildId
                        );


                        await cleanup();


                        resolve();
                    };


                const fail =
                    async error => {

                        if (settled) {
                            return;
                        }


                        settled =
                            true;


                        removeListeners();


                        this.activePlayback.delete(
                            guildId
                        );


                        await cleanup();


                        reject(error);
                    };


                const cancel =
                    async () => {

                        if (settled) {
                            return;
                        }


                        settled =
                            true;


                        removeListeners();


                        this.activePlayback.delete(
                            guildId
                        );


                        try {
                            player.stop();
                        } catch {}


                        await cleanup();


                        resolve();
                    };


                const onStateChange =
                    (
                        oldState,
                        newState
                    ) => {

                        /*
                         * El AudioPlayer realmente
                         * comenzó a reproducir.
                         */
                        if (
                            newState.status ===
                            AudioPlayerStatus.Playing
                        ) {
                            started =
                                true;

                            return;
                        }


                        /*
                         * Solo consideramos
                         * Idle como finalización
                         * después de Playing.
                         */
                        if (
                            started &&
                            newState.status ===
                                AudioPlayerStatus.Idle
                        ) {
                            finish();
                        }
                    };


                const onPlayerError =
                    error => {
                        fail(error);
                    };


                const onInputError =
                    error => {
                        fail(error);
                    };


                const onFFmpegError =
                    error => {
                        fail(error);
                    };


                const onFFmpegClose =
                    code => {

                        if (
                            code !== 0 &&
                            code !== null
                        ) {
                            fail(
                                new Error(
                                    `FFmpeg terminó con código ${code}.`
                                )
                            );
                        }
                    };


                this.activePlayback.set(
                    guildId,
                    {
                        cancel
                    }
                );


                input.once(
                    'error',
                    onInputError
                );


                ffmpeg.once(
                    'error',
                    onFFmpegError
                );


                ffmpeg.once(
                    'close',
                    onFFmpegClose
                );


                player.once(
                    'error',
                    onPlayerError
                );


                player.on(
                    'stateChange',
                    onStateChange
                );


                try {
                    player.play(
                        resource
                    );
                } catch (error) {
                    fail(error);
                }
            }
        );
    }


    stop(guildId) {
        const playback =
            this.activePlayback.get(
                guildId
            );


        if (playback) {
            playback.cancel();

            return true;
        }


        const player =
            this.players.get(
                guildId
            );


        if (!player) {
            return false;
        }


        return player.stop();
    }


    disconnect(guildId) {
        /*
         * Primero cancelamos cualquier
         * reproducción activa.
         */
        this.stop(
            guildId
        );


        const connection =
            this.connections.get(
                guildId
            );


        if (connection) {
            connection.destroy();
        }


        this.players.delete(
            guildId
        );


        this.connections.delete(
            guildId
        );


        return true;
    }


    isConnected(guildId) {
        return this.connections.has(
            guildId
        );
    }
}