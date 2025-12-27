import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { PhotoUpload } from './PhotoUpload';
import { VoiceRecorder } from './VoiceRecorder';
import { SectionHeader } from './SectionHeader';
import { NoSoftwareExtendedSection } from './NoSoftwareExtendedSection';
import { NoSoftwarePathData, SurveyAttachments, NoSoftwarePathExtended } from '@/types/survey';
import { FileText, HelpCircle, AlertTriangle, Lightbulb, Camera } from 'lucide-react';

interface NoSoftwarePathSectionProps {
  data: NoSoftwarePathData;
  attachments: SurveyAttachments;
  onChange: (data: Partial<NoSoftwarePathData>) => void;
  onAttachmentsChange: (attachments: Partial<SurveyAttachments>) => void;
}

const billingMethodOptions = [
  { value: 'handwritten', label: 'Handwritten Bill Book' },
  { value: 'calculator', label: 'Calculator + Notebook' },
  { value: 'excel', label: 'Simple Excel Sheet' },
  { value: 'noRecord', label: 'No Detailed Record; Just Approximate Totals' },
  { value: 'other', label: 'Other' },
];

const gstFrequencyOptions = [
  { value: 'veryOften', label: 'Very Often' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'never', label: 'Never' },
];

const stoppedReasonOptions = [
  { value: 'costHigh', label: 'Cost / Subscription is High' },
  { value: 'notComfortable', label: 'Not Comfortable with Computer Systems' },
  { value: 'noTrustedVendor', label: 'No Trusted Vendor / Fear of Fraud' },
  { value: 'afraidDataLoss', label: 'Afraid of Data Loss' },
  { value: 'currentMethodEnough', label: 'Current Method Feels Enough' },
  { value: 'other', label: 'Other' },
];

const difficultyOptions = [
  { value: 'endOfDay', label: 'End-of-Day Total / Closing Stock' },
  { value: 'creditTracking', label: 'Tracking Credit / Udhaar' },
  { value: 'gstFiling', label: 'GST Filing or Tax Calculations' },
  { value: 'findingOldBills', label: 'Finding Old Bills' },
  { value: 'trainingStaff', label: 'Training New Staff' },
  { value: 'calculationMistakes', label: 'Avoiding Manual Calculation Mistakes' },
  { value: 'other', label: 'Other' },
];

const lostMoneyOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'notSure', label: 'Not Sure' },
];

const interestOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
];

const budgetOptions = [
  { value: '<300', label: 'Less than ₹300' },
  { value: '300-500', label: '₹300 - ₹500' },
  { value: '500-1000', label: '₹500 - ₹1,000' },
  { value: 'notWilling', label: 'Not Willing to Pay Monthly' },
];

