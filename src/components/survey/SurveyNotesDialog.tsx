import { useState } from 'react';
import { Survey } from '@/types/survey';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Star, BookOpen, StickyNote } from 'lucide-react';

interface SurveyNotesDialogProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, notes: string, priority: 'normal' | 'high' | 'casestudy') => void;
}

const priorityOptions: { value: 'normal' | 'high' | 'casestudy'; label: string; icon: any; color: string }[] = [
  { value: 'normal', label: 'Normal', icon: StickyNote, color: 'bg-muted text-muted-foreground' },
  { value: 'high', label: 'High-Priority Lead', icon: Star, color: 'bg-warning/10 text-warning border-warning/30' },
  { value: 'casestudy', label: 'Case Study', icon: BookOpen, color: 'bg-info/10 text-info border-info/30' },
];

export function SurveyNotesDialog({ 
  survey, 
  open, 
  onOpenChange,
  onSave,
}: SurveyNotesDialogProps) {
  const [notes, setNotes] = useState(survey?.meta?.adminNotes || '');
  const [priority, setPriority] = useState<'normal' | 'high' | 'casestudy'>(
    survey?.meta?.priority || 'normal'
  );

  // Update state when survey changes
  if (survey && notes !== (survey.meta?.adminNotes || '') && !open) {
    setNotes(survey.meta?.adminNotes || '');
    setPriority(survey.meta?.priority || 'normal');
  }

  const handleSave = () => {
    if (survey) {
      onSave(survey.id, notes, priority);
      onOpenChange(false);
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notes & Priority</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Priority Selection */}
          <div className="space-y-2">
            <Label>Priority Tag</Label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = priority === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                      isSelected 
                        ? option.color + " border-current" 
                        : "bg-background border-border hover:border-primary/30"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this survey... e.g., follow-up actions, special observations, etc."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PriorityBadge({ priority }: { priority?: 'normal' | 'high' | 'casestudy' }) {
  if (!priority || priority === 'normal') return null;

  const config = {
    high: { label: 'High Priority', className: 'bg-warning/10 text-warning border-warning/30', icon: Star },
    casestudy: { label: 'Case Study', className: 'bg-info/10 text-info border-info/30', icon: BookOpen },
  };

  const { label, className, icon: Icon } = config[priority];

  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}