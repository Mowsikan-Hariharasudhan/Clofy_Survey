import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { getSurveyById } from '@/lib/surveyStorage';
import { AudioPlayer } from '@/components/survey/AudioPlayer';
import { format } from 'date-fns';
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
  Image as ImageIcon,
  Play,
  ExternalLink,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const survey = getSurveyById(id || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!survey) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Survey Details" showBack />
        <main className="container px-4 py-12 text-center">
          <p className="text-muted-foreground">Survey not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/surveys')}
            className="mt-4"
          >
            Back to Surveys
          </Button>
        </main>
      </div>
    );
  }

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
      <div className="flex items-start gap-3 py-3">
        <Icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-foreground">{value}</p>
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
    <div className="bg-card rounded-xl border border-border p-4 space-y-2">
      <h3 className="font-semibold text-foreground text-lg">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );

  const TagList = ({ items, emptyText = 'None' }: { items: string[]; emptyText?: string }) => {
    if (!items || items.length === 0) {
      return <span className="text-muted-foreground">{emptyText}</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm capitalize"
          >
            {item.replace(/([A-Z])/g, ' $1').trim()}
          </span>
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

  return (
    <div className="min-h-screen bg-background pb-6">
      <Header title="Survey Details" showBack />

      <main className="container px-4 py-4 space-y-4">
        {/* Header Card */}
        <div className="bg-card rounded-xl border border-border p-4 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {survey.common.shopName}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {shopTypeLabels[survey.common.shopType]}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5",
              survey.hasBillingSoftware 
                ? "bg-success/10 text-success" 
                : "bg-warning/10 text-warning"
            )}>
              {survey.hasBillingSoftware ? (
                <>
                  <Monitor className="w-4 h-4" />
                  Has Software
                </>
              ) : (
                <>
                  <FileX className="w-4 h-4" />
                  No Software
                </>
              )}
            </span>
          </div>

          <div className="divide-y divide-border">
            <InfoRow icon={User} label="Owner / Contact" value={survey.common.ownerName} />
            <InfoRow icon={Phone} label="Phone" value={survey.common.phoneNumber} />
            <InfoRow icon={Store} label="Bills Per Day" value={billsPerDayLabels[survey.common.billsPerDay]} />
            <InfoRow icon={User} label="Billing Handler" value={survey.common.billingHandler} />
            <InfoRow icon={User} label="Surveyor" value={survey.common.surveyorName} />
            <InfoRow 
              icon={Calendar} 
              label="Survey Date" 
              value={format(new Date(survey.createdAt), 'PPpp')} 
            />
          </div>

          {survey.common.location && (
            <button
              onClick={openGoogleMaps}
              className="w-full mt-4 p-3 bg-secondary rounded-lg flex items-center justify-between hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">
                  {survey.common.location.latitude.toFixed(6)}, {survey.common.location.longitude.toFixed(6)}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Software Path Details */}
        {survey.hasBillingSoftware && survey.softwarePath && (
          <>
            <Section title="Current Setup">
              <InfoRow icon={Monitor} label="Software Name" value={survey.softwarePath.softwareName || 'Not specified'} />
              <InfoRow icon={Calendar} label="Using Since" value={survey.softwarePath.usageDuration.replace(/([A-Z])/g, ' $1')} />
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Devices Used</p>
                <TagList items={survey.softwarePath.devices} />
              </div>
            </Section>

            <Section title="Features & Usage">
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Features Used</p>
                <TagList items={survey.softwarePath.featuresUsed} />
              </div>
              <InfoRow icon={Lightbulb} label="Satisfaction" value={survey.softwarePath.satisfaction.replace('-', ' ')} />
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Tasks Outside Software</p>
                <TagList items={survey.softwarePath.tasksOutsideSoftware} />
              </div>
            </Section>

            <Section title="Pain Points">
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Problems Faced</p>
                <TagList items={survey.softwarePath.painPoints} />
              </div>
              {survey.softwarePath.recentIncident && (
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-1">Recent Incident</p>
                  <p className="text-foreground text-sm">{survey.softwarePath.recentIncident}</p>
                </div>
              )}
            </Section>

            <Section title="Cost & Switching">
              <InfoRow icon={DollarSign} label="Yearly Cost" value={survey.softwarePath.yearlyCost} />
              <InfoRow icon={AlertTriangle} label="Value for Money" value={survey.softwarePath.valueForMoney} />
              <InfoRow icon={Lightbulb} label="Switching Willingness" value={survey.softwarePath.switchingWillingness.replace(/([A-Z])/g, ' $1')} />
            </Section>
          </>
        )}

        {/* No Software Path Details */}
        {!survey.hasBillingSoftware && survey.noSoftwarePath && (
          <>
            <Section title="Current Process">
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Billing Methods</p>
                <TagList items={survey.noSoftwarePath.currentBillingMethods} />
              </div>
              <InfoRow icon={FileX} label="Customers Ask for GST" value={survey.noSoftwarePath.customersAskGST.replace(/([A-Z])/g, ' $1')} />
            </Section>

            <Section title="About Software">
              <InfoRow 
                icon={Lightbulb} 
                label="Considered Software Before" 
                value={survey.noSoftwarePath.consideredSoftware ? 'Yes' : 'No'} 
              />
              {survey.noSoftwarePath.consideredSoftware && survey.noSoftwarePath.stoppedReasons && (
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-2">Reasons for Not Starting</p>
                  <TagList items={survey.noSoftwarePath.stoppedReasons} />
                </div>
              )}
              {!survey.noSoftwarePath.consideredSoftware && survey.noSoftwarePath.notNeededReason && (
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-1">Why Not Needed</p>
                  <p className="text-foreground text-sm">{survey.noSoftwarePath.notNeededReason}</p>
                </div>
              )}
            </Section>

            <Section title="Current Challenges">
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Difficulties</p>
                <TagList items={survey.noSoftwarePath.currentDifficulties} />
              </div>
              <InfoRow 
                icon={AlertTriangle} 
                label="Lost Money Due to Mistakes" 
                value={survey.noSoftwarePath.lostMoneyDueToMistakes} 
              />
              {survey.noSoftwarePath.lostMoneyExplanation && (
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-1">Explanation</p>
                  <p className="text-foreground text-sm">{survey.noSoftwarePath.lostMoneyExplanation}</p>
                </div>
              )}
            </Section>

            <Section title="Interest in Software">
              <InfoRow icon={Lightbulb} label="Interested in Trying" value={survey.noSoftwarePath.interestedInTrying} />
              <InfoRow icon={DollarSign} label="Monthly Budget" value={survey.noSoftwarePath.monthlyBudget} />
            </Section>
          </>
        )}

        {/* Survey Recording */}
        {survey.attachments.preSurveyRecording && (
          <Section title="Survey Recording">
            <div className="py-3">
              <AudioPlayer 
                src={survey.attachments.preSurveyRecording} 
                title="Full Survey Recording"
              />
            </div>
          </Section>
        )}

        {/* Attachments */}
        {(survey.attachments.photos.length > 0 || survey.attachments.voiceNote || survey.attachments.detailedFeedbackRecording || survey.attachments.futureVisionRecording) && (
          <Section title="Attachments">
            {survey.attachments.photos.length > 0 && (
              <div className="py-3">
                <p className="text-xs text-muted-foreground mb-2">Photos</p>
                <div className="grid grid-cols-3 gap-2">
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
              </div>
            )}
            
            {survey.attachments.voiceNote && (
              <div className="py-3">
                <AudioPlayer 
                  src={survey.attachments.voiceNote} 
                  title="Voice Note"
                />
              </div>
            )}

            {survey.attachments.detailedFeedbackRecording && (
              <div className="py-3">
                <AudioPlayer 
                  src={survey.attachments.detailedFeedbackRecording} 
                  title="Detailed Feedback Recording"
                />
              </div>
            )}

            {survey.attachments.futureVisionRecording && (
              <div className="py-3">
                <AudioPlayer 
                  src={survey.attachments.futureVisionRecording} 
                  title="Future Vision Recording"
                />
              </div>
            )}
          </Section>
        )}

        {/* Additional Notes */}
        {survey.additionalNotes && (
          <Section title="Additional Notes">
            <div className="py-3">
              <p className="text-foreground">{survey.additionalNotes}</p>
            </div>
          </Section>
        )}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default SurveyDetail;
