export class TTSQueue {
    constructor() {
        this.items = [];
        this.processing = false;
    }

    add(item) {
        this.items.push(item);
    }

    next() {
        return this.items.shift() || null;
    }

    clear() {
        this.items.length = 0;
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
        this.processing = value;
    }
}