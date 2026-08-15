import {
    YouTubeDlpExtractor,
    setFFmpegPath,
    setYtDlpPath
} from 'discord-player-youtubedlp';

import ffmpegPath from 'ffmpeg-static';

import {
    YtDlp
} from 'ytdlp-nodejs';


function convertCookiesToHeader(json) {
    const cookies = JSON.parse(json);

    if (!Array.isArray(cookies)) {
        throw new Error(
            'YOUTUBE_COOKIES no contiene un array de cookies válido.'
        );
    }

    return cookies
        .filter(cookie =>
            cookie.domain?.includes('youtube.com')
        )
        .map(cookie =>
            `${cookie.name}=${cookie.value}`
        )
        .join('; ');
}


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
     * COOKIES
     * ─────────────────────────────
     */

    const cookiesJson =
        process.env.YOUTUBE_COOKIES;

    let cookiesHeader;


    if (cookiesJson) {

        try {

            cookiesHeader =
                convertCookiesToHeader(
                    cookiesJson
                );

            console.log(
                '[YouTube] Cookies cargadas correctamente.'
            );

        } catch (error) {

            console.error(
                '[YouTube] Error procesando YOUTUBE_COOKIES:',
                error
            );

        }

    } else {

        console.warn(
            '[YouTube] YOUTUBE_COOKIES no está configurado.'
        );

    }


    /*
     * ─────────────────────────────
     * EXTRACTOR
     * ─────────────────────────────
     */

    await player.extractors.register(
        YouTubeDlpExtractor,
        {

            agent: {
                cookiesHeader
            },

            searchLimit: 5,

            playlistSearchLimit: 200,

            relatedLimit: 5,

            enableProtocols: true,

            searchTimeoutMs: 15000,

            videoTimeoutMs: 30000,

            playlistTimeoutMs: 60000,

            ytdlpTimeoutMs: 60000,

            infoCacheTtlMs: 120000,

            debug: true
        }
    );


    console.log(
        '[YouTube] Extractor registrado correctamente.'
    );
}