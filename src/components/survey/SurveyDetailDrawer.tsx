import { Survey } from '@/types/survey';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/survey/AudioPlayer';
import { 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Monitor, 
  FileX,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  Clock,
  Mic,
  Camera,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SurveyDetailDrawerProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkReviewed?: (id: string) => void;
  onEditNotes?: () => void;
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

const billsPerDayLabels: Record<string, string> = {
  '<50': 'Less than 50',
  '50-150': '50 - 150',
  '150-300': '150 - 300',
  '300+': 'More than 300',
};

export function SurveyDetailDrawer({ 
  survey, 
  open, 
  onOpenChange,
  onMarkReviewed,
  onEditNotes,
}: SurveyDetailDrawerProps) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!survey) return null;

  const handleViewFullDetails = () => {
    onOpenChange(false);
    navigate(`/survey/${survey.id}`);
  };

  const InfoRow = ({ 
    icon: Icon, 
    label, 
    value 
  }: { 
    icon: any; 
    label: string; 
    value: string | undefined;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm text-foreground">{value}</p>
        </div>
      </div>
    );
  };

  const Section = ({ 
    title, 
    children 
  }: { 
    title: string; 
    children: React.ReactNode;
  }) => (
    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
      <h4 className="font-medium text-foreground text-sm">{title}</h4>
      <div className="divide-y divide-border/50">{children}</div>
    </div>
  );

  const TagList = ({ items, emptyText = 'None' }: { items: string[]; emptyText?: string }) => {
    if (!items || items.length === 0) {
      return <span className="text-muted-foreground text-xs">{emptyText}</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="text-xs capitalize">
            {item.replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
        ))}
      </div>
    );
  };

  const openGoogleMaps = () => {
    if (survey.common.location) {
      const { latitude, longitude } = survey.common.location;
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    }
  };

  // Calculate stats
  const audioCount = [
    survey.attachments?.preSurveyRecording,
    survey.attachments?.detailedFeedbackRecording,
    survey.attachments?.futureVisionRecording,
    survey.attachments?.voiceNote,
  ].filter(Boolean).length;
  
  const photoCount = survey.attachments?.photos?.length || 0;
  const duration = survey.meta?.totalDuration 
    ? `${Math.floor(survey.meta.totalDuration / 60)}m ${survey.meta.totalDuration % 60}s`
    : null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SheetTitle className="text-lg">{survey.common.shopName}</SheetTitle>
                <p className="text-sm text-muted-foreground capitalize">
                  {shopTypeLabels[survey.common.shopType]}
                </p>
              </div>
              <Badge 
                variant="secondary"
                className={cn(
                  survey.hasBillingSoftware 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-warning/10 text-warning border-warning/20"
                )}
              >
                {survey.hasBillingSoftware ? (
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    Software
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <FileX className="w-3 h-3" />
                    Manual
                  </span>
                )}
              </Badge>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="p-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                {duration && (
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{duration}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Mic className="w-4 h-4 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Audio</p>
                    <p className="text-sm font-medium">{audioCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Camera className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Photos</p>
                    <p className="text-sm font-medium">{photoCount}</p>
                  </div>
                </div>
              </div>

              {/* Review Status */}
              {survey.meta?.isReviewed && (
                <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Reviewed</span>
                </div>
              )}

              {/* Basic Info */}
              <Section title="Shop Details">
                <InfoRow icon={User} label="Owner" value={survey.common.ownerName} />
                <InfoRow icon={Phone} label="Phone" value={survey.common.phoneNumber} />
                <InfoRow icon={Store} label="Bills/Day" value={billsPerDayLabels[survey.common.billsPerDay]} />
                <InfoRow icon={User} label="Handler" value={survey.common.billingHandler} />
                <InfoRow icon={User} label="Surveyor" value={survey.common.surveyorName} />
                <InfoRow icon={Calendar} label="Date" value={format(new Date(survey.createdAt), 'PPp')} />
              </Section>

              {/* Location */}
              {survey.common.location && (
                <button
                  onClick={openGoogleMaps}
                  className="w-full p-3 bg-muted/50 rounded-lg flex items-center justify-between hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm">
                      {survey.common.location.latitude.toFixed(4)}, {survey.common.location.longitude.toFixed(4)}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </button>
              )}

              {/* Software Path Details */}
              {survey.hasBillingSoftware && survey.softwarePath && (
                <>
                  <Section title="Software Setup">
                    <InfoRow icon={Monitor} label="Software" value={survey.softwarePath.softwareName || 'Not specified'} />
                    <InfoRow icon={Calendar} label="Using Since" value={survey.softwarePath.usageDuration} />
                    <div className="py-2">
                      <p className="text-xs text-muted-foreground mb-1">Devices</p>
                      <TagList items={survey.softwarePath.devices} />
                    </div>
                  </Section>

                  <Section title="Features & Satisfaction">
                    <div className="py-2">
                      <p className="text-xs text-muted-foreground mb-1">Features Used</p>
                      <TagList items={survey.softwarePath.featuresUsed} />
                    </div>
                    <InfoRow icon={Lightbulb} label="Satisfaction" value={survey.softwarePath.satisfaction} />
                  </Section>

                  <Section title="Pain Points">
                    <div className="py-2">
                      <TagList items={survey.softwarePath.painPoints} />
                    </div>
                    {survey.softwarePath.recentIncident && (
                      <div className="py-2">
                        <p className="text-xs text-muted-foreground">Recent Incident</p>
                        <p className="text-sm">{survey.softwarePath.recentIncident}</p>
                      </div>
                    )}
                  </Section>

                  <Section title="Cost & Switching">
                    <InfoRow icon={DollarSign} label="Yearly Cost" value={survey.softwarePath.yearlyCost} />
                    <InfoRow icon={AlertTriangle} label="Value" value={survey.softwarePath.valueForMoney} />
                    <InfoRow icon={Lightbulb} label="Switching" value={survey.softwarePath.switchingWillingness} />
                  </Section>
                </>
              )}

              {/* No Software Path Details */}
              {!survey.hasBillingSoftware && survey.noSoftwarePath && (
                <>
                  <Section title="Current Process">
                    <div className="py-2">
                      <p className="text-xs text-muted-foreground mb-1">Billing Methods</p>
                      <TagList items={survey.noSoftwarePath.currentBillingMethods} />
                    </div>
                    <InfoRow icon={FileX} label="GST Requests" value={survey.noSoftwarePath.customersAskGST} />
                  </Section>

                  <Section title="Challenges">
                    <div className="py-2">
                      <TagList items={survey.noSoftwarePath.currentDifficulties} />
                    </div>
                    <InfoRow icon={AlertTriangle} label="Lost Money" value={survey.noSoftwarePath.lostMoneyDueToMistakes} />
                  </Section>

                  <Section title="Interest">
                    <InfoRow icon={Lightbulb} label="Interested" value={survey.noSoftwarePath.interestedInTrying} />
                    <InfoRow icon={DollarSign} label="Budget" value={survey.noSoftwarePath.monthlyBudget} />
                  </Section>
                </>
              )}

              {/* Photos */}
              {survey.attachments.photos.length > 0 && (
                <Section title="Photos">
                  <div className="grid grid-cols-3 gap-2 py-2">
                    {survey.attachments.photos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(photo)}
                        className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Audio Recordings */}
              {(survey.attachments.preSurveyRecording || survey.attachments.voiceNote || survey.attachments.detailedFeedbackRecording || survey.attachments.futureVisionRecording) && (
                <Section title="Audio Recordings">
                  {survey.attachments.preSurveyRecording && (
                    <div className="py-2">
                      <AudioPlayer 
                        src={survey.attachments.preSurveyRecording} 
                        title="Full Survey Recording"
                      />
                    </div>
                  )}
                  {survey.attachments.voiceNote && (
                    <div className="py-2">
                      <AudioPlayer 
                        src={survey.attachments.voiceNote} 
                        title="Voice Note"
                      />
                    </div>
                  )}
                  {survey.attachments.detailedFeedbackRecording && (
                    <div className="py-2">
                      <AudioPlayer 
                        src={survey.attachments.detailedFeedbackRecording} 
                        title="Detailed Feedback Recording"
                      />
                    </div>
                  )}
                  {survey.attachments.futureVisionRecording && (
                    <div className="py-2">
                      <AudioPlayer 
                        src={survey.attachments.futureVisionRecording} 
                        title="Future Vision Recording"
                      />
                    </div>
                  )}
                </Section>
              )}

              {/* Notes */}
              {survey.additionalNotes && (
                <Section title="Notes">
                  <p className="text-sm py-2">{survey.additionalNotes}</p>
                </Section>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
            <div className="flex flex-col gap-2">
              <Button 
                className="w-full"
                onClick={handleViewFullDetails}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Details
              </Button>
              <div className="flex gap-2">
                {onEditNotes && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={onEditNotes}
                  >
                    Notes & Priority
                  </Button>
                )}
                {onMarkReviewed && !survey.meta?.isReviewed && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => onMarkReviewed(survey.id)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Reviewed
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}
