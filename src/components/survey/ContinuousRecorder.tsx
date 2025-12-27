import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPreferredAudioMimeType, getAudioConstraints } from '@/lib/audioRecording';

interface ContinuousRecorderProps {
  onRecordingComplete: (recording: string) => void;
  onTimeUpdate?: (time: number) => void;
  isActive: boolean;
  onStart: () => void;
}

export function ContinuousRecorder({
  onRecordingComplete,
  onTimeUpdate,
  isActive,
  onStart,
}: ContinuousRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(recordingTime);
    }
  }, [recordingTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      console.log('ContinuousRecorder: Requesting microphone...');

      // Get smart constraints (avoids Iriun)
      const audioConstraints = await getAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      streamRef.current = stream;

      const track = stream.getAudioTracks()[0];
      console.log(`ContinuousRecorder: Mic track active: ${track?.enabled}, label: ${track?.label}`);

      // Monitor volume for visual feedback
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const volumeCheckInterval = setInterval(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
          setAudioLevel(average);
        }
      }, 100);

      const preferredMimeType = getPreferredAudioMimeType();
      mimeTypeRef.current = preferredMimeType;
      console.log('ContinuousRecorder: Using MIME type:', preferredMimeType);

      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, {
          mimeType: preferredMimeType,
          audioBitsPerSecond: 128000
        })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // console.log(`ContinuousRecorder: Captured chunk of size ${e.data.size}`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('ContinuousRecorder: onstop triggered, chunks count:', chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          console.warn('ContinuousRecorder: No audio chunks captured!');
          return;
        }

        const blobType = mimeTypeRef.current || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        console.log(`ContinuousRecorder: Created blob of type ${blobType}, size: ${blob.size} bytes`);

        if (blob.size === 0) {
          console.warn('ContinuousRecorder: Blob size is 0, skipping completion');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          onRecordingComplete(reader.result as string);
        };
        reader.readAsDataURL(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (typeof volumeCheckInterval !== 'undefined') clearInterval(volumeCheckInterval);
        if (typeof audioContext !== 'undefined') audioContext.close();
      };

      // Request data every 100ms for extra safety
      mediaRecorder.start(100);
      setIsRecording(true);
      setHasStarted(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      onStart();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  }, [onRecordingComplete, onStart]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // Stop recording when survey is submitted
  useEffect(() => {
    if (!isActive && hasStarted && isRecording) {
      stopRecording();
    }
  }, [isActive, hasStarted, isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!hasStarted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
            <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Mic className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Start Survey Recording
            </h2>
            <p className="text-muted-foreground">
              Begin recording the entire survey conversation. The recording will continue until you submit the survey.
            </p>
          </div>

          <button
            onClick={startRecording}
            className={cn(
              "w-full py-4 px-6 rounded-xl text-lg font-semibold",
              "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
              "hover:shadow-lg transition-all duration-200",
              "flex items-center justify-center gap-3"
            )}
          >
            <Mic className="w-6 h-6" />
            Start Recording & Begin Survey
          </button>

          <p className="text-xs text-muted-foreground">
            The microphone will record continuously until survey completion
          </p>
        </div>
      </div>
    );
  }

  // Recording indicator (shown as a floating badge)
  return (
    <div className="fixed bottom-20 right-4 z-50 animate-slide-up">
      <div className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-full shadow-2xl border transition-all duration-300",
        isRecording
          ? "bg-destructive/90 text-destructive-foreground border-destructive animate-pulse-soft"
          : "bg-muted text-muted-foreground border-border"
      )}>
        {isRecording ? (
          <>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-current rounded-full"
                  style={{
                    height: `${Math.min(100, Math.max(20, (audioLevel * (i + 1)) / 2))}%`,
                    transition: 'height 0.1s ease-out'
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-sm font-bold tracking-tighter">{formatTime(recordingTime)}</span>
            <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          </>
        ) : (
          <>
            <Square className="w-4 h-4" />
            <span className="text-sm font-semibold">Recording saved</span>
          </>
        )}
      </div>
    </div>
  );
}