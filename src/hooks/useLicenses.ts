import { useState, useCallback } from 'react';
import { License, LicenseFilter } from '@/lib/types';
import { FIREBASE_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

export function useLicenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ db1: 0, db2: 0 });

  const loadLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${FIREBASE_CONFIG.mainDb}/license_keys.json?auth=${FIREBASE_CONFIG.authToken}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`خطأ ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        const licensesArray: License[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          key,
          userName: value.userName || 'غير محدد',
          expiresAt: value.expiresAt || '',
          hwid: value.hwid || '',
          notes: value.notes || '',
          used: value.used || false,
          createdAt: value.createdAt || '',
          lastUpdated: value.lastUpdated || ''
        }));
        
        licensesArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLicenses(licensesArray);
      } else {
        setLicenses([]);
      }
    } catch (error: any) {
      toast.error(`فشل تحميل التراخيص: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStats = useCallback(async (dbNumber: 1 | 2) => {
    try {
      const url = dbNumber === 1 ? FIREBASE_CONFIG.db1 : FIREBASE_CONFIG.db2;
      const response = await fetch(url);
      const data = await response.json();
      
      const count = data ? Object.keys(data).length : 0;
      setStats(prev => ({ ...prev, [`db${dbNumber}`]: count }));
      toast.success(`القاعدة ${dbNumber}: ${count} مستخدم`);
    } catch {
      toast.error(`فشل تحديث القاعدة ${dbNumber}`);
    }
  }, []);

  const createLicense = useCallback(async (licenseData: Omit<License, 'key' | 'createdAt' | 'lastUpdated'> & { key: string }) => {
    const data = {
      ...licenseData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    try {
      const url = `${FIREBASE_CONFIG.mainDb}/license_keys/${encodeURIComponent(licenseData.key)}.json?auth=${FIREBASE_CONFIG.authToken}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast.success(`تم إنشاء الترخيص: ${licenseData.key}`);
        await loadLicenses();
        return true;
      } else {
        toast.error('فشل إنشاء الترخيص');
        return false;
      }
    } catch (error: any) {
      toast.error(`حدث خطأ: ${error.message}`);
      return false;
    }
  }, [loadLicenses]);

  const updateLicense = useCallback(async (key: string, updates: Partial<License>) => {
    try {
      const url = `${FIREBASE_CONFIG.mainDb}/license_keys/${encodeURIComponent(key)}.json?auth=${FIREBASE_CONFIG.authToken}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, lastUpdated: new Date().toISOString() })
      });
      
      if (response.ok) {
        toast.success('تم تحديث الترخيص');
        await loadLicenses();
        return true;
      }
      return false;
    } catch {
      toast.error('فشل تحديث الترخيص');
      return false;
    }
  }, [loadLicenses]);

  const resetHWID = useCallback(async (key: string) => {
    try {
      const url = `${FIREBASE_CONFIG.mainDb}/license_keys/${encodeURIComponent(key)}.json?auth=${FIREBASE_CONFIG.authToken}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hwid: "",
          used: false,
          resetAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        toast.success('تم إعادة ضبط السيريال');
        await loadLicenses();
        return true;
      }
      return false;
    } catch {
      toast.error('فشل إعادة الضبط');
      return false;
    }
  }, [loadLicenses]);

  const deleteLicense = useCallback(async (key: string) => {
    try {
      const url = `${FIREBASE_CONFIG.mainDb}/license_keys/${encodeURIComponent(key)}.json?auth=${FIREBASE_CONFIG.authToken}`;
      const response = await fetch(url, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('تم حذف الترخيص');
        await loadLicenses();
        return true;
      }
      return false;
    } catch {
      toast.error('فشل حذف الترخيص');
      return false;
    }
  }, [loadLicenses]);

  const filterLicenses = useCallback((filter: LicenseFilter, searchQuery: string) => {
    let filtered = [...licenses];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(license => {
        const isExpired = license.expiresAt && new Date(license.expiresAt) < new Date();
        const hasHWID = license.hwid && license.hwid.trim() !== '';
        
        switch (filter) {
          case 'active': return !license.used && !isExpired;
          case 'used': return license.used;
          case 'expired': return isExpired;
          case 'linked': return hasHWID;
          case 'unlinked': return !hasHWID;
          default: return true;
        }
      });
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(license => 
        license.key.toLowerCase().includes(query) ||
        license.userName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [licenses]);

  const getLicenseStats = useCallback(() => {
    const total = licenses.length;
    const active = licenses.filter(l => !l.used && (!l.expiresAt || new Date(l.expiresAt) >= new Date())).length;
    const used = licenses.filter(l => l.used).length;
    const expired = licenses.filter(l => l.expiresAt && new Date(l.expiresAt) < new Date()).length;
    
    return { total, active, used, expired };
  }, [licenses]);

  return {
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
  };
}
