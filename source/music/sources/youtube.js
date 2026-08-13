import { YouTubeDlpExtractor } from 'discord-player-youtubedlp';

export async function registerYouTubeExtractor(player) {
    await player.extractors.register(
        YouTubeDlpExtractor,
        {
            searchLimit: 5,
            playlistSearchLimit: 200,
            relatedLimit: 5,
            enableProtocols: true,
            debug: false
        }
    );
}