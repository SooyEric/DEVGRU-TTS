import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    VoiceConnectionStatus
} from '@discordjs/voice';

import {
    PassThrough
} from 'node:stream';

import {
    spawn
} from 'node:child_process';

import ffmpegPath from 'ffmpeg-static';


export class AudioMixer {
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
                currentChannel === voiceChannel.id
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


    async ensureVoice(
        voiceChannel
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


        return {
            connection,
            player
        };
    }


    async playStream(
        voiceChannel,
        stream
    ) {
        const guildId =
            voiceChannel.guild.id;


        await this.ensureVoice(
            voiceChannel
        );


        const mixer =
            this.getMixer(
                guildId
            );


        const resource =
            createAudioResource(
                mixer,
                {
                    inputType:
                        StreamType.Raw,

                    metadata: {
                        guildId
                    }
                }
            );


        const player =
            this.getPlayer(
                guildId
            );


        if (
            player.state.status !==
            AudioPlayerStatus.Playing
        ) {
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


        stream.pipe(
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

                const cleanup = () => {
                    try {
                        stream.destroy();
                    } catch {}

                    try {
                        ffmpeg.stdin.destroy();
                    } catch {}
                };


                stream.once(
                    'error',
                    error => {
                        cleanup();
                        reject(error);
                    }
                );


                ffmpeg.once(
                    'error',
                    error => {
                        cleanup();
                        reject(error);
                    }
                );


                ffmpeg.once(
                    'close',
                    code => {
                        cleanup();

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


    async mixBuffer(
        voiceChannel,
        buffer
    ) {
        const stream =
            new PassThrough();


        stream.end(
            buffer
        );


        return this.playStream(
            voiceChannel,
            stream
        );
    }


    stop(guildId) {
        const mixer =
            this.mixers.get(
                guildId
            );

        if (mixer) {
            mixer.end();

            this.mixers.delete(
                guildId
            );
        }


        const player =
            this.players.get(
                guildId
            );

        if (player) {
            player.stop(
                true
            );
        }


        return true;
    }


    disconnect(guildId) {
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