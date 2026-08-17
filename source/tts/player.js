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
        this.connections = new Map();
        this.players = new Map();
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

                let finished = false;


                const cleanup =
                    async () => {
                        if (finished) {
                            return;
                        }

                        finished = true;


                        try {
                            input.destroy();
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


                        await deleteTTSFile(
                            filePath
                        );
                    };


                const finish =
                    async () => {
                        try {
                            await cleanup();

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    };


                const fail =
                    async error => {
                        try {
                            await cleanup();
                        } catch {}

                        reject(error);
                    };


                input.once(
                    'error',
                    fail
                );


                ffmpeg.once(
                    'error',
                    fail
                );


                ffmpeg.once(
                    'close',
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
                    }
                );


                player.once(
                    'error',
                    fail
                );


                player.once(
                    AudioPlayerStatus.Idle,
                    finish
                );


                player.play(
                    resource
                );
            }
        );
    }


    stop(guildId) {
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
        const player =
            this.players.get(
                guildId
            );

        if (player) {
            player.stop();
        }


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