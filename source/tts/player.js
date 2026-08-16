import {
    VoiceConnectionStatus,
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


        this.connections.set(
            guildId,
            connection
        );


        return connection;
    }


    async play(
        voiceChannel,
        filePath,
        mixer
    ) {
        const guildId =
            voiceChannel.guild.id;


        if (!mixer) {
            throw new Error(
                'No se recibió un mixer de audio.'
            );
        }


        await this.connect(
            voiceChannel
        );


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


        ffmpeg.stdout.pipe(
            mixer,
            {
                end: false
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


                        await deleteTTSFile(
                            filePath
                        );
                    };


                input.once(
                    'error',
                    async error => {
                        await cleanup();

                        reject(
                            error
                        );
                    }
                );


                ffmpeg.once(
                    'error',
                    async error => {
                        await cleanup();

                        reject(
                            error
                        );
                    }
                );


                ffmpeg.once(
                    'close',
                    async code => {
                        await cleanup();


                        if (
                            code !== 0 &&
                            code !== null
                        ) {
                            reject(
                                new Error(
                                    `FFmpeg terminó con código ${code}.`
                                )
                            );

                            return;
                        }


                        resolve();
                    }
                );
            }
        );
    }


    stop(guildId) {
        return false;
    }


    disconnect(guildId) {
        const connection =
            this.connections.get(
                guildId
            );


        if (connection) {
            connection.destroy();
        }


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