import { useState, useCallback, useEffect } from 'react';
import { Manager } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

export function useManagers() {
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.managers);
    if (stored) {
      setManagers(JSON.parse(stored));
    }
  }, []);

  const saveManagers = useCallback((newManagers: Manager[]) => {
    localStorage.setItem(STORAGE_KEYS.managers, JSON.stringify(newManagers));
    setManagers(newManagers);
  }, []);

  const addManager = useCallback((name: string, password: string, maxLicenses: number) => {
    const newManager: Manager = {
      id: Date.now().toString(),
      name,
      password,
      maxLicenses,
      createdLicenses: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    const updated = [...managers, newManager];
    saveManagers(updated);
    return newManager;
  }, [managers, saveManagers]);

  const updateManager = useCallback((id: string, updates: Partial<Manager>) => {
    const updated = managers.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    saveManagers(updated);
  }, [managers, saveManagers]);

  const deleteManager = useCallback((id: string) => {
    const updated = managers.filter(m => m.id !== id);
    saveManagers(updated);
  }, [managers, saveManagers]);

  const incrementManagerLicenses = useCallback((id: string) => {
    const updated = managers.map(m => 
      m.id === id ? { ...m, createdLicenses: m.createdLicenses + 1 } : m
    );
    saveManagers(updated);
  }, [managers, saveManagers]);

  const getManagerById = useCallback((id: string) => {
    return managers.find(m => m.id === id);
  }, [managers]);

  const validateManagerLogin = useCallback((password: string): Manager | null => {
    return managers.find(m => m.password === password && m.isActive) || null;
  }, [managers]);

  const canManagerCreateLicense = useCallback((id: string): boolean => {
    const manager = managers.find(m => m.id === id);
    if (!manager) return false;
    return manager.createdLicenses < manager.maxLicenses;
  }, [managers]);

  const getManagerRemainingLicenses = useCallback((id: string): number => {
    const manager = managers.find(m => m.id === id);
    if (!manager) return 0;
    return manager.maxLicenses - manager.createdLicenses;
  }, [managers]);

  return {
    managers,
    addManager,
    updateManager,
    deleteManager,
    incrementManagerLicenses,
    getManagerById,
    validateManagerLogin,
    canManagerCreateLicense,
    getManagerRemainingLicenses,
    loadManagers
  };
}
