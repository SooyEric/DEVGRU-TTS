const SUPPORTED_AUDIO_EXTENSIONS = [
    '.mp3',
    '.wav',
    '.ogg',
    '.oga',
    '.flac',
    '.m4a',
    '.aac',
    '.webm'
];

const SOURCE_PATTERNS = {
    youtube: [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i
    ],

    spotify: [
        /^(https?:\/\/)?open\.spotify\.com\//i
    ],

    soundcloud: [
        /^(https?:\/\/)?(www\.)?soundcloud\.com\//i
    ],

    applemusic: [
        /^(https?:\/\/)?music\.apple\.com\//i
    ]
};

export function parseCommand(content, prefix = '-') {
    if (!content || !content.startsWith(prefix)) {
        return null;
    }

    const withoutPrefix = content.slice(prefix.length).trim();

    if (!withoutPrefix) {
        return null;
    }

    const parts = withoutPrefix.split(/\s+/);

    const command = parts.shift().toLowerCase();

    return {
        command,
        args: parts,
        raw: parts.join(' ')
    };
}

export function parsePlayInput(input) {
    if (!input || !input.trim()) {
        return {
            type: 'empty',
            value: null
        };
    }

    const value = input.trim();

    const source = detectSource(value);

    if (source) {
        return {
            type: 'url',
            source,
            value
        };
    }

    if (isDirectAudioUrl(value)) {
        return {
            type: 'audio-url',
            source: 'direct',
            value
        };
    }

    return {
        type: 'search',
        source: 'search',
        value
    };
}

export function detectSource(url) {
    for (const [source, patterns] of Object.entries(SOURCE_PATTERNS)) {
        if (patterns.some(pattern => pattern.test(url))) {
            return source;
        }
    }

    return null;
}

export function isDirectAudioUrl(url) {
    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.toLowerCase();

        return SUPPORTED_AUDIO_EXTENSIONS.some(extension =>
            pathname.endsWith(extension)
        );
    } catch {
        return false;
    }
}

export function getAttachmentAudio(attachments) {
    if (!attachments || attachments.size === 0) {
        return null;
    }

    const attachment = attachments.find(file => {
        const extension = getFileExtension(file.name);

        return SUPPORTED_AUDIO_EXTENSIONS.includes(extension);
    });

    if (!attachment) {
        return null;
    }

    return {
        type: 'attachment',
        source: 'discord',
        name: attachment.name,
        url: attachment.url,
        size: attachment.size,
        contentType: attachment.contentType || null
    };
}

export function getFileExtension(filename) {
    if (!filename) {
        return '';
    }

    const lastDot = filename.lastIndexOf('.');

    if (lastDot === -1) {
        return '';
    }

    return filename.slice(lastDot).toLowerCase();
}