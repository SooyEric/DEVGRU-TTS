import { SoundCloudExtractor } from '@discord-player/extractor';

export async function registerSoundCloudExtractor(player) {
    await player.extractors.register(
        SoundCloudExtractor,
        {
            searchLimit: 5
        }
    );
}