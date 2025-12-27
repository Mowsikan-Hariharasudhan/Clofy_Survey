import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SurveyCommon, 
  SoftwarePathData, 
  NoSoftwarePathData,
  SurveyAttachments 
} from '@/types/survey';

const DRAFT_KEY = 'survey_draft';
const AUTO_SAVE_INTERVAL = 5000; // Save every 5 seconds

export interface SurveyDraft {
  step: string;
  common: SurveyCommon;
  hasSoftware: boolean | null;
  softwarePath: SoftwarePathData;
  noSoftwarePath: NoSoftwarePathData;
  attachments: SurveyAttachments;
  additionalNotes: string;
  consentGiven: boolean;
  startTime: string;
  isRecordingActive: boolean;
  recordingTime: number;
  lastSaved: string;
}

export function useSurveyDraft(
  initialStep: string,
  initialCommon: SurveyCommon,
  initialSoftwarePath: SoftwarePathData,
  initialNoSoftwarePath: NoSoftwarePathData,
  initialAttachments: SurveyAttachments
) {
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as SurveyDraft;
        // Only consider it a valid draft if it's from the last 24 hours
        const lastSavedDate = new Date(parsed.lastSaved);
        const hoursSinceLastSave = (Date.now() - lastSavedDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
          setHasDraft(true);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  const saveDraft = useCallback((draft: Omit<SurveyDraft, 'lastSaved'>) => {
    const fullDraft: SurveyDraft = {
      ...draft,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(fullDraft));
    setLastSaved(new Date());
  }, []);

  const loadDraft = useCallback((): SurveyDraft | null => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        return JSON.parse(draft) as SurveyDraft;
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setLastSaved(null);
  }, []);

  const startAutoSave = useCallback((getDraftData: () => Omit<SurveyDraft, 'lastSaved'>) => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setInterval(() => {
      const draftData = getDraftData();
      // Only save if recording is active (survey in progress)
      if (draftData.isRecordingActive) {
        saveDraft(draftData);
      }
    }, AUTO_SAVE_INTERVAL);
  }, [saveDraft]);

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    hasDraft,
    lastSaved,
    saveDraft,
    loadDraft,
    clearDraft,
    startAutoSave,
    stopAutoSave,
  };
}
