import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { PhotoUpload } from './PhotoUpload';
import { VoiceRecorder } from './VoiceRecorder';
import { SectionHeader } from './SectionHeader';
import { SoftwareExtendedSection } from './SoftwareExtendedSection';
import { SoftwarePathData, SurveyAttachments, SoftwarePathExtended } from '@/types/survey';
import { Monitor, Settings, AlertTriangle, DollarSign, Camera } from 'lucide-react';

interface SoftwarePathSectionProps {
  data: SoftwarePathData;
  attachments: SurveyAttachments;
  onChange: (data: Partial<SoftwarePathData>) => void;
  onAttachmentsChange: (attachments: Partial<SurveyAttachments>) => void;
}

const usageDurationOptions = [
  { value: '<6months', label: 'Less than 6 months' },
  { value: '6-12months', label: '6 - 12 months' },
  { value: '1-3years', label: '1 - 3 years' },
  { value: '3+years', label: 'More than 3 years' },
];

const deviceOptions = [
  { value: 'desktop', label: 'Desktop Computer' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile Phone' },
  { value: 'pos', label: 'Dedicated POS Machine' },
];

const featureOptions = [
  { value: 'billPrint', label: 'Bill Print' },
  { value: 'inventory', label: 'Stock / Inventory Tracking' },
  { value: 'gstReports', label: 'GST / Tax Reports' },
  { value: 'creditTracking', label: 'Customer Credit / Udhaar Tracking' },
  { value: 'purchaseManagement', label: 'Purchase Management' },
  { value: 'analytics', label: 'Basic Analytics / Reports' },
  { value: 'other', label: 'Other' },
];

const satisfactionOptions = [
  { value: 'very-satisfied', label: 'Very Satisfied' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'unsatisfied', label: 'Unsatisfied' },
  { value: 'very-unsatisfied', label: 'Very Unsatisfied' },
];

const outsideTaskOptions = [
  { value: 'notebooks', label: 'Maintaining Notebooks' },
  { value: 'excel', label: 'Using Excel' },
  { value: 'whatsapp', label: 'WhatsApp / Phone Reminders for Credit' },
  { value: 'cashbook', label: 'Manual Cash Book' },
  { value: 'other', label: 'Other' },
];

const painPointOptions = [
  { value: 'slow', label: 'Software is Slow / Hangs' },
  { value: 'hardToLearn', label: 'Difficult to Learn / Staff Training Issues' },
  { value: 'poorSupport', label: 'Support is Poor or Unresponsive' },
  { value: 'expensive', label: 'Expensive Subscription / AMC' },
  { value: 'gstIssues', label: 'GST / Report Issues' },
  { value: 'missingFeatures', label: 'Missing Features' },
  { value: 'dataLoss', label: 'Data Loss / Reliability Issues' },
  { value: 'other', label: 'Other' },
];

const yearlyCostOptions = [
  { value: '<5000', label: 'Less than ₹5,000' },
  { value: '5000-10000', label: '₹5,000 - ₹10,000' },
  { value: '10000-20000', label: '₹10,000 - ₹20,000' },
  { value: '>20000', label: 'More than ₹20,000' },
  { value: 'notSure', label: 'Not Sure' },
];

const valueForMoneyOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'notSure', label: 'Not Sure' },
];

const switchingOptions = [
  { value: 'yesDefinitely', label: 'Yes, definitely' },
  { value: 'maybeIfEasy', label: 'Maybe, if migration is easy' },
  { value: 'onlyIfRecommended', label: 'Only if many other shops recommend' },
  { value: 'noComfortable', label: 'No, we are comfortable' },
];

