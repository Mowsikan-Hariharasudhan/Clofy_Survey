import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface RadioFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  helper?: string;
  layout?: 'vertical' | 'horizontal';
}

export function RadioField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  helper,
  layout = 'vertical',
}: RadioFieldProps) {
  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className={cn(
          layout === 'horizontal' 
            ? 'flex flex-wrap gap-4' 
            : 'space-y-3'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
              value === option.value 
                ? "border-primary bg-primary/5" 
                : "border-input hover:border-primary/50"
            )}
          >
            <RadioGroupItem value={option.value} />
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </RadioGroup>
    </FormField>
  );
}
