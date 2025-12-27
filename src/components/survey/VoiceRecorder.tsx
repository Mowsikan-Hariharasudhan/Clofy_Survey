import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { getPreferredAudioMimeType, getAudioConstraints } from '@/lib/audioRecording';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  voiceNote?: string;
  onChange: (voiceNote: string | undefined) => void;
  label?: string;
  maxDuration?: number; // Set to 0 or undefined for unlimited
  unlimited?: boolean;
}

export function VoiceRecorder({
  voiceNote,
  onChange,
  label = "Record voice note",
  maxDuration = 60,
  unlimited = false
}: VoiceRecorderProps) {
  const isUnlimited = unlimited || maxDuration === 0;
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('VoiceRecorder: Requesting microphone...');

      const audioConstraints = await getAudioConstraints();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
      streamRef.current = stream;

      const track = stream.getAudioTracks()[0];
      console.log(`VoiceRecorder: Mic track active: ${track?.enabled}, label: ${track?.label}`);

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
      console.log('VoiceRecorder: Using MIME type:', preferredMimeType);

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
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('VoiceRecorder: onstop triggered, chunks count:', chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          console.warn('VoiceRecorder: No audio chunks captured!');
          return;
        }

        const blobType = mimeTypeRef.current || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: blobType });
        console.log(`VoiceRecorder: Created blob of type ${blobType}, size: ${blob.size} bytes`);

        if (blob.size === 0) {
          console.warn('VoiceRecorder: Blob size is 0, skipping completion');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (typeof volumeCheckInterval !== 'undefined') clearInterval(volumeCheckInterval);
        if (typeof audioContext !== 'undefined') audioContext.close();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (!isUnlimited && prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('VoiceRecorder: Error accessing microphone:', error);
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
    if (voiceNote && audioRef.current) {
      audioRef.current.play().catch(e => console.error('VoiceRecorder play error:', e));
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const deleteRecording = () => {
    onChange(undefined);
    setDuration(0);
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

  return (
    <div className="space-y-3">
      <label className="label-text">{label}</label>

      {!voiceNote ? (
        <Button
          type="button"
          variant={isRecording ? 'destructive' : 'outline'}
          onClick={isRecording ? stopRecording : startRecording}
          className="w-full justify-center gap-3 touch-target"
        >
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 h-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-destructive rounded-full"
                    style={{
                      height: `${Math.min(100, Math.max(15, (audioLevel * (i % 3 + 1)) / 1.5))}%`,
                      transition: 'height 0.05s ease-out'
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-destructive font-bold uppercase tracking-tighter animate-pulse text-[10px]">
                <Square className="w-4 h-4" />
                Stop Recording ({formatTime(recordingTime)})
              </div>
            </div>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Recording
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isPlaying ? pauseRecording : playRecording}
            className="touch-target text-primary"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>

          <div className="flex-1 space-y-1">
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-primary rounded-full transition-all duration-300",
                  isPlaying ? "animate-pulse" : ""
                )}
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <span>Available</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={deleteRecording}
            className="touch-target text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5" />
          </Button>

          <audio
            ref={audioRef}
            src={voiceNote}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          />
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 text-xs text-destructive font-medium bg-destructive/5 p-2 rounded border border-destructive/10 animate-fade-in">
          <span className="w-2 h-2 bg-destructive rounded-full animate-ping" />
          RECORDING ACTIVE... {isUnlimited ? 'UNLIMITED' : `MAX ${maxDuration}s`}
        </div>
      )}

      <p className="helper-text italic">
        {isUnlimited
          ? 'Record as much details as needed (touch to start)'
          : `Record a short voice note (max ${maxDuration} seconds)`}
      </p>
    </div>
  );
}
