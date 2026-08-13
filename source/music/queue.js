export class MusicQueue {
    constructor(guildId) {
        this.guildId = guildId;

        this.current = null;
        this.tracks = [];
    }

    add(track) {
        if (!track) {
            return false;
        }

        this.tracks.push(track);

        return true;
    }

    addMany(tracks) {
        if (!Array.isArray(tracks) || tracks.length === 0) {
            return 0;
        }

        const validTracks = tracks.filter(Boolean);

        this.tracks.push(...validTracks);

        return validTracks.length;
    }

    next() {
        return this.tracks.shift() || null;
    }

    peek() {
        return this.tracks[0] || null;
    }

    remove(index) {
        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.tracks.length
        ) {
            return null;
        }

        return this.tracks.splice(index, 1)[0] || null;
    }

    clear() {
        this.tracks = [];
    }

    setCurrent(track) {
        this.current = track || null;
    }

    getCurrent() {
        return this.current;
    }

    get size() {
        return this.tracks.length;
    }

    get isEmpty() {
        return this.tracks.length === 0;
    }

    get all() {
        return [...this.tracks];
    }

    hasTracks() {
        return this.tracks.length > 0;
    }
}