import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from './FormField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { VoiceRecorder } from './VoiceRecorder';
import { SectionHeader } from './SectionHeader';
import { NoSoftwarePathExtended, NoSoftwarePathData, SurveyAttachments } from '@/types/survey';
import { 
  FileWarning, 
  Wrench, 
  ShieldAlert, 
  Users, 
  Target,
  Mic
} from 'lucide-react';

interface NoSoftwareExtendedSectionProps {
  data: NoSoftwarePathExtended;
  baseData: NoSoftwarePathData;
  attachments: SurveyAttachments;
  onChange: (data: Partial<NoSoftwarePathExtended>) => void;
  onAttachmentsChange: (attachments: Partial<SurveyAttachments>) => void;
}

const inaccuracyOptions = [
  { value: '0%', label: '0%' },
  { value: '1-5%', label: '1-5%' },
  { value: '5-10%', label: '5-10%' },
  { value: '10-20%', label: '10-20%' },
  { value: '20+%', label: '20%+' },
  { value: 'notSure', label: 'Not Sure' },
];

const missedNumberOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'sometimes', label: 'Sometimes' },
];

const peopleInBillingOptions = [
  { value: 'ownerOnly', label: 'Owner Only' },
  { value: '1-2Staff', label: '1-2 Staff' },
  { value: '3+Staff', label: '3+ Staff' },
];

const concernOptions = [
  { value: 'cost', label: 'Cost Concerns' },
  { value: 'technical', label: 'Technical Concerns' },
  { value: 'trust', label: 'Trust Concerns' },
  { value: 'other', label: 'Other Concerns' },
];

const wouldConsiderOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no', label: 'No' },
  { value: 'notSure', label: 'Not Sure' },
];

const knowsOthersOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'notSure', label: 'Not Sure' },
];

const adoptionTriggerOptions = [
  { value: 'taxChange', label: 'Major Tax/Compliance Change' },
  { value: 'moreStaff', label: 'Hiring More Staff' },
  { value: 'businessGrows', label: 'Business Grows Significantly' },
  { value: 'gstAudit', label: 'GST Audit' },
  { value: 'eInvoiceDemand', label: 'Customer Demand for E-invoices' },
  { value: 'multiLocation', label: 'Expansion to Multiple Locations' },
  { value: 'competitorPressure', label: 'Competitor Pressure' },
  { value: 'associationRequirement', label: 'Association/Chamber Requirement' },
  { value: 'other', label: 'Other' },
];

const likelihoodOptions = [
  { value: 'veryLikely', label: 'Very Likely' },
  { value: 'likely', label: 'Likely' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'unlikely', label: 'Unlikely' },
  { value: 'veryUnlikely', label: 'Very Unlikely' },
];

// Map difficulty values to readable labels
const difficultyLabels: Record<string, string> = {
  endOfDay: 'End-of-day Total / Closing Stock',
  creditTracking: 'Tracking Credit / Udhaar',
  gstFiling: 'GST Filing or Tax Calculations',
  findingOldBills: 'Finding Old Bills',
  trainingStaff: 'Training New Staff',
  calculationMistakes: 'Avoiding Manual Calculation Mistakes',
  other: 'Other',
};

