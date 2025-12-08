import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeletedLicense {
  id: string;
  original_key: string;
  user_name: string | null;
  expires_at: string | null;
  hwid: string | null;
  notes: string | null;
  deleted_by: string;
  deleted_at: string;
}

export function useDeletedLicenses() {
  const [deletedLicenses, setDeletedLicenses] = useState<DeletedLicense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeletedLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deleted_licenses')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('Error loading deleted licenses:', error);
        return;
      }

      setDeletedLicenses(data || []);
    } catch (error) {
      console.error('Error loading deleted licenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeletedLicense = useCallback(async (license: {
    original_key: string;
    user_name?: string;
    expires_at?: string;
    hwid?: string;
    notes?: string;
    deleted_by: string;
  }) => {
    try {
      const { error } = await supabase
        .from('deleted_licenses')
        .insert({
          original_key: license.original_key,
          user_name: license.user_name || null,
          expires_at: license.expires_at || null,
          hwid: license.hwid || null,
          notes: license.notes || null,
          deleted_by: license.deleted_by
        });

      if (error) {
        console.error('Error adding deleted license:', error);
        return false;
      }

      await loadDeletedLicenses();
      return true;
    } catch (error) {
      console.error('Error adding deleted license:', error);
      return false;
    }
  }, [loadDeletedLicenses]);

  const permanentlyDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('deleted_licenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error permanently deleting license:', error);
        toast.error('حدث خطأ أثناء الحذف النهائي');
        return false;
      }

      await loadDeletedLicenses();
      toast.success('تم الحذف النهائي بنجاح');
      return true;
    } catch (error) {
      console.error('Error permanently deleting license:', error);
      return false;
    }
  }, [loadDeletedLicenses]);

  const restoreLicense = useCallback(async (license: DeletedLicense): Promise<{ success: boolean; licenseData: DeletedLicense | null }> => {
    try {
      // Delete from deleted_licenses table
      const { error: deleteError } = await supabase
        .from('deleted_licenses')
        .delete()
        .eq('id', license.id);

      if (deleteError) {
        console.error('Error restoring license:', deleteError);
        toast.error('حدث خطأ أثناء استعادة الترخيص');
        return { success: false, licenseData: null };
      }

      await loadDeletedLicenses();
      toast.success('تم استعادة الترخيص بنجاح');
      return { success: true, licenseData: license };
    } catch (error) {
      console.error('Error restoring license:', error);
      return { success: false, licenseData: null };
    }
  }, [loadDeletedLicenses]);

  useEffect(() => {
    loadDeletedLicenses();
  }, [loadDeletedLicenses]);

  return {
    deletedLicenses,
    loading,
    loadDeletedLicenses,
    addDeletedLicense,
    permanentlyDelete,
    restoreLicense
  };
}
