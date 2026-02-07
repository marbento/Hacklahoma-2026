import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

function getApiBaseUrl(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    Constants.expoConfig?.extra?.apiUrl
  );
}

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

async function fetchAudioFromServer(text: string): Promise<ArrayBuffer> {
  const baseUrl = getApiBaseUrl()?.trim();
  if (!baseUrl) throw new Error('Server API URL is not configured. Set EXPO_PUBLIC_API_URL.');
  const url = `${baseUrl.replace(/\/$/, '')}/tts`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`TTS failed: ${response.status} ${errText}`);
  }
  return response.arrayBuffer();
}

async function fetchAudioFromElevenLabs(text: string): Promise<ArrayBuffer> {
  const apiKey = getApiKey();
  if (!apiKey?.trim()) {
    throw new Error('Eleven Labs API key is not configured. Set EXPO_PUBLIC_ELEVEN_LABS_API_KEY.');
  }
  const url = `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5' }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Eleven Labs TTS failed: ${response.status} ${errText}`);
  }
  return response.arrayBuffer();
}

/**
 * Speaks the given text using Eleven Labs TTS.
 * Uses server /tts when EXPO_PUBLIC_API_URL is set, otherwise calls Eleven Labs directly.
 * Fetches audio, writes to temp file, plays with expo-av, then cleans up.
 */
export async function speakWithElevenLabs(text: string): Promise<void> {
  const arrayBuffer = getApiBaseUrl()?.trim()
    ? await fetchAudioFromServer(text)
    : await fetchAudioFromElevenLabs(text);

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

/** True if TTS is available (server URL or Eleven Labs API key set). */
export function isElevenLabsConfigured(): boolean {
  return Boolean(getApiBaseUrl()?.trim() || getApiKey()?.trim());
}
