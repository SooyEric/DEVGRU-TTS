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
     * Cookies de YouTube
     * ─────────────────────────────
     *
     * Railway proporciona las cookies
     * mediante una variable de entorno.
     *
     * NUNCA poner las cookies directamente
     * en este archivo ni subirlas a GitHub.
     */

    const youtubeCookies =
        process.env.YOUTUBE_COOKIES?.trim();

    if (youtubeCookies) {
        console.log(
            '[YouTube] Cookies configuradas.'
        );
    } else {
        console.warn(
            '[YouTube] YOUTUBE_COOKIES no está configurado. ' +
            'YouTube puede rechazar las solicitudes de yt-dlp.'
        );
    }

    /*
     * ─────────────────────────────
     * Configuración del agente
     * ─────────────────────────────
     */

    const agent = {
        /*
         * Cookie header proporcionado
         * desde Railway.
         */
        cookiesHeader:
            youtubeCookies || undefined,

        /*
         * Railway utiliza una IP de servidor.
         * IPv4 puede ser más estable para
         * determinadas rutas de YouTube.
         */
        forceIPv4: true,

        /*
         * No intentamos obtener cookies
         * desde Chrome/Firefox del servidor,
         * porque Railway no tiene nuestro
         * navegador local.
         */
        autoCookiesFromBrowser: false,

        cookiesFromBrowser:
            undefined,

        cookiesFile:
            undefined,

        cookiesJsonPath:
            undefined,

        noUA:
            false
    };

    /*
     * ─────────────────────────────
     * Registrar extractor
     * ─────────────────────────────
     */

    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            agent,

            /*
             * Búsqueda
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
             * Cache
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