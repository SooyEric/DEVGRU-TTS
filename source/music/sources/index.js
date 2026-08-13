import { registerYouTubeExtractor } from './youtube.js';
import { registerSpotifyExtractor } from './spotify.js';
import { registerSoundCloudExtractor } from './soundcloud.js';
import { registerAppleMusicExtractor } from './applemusic.js';

export async function registerExtractors(player) {
    await registerYouTubeExtractor(player);
    await registerSpotifyExtractor(player);
    await registerSoundCloudExtractor(player);
    await registerAppleMusicExtractor(player);
}