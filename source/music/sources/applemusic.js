import { AppleMusicExtractor } from '@discord-player/extractor';
import { logger } from '../../utils/logger.js';

export async function registerAppleMusicExtractor(player) {
    try {
        await player.extractors.register(AppleMusicExtractor, {
            searchLimit: 5
        });

        logger.success(
            'Extractor de Apple Music registrado.'
        );
    } catch (error) {
        logger.error(
            'No se pudo registrar el extractor de Apple Music.',
            error
        );

        throw error;
    }
}