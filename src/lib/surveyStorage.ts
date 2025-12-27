import { Survey, PainPoint, Difficulty, Device, MonthlyBudget, Satisfaction } from '@/types/survey';
import { startOfDay, subDays, isWithinInterval, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Helper to convert Survey to database format
const surveyToDb = (survey: Survey) => ({
  id: survey.id,
  created_at: survey.createdAt,
  updated_at: survey.updatedAt,
  shop_name: survey.common.shopName,
  owner_name: survey.common.ownerName,
  phone_number: survey.common.phoneNumber,
  shop_type: survey.common.shopType,
  bills_per_day: survey.common.billsPerDay,
  billing_handler: survey.common.billingHandler,
  location_lat: survey.common.location?.latitude,
  location_lng: survey.common.location?.longitude,
  surveyor_name: survey.common.surveyorName,
  has_billing_software: survey.hasBillingSoftware,
  software_path: survey.softwarePath || null,
  no_software_path: survey.noSoftwarePath || null,
  attachments: survey.attachments,
  additional_notes: survey.additionalNotes,
  consent_given: survey.consentGiven,
  status: survey.status,
  start_time: survey.meta?.startTime,
  end_time: survey.meta?.endTime,
  total_duration: survey.meta?.totalDuration,
  is_reviewed: survey.meta?.isReviewed || false,
  tags: survey.meta?.tags,
  admin_notes: survey.meta?.adminNotes,
  priority: survey.meta?.priority || 'normal',
});

// Helper to convert database format to Survey
const dbToSurvey = (row: any): Survey => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  common: {
    shopName: row.shop_name,
    ownerName: row.owner_name,
    phoneNumber: row.phone_number,
    shopType: row.shop_type,
    billsPerDay: row.bills_per_day,
    billingHandler: row.billing_handler,
    location: row.location_lat && row.location_lng 
      ? { latitude: row.location_lat, longitude: row.location_lng }
      : undefined,
    surveyorName: row.surveyor_name,
  },
  hasBillingSoftware: row.has_billing_software,
  softwarePath: row.software_path,
  noSoftwarePath: row.no_software_path,
  attachments: row.attachments || { photos: [] },
  additionalNotes: row.additional_notes,
  consentGiven: row.consent_given,
  status: row.status,
  meta: {
    startTime: row.start_time,
    endTime: row.end_time,
    totalDuration: row.total_duration,
    isReviewed: row.is_reviewed,
    tags: row.tags,
    adminNotes: row.admin_notes,
    priority: row.priority,
  },
});

// Legacy localStorage key for migration
const STORAGE_KEY = 'clofy_surveys';

// Migrate localStorage data to database
export const migrateLocalStorageToDb = async (): Promise<void> => {
  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return;

    const localSurveys: Survey[] = JSON.parse(localData);
    if (localSurveys.length === 0) return;

    // Check if there's already data in the database
    const { count } = await supabase.from('surveys').select('*', { count: 'exact', head: true });
    
    // Only migrate if database is empty and local storage has data
    if (count === 0 && localSurveys.length > 0) {
      for (const survey of localSurveys) {
        await supabase.from('surveys').insert(surveyToDb(survey) as any);
      }
      console.log(`Migrated ${localSurveys.length} surveys to database`);
    }
    
    // Clear local storage after successful migration
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error migrating surveys:', error);
  }
};

// Async versions for database operations
export const getSurveysAsync = async (): Promise<Survey[]> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(dbToSurvey);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return [];
  }
};

export const saveSurveyAsync = async (survey: Survey): Promise<void> => {
  try {
    const dbData = surveyToDb(survey);
    const { error } = await supabase
      .from('surveys')
      .upsert(dbData as any);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving survey:', error);
    throw new Error('Failed to save survey');
  }
};

export const updateSurveyMetaAsync = async (id: string, meta: Partial<Survey['meta']>): Promise<void> => {
  try {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (meta.isReviewed !== undefined) updateData.is_reviewed = meta.isReviewed;
    if (meta.adminNotes !== undefined) updateData.admin_notes = meta.adminNotes;
    if (meta.priority !== undefined) updateData.priority = meta.priority;
    if (meta.tags !== undefined) updateData.tags = meta.tags;
    
    const { error } = await supabase
      .from('surveys')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating survey meta:', error);
  }
};

export const deleteSurveysAsync = async (ids: string[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting surveys:', error);
  }
};

