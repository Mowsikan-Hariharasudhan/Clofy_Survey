import { Survey } from '@/types/survey';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Monitor, 
  FileX,
  DollarSign,
  Lightbulb,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriorityBadge } from './SurveyNotesDialog';

interface SurveyCompareDrawerProps {
  surveys: Survey[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveSurvey: (id: string) => void;
}

const shopTypeLabels: Record<string, string> = {
  grocery: 'Grocery',
  pharmacy: 'Pharmacy',
  textiles: 'Textiles',
  electronics: 'Electronics',
  mobile: 'Mobile',
  restaurant: 'Restaurant',
  other: 'Other',
};

const satisfactionLabels: Record<string, string> = {
  'very-satisfied': 'Very Satisfied',
  'satisfied': 'Satisfied',
  'neutral': 'Neutral',
  'unsatisfied': 'Unsatisfied',
  'very-unsatisfied': 'Very Unsatisfied',
};

export function SurveyCompareDrawer({ 
  surveys, 
  open, 
  onOpenChange,
  onRemoveSurvey,
}: SurveyCompareDrawerProps) {
  if (surveys.length === 0) return null;

  const CompareRow = ({ 
    label, 
    values, 
    highlight = false 
  }: { 
    label: string; 
    values: (string | undefined)[]; 
    highlight?: boolean;
  }) => (
    <div className={cn(
      "grid gap-3 py-2 border-b border-border/50",
      highlight && "bg-primary/5"
    )} style={{ gridTemplateColumns: `120px repeat(${surveys.length}, 1fr)` }}>
      <div className="text-xs text-muted-foreground font-medium px-2">{label}</div>
      {values.map((value, i) => (
        <div key={i} className="text-sm text-foreground px-2">
          {value || <span className="text-muted-foreground">—</span>}
        </div>
      ))}
    </div>
  );

  const TagRow = ({ 
    label, 
    values 
  }: { 
    label: string; 
    values: (string[] | undefined)[]; 
  }) => (
    <div className="grid gap-3 py-2 border-b border-border/50" style={{ gridTemplateColumns: `120px repeat(${surveys.length}, 1fr)` }}>
      <div className="text-xs text-muted-foreground font-medium px-2">{label}</div>
      {values.map((items, i) => (
        <div key={i} className="flex flex-wrap gap-1 px-2">
          {items && items.length > 0 ? (
            items.map((item, j) => (
              <Badge key={j} variant="secondary" className="text-xs capitalize">
                {item.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0" side="right">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>Compare Surveys ({surveys.length})</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4">
            {/* Survey Headers */}
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: `120px repeat(${surveys.length}, 1fr)` }}>
              <div></div>
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-muted/50 rounded-lg p-3 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => onRemoveSurvey(survey.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <h4 className="font-semibold text-sm truncate pr-6">{survey.common.shopName}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        survey.hasBillingSoftware 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {survey.hasBillingSoftware ? (
                        <><Monitor className="w-3 h-3 mr-1" /> Software</>
                      ) : (
                        <><FileX className="w-3 h-3 mr-1" /> Manual</>
                      )}
                    </Badge>
                    <PriorityBadge priority={survey.meta?.priority} />
                  </div>
                </div>
              ))}
            </div>

            {/* Basic Info Section */}
            <div className="mb-6">
              <h5 className="font-medium text-sm mb-2 px-2">Basic Information</h5>
              <div className="bg-muted/30 rounded-lg overflow-hidden">
                <CompareRow 
                  label="Shop Type" 
                  values={surveys.map(s => shopTypeLabels[s.common.shopType])} 
                />
                <CompareRow 
                  label="Bills/Day" 
                  values={surveys.map(s => s.common.billsPerDay)} 
                />
                <CompareRow 
                  label="Handler" 
                  values={surveys.map(s => s.common.billingHandler)} 
                  highlight
                />
                <CompareRow 
                  label="Surveyor" 
                  values={surveys.map(s => s.common.surveyorName)} 
                />
                <CompareRow 
                  label="Date" 
                  values={surveys.map(s => format(new Date(s.createdAt), 'MMM d, yyyy'))} 
                />
              </div>
            </div>

            {/* Software Users Section */}
            {surveys.some(s => s.hasBillingSoftware) && (
              <div className="mb-6">
                <h5 className="font-medium text-sm mb-2 px-2">Software Details</h5>
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  <CompareRow 
                    label="Software" 
                    values={surveys.map(s => s.softwarePath?.softwareName)} 
                    highlight
                  />
                  <CompareRow 
                    label="Duration" 
                    values={surveys.map(s => s.softwarePath?.usageDuration)} 
                  />
                  <CompareRow 
                    label="Satisfaction" 
                    values={surveys.map(s => 
                      s.softwarePath?.satisfaction 
                        ? satisfactionLabels[s.softwarePath.satisfaction] 
                        : undefined
                    )} 
                    highlight
                  />
                  <CompareRow 
                    label="Yearly Cost" 
                    values={surveys.map(s => s.softwarePath?.yearlyCost)} 
                  />
                  <CompareRow 
                    label="Value for Money" 
                    values={surveys.map(s => s.softwarePath?.valueForMoney)} 
                  />
                  <CompareRow 
                    label="Switch Intent" 
                    values={surveys.map(s => s.softwarePath?.switchingWillingness)} 
                    highlight
                  />
                  <TagRow 
                    label="Devices" 
                    values={surveys.map(s => s.softwarePath?.devices)} 
                  />
                  <TagRow 
                    label="Features" 
                    values={surveys.map(s => s.softwarePath?.featuresUsed)} 
                  />
                  <TagRow 
                    label="Pain Points" 
                    values={surveys.map(s => s.softwarePath?.painPoints)} 
                  />
                </div>
              </div>
            )}

            {/* Non-Software Users Section */}
            {surveys.some(s => !s.hasBillingSoftware) && (
              <div className="mb-6">
                <h5 className="font-medium text-sm mb-2 px-2">Manual Billing Details</h5>
                <div className="bg-muted/30 rounded-lg overflow-hidden">
                  <CompareRow 
                    label="GST Requests" 
                    values={surveys.map(s => s.noSoftwarePath?.customersAskGST)} 
                  />
                  <CompareRow 
                    label="Interested" 
                    values={surveys.map(s => s.noSoftwarePath?.interestedInTrying)} 
                    highlight
                  />
                  <CompareRow 
                    label="Budget" 
                    values={surveys.map(s => s.noSoftwarePath?.monthlyBudget)} 
                    highlight
                  />
                  <CompareRow 
                    label="Lost Money" 
                    values={surveys.map(s => s.noSoftwarePath?.lostMoneyDueToMistakes)} 
                  />
                  <TagRow 
                    label="Methods" 
                    values={surveys.map(s => s.noSoftwarePath?.currentBillingMethods)} 
                  />
                  <TagRow 
                    label="Difficulties" 
                    values={surveys.map(s => s.noSoftwarePath?.currentDifficulties)} 
                  />
                </div>
              </div>
            )}

            {/* Admin Notes Section */}
            {surveys.some(s => s.meta?.adminNotes) && (
              <div className="mb-6">
                <h5 className="font-medium text-sm mb-2 px-2">Admin Notes</h5>
                <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${surveys.length}, 1fr)` }}>
                  <div></div>
                  {surveys.map((survey) => (
                    <div key={survey.id} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-foreground">
                        {survey.meta?.adminNotes || <span className="text-muted-foreground">No notes</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}