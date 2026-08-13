import { AppleMusicExtractor } from '@discord-player/extractor';

export async function registerAppleMusicExtractor(player) {
    await player.extractors.register(
        AppleMusicExtractor,
        {
            searchLimit: 5
        }
    );
}