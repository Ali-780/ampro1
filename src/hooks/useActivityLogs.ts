import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  action_type: string;
  license_key: string | null;
  user_name: string | null;
  performed_by: string;
  details: string | null;
  created_at: string;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLog = useCallback(async (
    actionType: string,
    performedBy: string,
    licenseKey?: string,
    userName?: string,
    details?: string
  ) => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          action_type: actionType,
          license_key: licenseKey || null,
          user_name: userName || null,
          performed_by: performedBy,
          details: details || null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
  }, []);

  const clearLogs = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  }, []);

  return {
    logs,
    loading,
    loadLogs,
    addLog,
    clearLogs
  };
}
