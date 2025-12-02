import { useState } from 'react';
import { X, Save, User, Calendar, Monitor, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { License } from '@/lib/types';

interface EditLicenseDialogProps {
  license: License;
  onClose: () => void;
  onSave: (key: string, updates: Partial<License>) => Promise<boolean>;
}

export function EditLicenseDialog({ license, onClose, onSave }: EditLicenseDialogProps) {
  const [formData, setFormData] = useState({
    userName: license.userName,
    expiresAt: license.expiresAt,
    hwid: license.hwid,
    notes: license.notes,
    used: license.used
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.userName.trim() || !formData.expiresAt) {
      return;
    }

    setSaving(true);
    const success = await onSave(license.key, formData);
    if (success) {
      onClose();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="gradient-warning p-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-cairo font-bold text-warning-foreground">
            تعديل بيانات الترخيص
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warning-foreground/20 flex items-center justify-center hover:bg-warning-foreground/30 transition-colors"
          >
            <X className="w-4 h-4 text-warning-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            المفتاح: <span className="font-mono font-semibold text-foreground">{license.key}</span>
          </div>

          <div className="space-y-2">
            <Label>اسم المستخدم</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>تاريخ الانتهاء</Label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>رقم الجهاز (HWID)</Label>
            <div className="relative">
              <Monitor className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.hwid}
                onChange={(e) => setFormData(prev => ({ ...prev, hwid: e.target.value }))}
                placeholder="اترك فارغاً لحذف HWID"
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="pr-10 resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>حالة الترخيص</Label>
            <RadioGroup
              value={formData.used ? 'used' : 'active'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, used: value === 'used' }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="cursor-pointer">نشط</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="used" id="used" />
                <Label htmlFor="used" className="cursor-pointer">مستخدم</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="gradient-warning text-warning-foreground hover:opacity-90"
          >
            <Save className="w-4 h-4 ml-2" />
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </Button>
        </div>
      </div>
    </div>
  );
}
