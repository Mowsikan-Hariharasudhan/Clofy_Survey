import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  label?: string;
}

export function PhotoUpload({ 
  photos, 
  onChange, 
  maxPhotos = 3,
  label = "Upload photos"
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);
    
    const newPhotos: string[] = [];
    
    for (let i = 0; i < Math.min(files.length, maxPhotos - photos.length); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      }
    }
    
    onChange([...photos, ...newPhotos]);
    setIsLoading(false);
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="label-text">{label}</label>
      
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-border"
          >
            <img 
              src={photo} 
              alt={`Photo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-input",
              "flex flex-col items-center justify-center gap-2",
              "text-muted-foreground hover:border-primary hover:text-primary",
              "transition-colors duration-200",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <Camera className="w-6 h-6" />
                <span className="text-xs">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="helper-text">
        {photos.length}/{maxPhotos} photos uploaded
      </p>
    </div>
  );
}
