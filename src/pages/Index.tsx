import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshSurveysCache } from '@/lib/surveyStorage';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SoftwareDistributionChart } from '@/components/dashboard/SoftwareDistributionChart';
import { ShopTypeChart } from '@/components/dashboard/ShopTypeChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { PainPointsChart } from '@/components/dashboard/PainPointsChart';
import { SatisfactionChart } from '@/components/dashboard/SatisfactionChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { DeviceUsageChart } from '@/components/dashboard/DeviceUsageChart';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { 
  getSurveys, 
  getAdvancedStats, 
  getSoftwareDistribution,
  getShopTypeDistribution,
  getSurveyTrend,
  getPainPointsDistribution,
  getDifficultiesDistribution,
  getSatisfactionDistribution,
  getBudgetPreferenceDistribution,
  getDeviceUsageDistribution,
  getUniqueSurveyors,
  getFilteredSurveys,
  downloadCSV,
  DateRange,
} from '@/lib/surveyStorage';
import { downloadPDF, downloadExcel } from '@/lib/exportUtils';
import { 
  Plus, 
  List, 
  FileCheck, 
  Monitor, 
  FileX, 
  Clock, 
  Calendar,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [shopType, setShopType] = useState('all');
  const [hasSoftware, setHasSoftware] = useState<'yes' | 'no' | 'all'>('all');
  const [surveyorName, setSurveyorName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data on mount
  useEffect(() => {
    refreshSurveysCache().then(() => setRefreshKey(prev => prev + 1));
  }, []);

  const allSurveys = useMemo(() => getSurveys(), [refreshKey]);
  const surveyors = useMemo(() => getUniqueSurveyors(allSurveys), [allSurveys]);
  
  const filteredSurveys = useMemo(() => 
    getFilteredSurveys(allSurveys, { dateRange, shopType, hasSoftware, surveyorName }),
    [allSurveys, dateRange, shopType, hasSoftware, surveyorName]
  );

  const stats = useMemo(() => getAdvancedStats(allSurveys, dateRange), [allSurveys, dateRange]);
  const softwareDistribution = useMemo(() => getSoftwareDistribution(filteredSurveys), [filteredSurveys]);
  const shopTypeDistribution = useMemo(() => getShopTypeDistribution(filteredSurveys), [filteredSurveys]);
  const trendData = useMemo(() => getSurveyTrend(allSurveys, 30), [allSurveys]);
  const painPoints = useMemo(() => getPainPointsDistribution(filteredSurveys), [filteredSurveys]);
  const difficulties = useMemo(() => getDifficultiesDistribution(filteredSurveys), [filteredSurveys]);
  const satisfaction = useMemo(() => getSatisfactionDistribution(filteredSurveys), [filteredSurveys]);
  const budgetPreference = useMemo(() => getBudgetPreferenceDistribution(filteredSurveys), [filteredSurveys]);
  const deviceUsage = useMemo(() => getDeviceUsageDistribution(filteredSurveys), [filteredSurveys]);

  const handleSoftwareFilterFromChart = (value: string) => {
    setHasSoftware(value as 'yes' | 'no');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Clofy Survey" />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2 animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome, Surveyor!
          </h2>
          <p className="text-muted-foreground">
            Collect billing feedback from local shops
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/survey/new')}
            className="w-full justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Survey
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/surveys')}
            className="w-full justify-center gap-2"
          >
            <List className="w-5 h-5" />
            All Surveys
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-foreground">Key Metrics</h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              icon={FileCheck}
              label="Total Surveys"
              value={stats.total}
              color="primary"
            />
            <MetricCard
              icon={Calendar}
              label="This Week"
              value={stats.thisWeek}
              color="info"
            />
            <MetricCard
              icon={TrendingUp}
              label="Today"
              value={stats.today}
              color="success"
            />
            <MetricCard
              icon={Clock}
              label="Avg Duration"
              value={`${stats.avgDurationMinutes}m`}
              subtitle="per survey"
              color="warning"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <MetricCard
              icon={Monitor}
              label="With Software"
              value={stats.withSoftware}
              subtitle={`${stats.withSoftwarePercent}%`}
              color="success"
            />
            <MetricCard
              icon={FileX}
              label="Without Software"
              value={stats.withoutSoftware}
              subtitle={`${stats.withoutSoftwarePercent}%`}
              color="warning"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Pending"
              value={stats.pending}
              color="destructive"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <DashboardFilters
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            shopType={shopType}
            onShopTypeChange={setShopType}
            hasSoftware={hasSoftware}
            onHasSoftwareChange={setHasSoftware}
            surveyorName={surveyorName}
            onSurveyorNameChange={setSurveyorName}
            surveyors={surveyors}
            onExportCSV={() => downloadCSV(filteredSurveys)}
            onExportPDF={() => downloadPDF(filteredSurveys, stats)}
            onExportExcel={() => downloadExcel(filteredSurveys)}
          />
        </div>

        {/* Charts Grid */}
        {stats.total > 0 && (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="text-lg font-semibold text-foreground">Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartCard title="Software Distribution" subtitle="Click slice to filter">
                <SoftwareDistributionChart 
                  data={softwareDistribution} 
                  onSliceClick={handleSoftwareFilterFromChart}
                />
              </ChartCard>

              <ChartCard title="Survey Trend" subtitle="Last 30 days">
                <TrendChart data={trendData} />
              </ChartCard>
            </div>

            <ChartCard title="Surveys by Shop Type" subtitle="Grouped by software usage">
              <ShopTypeChart data={shopTypeDistribution} />
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChartCard title="Top Pain Points" subtitle="For shops with software">
                <PainPointsChart data={painPoints} color="hsl(var(--destructive))" />
              </ChartCard>

              <ChartCard title="Top Challenges" subtitle="For shops without software">
                <PainPointsChart data={difficulties} color="hsl(var(--warning))" />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ChartCard title="Satisfaction Rating" subtitle="Software users">
                <SatisfactionChart data={satisfaction} />
              </ChartCard>

              <ChartCard title="Budget Preference" subtitle="Non-software shops">
                <BudgetChart data={budgetPreference} />
              </ChartCard>

              <ChartCard title="Device Usage" subtitle="Software users">
                <DeviceUsageChart data={deviceUsage} />
              </ChartCard>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.total === 0 && (
          <div className="text-center py-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <FileCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No surveys yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your first survey to see analytics here
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
