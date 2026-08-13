import {
    YouTubeDlpExtractor,
    setFFmpegPath,
    setYtDlpPath
} from 'discord-player-youtubedlp';

import ffmpegPath from 'ffmpeg-static';

import {
    YtDlp
} from 'ytdlp-nodejs';

export async function registerYouTubeExtractor(player) {
    /*
     * ─────────────────────────────
     * FFmpeg
     * ─────────────────────────────
     */

    if (!ffmpegPath) {
        throw new Error(
            'No se encontró FFmpeg.'
        );
    }

    setFFmpegPath(
        ffmpegPath
    );

    /*
     * ─────────────────────────────
     * yt-dlp
     * ─────────────────────────────
     */

    const ytdlp =
        new YtDlp();

    const ytDlpPath =
        ytdlp.binaryPath;

    if (!ytDlpPath) {
        throw new Error(
            'No se pudo obtener la ruta de yt-dlp.'
        );
    }

    setYtDlpPath(
        ytDlpPath
    );

    console.log(
        `[YouTube] yt-dlp: ${ytDlpPath}`
    );

    console.log(
        `[YouTube] FFmpeg: ${ffmpegPath}`
    );

    /*
     * ─────────────────────────────
     * Registrar extractor
     * ─────────────────────────────
     */

    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            /*
             * Búsquedas
             */
            searchLimit: 5,

            playlistSearchLimit: 200,

            relatedLimit: 5,

            /*
             * Protocolos
             */
            enableProtocols: true,

            /*
             * Timeouts
             */
            searchTimeoutMs: 15000,

            videoTimeoutMs: 30000,

            playlistTimeoutMs: 60000,

            ytdlpTimeoutMs: 60000,

            /*
             * Cache de información
             */
            infoCacheTtlMs: 120000,

            /*
             * Debug
             */
            debug: true
        }
    );

    console.log(
        '[YouTube] Extractor registrado correctamente.'
    );
}