import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { License } from '@/lib/types';
import { exportToCSV, exportToExcel } from '@/lib/exportUtils';
import { toast } from 'sonner';

interface ExportLicensesButtonProps {
  licenses: License[];
}

type ExportFilter = 'all' | 'active' | 'used' | 'expired';

export function ExportLicensesButton({ licenses }: ExportLicensesButtonProps) {
  const filterLicenses = (filter: ExportFilter): License[] => {
    const now = new Date();
    
    switch (filter) {
      case 'active':
        return licenses.filter(l => {
          const expiresAt = new Date(l.expiresAt);
          return expiresAt >= now && !l.used;
        });
      case 'used':
        return licenses.filter(l => l.used);
      case 'expired':
        return licenses.filter(l => {
          const expiresAt = new Date(l.expiresAt);
          return expiresAt < now;
        });
      default:
        return licenses;
    }
  };

  const getFilterLabel = (filter: ExportFilter): string => {
    switch (filter) {
      case 'active': return 'النشطة';
      case 'used': return 'المستخدمة';
      case 'expired': return 'المنتهية';
      default: return 'الكل';
    }
  };

  const handleExport = (format: 'csv' | 'excel', filter: ExportFilter) => {
    const filteredLicenses = filterLicenses(filter);
    
    if (filteredLicenses.length === 0) {
      toast.error('لا توجد تراخيص للتصدير بهذا الفلتر');
      return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filterSuffix = filter !== 'all' ? `_${filter}` : '';
    const filename = `licenses${filterSuffix}_${timestamp}`;
    
    if (format === 'csv') {
      exportToCSV(filteredLicenses, filename);
    } else {
      exportToExcel(filteredLicenses, filename);
    }
    
    toast.success(`تم تصدير ${filteredLicenses.length} ترخيص (${getFilterLabel(filter)})`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
        >
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {/* Excel Export with filters */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExport('excel', 'all')} className="gap-2 cursor-pointer">
              <Filter className="w-4 h-4" />
              <span>الكل ({licenses.length})</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel', 'active')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-green-500">●</span>
              <span>النشطة</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel', 'used')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-blue-500">●</span>
              <span>المستخدمة</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel', 'expired')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-red-500">●</span>
              <span>المنتهية</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* CSV Export with filters */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <FileText className="w-4 h-4" />
            <span>تصدير CSV</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleExport('csv', 'all')} className="gap-2 cursor-pointer">
              <Filter className="w-4 h-4" />
              <span>الكل ({licenses.length})</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', 'active')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-green-500">●</span>
              <span>النشطة</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', 'used')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-blue-500">●</span>
              <span>المستخدمة</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', 'expired')} className="gap-2 cursor-pointer">
              <span className="w-4 h-4 flex items-center justify-center text-red-500">●</span>
              <span>المنتهية</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
