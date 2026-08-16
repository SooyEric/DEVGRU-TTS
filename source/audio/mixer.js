import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource
} from '@discordjs/voice';

import {
    PassThrough
} from 'node:stream';

export class AudioMixer {
    constructor() {
        this.mixers = new Map();
        this.players = new Map();
        this.connections = new Map();
    }

    getMixer(guildId) {
        let mixer = this.mixers.get(guildId);

        if (mixer) {
            return mixer;
        }

        mixer = new PassThrough();

        this.mixers.set(
            guildId,
            mixer
        );

        return mixer;
    }

    getPlayer(guildId) {
        let player = this.players.get(guildId);

        if (player) {
            return player;
        }

        player = createAudioPlayer({
            behaviors: {
                noSubscriber:
                    NoSubscriberBehavior.Play
            }
        });

        this.players.set(
            guildId,
            player
        );

        return player;
    }

    setConnection(guildId, connection) {
        this.connections.set(
            guildId,
            connection
        );

        connection.subscribe(
            this.getPlayer(guildId)
        );
    }

    getConnection(guildId) {
        return this.connections.get(
            guildId
        );
    }

    playStream(guildId, stream) {
        const mixer =
            this.getMixer(guildId);

        stream.pipe(
            mixer,
            {
                end: false
            }
        );
    }

    playAudio(guildId, stream) {
        const player =
            this.getPlayer(guildId);

        const resource =
            createAudioResource(
                stream
            );

        player.play(
            resource
        );
    }

    stop(guildId) {
        const player =
            this.players.get(guildId);

        if (player) {
            player.stop();
        }
    }

    destroy(guildId) {
        const mixer =
            this.mixers.get(guildId);

        if (mixer) {
            try {
                mixer.end();
            } catch {}
        }

        const connection =
            this.connections.get(guildId);

        if (connection) {
            try {
                connection.destroy();
            } catch {}
        }

        this.mixers.delete(
            guildId
        );

        this.players.delete(
            guildId
        );

        this.connections.delete(
            guildId
        );
    }
}