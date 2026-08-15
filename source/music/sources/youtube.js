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

    let cookies;


    if (cookiesJson) {

        try {

            cookies =
                JSON.parse(
                    cookiesJson
                );

            if (!Array.isArray(cookies)) {
                throw new Error(
                    'Las cookies deben ser un array.'
                );
            }

            console.log(
                '[YouTube] Cookies cargadas correctamente.'
            );

        } catch (error) {

            throw new Error(
                `Error procesando YOUTUBE_COOKIES: ${error.message}`
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
            agent: cookies
                ? {
                    cookies
                }
                : undefined,

            searchLimit: 1,

            playlistSearchLimit: 50,

            relatedLimit: 3,

            enableProtocols: true,

            searchTimeoutMs: 6000,

            videoTimeoutMs: 7000,

            playlistTimeoutMs: 25000,

            ytdlpTimeoutMs: 25000,

            infoCacheTtlMs: 600000,

            debug: false
        }
    );


    console.log(
        '[YouTube] Extractor registrado correctamente.'
    );
}