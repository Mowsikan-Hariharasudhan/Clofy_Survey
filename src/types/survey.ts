export interface Location {
  latitude: number;
  longitude: number;
}

export interface SurveyCommon {
  shopName: string;
  ownerName?: string;
  phoneNumber?: string;
  shopType: ShopType;
  billsPerDay: BillsPerDay;
  billingHandler: BillingHandler;
  location?: Location;
  surveyorName: string;
}

export type ShopType = 
  | 'grocery' 
  | 'pharmacy' 
  | 'textiles' 
  | 'electronics' 
  | 'mobile' 
  | 'restaurant' 
  | 'other';

export type BillsPerDay = '<50' | '50-150' | '150-300' | '300+';

export type BillingHandler = 'owner' | 'staff' | 'accountant' | 'mixed';

// Feature satisfaction ratings for A7
export interface FeatureSatisfaction {
  billPrinting?: number;
  inventoryTracking?: number;
  gstCalculation?: number;
  reportGeneration?: number;
  creditTracking?: number;
  backupSafety?: number;
  mobileAccess?: number;
  supportDocs?: number;
}

// A6-A11 Extended fields
export interface SoftwarePathExtended {
  // A6. Operational Impact
  operationalChanges?: string;
  onboardingProcess?: string[];
  otherOnboarding?: string;
  updateFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'asNeeded' | 'never' | 'notSure';
  crashImpact?: string;
  
  // A7. Feature Satisfaction
  featureSatisfaction?: FeatureSatisfaction;
  featureToImprove?: string;
  featureImproveReason?: string;
  
  // A8. Comparative & Switching Intent
  comparedWithCompetitors?: 'yes' | 'no' | 'considered';
  alternativesLookedAt?: string;
  switchingRequirements?: string[];
  otherSwitchingReq?: string;
  vendorLoyalty?: number;
  
  // A9. Business Impact
  timeSavedDaily?: string;
  errorReduction?: string;
  additionalRevenue?: string;
  costSavings?: string;
  biggestLossIfStopped?: string;
  
  // A10. Future Needs
  futureNeeds?: string[];
  futureNeedsRanking?: string[];
  otherFutureNeed?: string;
  preferredLanguage?: string;
  
  // A11. Voice Feedback - Deep Dive
  detailedFeedbackVoice?: string;
}

// B5-B10 Extended fields
export interface NoSoftwarePathExtended {
  // B5. Detailed Pain Points
  painPointDetails?: Record<string, string>;
  billingInaccuracyPercent?: '0%' | '1-5%' | '5-10%' | '10-20%' | '20+%' | 'notSure';
  missedBusinessNumber?: 'yes' | 'no' | 'sometimes';
  missedNumberDetails?: string;
  
  // B6. Current Workarounds
  creditTrackingWorkaround?: string;
  gstFilingWorkaround?: string;
  stockManagementWorkaround?: string;
  staffTrainingWorkaround?: string;
  reportGenerationWorkaround?: string;
  peopleInBilling?: 'ownerOnly' | '1-2Staff' | '3+Staff';
  delegateTrained?: string;
  
  // B7. Barriers & Concerns
  deeperConcerns?: string[];
  costConcernDetail?: string;
  technicalConcernDetail?: string;
  trustConcernDetail?: string;
  otherConcernDetail?: string;
  wouldConsiderIfCostFree?: 'yes' | 'maybe' | 'no' | 'notSure';
  wouldConsiderExplanation?: string;
  
  // B8. Competitive Awareness
  knowsOtherShopsUsing?: 'yes' | 'no' | 'notSure';
  interestedInTalkingToThem?: boolean;
  attendedBusinessMeeting?: boolean;
  meetingRecommendations?: string;
  
  // B9. Future Readiness
  adoptionTriggers?: string[];
  otherAdoptionTrigger?: string;
  idealSoftwareLikelihood?: 'veryLikely' | 'likely' | 'maybe' | 'unlikely' | 'veryUnlikely';
  
  // B10. Voice Feedback - Future Vision
  futureVisionVoice?: string;
}

