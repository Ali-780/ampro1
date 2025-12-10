import { useEffect } from 'react';
import { History, Trash2, RefreshCw, Key, Edit, RotateCcw, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityLog } from '@/hooks/useActivityLogs';

interface ActivityLogDialogProps {
  logs: ActivityLog[];
  loading: boolean;
  onLoad: () => void;
  onClear: () => void;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'create': <Key className="w-4 h-4 text-green-500" />,
  'edit': <Edit className="w-4 h-4 text-blue-500" />,
  'delete': <Trash2 className="w-4 h-4 text-red-500" />,
  'reset_hwid': <RotateCcw className="w-4 h-4 text-orange-500" />,
  'restore': <RefreshCw className="w-4 h-4 text-purple-500" />,
  'add_manager': <UserPlus className="w-4 h-4 text-green-500" />,
  'delete_manager': <UserMinus className="w-4 h-4 text-red-500" />,
};

const ACTION_LABELS: Record<string, string> = {
  'create': 'إنشاء ترخيص',
  'edit': 'تعديل ترخيص',
  'delete': 'حذف ترخيص',
  'reset_hwid': 'إعادة تعيين HWID',
  'restore': 'استعادة ترخيص',
  'add_manager': 'إضافة مسؤول',
  'delete_manager': 'حذف مسؤول',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function ActivityLogDialog({ logs, loading, onLoad, onClear }: ActivityLogDialogProps) {
  useEffect(() => {
    onLoad();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <History className="w-4 h-4" />
          <span>سجل النشاطات</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="w-5 h-5" />
              سجل النشاطات
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoad}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onClear}
                disabled={logs.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد نشاطات مسجلة
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="mt-1">
                    {ACTION_ICONS[log.action_type] || <History className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {ACTION_LABELS[log.action_type] || log.action_type}
                      </span>
                      {log.license_key && (
                        <code className="text-xs bg-background px-1.5 py-0.5 rounded border font-mono">
                          {log.license_key}
                        </code>
                      )}
                    </div>
                    {log.user_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        المستخدم: {log.user_name}
                      </p>
                    )}
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {log.details}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>بواسطة: {log.performed_by}</span>
                      <span>•</span>
                      <span>{formatDate(log.created_at)}</span>
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
