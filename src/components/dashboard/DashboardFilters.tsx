import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon, Filter, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from '@/lib/surveyStorage';
import { Satisfaction } from '@/types/survey';

interface DashboardFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  shopType: string;
  onShopTypeChange: (type: string) => void;
  hasSoftware: 'yes' | 'no' | 'all';
  onHasSoftwareChange: (value: 'yes' | 'no' | 'all') => void;
  surveyorName: string;
  onSurveyorNameChange: (name: string) => void;
  surveyors: string[];
  onExportCSV: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

const shopTypeLabels: Record<string, string> = {
  all: 'All Types',
  grocery: 'Grocery',
  pharmacy: 'Pharmacy',
  textiles: 'Textiles',
  electronics: 'Electronics',
  mobile: 'Mobile',
  restaurant: 'Restaurant',
  other: 'Other',
};

const quickDateRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 0 },
];

export function DashboardFilters({
  dateRange,
  onDateRangeChange,
  shopType,
  onShopTypeChange,
  hasSoftware,
  onHasSoftwareChange,
  surveyorName,
  onSurveyorNameChange,
  surveyors,
  onExportCSV,
  onExportPDF,
  onExportExcel,
}: DashboardFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleQuickDateRange = (days: number) => {
    if (days === 0) {
      onDateRangeChange(undefined);
    } else {
      const end = new Date();
      const start = subDays(end, days);
      onDateRangeChange({ start, end });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Date Filters */}
      <div className="flex flex-wrap gap-2">
        {quickDateRanges.map((range) => (
          <Button
            key={range.days}
            variant={
              (range.days === 0 && !dateRange) ||
              (dateRange && 
                Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) === range.days
              )
                ? 'default'
                : 'outline'
            }
            size="sm"
            onClick={() => handleQuickDateRange(range.days)}
          >
            {range.label}
          </Button>
        ))}
        
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Custom
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange ? { from: dateRange.start, to: dateRange.end } : undefined}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ start: range.from, end: range.to });
                  setIsCalendarOpen(false);
                }
              }}
              numberOfMonths={1}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-3">
        <Select value={shopType} onValueChange={onShopTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Shop Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(shopTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={hasSoftware} onValueChange={(v) => onHasSoftwareChange(v as 'yes' | 'no' | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Has Software" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">With Software</SelectItem>
            <SelectItem value="no">Without Software</SelectItem>
          </SelectContent>
        </Select>

        <Select value={surveyorName || 'all'} onValueChange={(v) => onSurveyorNameChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Surveyor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surveyors</SelectItem>
            {surveyors.map((name) => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={onExportCSV}>
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onExportPDF}>
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onExportExcel}>
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(dateRange || shopType !== 'all' || hasSoftware !== 'all' || surveyorName) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
          {dateRange && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d')}
            </span>
          )}
          {shopType !== 'all' && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs capitalize">
              {shopType}
            </span>
          )}
          {hasSoftware !== 'all' && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {hasSoftware === 'yes' ? 'With Software' : 'No Software'}
            </span>
          )}
          {surveyorName && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {surveyorName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => {
              onDateRangeChange(undefined);
              onShopTypeChange('all');
              onHasSoftwareChange('all');
              onSurveyorNameChange('');
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
