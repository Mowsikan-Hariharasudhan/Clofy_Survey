import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getSurveys, deleteSurveys, updateSurveyMeta, refreshSurveysCache } from '@/lib/surveyStorage';
import { downloadCSV } from '@/lib/surveyStorage';
import { downloadPDF, downloadExcel } from '@/lib/exportUtils';
import { Survey } from '@/types/survey';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  Monitor, 
  FileX, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Download,
  FileSpreadsheet,
  FileText,
  X,
  MoreHorizontal,
  StickyNote,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SurveyDetailDrawer } from '@/components/survey/SurveyDetailDrawer';
import { SurveyNotesDialog, PriorityBadge } from '@/components/survey/SurveyNotesDialog';
import { SurveyCompareDrawer } from '@/components/survey/SurveyCompareDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const shopTypeLabels: Record<string, string> = {
  grocery: 'Grocery',
  pharmacy: 'Pharmacy',
  textiles: 'Textiles',
  electronics: 'Electronics',
  mobile: 'Mobile',
  restaurant: 'Restaurant',
  other: 'Other',
};

const SurveyList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSoftware, setFilterSoftware] = useState<string>('all');
  const [filterShopType, setFilterShopType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data on mount
  useEffect(() => {
    refreshSurveysCache().then(() => setRefreshKey(prev => prev + 1));
  }, []);

  const surveys = useMemo(() => getSurveys(), [refreshKey]);

  const filteredSurveys = useMemo(() => {
    return surveys
      .filter((survey) => {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          survey.common.shopName.toLowerCase().includes(searchLower) ||
          (survey.common.phoneNumber || '').includes(search) ||
          (survey.common.ownerName || '').toLowerCase().includes(searchLower);

        const matchesSoftware = 
          filterSoftware === 'all' ||
          (filterSoftware === 'yes' && survey.hasBillingSoftware) ||
          (filterSoftware === 'no' && !survey.hasBillingSoftware);

        const matchesShopType = 
          filterShopType === 'all' ||
          survey.common.shopType === filterShopType;

        return matchesSearch && matchesSoftware && matchesShopType;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [surveys, search, filterSoftware, filterShopType]);

  const isAllSelected = filteredSurveys.length > 0 && selectedIds.size === filteredSurveys.length;
  const hasSelection = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSurveys.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    deleteSurveys(Array.from(selectedIds));
    toast.success(`Deleted ${selectedIds.size} survey(s)`);
    setSelectedIds(new Set());
    setShowDeleteDialog(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleMarkReviewed = (ids: string[]) => {
    ids.forEach(id => {
      updateSurveyMeta(id, { isReviewed: true });
    });
    toast.success(`Marked ${ids.length} survey(s) as reviewed`);
    setSelectedIds(new Set());
    setRefreshKey(prev => prev + 1);
  };

  const handleExportSelected = (type: 'csv' | 'pdf' | 'excel') => {
    const selectedSurveys = filteredSurveys.filter(s => selectedIds.has(s.id));
    
    if (type === 'csv') {
      downloadCSV(selectedSurveys, 'selected_surveys');
    } else if (type === 'pdf') {
      downloadPDF(selectedSurveys, { total: selectedSurveys.length });
    } else {
      downloadExcel(selectedSurveys);
    }
    toast.success(`Exported ${selectedSurveys.length} survey(s)`);
  };

  const openSurveyDetail = (survey: Survey) => {
    setSelectedSurvey(survey);
    setDrawerOpen(true);
  };

  const openNotesDialog = (survey: Survey) => {
    setSelectedSurvey(survey);
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = (id: string, notes: string, priority: 'normal' | 'high' | 'casestudy') => {
    updateSurveyMeta(id, { adminNotes: notes, priority });
    toast.success('Notes and priority saved');
    setRefreshKey(prev => prev + 1);
    if (selectedSurvey?.id === id) {
      const updated = getSurveys().find(s => s.id === id);
      if (updated) setSelectedSurvey(updated);
    }
  };

  const toggleCompare = (id: string) => {
    const newCompare = new Set(compareIds);
    if (newCompare.has(id)) {
      newCompare.delete(id);
    } else {
      if (newCompare.size >= 4) {
        toast.error('You can compare up to 4 surveys');
        return;
      }
      newCompare.add(id);
    }
    setCompareIds(newCompare);
  };

  const surveysToCompare = useMemo(() => 
    filteredSurveys.filter(s => compareIds.has(s.id)),
    [filteredSurveys, compareIds]
  );

  const handleMarkSingleReviewed = (id: string) => {
    handleMarkReviewed([id]);
    setRefreshKey(prev => prev + 1);
    if (selectedSurvey?.id === id) {
      const updated = getSurveys().find(s => s.id === id);
      if (updated) setSelectedSurvey(updated);
    }
  };

  const SurveyCard = ({ survey }: { survey: Survey }) => (
    <div
      className={cn(
        "w-full p-4 bg-card rounded-xl border shadow-sm transition-all duration-200 animate-fade-in",
        selectedIds.has(survey.id) 
          ? "border-primary bg-primary/5" 
          : compareIds.has(survey.id)
            ? "border-info bg-info/5"
            : "border-border hover:shadow-md hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-2 mt-1">
          <Checkbox
            checked={selectedIds.has(survey.id)}
            onCheckedChange={() => toggleSelect(survey.id)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(survey.id);
            }}
            className={cn(
              "p-1 rounded transition-colors",
              compareIds.has(survey.id) 
                ? "text-info bg-info/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Add to compare"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
        
        <button 
          className="flex-1 text-left"
          onClick={() => openSurveyDetail(survey)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">
                  {survey.common.shopName}
                </h3>
                {survey.meta?.isReviewed && (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                )}
                <PriorityBadge priority={survey.meta?.priority} />
                <span className={cn(
                  "shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                  survey.hasBillingSoftware 
                    ? "bg-success/10 text-success" 
                    : "bg-warning/10 text-warning"
                )}>
                  {survey.hasBillingSoftware ? (
                    <span className="flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      Software
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <FileX className="w-3 h-3" />
                      Manual
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="capitalize">{shopTypeLabels[survey.common.shopType]}</span>
                <span>•</span>
                <span>{format(new Date(survey.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>

              {survey.common.location && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {survey.common.location.latitude.toFixed(4)}, {survey.common.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-2">
                Surveyor: {survey.common.surveyorName}
              </p>

              {survey.meta?.adminNotes && (
                <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                  <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{survey.meta.adminNotes}</span>
                </div>
              )}
            </div>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
            <DropdownMenuItem onClick={() => openSurveyDetail(survey)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openNotesDialog(survey)}>
              <StickyNote className="w-4 h-4 mr-2" />
              Notes & Priority
            </DropdownMenuItem>
            {!survey.meta?.isReviewed && (
              <DropdownMenuItem onClick={() => handleMarkReviewed([survey.id])}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Reviewed
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setSelectedIds(new Set([survey.id]));
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="All Surveys" showBack />

      <main className="container px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shop name, phone, or owner..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={filterSoftware} onValueChange={setFilterSoftware}>
            <SelectTrigger className="flex-1">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Has Software" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Has Software</SelectItem>
              <SelectItem value="no">No Software</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterShopType} onValueChange={setFilterShopType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Shop Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(shopTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Compare Bar */}
        {compareIds.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-info/5 border border-info/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <GitCompare className="w-4 h-4 text-info" />
              <span className="text-sm font-medium">
                {compareIds.size} survey(s) selected for comparison
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareIds(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setCompareOpen(true)}
                disabled={compareIds.size < 2}
              >
                <GitCompare className="w-4 h-4 mr-1" />
                Compare
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {hasSelection ? (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedIds.size} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkReviewed(Array.from(selectedIds))}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Reviewed
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                  <DropdownMenuItem onClick={() => handleExportSelected('csv')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportSelected('pdf')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportSelected('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
              <p className="text-sm text-muted-foreground">
                {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
        )}

        {/* Survey List */}
        <div className="space-y-3">
          {filteredSurveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>

        {/* Empty State */}
        {filteredSurveys.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No surveys found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || filterSoftware !== 'all' || filterShopType !== 'all'
                ? 'Try adjusting your filters'
                : 'Start your first survey'
              }
            </p>
            <Button
              variant="gradient"
              onClick={() => navigate('/survey/new')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Start New Survey
            </Button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Surveys</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} survey{selectedIds.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Survey Detail Drawer */}
      <SurveyDetailDrawer
        survey={selectedSurvey}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onMarkReviewed={handleMarkSingleReviewed}
        onEditNotes={() => {
          setDrawerOpen(false);
          setNotesDialogOpen(true);
        }}
      />

      {/* Notes Dialog */}
      <SurveyNotesDialog
        survey={selectedSurvey}
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        onSave={handleSaveNotes}
      />

      {/* Compare Drawer */}
      <SurveyCompareDrawer
        surveys={surveysToCompare}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemoveSurvey={(id) => {
          const newCompare = new Set(compareIds);
          newCompare.delete(id);
          setCompareIds(newCompare);
          if (newCompare.size < 2) {
            setCompareOpen(false);
          }
        }}
      />
    </div>
  );
};

export default SurveyList;