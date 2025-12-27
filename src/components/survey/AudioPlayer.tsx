import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ src, title = 'Audio Recording', className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playProgressRef = useRef<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Monitor playback progress
    const interval = setInterval(() => {
      if (isPlaying && audio && !audio.paused) {
        if (playProgressRef.current === audio.currentTime && audio.currentTime > 0 && audio.currentTime < audio.duration) {
          console.warn(`AudioPlayer: audio might be STUCK at ${audio.currentTime}s. readyState=${audio.readyState}`);
        }
        playProgressRef.current = audio.currentTime;
        // console.log(`AudioPlayer Debug: t=${audio.currentTime.toFixed(2)}, vol=${audio.volume}, muted=${audio.muted}`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset state when src changes
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!src) {
      console.warn('AudioPlayer: src is empty');
      setError('Audio source is missing');
      setIsLoading(false);
      return;
    }

    console.log('AudioPlayer: Loading src:', src);

    const lower = src.toLowerCase().split('?')[0];
    let typeGuess: string | undefined;

    if (lower.includes('webm') || src.startsWith('data:audio/webm')) typeGuess = 'audio/webm';
    else if (lower.includes('mp4') || lower.includes('m4a') || src.startsWith('data:audio/mp4')) typeGuess = 'audio/mp4';
    else if (lower.includes('ogg') || src.startsWith('data:audio/ogg')) typeGuess = 'audio/ogg';
    else if (lower.includes('wav') || src.startsWith('data:audio/wav')) typeGuess = 'audio/wav';
    else if (src.startsWith('data:audio/')) typeGuess = src.split(';')[0].split(':')[1];

    if (typeGuess) {
      const support = audio.canPlayType(typeGuess);
      console.log(`AudioPlayer: Browser support for ${typeGuess}: "${support}"`);
      if (support === '') {
        setError(`Format ${typeGuess} not supported on this device.`);
        setIsLoading(false);
        return;
      }
    }

    try {
      audio.volume = 1.0; // Ensure volume is up
      console.log(`AudioPlayer: audio.muted=${audio.muted}, audio.volume=${audio.volume}`);
      audio.load();
    } catch (e) {
      console.error('AudioPlayer: Error calling audio.load():', e);
    }
  }, [src]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleError = (e: any) => {
    console.error('AudioPlayer: loading error event:', e);
    const audio = audioRef.current;
    if (audio && audio.error) {
      console.error('AudioPlayer: error code:', audio.error.code);
      console.error('AudioPlayer: error message:', audio.error.message);

      let msg = 'Failed to load audio';
      switch (audio.error.code) {
        case 1: msg = 'Audio loading aborted'; break;
        case 2: msg = 'Network error while loading audio'; break;
        case 3: msg = 'Audio decoding failed'; break;
        case 4: msg = 'Audio format not supported or file not found'; break;
      }
      setError(msg);
    } else {
      setError('Failed to load audio');
    }
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          console.error('Play error caught in toggle:', err);
          if (err.name !== 'AbortError') {
            setError('Playback failed');
            setIsPlaying(false);
          }
        });
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuteState = !isMuted;
    audio.muted = newMuteState;
    setIsMuted(newMuteState);
    console.log(`AudioPlayer: Mute toggled to ${newMuteState}. Element muted=${audio.muted}`);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(value[0])) return;
    const newTime = value[0];
    try {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } catch (e) {
      console.error('AudioPlayer: Error seeking:', e);
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
    }
  };

  if (error) {
    return (
      <div className={cn(
        "bg-secondary rounded-lg p-4 space-y-2 text-center",
        className
      )}>
        <p className="text-sm text-destructive font-medium">{error}</p>
        <p className="text-[10px] text-muted-foreground">
          Problem playing? <a href={src} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Try opening audio in a new tab</a>
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-secondary rounded-lg p-4 space-y-3",
      className
    )}>
      <audio
        key={src}
        ref={audioRef}
        src={src}
        muted={isMuted}
        preload="auto"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        onCanPlay={handleCanPlay}
      />

      <div className="flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