export const getSurveyByIdAsync = async (id: string): Promise<Survey | undefined> => {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? dbToSurvey(data) : undefined;
  } catch (error) {
    console.error('Error fetching survey:', error);
    return undefined;
  }
};

// Synchronous versions (using cached data) for backward compatibility
let surveysCache: Survey[] = [];
let cacheInitialized = false;

export const initializeSurveysCache = async (): Promise<void> => {
  if (!cacheInitialized) {
    await migrateLocalStorageToDb();
    surveysCache = await getSurveysAsync();
    cacheInitialized = true;
  }
};

export const refreshSurveysCache = async (): Promise<void> => {
  surveysCache = await getSurveysAsync();
};

export const getSurveys = (): Survey[] => {
  return surveysCache;
};

export const saveSurvey = (survey: Survey): void => {
  // Update cache immediately
  const existingIndex = surveysCache.findIndex(s => s.id === survey.id);
  if (existingIndex >= 0) {
    surveysCache[existingIndex] = { ...survey, updatedAt: new Date().toISOString() };
  } else {
    surveysCache.unshift(survey);
  }
  
  // Save to database async
  saveSurveyAsync(survey).catch(console.error);
};

export const updateSurveyMeta = (id: string, meta: Partial<Survey['meta']>): void => {
  // Update cache immediately
  const index = surveysCache.findIndex(s => s.id === id);
  if (index >= 0) {
    surveysCache[index].meta = { ...surveysCache[index].meta, ...meta };
    surveysCache[index].updatedAt = new Date().toISOString();
  }
  
  // Update database async
  updateSurveyMetaAsync(id, meta).catch(console.error);
};

export const deleteSurveys = (ids: string[]): void => {
  // Update cache immediately
  surveysCache = surveysCache.filter(s => !ids.includes(s.id));
  
  // Delete from database async
  deleteSurveysAsync(ids).catch(console.error);
};

export const getSurveyById = (id: string): Survey | undefined => {
  return surveysCache.find(s => s.id === id);
};

export const deleteSurvey = (id: string): void => {
  deleteSurveys([id]);
};

