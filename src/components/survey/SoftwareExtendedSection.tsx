import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { VoiceRecorder } from './VoiceRecorder';
import { SectionHeader } from './SectionHeader';
import { SoftwarePathExtended, SurveyAttachments } from '@/types/survey';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Briefcase, 
  Star, 
  ArrowRightLeft, 
  TrendingUp, 
  Rocket,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SoftwareExtendedSectionProps {
  data: SoftwarePathExtended;
  attachments: SurveyAttachments;
  onChange: (data: Partial<SoftwarePathExtended>) => void;
  onAttachmentsChange: (attachments: Partial<SurveyAttachments>) => void;
}

const onboardingOptions = [
  { value: 'vendorTraining', label: 'Vendor Provided Training' },
  { value: 'selfTaught', label: 'Self-taught (Tutorials/YouTube)' },
  { value: 'staffLearned', label: 'Staff Learned Over Time' },
  { value: 'stillStruggling', label: 'Still Struggling to Use Fully' },
  { value: 'other', label: 'Other' },
];

const updateFrequencyOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'asNeeded', label: 'As Needed' },
  { value: 'never', label: 'Never' },
  { value: 'notSure', label: 'Not Sure' },
];

const comparedOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'considered', label: 'Considered but did not explore' },
];

const switchingRequirementOptions = [
  { value: 'lowerCost', label: 'Significantly Lower Cost' },
  { value: 'solvePainPoints', label: 'Solve 2-3 Major Pain Points' },
  { value: 'trustedRecommendation', label: 'Recommendation from Trusted Source' },
  { value: 'betterSupport', label: 'Better Support / Local Language' },
  { value: 'mobileApp', label: 'Mobile App Availability' },
  { value: 'integrations', label: 'Integration with Other Systems' },
  { value: 'easyMigration', label: 'Easier Data Migration' },
  { value: 'other', label: 'Other' },
];

const futureNeedsOptions = [
  { value: 'multiLocation', label: 'Multi-location/Branch Support' },
  { value: 'advancedAnalytics', label: 'Advanced Analytics & Reporting' },
  { value: 'crm', label: 'Customer Relationship Management' },
  { value: 'ecommerce', label: 'E-commerce Integration' },
  { value: 'accountingLink', label: 'Accounting Software Link-up' },
  { value: 'onlineOrdering', label: 'Online Ordering System' },
  { value: 'subscriptionBilling', label: 'Subscription/Recurring Billing' },
  { value: 'aiInsights', label: 'AI-powered Insights' },
  { value: 'mobileFirst', label: 'Mobile-first Design' },
  { value: 'localLanguage', label: 'Local Language Support' },
  { value: 'other', label: 'Other' },
];

const featureRatingLabels = [
  { key: 'billPrinting', label: 'Bill Printing' },
  { key: 'inventoryTracking', label: 'Inventory Tracking' },
  { key: 'gstCalculation', label: 'GST/Tax Calculation' },
  { key: 'reportGeneration', label: 'Report Generation' },
  { key: 'creditTracking', label: 'Customer Credit Tracking' },
  { key: 'backupSafety', label: 'Backup/Data Safety' },
  { key: 'mobileAccess', label: 'Mobile Access' },
  { key: 'supportDocs', label: 'Support/Help Documentation' },
];

