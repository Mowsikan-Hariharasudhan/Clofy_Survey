// Shared utilities for audio recording across browsers.
// Safari/iOS typically does NOT support audio/webm, so we prefer audio/mp4 when possible.

export const getPreferredAudioMimeType = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const MR = (window as any).MediaRecorder as typeof MediaRecorder | undefined;
  if (!MR || typeof MR.isTypeSupported !== 'function') return undefined;

  const candidates = [
    // Best quality and compatibility on Chromium/Firefox
    'audio/webm;codecs=opus',
    'audio/webm',

    // Best chance on iOS Safari
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
  ];

  return candidates.find((t) => {
    try {
      return MR.isTypeSupported(t);
    } catch {
      return false;
    }
  });
};

export const guessAudioExtension = (mimeType: string | undefined): string => {
  const t = (mimeType || '').toLowerCase();
  if (t.includes('mp4')) return 'mp4';
  if (t.includes('ogg')) return 'ogg';
  if (t.includes('wav')) return 'wav';
  return 'webm';
};

/**
 * Attempts to find the best internal/system microphone while avoiding virtual ones like Iriun.
 */
export const getAudioConstraints = async (): Promise<MediaStreamConstraints['audio']> => {
  try {
    let devices = await navigator.mediaDevices.enumerateDevices();
    let audioDevices = devices.filter(d => d.kind === 'audioinput');

    // If labels are empty, we need to request permission once to see the real names
    if (audioDevices.length > 0 && audioDevices.every(d => !d.label)) {
      console.log('getAudioConstraints: Labels hidden, requesting temporary access...');
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        devices = await navigator.mediaDevices.enumerateDevices();
        audioDevices = devices.filter(d => d.kind === 'audioinput');
        tempStream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn('getAudioConstraints: Permission denied during probe', e);
      }
    }

    console.log('Available Audio Devices:', audioDevices.map(d => d.label || 'Unknown Mic'));

    // Strictly filter out Iriun, Virtual, Webcam, DroidCam, and OBS
    const filtered = audioDevices.filter(d => {
      const label = (d.label || '').toLowerCase();
      return !label.includes('iriun') &&
        !label.includes('virtual') &&
        !label.includes('webcam') &&
        !label.includes('droidcam') &&
        !label.includes('obs') &&
        !label.includes('camera');
    });

    console.log('Filtered Audio Devices:', filtered.map(d => d.label || 'Unknown Mic'));

    let targetId: string | undefined;

    if (filtered.length > 0) {
      // Find the most likely internal system mic
      const systemMic = filtered.find(d => {
        const label = d.label.toLowerCase();
        return label.includes('realtek') ||
          label.includes('internal') ||
          label.includes('array') ||
          label.includes('built-in') ||
          label.includes('high definition');
      });
      targetId = systemMic?.deviceId || filtered[0].deviceId;
    } else if (audioDevices.length > 0) {
      // Fallback if everything was filtered (unlikely)
      targetId = audioDevices[0].deviceId;
    }

    if (targetId) {
      const label = audioDevices.find(d => d.deviceId === targetId)?.label;
      console.log(`getAudioConstraints: FORCE SELECTING -> "${label}" (ID: ${targetId})`);

      return {
        deviceId: { exact: targetId },
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true }
      };
    }

    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
  } catch (err) {
    console.error('getAudioConstraints: Error selecting device', err);
    return true;
  }
};
