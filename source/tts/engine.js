import googleTTS from 'google-tts-api';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const LANGUAGE = 'es';

export async function generateTTS(text) {
    const cleanText = text.trim();

    if (!cleanText) {
        throw new Error('El texto está vacío.');
    }

    const audioParts = await googleTTS.getAllAudioBase64(
        cleanText,
        {
            lang: LANGUAGE,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 15000
        }
    );

    if (!audioParts?.length) {
        throw new Error(
            'No se pudo generar el audio TTS.'
        );
    }

    const directory = await fs.mkdtemp(
        path.join(os.tmpdir(), 'devgru-tts-')
    );

    const filePath = path.join(
        directory,
        `${crypto.randomUUID()}.mp3`
    );

    const buffers = audioParts.map(
        part => Buffer.from(part.base64, 'base64')
    );

    await fs.writeFile(
        filePath,
        Buffer.concat(buffers)
    );

    return filePath;
}

export async function deleteTTSFile(filePath) {
    if (!filePath) {
        return;
    }

    try {
        await fs.rm(filePath, {
            force: true
        });

        await fs.rm(
            path.dirname(filePath),
            {
                recursive: true,
                force: true
            }
        );
    } catch {
        // El archivo ya fue eliminado.
    }
}