export function SoftwarePathSection({ 
  data, 
  attachments,
  onChange, 
  onAttachmentsChange 
}: SoftwarePathSectionProps) {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* A1. Current Setup */}
      <div className="space-y-6">
        <SectionHeader 
          title="Current Setup" 
          subtitle="Tell us about your billing software"
          icon={Monitor}
        />

        <FormField label="Name of Billing Software">
          <Input
            value={data.softwareName}
            onChange={(e) => onChange({ softwareName: e.target.value })}
            placeholder="Enter software name (or 'Not sure')"
          />
        </FormField>

        <SelectField
          label="How long have you been using it?"
          value={data.usageDuration}
          onChange={(value) => onChange({ usageDuration: value as any })}
          options={usageDurationOptions}
        />

        <CheckboxField
          label="Devices used for billing"
          values={data.devices}
          onChange={(values) => onChange({ devices: values as any[] })}
          options={deviceOptions}
        />
      </div>

      {/* A2. Usage & Workflow */}
      <div className="space-y-6">
        <SectionHeader 
          title="Usage & Workflow" 
          subtitle="How you use the software day-to-day"
          icon={Settings}
        />

        <CheckboxField
          label="What features do you use regularly?"
          values={data.featuresUsed}
          onChange={(values) => onChange({ featuresUsed: values as any[] })}
          options={featureOptions}
        />

        {data.featuresUsed.includes('other') && (
          <FormField label="Other features">
            <Input
              value={data.otherFeature || ''}
              onChange={(e) => onChange({ otherFeature: e.target.value })}
              placeholder="Describe other features"
            />
          </FormField>
        )}

        <RadioField
          label="How satisfied are you with your billing process overall?"
          value={data.satisfaction}
          onChange={(value) => onChange({ satisfaction: value as any })}
          options={satisfactionOptions}
        />

        <CheckboxField
          label="Which tasks still happen outside the software?"
          values={data.tasksOutsideSoftware}
          onChange={(values) => onChange({ tasksOutsideSoftware: values as any[] })}
          options={outsideTaskOptions}
        />

        {data.tasksOutsideSoftware.includes('other') && (
          <FormField label="Other tasks">
            <Input
              value={data.otherOutsideTask || ''}
              onChange={(e) => onChange({ otherOutsideTask: e.target.value })}
              placeholder="Describe other tasks"
            />
          </FormField>
        )}
      </div>

      {/* A3. Pain Points */}
      <div className="space-y-6">
        <SectionHeader 
          title="Pain Points" 
          subtitle="Problems with current software"
          icon={AlertTriangle}
        />

        <CheckboxField
          label="What are the biggest problems you face with your current billing software?"
          values={data.painPoints}
          onChange={(values) => onChange({ painPoints: values as any[] })}
          options={painPointOptions}
        />

        {data.painPoints.includes('other') && (
          <FormField label="Other problems">
            <Input
              value={data.otherPainPoint || ''}
              onChange={(e) => onChange({ otherPainPoint: e.target.value })}
              placeholder="Describe other problems"
            />
          </FormField>
        )}

        <FormField 
          label="Describe any recent incident where the software caused a problem or delay"
          helper="Optional - share any specific experience"
        >
          <Textarea
            value={data.recentIncident || ''}
            onChange={(e) => onChange({ recentIncident: e.target.value })}
            placeholder="Describe what happened..."
          />
        </FormField>
      </div>

      {/* A4. Money & Switching */}
      <div className="space-y-6">
        <SectionHeader 
          title="Cost & Switching" 
          subtitle="About costs and willingness to change"
          icon={DollarSign}
        />

        <SelectField
          label="Approximate yearly cost of your billing software (license + support)?"
          value={data.yearlyCost}
          onChange={(value) => onChange({ yearlyCost: value as any })}
          options={yearlyCostOptions}
        />

        <RadioField
          label="Do you feel it is value for money?"
          value={data.valueForMoney}
          onChange={(value) => onChange({ valueForMoney: value as any })}
          options={valueForMoneyOptions}
          layout="horizontal"
        />

        <RadioField
          label="Would you consider switching to another billing software if it clearly solves your top 2-3 problems?"
          value={data.switchingWillingness}
          onChange={(value) => onChange({ switchingWillingness: value as any })}
          options={switchingOptions}
        />
      </div>

      {/* A5. Attachments */}
      <div className="space-y-6">
        <SectionHeader 
          title="Attachments" 
          subtitle="Photos and voice recording"
          icon={Camera}
        />

        <PhotoUpload
          photos={attachments.photos}
          onChange={(photos) => onAttachmentsChange({ photos })}
          label="Upload photo of billing counter / POS setup"
        />

        <VoiceRecorder
          voiceNote={attachments.voiceNote}
          onChange={(voiceNote) => onAttachmentsChange({ voiceNote })}
          label="Record owner's feedback (optional)"
          unlimited
        />
      </div>

      {/* A6-A11. Extended Questions */}
      <SoftwareExtendedSection
        data={data.extended || {}}
        attachments={attachments}
        onChange={(extendedData) => onChange({ extended: { ...data.extended, ...extendedData } })}
        onAttachmentsChange={onAttachmentsChange}
      />
    </div>
  );
}
