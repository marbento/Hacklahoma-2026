import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
const MODEL_ID = 'eleven_turbo_v2_5';

function getApiKey(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY ??
    Constants.expoConfig?.extra?.elevenLabsApiKey
  );
}

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    result += BASE64_ALPHABET[a! >> 2];
    result += BASE64_ALPHABET[((a! & 3) << 4) | (b ?? 0) >> 4];
    result += i + 1 < bytes.length ? BASE64_ALPHABET[((b! & 15) << 2) | (c ?? 0) >> 6] : '=';
    result += i + 2 < bytes.length ? BASE64_ALPHABET[(c ?? 0) & 63] : '=';
  }
  return result;
}

/**
 * Speaks the given text using Eleven Labs TTS.
 * Fetches audio, writes to temp file, plays with expo-av, then cleans up.
 * Throws if API key is missing or request fails.
 */
export async function speakWithElevenLabs(text: string): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey?.trim()) {
    throw new Error('Eleven Labs API key is not configured. Set EXPO_PUBLIC_ELEVEN_LABS_API_KEY.');
  }

  const url = `${ELEVEN_LABS_API_URL}/${DEFAULT_VOICE_ID}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Eleven Labs TTS failed: ${response.status} ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const tempUri = `${FileSystem.cacheDirectory}tts-${Date.now()}.mp3`;

  await FileSystem.writeAsStringAsync(tempUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { sound } = await Audio.Sound.createAsync(
    { uri: tempUri },
    { shouldPlay: true }
  );

  const cleanup = () => {
    sound.unloadAsync().then(() =>
      FileSystem.deleteAsync(tempUri, { idempotent: true })
    );
  };

  return new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinishAndNotReset) {
        done();
      }
    });
    setTimeout(done, 15000);
  });
}

export function isElevenLabsConfigured(): boolean {
  return Boolean(getApiKey()?.trim());
}
