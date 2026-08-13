export function formatDuration(seconds) {
    if (
        typeof seconds !== 'number' ||
        !Number.isFinite(seconds)
    ) {
        return '00:00';
    }

    const totalSeconds = Math.max(
        0,
        Math.floor(seconds)
    );

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {
        return [
            hours,
            String(minutes).padStart(2, '0'),
            String(remainingSeconds).padStart(2, '0')
        ].join(':');
    }

    return [
        String(minutes).padStart(2, '0'),
        String(remainingSeconds).padStart(2, '0')
    ].join(':');
}

export function truncate(text, maxLength) {
    if (!text) {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}