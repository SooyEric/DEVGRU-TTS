import {
    Client,
    GatewayIntentBits
} from 'discord.js';

import { TTSSystem } from './tts.js';

const TOKEN =
    process.env.DISCORD_TOKEN;

const TTS_CHANNEL_ID =
    process.env.TTS_CHANNEL_ID;

if (!TOKEN) {
    throw new Error(
        'DISCORD_TOKEN no está configurado.'
    );
}

if (!TTS_CHANNEL_ID) {
    throw new Error(
        'TTS_CHANNEL_ID no está configurado.'
    );
}

const client =
    new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildVoiceStates
        ]
    });

const tts =
    new TTSSystem(
        TTS_CHANNEL_ID
    );

client.once(
    'clientReady',
    () => {
        console.log(
            `✅ DEVGRU-TTS conectado como ${client.user.tag}`
        );
    }
);

client.on(
    'messageCreate',
    async message => {
        try {
            if (
                message.author.bot ||
                !message.guild
            ) {
                return;
            }

            if (
                message.channel.id !==
                TTS_CHANNEL_ID
            ) {
                return;
            }

            await tts.handleMessage(
                message
            );

        } catch (error) {
            console.error(
                '[TTS] Error:',
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
            tts.handleVoiceStateUpdate(
                oldState,
                newState,
                client
            );
        } catch (error) {
            console.error(
                '[VOICE] Error:',
                error
            );
        }
    }
);

client.on(
    'error',
    error => {
        console.error(
            '[DISCORD] Error:',
            error
        );
    }
);

process.on(
    'unhandledRejection',
    error => {
        console.error(
            '[PROCESS] Unhandled rejection:',
            error
        );
    }
);

process.on(
    'uncaughtException',
    error => {
        console.error(
            '[PROCESS] Uncaught exception:',
            error
        );
    }
);

client.login(
    TOKEN
);