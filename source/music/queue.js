export class MusicQueue {
    constructor(player) {
        this.player = player;
    }

    get(guildId) {
        return this.player.getQueue(guildId);
    }

    getTracks(guildId) {
        return this.player.getTracks(guildId);
    }

    getSize(guildId) {
        return this.player.getQueueSize(guildId);
    }

    getCurrent(guildId) {
        return this.player.getCurrentTrack(guildId);
    }

    isPlaying(guildId) {
        return this.player.isPlaying(guildId);
    }
}