-- Create a storage bucket for survey audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('survey-audio', 'survey-audio', true);

-- Allow anyone to upload to survey-audio bucket
CREATE POLICY "Anyone can upload survey audio"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'survey-audio');

-- Allow anyone to read survey audio files
CREATE POLICY "Anyone can read survey audio"
ON storage.objects
FOR SELECT
USING (bucket_id = 'survey-audio');

-- Allow anyone to delete their uploaded audio
CREATE POLICY "Anyone can delete survey audio"
ON storage.objects
FOR DELETE
USING (bucket_id = 'survey-audio');