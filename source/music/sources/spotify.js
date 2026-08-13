import { SpotifyExtractor } from '@discord-player/extractor';
import { logger } from '../../utils/logger.js';

export async function registerSpotifyExtractor(player) {
    try {
        await player.extractors.register(SpotifyExtractor, {
            searchLimit: 5
        });

        logger.success('Extractor de Spotify registrado.');
    } catch (error) {
        logger.error(
            'No se pudo registrar el extractor de Spotify.',
            error
        );

        throw error;
    }
}