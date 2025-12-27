import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CommonInfoSection } from '@/components/survey/CommonInfoSection';
import { SoftwarePathSection } from '@/components/survey/SoftwarePathSection';
import { NoSoftwarePathSection } from '@/components/survey/NoSoftwarePathSection';
import { ContinuousRecorder } from '@/components/survey/ContinuousRecorder';
import { SurveySummary } from '@/components/survey/SurveySummary';
import { RadioField } from '@/components/survey/RadioField';
import { FormField } from '@/components/survey/FormField';
import { SectionHeader } from '@/components/survey/SectionHeader';
import {
  Survey,
  SurveyCommon,
  SoftwarePathData,
  NoSoftwarePathData,
  SurveyAttachments
} from '@/types/survey';
import { saveSurveyAsync, generateId, refreshSurveysCache } from '@/lib/surveyStorage';
import { uploadAudioToStorage } from '@/lib/audioStorage';
import { isOnline, queueSurveyForSync } from '@/lib/offlineStorage';
import { useSurveyDraft, SurveyDraft } from '@/hooks/useSurveyDraft';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowRight, FileText, Save, AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialCommon: SurveyCommon = {
  shopName: '',
  ownerName: '',
  phoneNumber: '',
  shopType: 'grocery',
  billsPerDay: '<50',
  billingHandler: 'owner',
  surveyorName: '',
};

const initialSoftwarePath: SoftwarePathData = {
  softwareName: '',
  usageDuration: '<6months',
  devices: [],
  featuresUsed: [],
  satisfaction: 'neutral',
  tasksOutsideSoftware: [],
  painPoints: [],
  yearlyCost: 'notSure',
  valueForMoney: 'notSure',
  switchingWillingness: 'maybeIfEasy',
};

const initialNoSoftwarePath: NoSoftwarePathData = {
  currentBillingMethods: [],
  customersAskGST: 'sometimes',
  consideredSoftware: false,
  currentDifficulties: [],
  lostMoneyDueToMistakes: 'notSure',
  interestedInTrying: 'maybe',
  monthlyBudget: '300-500',
};

const initialAttachments: SurveyAttachments = {
  photos: [],
};

type Step = 'start' | 'common' | 'branch' | 'path' | 'finish';

