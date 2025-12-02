import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LicenseFilter } from '@/lib/types';

interface LicenseSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: LicenseFilter;
  onFilterChange: (filter: LicenseFilter) => void;
  totalCount: number;
}

export function LicenseSearch({ 
  searchQuery, 
  onSearchChange, 
  filter, 
  onFilterChange,
  totalCount 
}: LicenseSearchProps) {
  return (
    <div className="card-elevated p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالمفتاح أو اسم المستخدم..."
            className="pr-10"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filter} onValueChange={(value) => onFilterChange(value as LicenseFilter)}>
            <SelectTrigger>
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="تصفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">النشطة فقط</SelectItem>
              <SelectItem value="used">المستخدمة فقط</SelectItem>
              <SelectItem value="expired">المنتهية فقط</SelectItem>
              <SelectItem value="linked">المرتبطة بجهاز</SelectItem>
              <SelectItem value="unlinked">غير المرتبطة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        عدد النتائج: <span className="font-semibold text-foreground">{totalCount}</span>
      </div>
    </div>
  );
}
