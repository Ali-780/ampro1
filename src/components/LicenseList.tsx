import { Loader2, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { License } from '@/lib/types';
import { LicenseCard } from './LicenseCard';

interface LicenseListProps {
  licenses: License[];
  loading: boolean;
  onEdit?: (license: License) => void;
  onReset?: (key: string) => Promise<boolean>;
  onDelete?: (key: string) => Promise<boolean>;
  onRefresh: () => void;
}

export function LicenseList({ 
  licenses, 
  loading, 
  onEdit, 
  onReset, 
  onDelete,
  onRefresh 
}: LicenseListProps) {
  if (loading) {
    return (
      <div className="card-elevated p-12 text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-muted-foreground">جاري تحميل التراخيص...</p>
      </div>
    );
  }

  if (licenses.length === 0) {
    return (
      <div className="card-elevated p-12 text-center">
        <Inbox className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد تراخيص</h3>
        <p className="text-muted-foreground mb-4">لم يتم العثور على أي تراخيص</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 ml-2" />
          تحديث
        </Button>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="gradient-primary p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-cairo font-bold text-primary-foreground">
            جميع التراخيص
            <span className="mr-2 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-sm">
              {licenses.length}
            </span>
          </h2>
          <Button
            onClick={onRefresh}
            size="sm"
            variant="secondary"
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {licenses.map((license, index) => (
          <LicenseCard
            key={license.key}
            license={license}
            onEdit={onEdit ? () => onEdit(license) : undefined}
            onReset={onReset ? () => onReset(license.key) : undefined}
            onDelete={onDelete ? () => onDelete(license.key) : undefined}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
