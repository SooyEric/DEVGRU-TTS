export function truncate(
    text,
    maxLength
) {
    if (!text) {
        return '';
    }

    if (
        text.length <=
        maxLength
    ) {
        return text;
    }

    return `${text.slice(
        0,
        maxLength - 3
    )}...`;
}