export interface SoftwarePathData {
  softwareName: string;
  usageDuration: UsageDuration;
  devices: Device[];
  featuresUsed: Feature[];
  otherFeature?: string;
  satisfaction: Satisfaction;
  tasksOutsideSoftware: OutsideTask[];
  otherOutsideTask?: string;
  painPoints: PainPoint[];
  otherPainPoint?: string;
  recentIncident?: string;
  yearlyCost: YearlyCost;
  valueForMoney: ValueForMoney;
  switchingWillingness: SwitchingWillingness;
  // Extended fields A6-A11
  extended?: SoftwarePathExtended;
}

export type UsageDuration = '<6months' | '6-12months' | '1-3years' | '3+years';

export type Device = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'pos';

export type Feature = 
  | 'billPrint' 
  | 'inventory' 
  | 'gstReports' 
  | 'creditTracking' 
  | 'purchaseManagement' 
  | 'analytics' 
  | 'other';

export type Satisfaction = 
  | 'very-satisfied' 
  | 'satisfied' 
  | 'neutral' 
  | 'unsatisfied' 
  | 'very-unsatisfied';

export type OutsideTask = 
  | 'notebooks' 
  | 'excel' 
  | 'whatsapp' 
  | 'cashbook' 
  | 'other';

export type PainPoint = 
  | 'slow' 
  | 'hardToLearn' 
  | 'poorSupport' 
  | 'expensive' 
  | 'gstIssues' 
  | 'missingFeatures' 
  | 'dataLoss' 
  | 'other';

export type YearlyCost = '<5000' | '5000-10000' | '10000-20000' | '>20000' | 'notSure';

export type ValueForMoney = 'yes' | 'no' | 'notSure';

export type SwitchingWillingness = 
  | 'yesDefinitely' 
  | 'maybeIfEasy' 
  | 'onlyIfRecommended' 
  | 'noComfortable';

export interface NoSoftwarePathData {
  currentBillingMethods: BillingMethod[];
  otherBillingMethod?: string;
  customersAskGST: GSTFrequency;
  consideredSoftware: boolean;
  stoppedReasons?: StoppedReason[];
  otherStoppedReason?: string;
  notNeededReason?: string;
  currentDifficulties: Difficulty[];
  otherDifficulty?: string;
  lostMoneyDueToMistakes: LostMoney;
  lostMoneyExplanation?: string;
  interestedInTrying: InterestLevel;
  monthlyBudget: MonthlyBudget;
  // Extended fields B5-B10
  extended?: NoSoftwarePathExtended;
}

export type BillingMethod = 
  | 'handwritten' 
  | 'calculator' 
  | 'excel' 
  | 'noRecord' 
  | 'other';

export type GSTFrequency = 'veryOften' | 'sometimes' | 'rarely' | 'never';

export type StoppedReason = 
  | 'costHigh' 
  | 'notComfortable' 
  | 'noTrustedVendor' 
  | 'afraidDataLoss' 
  | 'currentMethodEnough' 
  | 'other';

export type Difficulty = 
  | 'endOfDay' 
  | 'creditTracking' 
  | 'gstFiling' 
  | 'findingOldBills' 
  | 'trainingStaff' 
  | 'calculationMistakes' 
  | 'other';

export type LostMoney = 'yes' | 'no' | 'notSure';

export type InterestLevel = 'yes' | 'maybe' | 'no';

export type MonthlyBudget = '<300' | '300-500' | '500-1000' | 'notWilling';

export interface SurveyAttachments {
  photos: string[]; // base64 or URLs
  voiceNote?: string; // base64 or URL
  preSurveyRecording?: string; // Pre-survey audio recording
  detailedFeedbackRecording?: string; // A11 detailed feedback
  futureVisionRecording?: string; // B10 future vision
}

export interface SurveyMeta {
  startTime?: string;
  endTime?: string;
  totalDuration?: number; // in seconds
  isReviewed?: boolean;
  tags?: string[];
  adminNotes?: string;
  priority?: 'normal' | 'high' | 'casestudy';
}

export interface Survey {
  id: string;
  createdAt: string;
  updatedAt: string;
  common: SurveyCommon;
  hasBillingSoftware: boolean;
  softwarePath?: SoftwarePathData;
  noSoftwarePath?: NoSoftwarePathData;
  attachments: SurveyAttachments;
  additionalNotes?: string;
  consentGiven: boolean;
  status: 'draft' | 'completed';
  meta?: SurveyMeta;
}
