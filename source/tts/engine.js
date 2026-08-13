import googleTTS from 'google-tts-api';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const TTS_LANGUAGE = 'es';
const TTS_SPEED = 1.0;

export async function generateTTS(text) {
    if (!text || !text.trim()) {
        throw new Error('No se proporcionó texto para TTS.');
    }

    const cleanText = text.trim();

    const parts = googleTTS.getAllAudioBase64(cleanText, {
        lang: TTS_LANGUAGE,
        slow: false,
        host: 'https://translate.google.com'
    });

    if (!parts || parts.length === 0) {
        throw new Error('No se pudo generar el audio TTS.');
    }

    const tempDirectory = await fs.mkdtemp(
        path.join(os.tmpdir(), 'devgru-tts-')
    );

    const outputPath = path.join(
        tempDirectory,
        `${crypto.randomUUID()}.mp3`
    );

    const buffers = parts.map(part =>
        Buffer.from(part.base64, 'base64')
    );

    await fs.writeFile(
        outputPath,
        Buffer.concat(buffers)
    );

    return {
        path: outputPath,
        text: cleanText,
        language: TTS_LANGUAGE,
        speed: TTS_SPEED
    };
}

export async function deleteTTSFile(filePath) {
    if (!filePath) {
        return;
    }

    try {
        await fs.rm(filePath, {
            force: true
        });
    } catch {
        // El archivo ya no existe o no pudo eliminarse.
    }
}

export async function deleteTTSDirectory(filePath) {
    if (!filePath) {
        return;
    }

    try {
        const directory = path.dirname(filePath);

        await fs.rm(directory, {
            recursive: true,
            force: true
        });
    } catch {
        // El directorio ya no existe o no pudo eliminarse.
    }
}