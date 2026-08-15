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

    if (!ffmpegPath) {
        throw new Error(
            'No se encontró FFmpeg.'
        );
    }

    setFFmpegPath(
        ffmpegPath
    );


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


    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            agent: {
                cookiesHeader
            },

            searchLimit: 1,

            playlistSearchLimit: 50,

            relatedLimit: 3,

            enableProtocols: true,

            searchTimeoutMs: 10000,

            videoTimeoutMs: 15000,

            playlistTimeoutMs: 30000,

            ytdlpTimeoutMs: 30000,

            infoCacheTtlMs: 600000,

            debug: false
        }
    );


    console.log(
        '[YouTube] Extractor registrado correctamente.'
    );
}