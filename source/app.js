import {
    Client,
    GatewayIntentBits
} from 'discord.js';

import { config } from './utils/config.js';
import { logger } from './utils/logger.js';

import {
    TTSManager
} from './tts/manager.js';

import ready from './events/ready.js';
import messageCreate from './events/messageCreate.js';
import voiceStateUpdate from './events/voiceStateUpdate.js';
import error from './events/error.js';

if (!config.token) {
    throw new Error(
        'DISCORD_TOKEN no está configurado.'
    );
}

if (!config.ttsChannelId) {
    logger.warn(
        'TTS_CHANNEL_ID no está configurado. El sistema TTS permanecerá desactivado.'
    );
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.ttsManager =
    new TTSManager();

client.once(
    'clientReady',
    async () => {
        try {
            await ready(client);

            logger.success(
                'DEVGRU-TTS está completamente iniciado.'
            );
        } catch (error) {
            logger.error(
                'No se pudo inicializar DEVGRU-TTS.',
                error
            );

            process.exit(1);
        }
    }
);

client.on(
    'messageCreate',
    async message => {
        try {
            await messageCreate(
                message,
                client
            );
        } catch (error) {
            logger.error(
                'Error en messageCreate.',
                error
            );
        }
    }
);

client.on(
    'voiceStateUpdate',
    async (
        oldState,
        newState
    ) => {
        try {
            await voiceStateUpdate(
                oldState,
                newState,
                client
            );
        } catch (error) {
            logger.error(
                'Error en voiceStateUpdate.',
                error
            );
        }
    }
);

client.on(
    'error',
    error
);

process.on(
    'unhandledRejection',
    error => {
        logger.error(
            'Unhandled promise rejection.',
            error
        );
    }
);

process.on(
    'uncaughtException',
    error => {
        logger.error(
            'Uncaught exception.',
            error
        );
    }
);

client.login(
    config.token
);