export function formatDuration(seconds) {
    if (!seconds || seconds < 0) {
        return '00:00';
    }

    seconds = Math.floor(seconds);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
        return [
            hours,
            minutes.toString().padStart(2, '0'),
            remainingSeconds.toString().padStart(2, '0')
        ].join(':');
    }

    return [
        minutes.toString().padStart(2, '0'),
        remainingSeconds.toString().padStart(2, '0')
    ].join(':');
}

export function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

export function truncate(text, maxLength = 100) {
    if (!text) {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 3)}...`;
}

export function formatTrackTitle(title, maxLength = 100) {
    return truncate(title, maxLength);
}

export function formatArtist(artist, maxLength = 100) {
    return truncate(artist, maxLength);
}