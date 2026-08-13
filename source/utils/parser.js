const AUDIO_EXTENSIONS = [
    'mp3',
    'wav',
    'ogg',
    'oga',
    'flac',
    'm4a',
    'aac',
    'opus',
    'webm'
];

export function getAttachmentAudio(attachments) {
    if (!attachments || attachments.size === 0) {
        return null;
    }

    for (const attachment of attachments.values()) {
        const extension = getExtension(
            attachment.name
        );

        if (
            AUDIO_EXTENSIONS.includes(
                extension
            )
        ) {
            return attachment;
        }
    }

    return null;
}

export function getExtension(filename) {
    if (!filename) {
        return '';
    }

    const parts = filename
        .toLowerCase()
        .split('.');

    if (parts.length < 2) {
        return '';
    }

    return parts.pop();
}

export function parseCommand(content, prefix = '-') {
    if (!content.startsWith(prefix)) {
        return null;
    }

    const input = content
        .slice(prefix.length)
        .trim();

    if (!input) {
        return null;
    }

    const parts = input.split(/\s+/);

    const command = parts
        .shift()
        .toLowerCase();

    return {
        command,
        args: parts
    };
}