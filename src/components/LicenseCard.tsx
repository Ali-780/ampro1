import { Key, User, Calendar, Link, Unlink, Clock, Edit, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { License } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LicenseCardProps {
  license: License;
  onEdit?: () => void;
  onReset?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}

export function LicenseCard({ license, onEdit, onReset, onDelete, style }: LicenseCardProps) {
  const isExpired = license.expiresAt && new Date(license.expiresAt) < new Date();
  const hasHWID = license.hwid && license.hwid.trim() !== '';
  
  const status = license.used ? 'used' : isExpired ? 'expired' : 'active';
  const statusLabel = license.used ? 'مستخدم' : isExpired ? 'منتهي' : 'نشط';
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'غير محدد';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleDelete = () => {
    if (onDelete && confirm(`هل أنت متأكد من حذف الترخيص: ${license.key}؟`)) {
      onDelete();
    }
  };

  const handleReset = () => {
    if (onReset && confirm(`هل تريد إعادة ضبط السيريال للترخيص: ${license.key}؟`)) {
      onReset();
    }
  };

  const hasActions = onEdit || onReset || onDelete;

  return (
    <div 
      className={cn("license-card animate-slide-up", status)}
      style={style}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* License Info */}
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
              <Key className="w-4 h-4 text-primary" />
              {license.key}
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              status === 'active' && "bg-success/10 text-success",
              status === 'used' && "bg-destructive/10 text-destructive",
              status === 'expired' && "bg-warning/10 text-warning"
            )}>
              {statusLabel}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            {license.userName}
          </div>
          
          <div className={cn(
            "flex items-center gap-1.5 text-sm",
            isExpired ? "text-warning" : "text-muted-foreground"
          )}>
            <Calendar className="w-4 h-4" />
            {formatDate(license.expiresAt)}
            {isExpired && <span className="text-xs">(منتهي)</span>}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs",
              hasHWID ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
            )}>
              {hasHWID ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
              {hasHWID ? 'مرتبط' : 'غير مرتبط'}
            </span>
            {license.createdAt && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                {formatDate(license.createdAt)}
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {hasActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={onEdit}
                size="icon"
                className="w-10 h-10 rounded-full gradient-primary hover:opacity-90"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onReset && (
              <Button
                onClick={handleReset}
                size="icon"
                className="w-10 h-10 rounded-full gradient-warning hover:opacity-90"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={handleDelete}
                size="icon"
                className="w-10 h-10 rounded-full gradient-danger hover:opacity-90"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