export const getSurveyStats = () => {
  const surveys = getSurveys().filter(s => s.status === 'completed');
  
  return {
    total: surveys.length,
    withSoftware: surveys.filter(s => s.hasBillingSoftware).length,
    withoutSoftware: surveys.filter(s => !s.hasBillingSoftware).length,
    byShopType: surveys.reduce((acc, s) => {
      acc[s.common.shopType] = (acc[s.common.shopType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
};

export const generateId = (): string => {
  // Generate a proper UUID v4 for database compatibility
  return crypto.randomUUID();
};

// Enhanced analytics functions
export interface DateRange {
  start: Date;
  end: Date;
}

export const getFilteredSurveys = (
  surveys: Survey[],
  filters: {
    dateRange?: DateRange;
    shopType?: string;
    hasSoftware?: 'yes' | 'no' | 'all';
    surveyorName?: string;
    satisfaction?: Satisfaction;
  }
): Survey[] => {
  return surveys.filter(s => {
    if (s.status !== 'completed') return false;
    
    if (filters.dateRange) {
      const surveyDate = new Date(s.createdAt);
      if (!isWithinInterval(surveyDate, { start: filters.dateRange.start, end: filters.dateRange.end })) {
        return false;
      }
    }
    
    if (filters.shopType && filters.shopType !== 'all' && s.common.shopType !== filters.shopType) {
      return false;
    }
    
    if (filters.hasSoftware && filters.hasSoftware !== 'all') {
      const hasSoftware = filters.hasSoftware === 'yes';
      if (s.hasBillingSoftware !== hasSoftware) return false;
    }
    
    if (filters.surveyorName && !s.common.surveyorName.toLowerCase().includes(filters.surveyorName.toLowerCase())) {
      return false;
    }
    
    if (filters.satisfaction && s.hasBillingSoftware && s.softwarePath?.satisfaction !== filters.satisfaction) {
      return false;
    }
    
    return true;
  });
};

export const getAdvancedStats = (surveys: Survey[], dateRange?: DateRange) => {
  const completedSurveys = surveys.filter(s => s.status === 'completed');
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = subDays(todayStart, 7);
  
  const filtered = dateRange 
    ? completedSurveys.filter(s => isWithinInterval(new Date(s.createdAt), { start: dateRange.start, end: dateRange.end }))
    : completedSurveys;
    
  const withSoftware = filtered.filter(s => s.hasBillingSoftware);
  const withoutSoftware = filtered.filter(s => !s.hasBillingSoftware);
  
  const thisWeek = completedSurveys.filter(s => 
    new Date(s.createdAt) >= weekStart
  ).length;
  
  const today = completedSurveys.filter(s => 
    new Date(s.createdAt) >= todayStart
  ).length;
  
  const surveysWithDuration = filtered.filter(s => s.meta?.totalDuration);
  const avgDuration = surveysWithDuration.length > 0
    ? surveysWithDuration.reduce((sum, s) => sum + (s.meta?.totalDuration || 0), 0) / surveysWithDuration.length
    : 0;
  
  const pending = surveys.filter(s => s.status === 'draft').length;
  
  return {
    total: filtered.length,
    thisWeek,
    today,
    withSoftware: withSoftware.length,
    withoutSoftware: withoutSoftware.length,
    withSoftwarePercent: filtered.length > 0 ? Math.round((withSoftware.length / filtered.length) * 100) : 0,
    withoutSoftwarePercent: filtered.length > 0 ? Math.round((withoutSoftware.length / filtered.length) * 100) : 0,
    avgDurationMinutes: Math.round(avgDuration / 60),
    pending,
  };
};

export const getSoftwareDistribution = (surveys: Survey[]) => {
  const completed = surveys.filter(s => s.status === 'completed');
  const withSoftware = completed.filter(s => s.hasBillingSoftware).length;
  const withoutSoftware = completed.filter(s => !s.hasBillingSoftware).length;
  
  return [
    { name: 'With Software', value: withSoftware, fill: 'hsl(var(--success))' },
    { name: 'Without Software', value: withoutSoftware, fill: 'hsl(var(--warning))' },
  ];
};

export const getShopTypeDistribution = (surveys: Survey[]) => {
  const completed = surveys.filter(s => s.status === 'completed');
  const shopTypeLabels: Record<string, string> = {
    grocery: 'Grocery',
    pharmacy: 'Pharmacy',
    textiles: 'Textiles',
    electronics: 'Electronics',
    mobile: 'Mobile',
    restaurant: 'Restaurant',
    other: 'Other',
  };
  
  const distribution: Record<string, { withSoftware: number; withoutSoftware: number }> = {};
  
  Object.keys(shopTypeLabels).forEach(type => {
    distribution[type] = { withSoftware: 0, withoutSoftware: 0 };
  });
  
  completed.forEach(s => {
    if (s.hasBillingSoftware) {
      distribution[s.common.shopType].withSoftware++;
    } else {
      distribution[s.common.shopType].withoutSoftware++;
    }
  });
  
  return Object.entries(distribution).map(([type, data]) => ({
    name: shopTypeLabels[type],
    type,
    withSoftware: data.withSoftware,
    withoutSoftware: data.withoutSoftware,
    total: data.withSoftware + data.withoutSoftware,
  })).filter(d => d.total > 0);
};

export const getSurveyTrend = (surveys: Survey[], days: number = 30) => {
  const completed = surveys.filter(s => s.status === 'completed');
  const now = new Date();
  const trend: { date: string; count: number; formatted: string }[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const formatted = format(date, 'MMM d');
    const count = completed.filter(s => 
      format(new Date(s.createdAt), 'yyyy-MM-dd') === dateStr
    ).length;
    
    trend.push({ date: dateStr, count, formatted });
  }
  
  return trend;
};

export const getPainPointsDistribution = (surveys: Survey[]) => {
  const withSoftware = surveys.filter(s => s.status === 'completed' && s.hasBillingSoftware && s.softwarePath);
  
  const painPointLabels: Record<PainPoint, string> = {
    slow: 'Slow/Hangs',
    hardToLearn: 'Hard to Learn',
    poorSupport: 'Poor Support',
    expensive: 'Expensive',
    gstIssues: 'GST Issues',
    missingFeatures: 'Missing Features',
    dataLoss: 'Data Loss',
    other: 'Other',
  };
  
  const counts: Record<string, number> = {};
  
  withSoftware.forEach(s => {
    s.softwarePath?.painPoints.forEach(pp => {
      const label = painPointLabels[pp] || pp;
      counts[label] = (counts[label] || 0) + 1;
    });
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

export const getDifficultiesDistribution = (surveys: Survey[]) => {
  const withoutSoftware = surveys.filter(s => s.status === 'completed' && !s.hasBillingSoftware && s.noSoftwarePath);
  
  const difficultyLabels: Record<Difficulty, string> = {
    endOfDay: 'End-of-Day Total',
    creditTracking: 'Credit Tracking',
    gstFiling: 'GST Filing',
    findingOldBills: 'Finding Old Bills',
    trainingStaff: 'Training Staff',
    calculationMistakes: 'Calculation Mistakes',
    other: 'Other',
  };
  
  const counts: Record<string, number> = {};
  
  withoutSoftware.forEach(s => {
    s.noSoftwarePath?.currentDifficulties.forEach(d => {
      const label = difficultyLabels[d] || d;
      counts[label] = (counts[label] || 0) + 1;
    });
  });
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

export const getSatisfactionDistribution = (surveys: Survey[]) => {
  const withSoftware = surveys.filter(s => s.status === 'completed' && s.hasBillingSoftware && s.softwarePath);
  
  const satisfactionLabels: Record<Satisfaction, string> = {
    'very-satisfied': 'Very Satisfied',
    'satisfied': 'Satisfied',
    'neutral': 'Neutral',
    'unsatisfied': 'Unsatisfied',
    'very-unsatisfied': 'Very Unsatisfied',
  };
  
  const order: Satisfaction[] = ['very-satisfied', 'satisfied', 'neutral', 'unsatisfied', 'very-unsatisfied'];
  
  const counts: Record<string, number> = {};
  order.forEach(s => counts[satisfactionLabels[s]] = 0);
  
  withSoftware.forEach(s => {
    if (s.softwarePath?.satisfaction) {
      const label = satisfactionLabels[s.softwarePath.satisfaction];
      counts[label] = (counts[label] || 0) + 1;
    }
  });
  
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
};

export const getBudgetPreferenceDistribution = (surveys: Survey[]) => {
  const withoutSoftware = surveys.filter(s => s.status === 'completed' && !s.hasBillingSoftware && s.noSoftwarePath);
  
  const budgetLabels: Record<MonthlyBudget, string> = {
    '<300': '< ₹300',
    '300-500': '₹300-500',
    '500-1000': '₹500-1000',
    'notWilling': 'Not Willing',
  };
  
  const counts: Record<string, number> = {};
  
  withoutSoftware.forEach(s => {
    if (s.noSoftwarePath?.monthlyBudget) {
      const label = budgetLabels[s.noSoftwarePath.monthlyBudget];
      counts[label] = (counts[label] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);
};

export const getDeviceUsageDistribution = (surveys: Survey[]) => {
  const withSoftware = surveys.filter(s => s.status === 'completed' && s.hasBillingSoftware && s.softwarePath);
  
  const deviceLabels: Record<Device, string> = {
    desktop: 'Desktop',
    laptop: 'Laptop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    pos: 'POS Machine',
  };
  
  const counts: Record<string, number> = {};
  
  withSoftware.forEach(s => {
    s.softwarePath?.devices.forEach(d => {
      const label = deviceLabels[d] || d;
      counts[label] = (counts[label] || 0) + 1;
    });
  });
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  return Object.entries(counts)
    .map(([name, value]) => ({ 
      name, 
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
    .filter(d => d.value > 0);
};

export const getUniqueSurveyors = (surveys: Survey[]): string[] => {
  const surveyors = new Set<string>();
  surveys.forEach(s => {
    if (s.common.surveyorName) {
      surveyors.add(s.common.surveyorName);
    }
  });
  return Array.from(surveyors).sort();
};

// Export to CSV
export const exportToCSV = (surveys: Survey[]): string => {
  const headers = [
    'ID', 'Shop Name', 'Owner', 'Phone', 'Shop Type', 'Bills/Day', 'Billing Handler',
    'Surveyor', 'Has Software', 'Software Name', 'Satisfaction', 'Created At', 'Location'
  ];
  
  const rows = surveys.map(s => [
    s.id,
    `"${s.common.shopName}"`,
    `"${s.common.ownerName || ''}"`,
    s.common.phoneNumber || '',
    s.common.shopType,
    s.common.billsPerDay,
    s.common.billingHandler,
    `"${s.common.surveyorName}"`,
    s.hasBillingSoftware ? 'Yes' : 'No',
    `"${s.softwarePath?.softwareName || ''}"`,
    s.softwarePath?.satisfaction || '',
    s.createdAt,
    s.common.location ? `${s.common.location.latitude},${s.common.location.longitude}` : '',
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const downloadCSV = (surveys: Survey[], filename: string = 'surveys'): void => {
  const csv = exportToCSV(surveys);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};