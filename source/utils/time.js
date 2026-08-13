export function secondsToMilliseconds(seconds) {
    return Math.max(0, Number(seconds) * 1000);
}

export function millisecondsToSeconds(milliseconds) {
    return Math.max(0, Number(milliseconds) / 1000);
}

export function getRemainingTime(duration, position) {
    const total = Number(duration) || 0;
    const current = Number(position) || 0;

    return Math.max(0, total - current);
}

export function isFinished(duration, position) {
    return getRemainingTime(duration, position) <= 0;
}