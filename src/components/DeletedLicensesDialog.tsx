import { useState } from 'react';
import { Trash2, Archive, Key, Calendar, User, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeletedLicense } from '@/hooks/useDeletedLicenses';
import { toast } from 'sonner';

interface DeletedLicensesDialogProps {
  deletedLicenses: DeletedLicense[];
  loading: boolean;
  onPermanentDelete: (id: string) => Promise<boolean>;
  onRestore: (license: DeletedLicense) => Promise<{ success: boolean; licenseData: DeletedLicense | null }>;
  onRefresh: () => void;
}

const PERMANENT_DELETE_CODE = '780';

export function DeletedLicensesDialog({
  deletedLicenses,
  loading,
  onPermanentDelete,
  onRestore,
  onRefresh
}: DeletedLicensesDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handlePermanentDelete = async (id: string) => {
    if (deleteCode !== PERMANENT_DELETE_CODE) {
      toast.error('رمز الحذف غير صحيح');
      return;
    }

    const success = await onPermanentDelete(id);
    if (success) {
      setDeleteConfirmId(null);
      setDeleteCode('');
    }
  };

  const handleRestore = async (license: DeletedLicense) => {
    setRestoringId(license.id);
    const result = await onRestore(license);
    setRestoringId(null);
    
    if (result.success) {
      onRefresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
        >
          <Archive className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <Archive className="w-5 h-5" />
            التراخيص المحذوفة ({deletedLicenses.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : deletedLicenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تراخيص محذوفة
            </div>
          ) : (
            <div className="space-y-3">
              {deletedLicenses.map((license) => (
                <div
                  key={license.id}
                  className="bg-muted/50 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary" />
                        <span className="font-mono text-sm font-medium">
                          {license.original_key}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{license.user_name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>انتهاء: {formatDate(license.expires_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          <span>حُذف: {formatDate(license.deleted_at)}</span>
                        </div>
                      </div>

                      {license.notes && (
                        <p className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                          {license.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Restore button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-600/10"
                        onClick={() => handleRestore(license)}
                        disabled={restoringId === license.id}
                      >
                        {restoringId === license.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Delete button */}
                      {deleteConfirmId === license.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="password"
                            placeholder="رمز الحذف"
                            value={deleteCode}
                            onChange={(e) => setDeleteCode(e.target.value)}
                            className="w-24 text-center"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePermanentDelete(license.id)}
                              className="flex-1"
                            >
                              تأكيد
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDeleteConfirmId(null);
                                setDeleteCode('');
                              }}
                              className="flex-1"
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirmId(license.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
