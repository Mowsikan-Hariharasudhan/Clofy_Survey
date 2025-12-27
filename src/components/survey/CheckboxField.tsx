import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CheckboxFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  helper?: string;
}

export function CheckboxField({
  label,
  values,
  onChange,
  options,
  required,
  error,
  helper,
}: CheckboxFieldProps) {
  const handleToggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <FormField label={label} required={required} error={error} helper={helper}>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200",
              values.includes(option.value)
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50"
            )}
          >
            <Checkbox
              checked={values.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
            />
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
}