export function NoSoftwareExtendedSection({ 
  data, 
  baseData,
  attachments,
  onChange, 
  onAttachmentsChange 
}: NoSoftwareExtendedSectionProps) {
  const handlePainPointDetailChange = (key: string, value: string) => {
    onChange({
      painPointDetails: {
        ...data.painPointDetails,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* B5. Detailed Pain Points */}
      <div className="space-y-6">
        <SectionHeader 
          title="Detailed Pain Points" 
          subtitle="Tell us more about your challenges"
          icon={FileWarning}
        />

        {baseData.currentDifficulties.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For each pain point you selected, please explain briefly:
            </p>
            {baseData.currentDifficulties.map((difficulty) => (
              <FormField 
                key={difficulty}
                label={difficultyLabels[difficulty] || difficulty}
                helper="How much time does this take? Any recent mistakes?"
              >
                <Textarea
                  value={data.painPointDetails?.[difficulty] || ''}
                  onChange={(e) => handlePainPointDetailChange(difficulty, e.target.value)}
                  placeholder="Describe your experience..."
                  rows={2}
                />
              </FormField>
            ))}
          </div>
        )}

        <RadioField
          label="What percentage of your bills do you estimate are inaccurate or missing?"
          value={data.billingInaccuracyPercent || ''}
          onChange={(value) => onChange({ billingInaccuracyPercent: value as any })}
          options={inaccuracyOptions}
        />

        <RadioField
          label="Have you ever missed an important business number because of manual tracking?"
          value={data.missedBusinessNumber || ''}
          onChange={(value) => onChange({ missedBusinessNumber: value as any })}
          options={missedNumberOptions}
          layout="horizontal"
        />

        {(data.missedBusinessNumber === 'yes' || data.missedBusinessNumber === 'sometimes') && (
          <FormField 
            label="What number? How did you discover the mistake?"
          >
            <Textarea
              value={data.missedNumberDetails || ''}
              onChange={(e) => onChange({ missedNumberDetails: e.target.value })}
              placeholder="Describe what happened..."
              rows={3}
            />
          </FormField>
        )}
      </div>

      {/* B6. Current Workarounds */}
      <div className="space-y-6">
        <SectionHeader 
          title="Current Workarounds" 
          subtitle="How you manage different aspects today"
          icon={Wrench}
        />

        <p className="text-sm text-muted-foreground">
          For your current manual processes, describe what you do:
        </p>

        <FormField label="Credit Tracking">
          <Textarea
            value={data.creditTrackingWorkaround || ''}
            onChange={(e) => onChange({ creditTrackingWorkaround: e.target.value })}
            placeholder="How do you track customer credit/udhaar?"
            rows={2}
          />
        </FormField>

        <FormField label="GST Filing">
          <Textarea
            value={data.gstFilingWorkaround || ''}
            onChange={(e) => onChange({ gstFilingWorkaround: e.target.value })}
            placeholder="How do you handle GST filing?"
            rows={2}
          />
        </FormField>

        <FormField label="Stock Management">
          <Textarea
            value={data.stockManagementWorkaround || ''}
            onChange={(e) => onChange({ stockManagementWorkaround: e.target.value })}
            placeholder="How do you manage inventory/stock?"
            rows={2}
          />
        </FormField>

        <FormField label="Staff Training">
          <Textarea
            value={data.staffTrainingWorkaround || ''}
            onChange={(e) => onChange({ staffTrainingWorkaround: e.target.value })}
            placeholder="How do you train new staff on billing?"
            rows={2}
          />
        </FormField>

        <FormField label="Report Generation">
          <Textarea
            value={data.reportGenerationWorkaround || ''}
            onChange={(e) => onChange({ reportGenerationWorkaround: e.target.value })}
            placeholder="How do you generate reports?"
            rows={2}
          />
        </FormField>

        <RadioField
          label="How many people are involved in billing operations daily?"
          value={data.peopleInBilling || ''}
          onChange={(value) => onChange({ peopleInBilling: value as any })}
          options={peopleInBillingOptions}
          layout="horizontal"
        />

        <FormField label="Do you ever delegate billing to staff? How do they learn?">
          <Textarea
            value={data.delegateTrained || ''}
            onChange={(e) => onChange({ delegateTrained: e.target.value })}
            placeholder="Describe your training process..."
            rows={2}
          />
        </FormField>
      </div>

      {/* B7. Barriers & Concerns */}
      <div className="space-y-6">
        <SectionHeader 
          title="Barriers & Concerns" 
          subtitle="Dive deeper into your concerns about software"
          icon={ShieldAlert}
        />

        <CheckboxField
          label="Please dive deeper into your concerns:"
          values={data.deeperConcerns || []}
          onChange={(values) => onChange({ deeperConcerns: values })}
          options={concernOptions}
        />

        {data.deeperConcerns?.includes('cost') && (
          <FormField 
            label="Cost Concerns"
            helper="What is your budget? Would subscription vs one-time help?"
          >
            <Textarea
              value={data.costConcernDetail || ''}
              onChange={(e) => onChange({ costConcernDetail: e.target.value })}
              placeholder="Describe your cost concerns..."
              rows={2}
            />
          </FormField>
        )}

        {data.deeperConcerns?.includes('technical') && (
          <FormField 
            label="Technical Concerns"
            helper="What specifically worries you? Hardware? Learning?"
          >
            <Textarea
              value={data.technicalConcernDetail || ''}
              onChange={(e) => onChange({ technicalConcernDetail: e.target.value })}
              placeholder="Describe your technical concerns..."
              rows={2}
            />
          </FormField>
        )}

        {data.deeperConcerns?.includes('trust') && (
          <FormField 
            label="Trust Concerns"
            helper="What would make you trust a new software?"
          >
            <Textarea
              value={data.trustConcernDetail || ''}
              onChange={(e) => onChange({ trustConcernDetail: e.target.value })}
              placeholder="Describe your trust concerns..."
              rows={2}
            />
          </FormField>
        )}

        {data.deeperConcerns?.includes('other') && (
          <FormField label="Other Concerns">
            <Textarea
              value={data.otherConcernDetail || ''}
              onChange={(e) => onChange({ otherConcernDetail: e.target.value })}
              placeholder="Describe other concerns..."
              rows={2}
            />
          </FormField>
        )}

        <RadioField
          label="If cost was not a factor, would you seriously consider software?"
          value={data.wouldConsiderIfCostFree || ''}
          onChange={(value) => onChange({ wouldConsiderIfCostFree: value as any })}
          options={wouldConsiderOptions}
          layout="horizontal"
        />

        <FormField label="Please explain your answer">
          <Textarea
            value={data.wouldConsiderExplanation || ''}
            onChange={(e) => onChange({ wouldConsiderExplanation: e.target.value })}
            placeholder="Explain why..."
            rows={2}
          />
        </FormField>
      </div>

      {/* B8. Competitive Awareness */}
      <div className="space-y-6">
        <SectionHeader 
          title="Competitive Awareness" 
          subtitle="What you know about others using software"
          icon={Users}
        />

        <RadioField
          label="Do you know of other shops in your area using billing software?"
          value={data.knowsOtherShopsUsing || ''}
          onChange={(value) => onChange({ knowsOtherShopsUsing: value as any })}
          options={knowsOthersOptions}
          layout="horizontal"
        />

        {data.knowsOtherShopsUsing === 'yes' && (
          <RadioField
            label="Would you be interested in talking to them about their experience?"
            value={data.interestedInTalkingToThem === true ? 'yes' : data.interestedInTalkingToThem === false ? 'no' : ''}
            onChange={(value) => onChange({ interestedInTalkingToThem: value === 'yes' })}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            layout="horizontal"
          />
        )}

        <RadioField
          label="Have you ever attended a business association meeting or event where billing software was discussed?"
          value={data.attendedBusinessMeeting === true ? 'yes' : data.attendedBusinessMeeting === false ? 'no' : ''}
          onChange={(value) => onChange({ attendedBusinessMeeting: value === 'yes' })}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          layout="horizontal"
        />

        {data.attendedBusinessMeeting && (
          <FormField label="What was mentioned or recommended?">
            <Textarea
              value={data.meetingRecommendations || ''}
              onChange={(e) => onChange({ meetingRecommendations: e.target.value })}
              placeholder="Share what you learned..."
              rows={3}
            />
          </FormField>
        )}
      </div>

      {/* B9. Future Readiness */}
      <div className="space-y-6">
        <SectionHeader 
          title="Future Readiness" 
          subtitle="What would make you adopt software"
          icon={Target}
        />

        <CheckboxField
          label="What would force you to finally adopt billing software?"
          values={data.adoptionTriggers || []}
          onChange={(values) => onChange({ adoptionTriggers: values })}
          options={adoptionTriggerOptions}
        />

        {data.adoptionTriggers?.includes('other') && (
          <FormField label="Other trigger">
            <Input
              value={data.otherAdoptionTrigger || ''}
              onChange={(e) => onChange({ otherAdoptionTrigger: e.target.value })}
              placeholder="Describe other trigger"
            />
          </FormField>
        )}

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
          <p className="text-sm font-medium text-foreground">If a software existed that:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Costs only ₹200-₹300 per month</li>
            <li>Works entirely in your preferred language</li>
            <li>Has a local support person you can call</li>
            <li>Takes 1 day to set up</li>
            <li>Solves your top 3 pain points</li>
          </ul>
        </div>

        <RadioField
          label="How likely would you be to try it?"
          value={data.idealSoftwareLikelihood || ''}
          onChange={(value) => onChange({ idealSoftwareLikelihood: value as any })}
          options={likelihoodOptions}
        />
      </div>

      {/* B10. Voice Feedback - Future Vision */}
      <div className="space-y-6">
        <SectionHeader 
          title="Future Vision Recording" 
          subtitle="Record your vision for the future (2-3 minutes)"
          icon={Mic}
        />

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
          <p className="text-sm font-medium text-foreground">Recording prompts:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Describe how billing is done in your ideal shop 2 years from now</li>
            <li>What is your biggest fear about adopting new technology?</li>
            <li>What would make you confident in trying new software?</li>
          </ul>
        </div>

        <VoiceRecorder
          voiceNote={attachments.futureVisionRecording}
          onChange={(recording) => onAttachmentsChange({ futureVisionRecording: recording })}
          label="Record Future Vision (no time limit)"
          unlimited
        />
      </div>
    </div>
  );
}
