import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { Location } from '@/types/survey';
import { cn } from '@/lib/utils';

interface LocationCaptureProps {
  location?: Location;
  onCapture: (location: Location) => void;
}

export function LocationCapture({ location, onCapture }: LocationCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onCapture({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable it in your browser settings.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <label className="label-text flex items-center gap-1">
        Location Data
      </label>
      
      <Button
        type="button"
        variant={location ? 'secondary' : 'outline'}
        onClick={handleCapture}
        disabled={isLoading}
        className={cn(
          "w-full justify-start gap-3",
          location && "border-success text-success"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : location ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <MapPin className="w-5 h-5" />
        )}
        {isLoading 
          ? 'Getting location...' 
          : location 
            ? 'Location captured' 
            : 'Use Current Location'
        }
      </Button>

      {location && (
        <p className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
          📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