function RatingSlider({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value?: number; 
  onChange: (val: number | undefined) => void;
}) {
  const ratingLabels = ['Not Used', '1', '2', '3', '4', '5'];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <span className={cn(
          "text-sm font-medium px-2 py-0.5 rounded",
          value === undefined ? "bg-muted text-muted-foreground" :
          value >= 4 ? "bg-success/20 text-success" :
          value >= 3 ? "bg-warning/20 text-warning" :
          "bg-destructive/20 text-destructive"
        )}>
          {value === undefined ? 'Not Used' : `${value}/5`}
        </span>
      </div>
      <Slider
        value={[value ?? 0]}
        onValueChange={([val]) => onChange(val === 0 ? undefined : val)}
        min={0}
        max={5}
        step={1}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        {ratingLabels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export function SoftwareExtendedSection({ 
  data, 
  attachments,
  onChange, 
  onAttachmentsChange 
}: SoftwareExtendedSectionProps) {
  const handleFeatureSatisfactionChange = (key: string, value: number | undefined) => {
    onChange({
      featureSatisfaction: {
        ...data.featureSatisfaction,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* A6. Operational Impact */}
      <div className="space-y-6">
        <SectionHeader 
          title="Operational Impact" 
          subtitle="How the software has changed your operations"
          icon={Briefcase}
        />

        <FormField 
          label="How has the billing software changed your daily operations?"
          helper="What's different since you started using it?"
        >
          <Textarea
            value={data.operationalChanges || ''}
            onChange={(e) => onChange({ operationalChanges: e.target.value })}
            placeholder="Describe specific examples of what changed..."
            rows={4}
          />
        </FormField>

        <CheckboxField
          label="What was the onboarding process like?"
          values={data.onboardingProcess || []}
          onChange={(values) => onChange({ onboardingProcess: values })}
          options={onboardingOptions}
        />

        {data.onboardingProcess?.includes('other') && (
          <FormField label="Other onboarding experience">
            <Input
              value={data.otherOnboarding || ''}
              onChange={(e) => onChange({ otherOnboarding: e.target.value })}
              placeholder="Describe other onboarding experience"
            />
          </FormField>
        )}

        <SelectField
          label="How often do you receive software updates?"
          value={data.updateFrequency || ''}
          onChange={(value) => onChange({ updateFrequency: value as any })}
          options={updateFrequencyOptions}
          placeholder="Select frequency"
        />

        <FormField 
          label="When software stops working or crashes, what is the impact on your shop?"
          helper="How long do you lose business? How do you manage?"
        >
          <Textarea
            value={data.crashImpact || ''}
            onChange={(e) => onChange({ crashImpact: e.target.value })}
            placeholder="Describe the impact..."
            rows={3}
          />
        </FormField>
      </div>

      {/* A7. Feature Satisfaction */}
      <div className="space-y-6">
        <SectionHeader 
          title="Feature Satisfaction" 
          subtitle="Rate each feature (1-5 or Not Used)"
          icon={Star}
        />

        <div className="space-y-6 card-elevated p-4">
          {featureRatingLabels.map(({ key, label }) => (
            <RatingSlider
              key={key}
              label={label}
              value={(data.featureSatisfaction as any)?.[key]}
              onChange={(val) => handleFeatureSatisfactionChange(key, val)}
            />
          ))}
        </div>

        <FormField 
          label="Which feature would you most like to improve if you could change one thing?"
        >
          <Input
            value={data.featureToImprove || ''}
            onChange={(e) => onChange({ featureToImprove: e.target.value })}
            placeholder="Enter the feature you'd improve"
          />
        </FormField>

        <FormField 
          label="Why is this improvement important to you?"
        >
          <Textarea
            value={data.featureImproveReason || ''}
            onChange={(e) => onChange({ featureImproveReason: e.target.value })}
            placeholder="Explain why..."
            rows={3}
          />
        </FormField>
      </div>

      {/* A8. Comparative & Switching Intent */}
      <div className="space-y-6">
        <SectionHeader 
          title="Comparative & Switching Intent" 
          subtitle="Your experience with alternatives"
          icon={ArrowRightLeft}
        />

        <RadioField
          label="Have you ever compared your current software with competitors?"
          value={data.comparedWithCompetitors || ''}
          onChange={(value) => onChange({ comparedWithCompetitors: value as any })}
          options={comparedOptions}
        />

        {data.comparedWithCompetitors === 'yes' && (
          <FormField label="Which alternatives have you looked at?">
            <Input
              value={data.alternativesLookedAt || ''}
              onChange={(e) => onChange({ alternativesLookedAt: e.target.value })}
              placeholder="List the alternatives..."
            />
          </FormField>
        )}

        <CheckboxField
          label="What would it take for you to seriously consider switching?"
          values={data.switchingRequirements || []}
          onChange={(values) => onChange({ switchingRequirements: values })}
          options={switchingRequirementOptions}
        />

        {data.switchingRequirements?.includes('other') && (
          <FormField label="Other switching requirement">
            <Input
              value={data.otherSwitchingReq || ''}
              onChange={(e) => onChange({ otherSwitchingReq: e.target.value })}
              placeholder="Describe other requirement"
            />
          </FormField>
        )}

        <div className="space-y-3">
          <Label>How loyal do you feel to your current software vendor?</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[data.vendorLoyalty ?? 3]}
              onValueChange={([val]) => onChange({ vendorLoyalty: val })}
              min={1}
              max={5}
              step={1}
              className="flex-1"
            />
            <span className={cn(
              "text-sm font-medium px-3 py-1 rounded min-w-[100px] text-center",
              (data.vendorLoyalty ?? 3) >= 4 ? "bg-success/20 text-success" :
              (data.vendorLoyalty ?? 3) >= 3 ? "bg-warning/20 text-warning" :
              "bg-destructive/20 text-destructive"
            )}>
              {data.vendorLoyalty === 5 ? 'Very Loyal' :
               data.vendorLoyalty === 4 ? 'Loyal' :
               data.vendorLoyalty === 3 ? 'Neutral' :
               data.vendorLoyalty === 2 ? 'Looking' :
               data.vendorLoyalty === 1 ? 'Will Switch' : 'Neutral'}
            </span>
          </div>
        </div>
      </div>

      {/* A9. Business Impact */}
      <div className="space-y-6">
        <SectionHeader 
          title="Business Impact" 
          subtitle="Estimate the financial impact of your software"
          icon={TrendingUp}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Time saved per day (in hours)">
            <Input
              value={data.timeSavedDaily || ''}
              onChange={(e) => onChange({ timeSavedDaily: e.target.value })}
              placeholder="e.g., 2 hours"
            />
          </FormField>

          <FormField label="Reduction in billing errors (approx. %)">
            <Input
              value={data.errorReduction || ''}
              onChange={(e) => onChange({ errorReduction: e.target.value })}
              placeholder="e.g., 80%"
            />
          </FormField>

          <FormField label="Additional revenue due to features (if any)">
            <Input
              value={data.additionalRevenue || ''}
              onChange={(e) => onChange({ additionalRevenue: e.target.value })}
              placeholder="e.g., ₹5,000/month"
            />
          </FormField>

          <FormField label="Cost savings from automation (if any)">
            <Input
              value={data.costSavings || ''}
              onChange={(e) => onChange({ costSavings: e.target.value })}
              placeholder="e.g., ₹3,000/month"
            />
          </FormField>
        </div>

        <FormField 
          label="If you had to stop using the software today, what would be the biggest loss to your shop?"
        >
          <Textarea
            value={data.biggestLossIfStopped || ''}
            onChange={(e) => onChange({ biggestLossIfStopped: e.target.value })}
            placeholder="Describe the biggest loss..."
            rows={4}
          />
        </FormField>
      </div>

      {/* A10. Future Needs */}
      <div className="space-y-6">
        <SectionHeader 
          title="Future Needs" 
          subtitle="Features important for your shop's growth"
          icon={Rocket}
        />

        <CheckboxField
          label="What new features or improvements are most important for your shop's future growth?"
          values={data.futureNeeds || []}
          onChange={(values) => onChange({ futureNeeds: values })}
          options={futureNeedsOptions}
        />

        {data.futureNeeds?.includes('localLanguage') && (
          <FormField label="Which language would you prefer?">
            <Input
              value={data.preferredLanguage || ''}
              onChange={(e) => onChange({ preferredLanguage: e.target.value })}
              placeholder="e.g., Tamil, Hindi, Telugu..."
            />
          </FormField>
        )}

        {data.futureNeeds?.includes('other') && (
          <FormField label="Other future need">
            <Input
              value={data.otherFutureNeed || ''}
              onChange={(e) => onChange({ otherFutureNeed: e.target.value })}
              placeholder="Describe other need"
            />
          </FormField>
        )}
      </div>

      {/* A11. Voice Feedback - Deep Dive */}
      <div className="space-y-6">
        <SectionHeader 
          title="Detailed Voice Feedback" 
          subtitle="Record a 2-3 minute detailed feedback session"
          icon={Mic}
        />

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
          <p className="text-sm font-medium text-foreground">Recording prompts:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Describe the best thing about your software</li>
            <li>Describe the worst thing about your software</li>
            <li>What advice would you give to other shop owners?</li>
          </ul>
        </div>

        <VoiceRecorder
          voiceNote={attachments.detailedFeedbackRecording}
          onChange={(recording) => onAttachmentsChange({ detailedFeedbackRecording: recording })}
          label="Record Detailed Feedback (no time limit)"
          unlimited
        />
      </div>
    </div>
  );
}
