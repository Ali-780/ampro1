import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BannedDevice {
  id: string;
  device_name: string;
  banned_at: string;
  banned_until: string;
  banned_by: string;
  reason: string | null;
}

export function useBannedDevices() {
  const [bannedDevices, setBannedDevices] = useState<BannedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBannedDevices = useCallback(async () => {
    try {
      // Clean up expired bans first
      await supabase
        .from('banned_devices')
        .delete()
        .lt('banned_until', new Date().toISOString());

      const { data, error } = await supabase
        .from('banned_devices')
        .select('*')
        .order('banned_at', { ascending: false });

      if (error) {
        console.error('Error loading banned devices:', error);
        return;
      }

      setBannedDevices(data || []);
    } catch (error) {
      console.error('Error loading banned devices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const banDevice = useCallback(async (deviceName: string, durationMinutes: number, reason?: string) => {
    try {
      const bannedUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('banned_devices')
        .insert({
          device_name: deviceName,
          banned_until: bannedUntil,
          banned_by: 'admin',
          reason: reason || null
        });

      if (error) {
        console.error('Error banning device:', error);
        toast.error('حدث خطأ أثناء حظر الجهاز');
        return false;
      }

      await loadBannedDevices();
      toast.success('تم حظر الجهاز بنجاح');
      return true;
    } catch (error) {
      console.error('Error banning device:', error);
      return false;
    }
  }, [loadBannedDevices]);

  const unbanDevice = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('banned_devices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error unbanning device:', error);
        toast.error('حدث خطأ أثناء إلغاء الحظر');
        return false;
      }

      await loadBannedDevices();
      toast.success('تم إلغاء حظر الجهاز');
      return true;
    } catch (error) {
      console.error('Error unbanning device:', error);
      return false;
    }
  }, [loadBannedDevices]);

  const isDeviceBanned = useCallback((deviceName: string) => {
    return bannedDevices.some(d => d.device_name === deviceName && new Date(d.banned_until) > new Date());
  }, [bannedDevices]);

  const getBanInfo = useCallback((deviceName: string) => {
    return bannedDevices.find(d => d.device_name === deviceName && new Date(d.banned_until) > new Date());
  }, [bannedDevices]);

  useEffect(() => {
    loadBannedDevices();
  }, [loadBannedDevices]);

  return {
    bannedDevices,
    loading,
    loadBannedDevices,
    banDevice,
    unbanDevice,
    isDeviceBanned,
    getBanInfo
  };
}
