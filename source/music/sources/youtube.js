import {
    YouTubeDlpExtractor,
    setFFmpegPath,
    setYtDlpPath
} from 'discord-player-youtubedlp';

import ffmpegPath from 'ffmpeg-static';

import {
    YTDLP
} from 'ytdlp-nodejs';

export async function registerYouTubeExtractor(player) {
    if (!ffmpegPath) {
        throw new Error(
            'No se encontró FFmpeg.'
        );
    }

    /*
     * Configurar FFmpeg
     */
    setFFmpegPath(
        ffmpegPath
    );

    /*
     * Inicializar yt-dlp
     */
    const ytdlp =
        new YTDLP();

    const ytDlpPath =
        await ytdlp.getBinaryPath();

    if (!ytDlpPath) {
        throw new Error(
            'No se pudo obtener la ruta de yt-dlp.'
        );
    }

    /*
     * Configurar yt-dlp
     */
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
     * Registrar extractor
     */
    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            searchLimit: 5,

            playlistSearchLimit: 200,

            relatedLimit: 5,

            enableProtocols: true,

            searchTimeoutMs: 10000,

            videoTimeoutMs: 15000,

            playlistTimeoutMs: 30000,

            ytdlpTimeoutMs: 30000,

            infoCacheTtlMs: 120000,

            debug: true
        }
    );
}