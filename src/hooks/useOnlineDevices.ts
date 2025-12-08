import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineDevice {
  id: string;
  device_name: string;
  user_type: string;
  last_seen: string;
  is_online: boolean;
}

// Generate a unique device ID that persists in localStorage
const getOrCreateDeviceId = (): string => {
  const storageKey = 'ampro_device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
};

export function useOnlineDevices(userType: 'admin' | 'manager' | null) {
  const [devices, setDevices] = useState<OnlineDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const deviceIdRef = useRef<string | null>(null);
  const isRegisteredRef = useRef(false);

  // Generate device name based on browser/OS
  const getDeviceName = useCallback(() => {
    const userAgent = navigator.userAgent;
    let deviceName = 'جهاز غير معروف';
    
    if (userAgent.includes('Windows')) deviceName = 'ويندوز';
    else if (userAgent.includes('Mac')) deviceName = 'ماك';
    else if (userAgent.includes('Linux')) deviceName = 'لينكس';
    else if (userAgent.includes('Android')) deviceName = 'أندرويد';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) deviceName = 'آيفون/آيباد';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) deviceName += ' - كروم';
    else if (userAgent.includes('Firefox')) deviceName += ' - فايرفوكس';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) deviceName += ' - سفاري';
    else if (userAgent.includes('Edg')) deviceName += ' - إيدج';
    
    return deviceName;
  }, []);

  // Register or update device when component mounts
  const registerDevice = useCallback(async () => {
    if (!userType || isRegisteredRef.current) return;
    
    try {
      const persistentDeviceId = getOrCreateDeviceId();
      const deviceName = getDeviceName();
      
      // First, try to find existing device with this persistent ID
      const { data: existingDevice } = await supabase
        .from('online_devices')
        .select('*')
        .eq('id', persistentDeviceId)
        .maybeSingle();
      
      if (existingDevice) {
        // Update existing device
        await supabase
          .from('online_devices')
          .update({
            device_name: deviceName,
            user_type: userType,
            is_online: true,
            last_seen: new Date().toISOString()
          })
          .eq('id', persistentDeviceId);
      } else {
        // Insert new device with the persistent ID
        await supabase
          .from('online_devices')
          .insert({
            id: persistentDeviceId,
            device_name: deviceName,
            user_type: userType,
            is_online: true,
            last_seen: new Date().toISOString()
          });
      }
      
      deviceIdRef.current = persistentDeviceId;
      isRegisteredRef.current = true;
    } catch (error) {
      console.error('Error registering device:', error);
    }
  }, [userType, getDeviceName]);

  // Fetch all online devices and clean up stale ones
  const fetchDevices = useCallback(async () => {
    try {
      // Delete devices that haven't been seen for more than 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await supabase
        .from('online_devices')
        .delete()
        .lt('last_seen', twoMinutesAgo);

      const { data, error } = await supabase
        .from('online_devices')
        .select('*')
        .order('last_seen', { ascending: false });
      
      if (error) {
        console.error('Error fetching devices:', error);
        return;
      }
      
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update last seen timestamp periodically
  const updateLastSeen = useCallback(async () => {
    if (!deviceIdRef.current) return;
    
    try {
      await supabase
        .from('online_devices')
        .update({ 
          last_seen: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', deviceIdRef.current);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }, []);

  // Mark device as offline when leaving
  const markOffline = useCallback(async () => {
    if (!deviceIdRef.current) return;
    
    try {
      await supabase
        .from('online_devices')
        .delete()
        .eq('id', deviceIdRef.current);
    } catch (error) {
      console.error('Error marking device offline:', error);
    }
  }, []);

  // Kick a device (admin only)
  const kickDevice = useCallback(async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('online_devices')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Error kicking device:', error);
        return false;
      }

      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Error kicking device:', error);
      return false;
    }
  }, [fetchDevices]);

  // Register device and set up realtime subscription
  useEffect(() => {
    if (!userType) return;
    
    // Reset registration flag when userType changes
    isRegisteredRef.current = false;
    
    registerDevice();
    fetchDevices();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('online-devices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_devices'
        },
        () => {
          fetchDevices();
        }
      )
      .subscribe();

    // Update last seen every 30 seconds
    const interval = setInterval(updateLastSeen, 30000);

    // Handle page visibility change
    const handleVisibilityChange = () => {
      updateLastSeen();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
      markOffline();
    };
  }, [userType, registerDevice, fetchDevices, updateLastSeen, markOffline]);

  // Handle beforeunload to mark device offline
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (deviceIdRef.current) {
        // Use sendBeacon for more reliable cleanup on page unload
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/online_devices?id=eq.${deviceIdRef.current}`;
        navigator.sendBeacon(url, '');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Check if device is online (last seen within 1 minute)
  const isDeviceOnline = (lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInSeconds = (now.getTime() - lastSeenDate.getTime()) / 1000;
    return diffInSeconds < 60;
  };

  const onlineCount = devices.filter(d => isDeviceOnline(d.last_seen)).length;

  return {
    devices,
    loading,
    onlineCount,
    isDeviceOnline,
    refresh: fetchDevices,
    kickDevice,
    currentDeviceId: deviceIdRef.current
  };
}
