import { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Users, Database, Clock, Key, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLicenses } from '@/hooks/useLicenses';
import { LicenseFilter } from '@/lib/types';
import { StatCard } from './StatCard';
import { CreateLicenseForm } from './CreateLicenseForm';
import { LicenseSearch } from './LicenseSearch';
import { LicenseList } from './LicenseList';
import { EditLicenseDialog } from './EditLicenseDialog';
import { ManagerSettings } from './ManagerSettings';
import { License } from '@/lib/types';
import { toast } from 'sonner';

interface DashboardProps {
  timeLeft: number;
  onLogout: () => void;
  isAdmin: boolean;
  managerId: string | null;
  managersHook: {
    managers: any[];
    addManager: (name: string, password: string, maxLicenses: number) => any;
    updateManager: (id: string, updates: any) => void;
    deleteManager: (id: string) => void;
    incrementManagerLicenses: (id: string) => void;
    getManagerById: (id: string) => any;
    canManagerCreateLicense: (id: string) => boolean;
    getManagerRemainingLicenses: (id: string) => number;
  };
}

export function Dashboard({ timeLeft, onLogout, isAdmin, managerId, managersHook }: DashboardProps) {
  const {
    licenses,
    loading,
    stats,
    loadLicenses,
    updateStats,
    createLicense,
    updateLicense,
    resetHWID,
    deleteLicense,
    filterLicenses,
    getLicenseStats
  } = useLicenses();

  const [filter, setFilter] = useState<LicenseFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [showManagerSettings, setShowManagerSettings] = useState(false);

  useEffect(() => {
    loadLicenses();
    updateStats(1);
    updateStats(2);
  }, []);

  const filteredLicenses = filterLicenses(filter, searchQuery);
  const licenseStats = getLicenseStats();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefreshAll = () => {
    loadLicenses();
    updateStats(1);
    updateStats(2);
  };

  const handleCreateLicense = async (data: any) => {
    if (!isAdmin && managerId) {
      if (!managersHook.canManagerCreateLicense(managerId)) {
        toast.error('لقد وصلت للحد الأقصى من التراخيص المسموحة لك');
        return false;
      }
    }
    
    const success = await createLicense(data);
    
    if (success && !isAdmin && managerId) {
      managersHook.incrementManagerLicenses(managerId);
    }
    
    return success;
  };

  const currentManager = managerId ? managersHook.getManagerById(managerId) : null;
  const remainingLicenses = managerId ? managersHook.getManagerRemainingLicenses(managerId) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="gradient-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-cairo font-bold">إدارة التراخيص</h1>
                <p className="text-xs opacity-80">
                  {isAdmin ? 'المدير الرئيسي' : `مسؤول: ${currentManager?.name || ''}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isAdmin && remainingLicenses !== null && (
                <div className="hidden sm:flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">متبقي: {remainingLicenses}</span>
                </div>
              )}
              
              <div className="hidden sm:flex items-center gap-2 bg-primary-foreground/10 px-3 py-1.5 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{licenseStats.active} نشط</span>
              </div>
              
              {isAdmin && (
                <Button
                  onClick={() => setShowManagerSettings(true)}
                  size="sm"
                  variant="secondary"
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                onClick={handleRefreshAll}
                size="sm"
                variant="secondary"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={() => onLogout()}
                size="sm"
                variant="destructive"
                className="gradient-danger border-0"
              >
                <LogOut className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="قاعدة البيانات 1"
            value={stats.db1}
            icon={<Database className="w-5 h-5" />}
            color="primary"
            onRefresh={() => updateStats(1)}
          />
          <StatCard
            title="قاعدة البيانات 2"
            value={stats.db2}
            icon={<Database className="w-5 h-5" />}
            color="success"
            onRefresh={() => updateStats(2)}
          />
          <StatCard
            title="التراخيص النشطة"
            value={licenseStats.active}
            icon={<Key className="w-5 h-5" />}
            color="accent"
          />
          <StatCard
            title="إجمالي التراخيص"
            value={licenseStats.total}
            icon={<Users className="w-5 h-5" />}
            color="warning"
          />
        </div>

        {/* Create License Form */}
        <CreateLicenseForm 
          onSubmit={handleCreateLicense}
          remainingLicenses={!isAdmin && remainingLicenses !== null ? remainingLicenses : undefined}
        />

        {/* Search & Filter */}
        <LicenseSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filter={filter}
          onFilterChange={setFilter}
          totalCount={filteredLicenses.length}
        />

        {/* License List */}
        <LicenseList
          licenses={filteredLicenses}
          loading={loading}
          onEdit={isAdmin ? setEditingLicense : undefined}
          onReset={isAdmin ? resetHWID : undefined}
          onDelete={isAdmin ? deleteLicense : undefined}
          onRefresh={loadLicenses}
        />
      </main>

      {/* Session Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-foreground text-background py-2 px-4">
        <div className="container mx-auto flex justify-center items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>الجلسة:</span>
            <span className={timeLeft <= 60 ? 'text-destructive font-bold' : timeLeft <= 300 ? 'text-warning' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span>التراخيص: {licenseStats.total}</span>
          <span className="text-muted-foreground">|</span>
          <span>النشطة: {licenseStats.active}</span>
        </div>
      </footer>

      {/* Edit Dialog */}
      {editingLicense && (
        <EditLicenseDialog
          license={editingLicense}
          onClose={() => setEditingLicense(null)}
          onSave={updateLicense}
        />
      )}

      {/* Manager Settings Dialog */}
      {isAdmin && (
        <ManagerSettings
          open={showManagerSettings}
          onClose={() => setShowManagerSettings(false)}
          managers={managersHook.managers}
          onAddManager={managersHook.addManager}
          onUpdateManager={managersHook.updateManager}
          onDeleteManager={managersHook.deleteManager}
        />
      )}
    </div>
  );
}
