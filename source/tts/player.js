import {
    createReadStream
} from 'node:fs';

import {
    deleteTTSFile
} from './engine.js';

import {
    AudioMixer
} from '../music/mixer.js';

export class TTSPlayer {
    constructor() {
        this.mixer =
            new AudioMixer();
    }

    async play(
        voiceChannel,
        filePath
    ) {
        const guildId =
            voiceChannel.guild.id;

        try {
            const stream =
                createReadStream(
                    filePath
                );

            await this.mixer.playStream(
                voiceChannel,
                stream
            );

            return new Promise(
                (resolve, reject) => {
                    stream.on(
                        'end',
                        async () => {
                            await deleteTTSFile(
                                filePath
                            );

                            resolve();
                        }
                    );

                    stream.on(
                        'error',
                        async error => {
                            await deleteTTSFile(
                                filePath
                            );

                            reject(error);
                        }
                    );
                }
            );
        } catch (error) {
            await deleteTTSFile(
                filePath
            );

            throw error;
        }
    }

    stop(guildId) {
        return this.mixer.stop(
            guildId
        );
    }

    disconnect(guildId) {
        return this.mixer.disconnect(
            guildId
        );
    }

    isConnected(guildId) {
        return this.mixer.isConnected(
            guildId
        );
    }
}