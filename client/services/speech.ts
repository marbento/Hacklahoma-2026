/**
 * Native (iOS/Android): use expo-speech.
 */
import * as Speech from 'expo-speech';

export function speak(text: string): void {
  Speech.speak(text);
}

export function stop(): void {
  Speech.stop();
}