const NewSurvey = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('start');
  const [common, setCommon] = useState<SurveyCommon>(initialCommon);
  const [hasSoftware, setHasSoftware] = useState<boolean | null>(null);
  const [softwarePath, setSoftwarePath] = useState<SoftwarePathData>(initialSoftwarePath);
  const [noSoftwarePath, setNoSoftwarePath] = useState<NoSoftwarePathData>(initialNoSoftwarePath);
  const [attachments, setAttachments] = useState<SurveyAttachments>(initialAttachments);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedSurvey, setSubmittedSurvey] = useState<Survey | null>(null);
  const [surveyDuration, setSurveyDuration] = useState(0);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const audioDataUrlRef = useRef<string | null>(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Track survey start time and ID
  const startTimeRef = useRef<Date>(new Date());
  const surveyIdRef = useRef<string>(generateId());

  // Draft management
  const {
    hasDraft,
    lastSaved,
    saveDraft,
    loadDraft,
    clearDraft,
    startAutoSave,
    stopAutoSave,
  } = useSurveyDraft('start', initialCommon, initialSoftwarePath, initialNoSoftwarePath, initialAttachments);

  // Check for draft on mount
  useEffect(() => {
    if (hasDraft) {
      setShowDraftPrompt(true);
    }
  }, [hasDraft]);

  // Get current draft data
  const getDraftData = useCallback((): Omit<SurveyDraft, 'lastSaved'> => ({
    step,
    common,
    hasSoftware,
    softwarePath,
    noSoftwarePath,
    attachments,
    additionalNotes,
    consentGiven,
    startTime: startTimeRef.current.toISOString(),
    isRecordingActive,
    recordingTime,
  }), [step, common, hasSoftware, softwarePath, noSoftwarePath, attachments, additionalNotes, consentGiven, isRecordingActive, recordingTime]);

  // Start auto-save when recording starts
  useEffect(() => {
    if (isRecordingActive) {
      startAutoSave(getDraftData);
    } else {
      stopAutoSave();
    }
  }, [isRecordingActive, startAutoSave, stopAutoSave, getDraftData]);

  const handleRecordingStart = () => {
    startTimeRef.current = new Date();
    setIsRecordingActive(true);
    setStep('common');
  };

  const handleRecordingComplete = (recording: string) => {
    setAudioDataUrl(recording);
    audioDataUrlRef.current = recording;
  };

  const handleRecordingTimeUpdate = (time: number) => {
    setRecordingTime(time);
  };

  const handleResumeDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step as Step);
      setCommon(draft.common);
      setHasSoftware(draft.hasSoftware);
      setSoftwarePath(draft.softwarePath);
      setNoSoftwarePath(draft.noSoftwarePath);
      setAttachments(draft.attachments);
      setAdditionalNotes(draft.additionalNotes);
      setConsentGiven(draft.consentGiven);
      startTimeRef.current = new Date(draft.startTime);
      setRecordingTime(draft.recordingTime);

      // Recording can't be resumed, user needs to start fresh
      if (draft.isRecordingActive) {
        toast.info('Recording cannot be resumed. Please start a new recording.');
      }
    }
    setShowDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  const validateCommon = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!common.shopName.trim()) {
      newErrors.shopName = 'Shop name is required';
    }
    if (!common.surveyorName.trim()) {
      newErrors.surveyorName = 'Surveyor name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextFromCommon = () => {
    if (validateCommon()) {
      setStep('branch');
    }
  };

  const handleBranchSelect = (value: string) => {
    setHasSoftware(value === 'yes');
    setStep('path');
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 1) {
      // If we are at 'path', we go back to 'branch'
      // If we are at 'branch', we go back to 'common'
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!consentGiven) {
      toast.error('Please provide consent to submit the survey');
      return;
    }

    setIsSubmitting(true);

    // Calculate duration
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
    setSurveyDuration(duration);

    // Wait for recording to finalize if it was active
    if (isRecordingActive) {
      setIsRecordingActive(false);

      // Stop timer and wait for finalize
      let waitCount = 0;
      while (!audioDataUrlRef.current && waitCount < 50) { // Max 5s wait
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
    }

    // Capture the final audio URL from ref
    const finalAudioDataUrl = audioDataUrlRef.current;

    // Wait a moment for recording to finalize
    await new Promise(resolve => setTimeout(resolve, 500));

    const finalAttachments = {
      ...attachments,
    };

    const survey: Survey = {
      id: surveyIdRef.current,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      common,
      hasBillingSoftware: hasSoftware!,
      softwarePath: hasSoftware ? softwarePath : undefined,
      noSoftwarePath: !hasSoftware ? noSoftwarePath : undefined,
      attachments: finalAttachments,
      additionalNotes: additionalNotes || undefined,
      consentGiven,
      status: 'completed',
      meta: {
        startTime: startTimeRef.current.toISOString(),
        endTime: endTime.toISOString(),
        totalDuration: duration,
      },
    };

    // Check if online
    if (!isOnline()) {
      // Save offline - queue for later sync
      queueSurveyForSync(survey, finalAudioDataUrl || undefined);
      clearDraft();
      setSubmittedSurvey(survey);
      setIsSuccess(true);
      toast.warning('Saved offline. Will sync when back online.', {
        icon: <WifiOff className="w-4 h-4" />,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload all audio to storage if we have it
      toast.info('Uploading audio recordings...');

      // 1. Upload main recording
      if (finalAudioDataUrl) {
        const url = await uploadAudioToStorage(finalAudioDataUrl, surveyIdRef.current, 'main');
        if (url) {
          survey.attachments.preSurveyRecording = url;
        }
      }

      // 2. Upload other voice notes if they are in base64
      const audioKeys = ['voiceNote', 'detailedFeedbackRecording', 'futureVisionRecording'] as const;
      for (const key of audioKeys) {
        const value = survey.attachments[key];
        if (typeof value === 'string' && value.startsWith('data:audio')) {
          const url = await uploadAudioToStorage(value, surveyIdRef.current, key);
          if (url) {
            (survey.attachments as any)[key] = url;
          }
        }
      }

      // Use async save and wait for it
      await saveSurveyAsync(survey);

      // Refresh cache after successful save
      await refreshSurveysCache();

      // Clear the draft
      clearDraft();

      setSubmittedSurvey(survey);
      setIsSuccess(true);
      toast.success('Survey saved successfully!');
    } catch (error) {
      console.error('Failed to save survey:', error);
      // If online save fails, queue for offline sync
      queueSurveyForSync(survey, finalAudioDataUrl || undefined);
      clearDraft();
      setSubmittedSurvey(survey);
      setIsSuccess(true);
      toast.warning('Saved locally. Will retry sync later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setStep('start');
    setCommon(initialCommon);
    setHasSoftware(null);
    setSoftwarePath(initialSoftwarePath);
    setNoSoftwarePath(initialNoSoftwarePath);
    setAttachments(initialAttachments);
    setAdditionalNotes('');
    setConsentGiven(false);
    setIsSuccess(false);
    setSubmittedSurvey(null);
    setSurveyDuration(0);
    setIsRecordingActive(false);
    setRecordingTime(0);
    setAudioDataUrl(null);
    startTimeRef.current = new Date();
    surveyIdRef.current = generateId();
  };

  // Draft prompt modal
  if (showDraftPrompt) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="New Survey" showBack />
        <main className="container px-4 py-6">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-warning/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-2xl font-bold">Resume Previous Survey?</h2>
            <p className="text-muted-foreground">
              You have an unfinished survey from earlier. Would you like to continue where you left off?
            </p>
            <p className="text-sm text-muted-foreground">
              Note: Audio recording cannot be resumed and will need to be restarted.
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="gradient" onClick={handleResumeDraft} className="w-full">
                Resume Survey
              </Button>
              <Button variant="outline" onClick={handleDiscardDraft} className="w-full">
                Start Fresh
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isSuccess && submittedSurvey) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Survey Complete" showBack />

        <main className="container px-4 py-6">
          <SurveySummary
            survey={submittedSurvey}
            duration={surveyDuration}
            onGoToDashboard={() => navigate('/')}
            onStartNew={handleStartNew}
          />
        </main>
      </div>
    );
  }

  const steps: Step[] = ['start', 'common', 'branch', 'path', 'finish'];

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="New Survey" showBack />

      {/* Progress Indicator - only show after recording starts */}
      {step !== 'start' && (
        <div className="container px-4 py-4">
          <div className="flex items-center gap-2">
            {steps.slice(1).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors duration-300",
                  steps.indexOf(step) >= i + 1
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              Step {steps.indexOf(step)} of {steps.length - 1}
            </p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Save className="w-3 h-3" />
                Auto-saved
              </p>
            )}
          </div>
        </div>
      )}

      <main className="container px-4 py-4">
        {/* Start Screen with Continuous Recording */}
        {step === 'start' && (
          <ContinuousRecorder
            onRecordingComplete={handleRecordingComplete}
            onTimeUpdate={handleRecordingTimeUpdate}
            isActive={isRecordingActive}
            onStart={handleRecordingStart}
          />
        )}

        {/* Continuous Recording Indicator */}
        {step !== 'start' && (
          <ContinuousRecorder
            onRecordingComplete={handleRecordingComplete}
            onTimeUpdate={handleRecordingTimeUpdate}
            isActive={isRecordingActive}
            onStart={() => { }}
          />
        )}

        {/* Common Info Section */}
        {step === 'common' && (
          <div className="space-y-6">
            <CommonInfoSection
              data={common}
              onChange={(data) => setCommon({ ...common, ...data })}
              errors={errors}
            />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleNextFromCommon}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Branch Question */}
        {step === 'branch' && (
          <div className="space-y-6 animate-slide-up">
            <SectionHeader
              title="Billing Software"
              subtitle="Tell us about the shop's billing setup"
              icon={FileText}
            />

            <RadioField
              label="Do you currently use any billing software / billing system in this shop?"
              value={hasSoftware === null ? '' : hasSoftware ? 'yes' : 'no'}
              onChange={handleBranchSelect}
              options={[
                { value: 'yes', label: 'Yes, we use billing software' },
                { value: 'no', label: "No, we don't use any software (manual methods)" },
              ]}
            />

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Path Sections */}
        {step === 'path' && hasSoftware !== null && (
          <div className="space-y-6">
            {hasSoftware ? (
              <SoftwarePathSection
                data={softwarePath}
                attachments={attachments}
                onChange={(data) => setSoftwarePath({ ...softwarePath, ...data })}
                onAttachmentsChange={(data) => setAttachments({ ...attachments, ...data })}
              />
            ) : (
              <NoSoftwarePathSection
                data={noSoftwarePath}
                attachments={attachments}
                onChange={(data) => setNoSoftwarePath({ ...noSoftwarePath, ...data })}
                onAttachmentsChange={(data) => setAttachments({ ...attachments, ...data })}
              />
            )}

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setStep('finish')}
                className="flex-[2]"
              >
                Continue to Finish
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Finish Section */}
        {step === 'finish' && (
          <div className="space-y-6 animate-slide-up">
            <SectionHeader
              title="Final Steps"
              subtitle="Additional notes and consent"
              icon={FileText}
            />

            <FormField label="Additional Notes by Surveyor" helper="Any extra observations or comments">
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Add any additional notes..."
              />
            </FormField>

            <div className="space-y-3">
              <label
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                  consentGiven
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50"
                )}
              >
                <Checkbox
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(!!checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  Owner has given permission to capture and store this data for research purposes.
                </span>
              </label>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || !consentGiven}
                className="flex-[2]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Submit Survey
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewSurvey;