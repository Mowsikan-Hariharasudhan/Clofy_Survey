import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  isOnline, 
  getPendingSyncCount, 
  syncPendingSurveys, 
  setupConnectivityListeners 
} from '@/lib/offlineStorage';
import { refreshSurveysCache } from '@/lib/surveyStorage';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    setPendingCount(getPendingSyncCount());

    const cleanup = setupConnectivityListeners(
      () => {
        setOnline(true);
        toast.success('Back online!');
        // Auto-sync when coming back online
        handleSync();
      },
      () => {
        setOnline(false);
        toast.warning('You are offline. Surveys will be saved locally.');
      }
    );

    return cleanup;
  }, []);

  const handleSync = async () => {
    if (!online || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncPendingSurveys();
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} survey${result.synced > 1 ? 's' : ''}`);
        await refreshSurveysCache();
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 2000);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} survey${result.failed > 1 ? 's' : ''}`);
      }
      setPendingCount(getPendingSyncCount());
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show if online and nothing pending
  if (online && pendingCount === 0 && !justSynced) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300",
      !online 
        ? "bg-warning text-warning-foreground" 
        : pendingCount > 0 
          ? "bg-primary text-primary-foreground"
          : "bg-success text-success-foreground"
    )}>
      {!online ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-background/20 rounded-full text-xs">
              {pendingCount} pending
            </span>
          )}
        </>
      ) : pendingCount > 0 ? (
        <>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <RefreshCw className={cn(
              "w-4 h-4",
              isSyncing && "animate-spin"
            )} />
            <span className="text-sm font-medium">
              {isSyncing ? 'Syncing...' : `Sync ${pendingCount} survey${pendingCount > 1 ? 's' : ''}`}
            </span>
          </button>
        </>
      ) : justSynced ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Synced!</span>
        </>
      ) : null}
    </div>
  );
}