export function NoSoftwarePathSection({ 
  data, 
  attachments,
  onChange, 
  onAttachmentsChange 
}: NoSoftwarePathSectionProps) {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* B1. Current Process */}
      <div className="space-y-6">
        <SectionHeader 
          title="Current Process" 
          subtitle="How billing is done today"
          icon={FileText}
        />

        <CheckboxField
          label="How do you currently do billing?"
          values={data.currentBillingMethods}
          onChange={(values) => onChange({ currentBillingMethods: values as any[] })}
          options={billingMethodOptions}
        />

        {data.currentBillingMethods.includes('other') && (
          <FormField label="Other method">
            <Input
              value={data.otherBillingMethod || ''}
              onChange={(e) => onChange({ otherBillingMethod: e.target.value })}
              placeholder="Describe other method"
            />
          </FormField>
        )}

        <RadioField
          label="Do customers ask for GST / formal bills often?"
          value={data.customersAskGST}
          onChange={(value) => onChange({ customersAskGST: value as any })}
          options={gstFrequencyOptions}
        />
      </div>

      {/* B2. Reasons For Not Using Software */}
      <div className="space-y-6">
        <SectionHeader 
          title="About Billing Software" 
          subtitle="Your thoughts on billing software"
          icon={HelpCircle}
        />

        <RadioField
          label="Have you ever considered using billing software?"
          value={data.consideredSoftware ? 'yes' : 'no'}
          onChange={(value) => onChange({ consideredSoftware: value === 'yes' })}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          layout="horizontal"
        />

        {data.consideredSoftware && (
          <>
            <CheckboxField
              label="What stopped you from starting?"
              values={data.stoppedReasons || []}
              onChange={(values) => onChange({ stoppedReasons: values as any[] })}
              options={stoppedReasonOptions}
            />

            {data.stoppedReasons?.includes('other') && (
              <FormField label="Other reason">
                <Input
                  value={data.otherStoppedReason || ''}
                  onChange={(e) => onChange({ otherStoppedReason: e.target.value })}
                  placeholder="Describe other reason"
                />
              </FormField>
            )}
          </>
        )}

        {!data.consideredSoftware && (
          <FormField label="Main reason you feel software is not needed currently?">
            <Textarea
              value={data.notNeededReason || ''}
              onChange={(e) => onChange({ notNeededReason: e.target.value })}
              placeholder="Share your thoughts..."
            />
          </FormField>
        )}
      </div>

      {/* B3. Pain Points Today */}
      <div className="space-y-6">
        <SectionHeader 
          title="Current Challenges" 
          subtitle="Difficulties with current method"
          icon={AlertTriangle}
        />

        <CheckboxField
          label="What is the biggest difficulty in your current billing and accounting method?"
          values={data.currentDifficulties}
          onChange={(values) => onChange({ currentDifficulties: values as any[] })}
          options={difficultyOptions}
        />

        {data.currentDifficulties.includes('other') && (
          <FormField label="Other difficulty">
            <Input
              value={data.otherDifficulty || ''}
              onChange={(e) => onChange({ otherDifficulty: e.target.value })}
              placeholder="Describe other difficulty"
            />
          </FormField>
        )}

        <RadioField
          label="Have you ever lost money due to manual billing mistakes?"
          value={data.lostMoneyDueToMistakes}
          onChange={(value) => onChange({ lostMoneyDueToMistakes: value as any })}
          options={lostMoneyOptions}
          layout="horizontal"
        />

        {data.lostMoneyDueToMistakes === 'yes' && (
          <FormField label="Please explain briefly (optional)">
            <Textarea
              value={data.lostMoneyExplanation || ''}
              onChange={(e) => onChange({ lostMoneyExplanation: e.target.value })}
              placeholder="What happened..."
            />
          </FormField>
        )}
      </div>

      {/* B4. Openness to Software */}
      <div className="space-y-6">
        <SectionHeader 
          title="Interest in Software" 
          subtitle="If there was a simple billing app..."
          icon={Lightbulb}
        />

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-foreground">
            If there was a simple billing app in your preferred language that:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Works on mobile or basic system</li>
            <li>Gives easy GST & sales reports</li>
            <li>Has local support</li>
          </ul>
        </div>

        <RadioField
          label="Would you be interested in trying it for a short period?"
          value={data.interestedInTrying}
          onChange={(value) => onChange({ interestedInTrying: value as any })}
          options={interestOptions}
          layout="horizontal"
        />

        <RadioField
          label="What is a comfortable monthly budget for such software?"
          value={data.monthlyBudget}
          onChange={(value) => onChange({ monthlyBudget: value as any })}
          options={budgetOptions}
        />
      </div>

      {/* B5. Attachments (renamed from original B5) */}
      <div className="space-y-6">
        <SectionHeader 
          title="Attachments" 
          subtitle="Photos and voice recording"
          icon={Camera}
        />

        <PhotoUpload
          photos={attachments.photos}
          onChange={(photos) => onAttachmentsChange({ photos })}
          label="Upload photo of current billing method (notebook, counter, etc.)"
        />

        <VoiceRecorder
          voiceNote={attachments.voiceNote}
          onChange={(voiceNote) => onAttachmentsChange({ voiceNote })}
          label="Record shopkeeper explaining why they don't use software"
          unlimited
        />
      </div>

      {/* B5-B10. Extended Questions */}
      <NoSoftwareExtendedSection
        data={data.extended || {}}
        baseData={data}
        attachments={attachments}
        onChange={(extendedData) => onChange({ extended: { ...data.extended, ...extendedData } })}
        onAttachmentsChange={onAttachmentsChange}
      />
    </div>
  );
}
