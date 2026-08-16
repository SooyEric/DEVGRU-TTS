import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
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
    PassThrough
} from 'node:stream';

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
        this.mixers = new Map();
    }


    async connect(voiceChannel) {
        const guildId =
            voiceChannel.guild.id;

        const existing =
            this.connections.get(guildId);

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


    getPlayer(guildId) {
        let player =
            this.players.get(guildId);

        if (player) {
            return player;
        }


        player =
            createAudioPlayer({
                behaviors: {
                    noSubscriber:
                        NoSubscriberBehavior.Stop
                }
            });


        this.players.set(
            guildId,
            player
        );


        return player;
    }


    getMixer(guildId) {
        let mixer =
            this.mixers.get(guildId);

        if (mixer) {
            return mixer;
        }


        mixer =
            new PassThrough();


        this.mixers.set(
            guildId,
            mixer
        );


        return mixer;
    }


    async play(
        voiceChannel,
        filePath
    ) {
        const guildId =
            voiceChannel.guild.id;


        const connection =
            await this.connect(
                voiceChannel
            );


        const player =
            this.getPlayer(
                guildId
            );


        connection.subscribe(
            player
        );


        const mixer =
            this.getMixer(
                guildId
            );


        if (
            player.state.status !==
            AudioPlayerStatus.Playing
        ) {
            const resource =
                createAudioResource(
                    mixer,
                    {
                        inputType:
                            'raw'
                    }
                );

            player.play(
                resource
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
                        reject(error);
                    }
                );


                ffmpeg.once(
                    'error',
                    async error => {
                        await cleanup();
                        reject(error);
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
        const player =
            this.players.get(
                guildId
            );

        if (!player) {
            return false;
        }

        player.stop();

        return true;
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

        this.players.delete(
            guildId
        );

        this.mixers.delete(
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