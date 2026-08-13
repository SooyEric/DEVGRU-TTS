import { SpotifyExtractor } from '@discord-player/extractor';

export async function registerSpotifyExtractor(player) {
    await player.extractors.register(
        SpotifyExtractor,
        {
            searchLimit: 5
        }
    );
}