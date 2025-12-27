import { Survey } from '@/types/survey';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Mic, 
  Camera, 
  FileText, 
  Home, 
  Plus,
  ChevronRight,
  Store,
  Monitor,
  FileX
} from 'lucide-react';

interface SurveySummaryProps {
  survey: Survey;
  duration: number; // in seconds
  onGoToDashboard: () => void;
  onStartNew: () => void;
}

export function SurveySummary({ survey, duration, onGoToDashboard, onStartNew }: SurveySummaryProps) {
  // Calculate audio recordings count
  const audioRecordingsCount = [
    survey.attachments?.preSurveyRecording,
    survey.attachments?.detailedFeedbackRecording,
    survey.attachments?.futureVisionRecording,
  ].filter(Boolean).length;

  // Calculate photos count
  const photosCount = survey.attachments?.photos?.length || 0;

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} min ${secs} sec`;
  };

  // Get key insights
  const keyInsights = [];
  
  if (survey.hasBillingSoftware && survey.softwarePath) {
    const satisfaction = survey.softwarePath.satisfaction;
    if (satisfaction === 'very-satisfied' || satisfaction === 'satisfied') {
      keyInsights.push({ icon: '😊', text: 'Customer is satisfied with current software' });
    } else if (satisfaction === 'unsatisfied' || satisfaction === 'very-unsatisfied') {
      keyInsights.push({ icon: '⚠️', text: 'Potential switching opportunity' });
    }
    
    if (survey.softwarePath.painPoints.length > 2) {
      keyInsights.push({ icon: '📋', text: `${survey.softwarePath.painPoints.length} pain points identified` });
    }
    
    if (survey.softwarePath.switchingWillingness === 'yesDefinitely') {
      keyInsights.push({ icon: '🔄', text: 'High willingness to switch software' });
    }
  } else if (survey.noSoftwarePath) {
    if (survey.noSoftwarePath.interestedInTrying === 'yes') {
      keyInsights.push({ icon: '🎯', text: 'High interest in adopting software' });
    }
    
    if (survey.noSoftwarePath.monthlyBudget && survey.noSoftwarePath.monthlyBudget !== 'notWilling') {
      keyInsights.push({ icon: '💰', text: `Budget: ${survey.noSoftwarePath.monthlyBudget}` });
    }
    
    if (survey.noSoftwarePath.currentDifficulties.length > 2) {
      keyInsights.push({ icon: '⚡', text: `${survey.noSoftwarePath.currentDifficulties.length} challenges identified` });
    }
  }

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Survey Complete!
          </h2>
          <p className="text-muted-foreground">
            Data collected for {survey.common.shopName}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Survey Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Spent</p>
                <p className="font-semibold text-foreground">{formatDuration(duration)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Audio Recordings</p>
                <p className="font-semibold text-foreground">{audioRecordingsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Photos Captured</p>
                <p className="font-semibold text-foreground">{photosCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                {survey.hasBillingSoftware ? (
                  <Monitor className="w-5 h-5 text-warning" />
                ) : (
                  <FileX className="w-5 h-5 text-warning" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Software Status</p>
                <p className="font-semibold text-foreground">
                  {survey.hasBillingSoftware ? 'Uses Software' : 'No Software'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Details */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Shop Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{survey.common.shopName}</p>
                <p className="text-xs text-muted-foreground capitalize">{survey.common.shopType} Shop</p>
              </div>
            </div>
            
            {survey.common.ownerName && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{survey.common.ownerName}</p>
                  <p className="text-xs text-muted-foreground">Owner</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {keyInsights.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
            
            <div className="space-y-2">
              {keyInsights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <span className="text-xl">{insight.icon}</span>
                  <p className="text-sm font-medium text-foreground">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Next Steps</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <ChevronRight className="w-5 h-5 text-primary" />
              <p className="text-sm text-foreground">Survey data has been saved locally</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <ChevronRight className="w-5 h-5 text-primary" />
              <p className="text-sm text-foreground">View this survey in the dashboard</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <ChevronRight className="w-5 h-5 text-primary" />
              <p className="text-sm text-foreground">Export data for analysis</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          variant="gradient"
          size="lg"
          onClick={onGoToDashboard}
          className="w-full"
        >
          <Home className="w-5 h-5 mr-2" />
          Go to Dashboard
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onStartNew}
          className="w-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          Start Next Survey
        </Button>
      </div>
    </div>
  );
}
