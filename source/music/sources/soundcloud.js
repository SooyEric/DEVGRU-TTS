import { SoundCloudExtractor } from '@discord-player/extractor';
import { logger } from '../../utils/logger.js';

export async function registerSoundCloudExtractor(player) {
    try {
        await player.extractors.register(SoundCloudExtractor, {
            searchLimit: 5
        });

        logger.success('Extractor de SoundCloud registrado.');
    } catch (error) {
        logger.error(
            'No se pudo registrar el extractor de SoundCloud.',
            error
        );

        throw error;
    }
}