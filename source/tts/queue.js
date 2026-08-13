export class TTSQueue {
    constructor(guildId) {
        this.guildId = guildId;
        this.items = [];
        this.processing = false;
    }

    add(item) {
        if (!item) {
            return false;
        }

        this.items.push(item);

        return true;
    }

    next() {
        return this.items.shift() || null;
    }

    peek() {
        return this.items[0] || null;
    }

    clear() {
        this.items = [];
    }

    get size() {
        return this.items.length;
    }

    get isEmpty() {
        return this.items.length === 0;
    }

    get isProcessing() {
        return this.processing;
    }

    setProcessing(value) {
        this.processing = Boolean(value);
    }

    get all() {
        return [...this.items];
    }
}