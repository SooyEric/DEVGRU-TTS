import { YouTubeDlpExtractor } from 'discord-player-youtubedlp';
import { logger } from '../../utils/logger.js';

export async function registerYouTubeExtractor(player) {
    try {
        await player.extractors.register(YouTubeDlpExtractor, {
            searchLimit: 5,
            playlistSearchLimit: 100,
            relatedLimit: 0,

            searchTimeoutMs: 6000,
            videoTimeoutMs: 7000,
            playlistTimeoutMs: 25000,
            ytdlpTimeoutMs: 25000,

            infoCacheTtlMs: 120000,

            enableProtocols: true,

            debug: false
        });

        logger.success('Extractor de YouTube registrado.');
    } catch (error) {
        logger.error(
            'No se pudo registrar el extractor de YouTube.',
            error
        );

        throw error;
    }
}