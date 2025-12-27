import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads an audio blob to Supabase storage and returns the public URL
 */
export const uploadAudioToStorage = async (
  audioDataUrl: string,
  surveyId: string,
  prefix: string = 'audio'
): Promise<string | null> => {
  try {
    // Convert data URL to blob
    const response = await fetch(audioDataUrl);
    const blob = await response.blob();

    const contentType = blob.type || 'audio/webm';

    // Generate unique filename
    const timestamp = Date.now();
    const extension = contentType.includes('mp4')
      ? 'mp4'
      : contentType.includes('ogg')
        ? 'ogg'
        : 'webm';
    const fileName = `${surveyId}/${prefix}_${timestamp}.${extension}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('survey-audio')
      .upload(fileName, blob, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading audio:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('survey-audio')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error processing audio upload:', error);
    return null;
  }
};

/**
 * Delete audio files for a survey
 */
export const deleteAudioFromStorage = async (surveyId: string): Promise<void> => {
  try {
    const { data: files } = await supabase.storage
      .from('survey-audio')
      .list(surveyId);

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${surveyId}/${f.name}`);
      await supabase.storage.from('survey-audio').remove(filePaths);
    }
  } catch (error) {
    console.error('Error deleting audio:', error);
  }
};
