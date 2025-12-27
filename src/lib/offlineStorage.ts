import { Survey } from '@/types/survey';
import { saveSurveyAsync } from './surveyStorage';
import { uploadAudioToStorage } from './audioStorage';

const OFFLINE_QUEUE_KEY = 'offline_survey_queue';
const OFFLINE_AUDIO_KEY = 'offline_audio_queue';

interface OfflineSurvey {
  survey: Survey;
  audioDataUrl?: string;
  timestamp: number;
}

interface OfflineAudio {
  surveyId: string;
  audioDataUrl: string;
  timestamp: number;
}

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Queue a survey for later sync
export const queueSurveyForSync = (survey: Survey, audioDataUrl?: string): void => {
  const queue = getOfflineQueue();
  queue.push({
    survey,
    audioDataUrl,
    timestamp: Date.now(),
  });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

// Get offline queue
export const getOfflineQueue = (): OfflineSurvey[] => {
  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Get pending count
export const getPendingSyncCount = (): number => {
  return getOfflineQueue().length;
};

// Clear an item from queue after successful sync
const removeFromQueue = (surveyId: string): void => {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.survey.id !== surveyId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
};

// Check if a string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Sync all pending surveys
export const syncPendingSurveys = async (): Promise<{
  synced: number;
  failed: number;
}> => {
  if (!isOnline()) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const originalId = item.survey.id;

      // If the survey ID is not a valid UUID, generate a new one (but still remove the queued item by original ID)
      if (!isValidUUID(item.survey.id)) {
        const oldId = item.survey.id;
        item.survey.id = crypto.randomUUID();
        console.log(`Regenerated UUID for survey: ${oldId} -> ${item.survey.id}`);
      }

      // Upload audio if present
      if (item.audioDataUrl) {
        const url = await uploadAudioToStorage(item.audioDataUrl, item.survey.id, 'main');
        if (url) {
          item.survey.attachments.preSurveyRecording = url;
        }
      }

      const audioKeys = ['voiceNote', 'detailedFeedbackRecording', 'futureVisionRecording'] as const;
      for (const key of audioKeys) {
        const value = item.survey.attachments[key];
        if (typeof value === 'string' && value.startsWith('data:audio')) {
          const url = await uploadAudioToStorage(value, item.survey.id, key);
          if (url) {
            (item.survey.attachments as any)[key] = url;
          }
        }
      }

      // Save survey to database
      await saveSurveyAsync(item.survey);

      // Important: remove from queue using the ID that was stored in localStorage
      removeFromQueue(originalId);
      synced++;
    } catch (error) {
      console.error('Failed to sync survey:', item.survey.id, error);
      failed++;
    }
  }

  return { synced, failed };
};

// Clear all pending surveys (for manual cleanup)
export const clearPendingSurveys = (): void => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

// Listen for online/offline events
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
