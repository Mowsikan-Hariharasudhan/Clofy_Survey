import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SectionHeader } from './SectionHeader';
import { Mic, Square, Play, Pause, RotateCcw, ArrowRight, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPreferredAudioMimeType } from '@/lib/audioRecording';

interface PreSurveyRecordingProps {
  recording?: string;
  onRecordingChange: (recording: string | undefined) => void;
  onConfirmAndProceed: () => void;
}

export function PreSurveyRecording({ 
  recording, 
  onRecordingChange, 
  onConfirmAndProceed 
}: PreSurveyRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string | undefined>(undefined);
  
  const isUnlimited = true; // Allow unlimited recording

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (recording && audioRef.current) {
      audioRef.current.src = recording;
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(Math.floor(audioRef.current.duration));
        }
      };
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      };
    }
  }, [recording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const preferredMimeType = getPreferredAudioMimeType();
      mimeTypeRef.current = preferredMimeType;
      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mimeTypeRef.current || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        const reader = new FileReader();
        reader.onload = () => {
          onRecordingChange(reader.result as string);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setIsConfirmed(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (recording && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      
      playbackTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          setPlaybackTime(Math.floor(audioRef.current.currentTime));
        }
      }, 100);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }
  };

  const reRecord = () => {
    onRecordingChange(undefined);
    setDuration(0);
    setPlaybackTime(0);
    setIsConfirmed(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canProceed = recording && isConfirmed;

  return (
    <div className="space-y-8 animate-slide-up">
      <audio ref={audioRef} hidden />
      
      <SectionHeader 
        title="Start Survey Recording"
        subtitle="This recording will capture background context and your initial observations. Keep it under 2 minutes."
        icon={Volume2}
      />

      <div className="card-elevated p-6 space-y-6">
        {/* Recording State */}
        {!recording ? (
          <div className="text-center space-y-6">
            {/* Large Record Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300",
                isRecording 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                  : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl"
              )}
            >
              {isRecording ? (
                <Square className="w-12 h-12 text-destructive-foreground" />
              ) : (
                <Mic className="w-12 h-12 text-primary-foreground" />
              )}
            </button>

            {/* Status Text */}
            <div className="space-y-2">
              {isRecording ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    <span className="text-lg font-semibold text-destructive">Recording...</span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-foreground">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">Click to stop recording</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-foreground">Click to Start Recording</p>
                  <p className="text-sm text-muted-foreground">No time limit</p>
                </>
              )}
            </div>

            {/* Recording Indicator */}
            {isRecording && (
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive animate-pulse"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Playback State */
          <div className="space-y-6">
            {/* Waveform Visualization (simplified) */}
            <div className="bg-muted/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <Button
                  type="button"
                  variant={isPlaying ? "outline" : "gradient"}
                  size="lg"
                  onClick={isPlaying ? pauseRecording : playRecording}
                  className="w-14 h-14 rounded-full p-0"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>

                {/* Progress Bar */}
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: duration > 0 ? `${(playbackTime / duration) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(playbackTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Waveform bars (decorative) */}
              <div className="flex items-center justify-center gap-1 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1 bg-primary/40 rounded-full transition-all duration-150",
                      isPlaying && "animate-pulse"
                    )}
                    style={{ 
                      height: `${Math.random() * 100}%`,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Re-record Button */}
            <Button
              type="button"
              variant="outline"
              onClick={reRecord}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Re-record
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Checkbox */}
      {recording && (
        <div className="space-y-3 animate-slide-up">
          <label
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
              isConfirmed 
                ? "border-primary bg-primary/5" 
                : "border-input hover:border-primary/50"
            )}
          >
            <Checkbox
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(!!checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              I confirm this audio is clear and ready to submit with the survey
            </span>
          </label>
        </div>
      )}

      {/* Next Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          variant="gradient"
          size="lg"
          onClick={onConfirmAndProceed}
          disabled={!canProceed}
          className="w-full"
        >
          Continue to Survey
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
