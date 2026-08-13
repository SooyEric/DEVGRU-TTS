import { parseCommand } from './utils/parser.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';

import * as play from './commands/music/play.js';
import * as skip from './commands/music/skip.js';

export class CommandHandler {
    constructor(client) {
        this.client = client;

        this.commands = new Map([
            ['play', play.execute],
            ['skip', skip.execute]
        ]);
    }

    async handle(message) {
        const parsed = parseCommand(
            message.content,
            config.prefix
        );

        if (!parsed) {
            return;
        }

        const command = this.commands.get(
            parsed.command
        );

        if (!command) {
            return;
        }

        try {
            await command(
                message,
                parsed.args,
                this.client.musicManager
            );
        } catch (error) {
            logger.error(
                `Error ejecutando -${parsed.command}.`,
                error
            );
        }
    }
}