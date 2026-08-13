import {
    YouTubeDlpExtractor,
    setFFmpegPath
} from 'discord-player-youtubedlp';

import ffmpegPath from 'ffmpeg-static';

export async function registerYouTubeExtractor(player) {
    if (!ffmpegPath) {
        throw new Error(
            'No se encontró FFmpeg.'
        );
    }

    setFFmpegPath(ffmpegPath);

    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            searchLimit: 5,
            playlistSearchLimit: 200,
            relatedLimit: 5,

            enableProtocols: true,

            searchTimeoutMs: 6000,
            videoTimeoutMs: 7000,
            playlistTimeoutMs: 25000,
            ytdlpTimeoutMs: 25000,

            infoCacheTtlMs: 120000,

            debug: true
        }
    );
}