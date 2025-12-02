import { useState } from 'react';
import { Plus, Key, User, Calendar, Monitor, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { License } from '@/lib/types';
import { toast } from 'sonner';

interface CreateLicenseFormProps {
  onSubmit: (data: Omit<License, 'createdAt' | 'lastUpdated'> & { key: string }) => Promise<boolean>;
}

export function CreateLicenseForm({ onSubmit }: CreateLicenseFormProps) {
  const [formData, setFormData] = useState({
    key: '',
    userName: '',
    expiresAt: new Date().toISOString().split('T')[0],
    hwid: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.key.trim() || !formData.userName.trim() || !formData.expiresAt) {
      toast.warning('يرجى ملء الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    const success = await onSubmit({
      key: formData.key,
      userName: formData.userName,
      expiresAt: formData.expiresAt,
      hwid: formData.hwid || '',
      notes: formData.notes || 'تم الإنشاء عبر تطبيق الويب',
      used: false
    });

    if (success) {
      setFormData({
        key: '',
        userName: '',
        expiresAt: new Date().toISOString().split('T')[0],
        hwid: '',
        notes: ''
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="card-elevated p-6 mb-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-success flex items-center justify-center">
          <Plus className="w-5 h-5 text-success-foreground" />
        </div>
        <h2 className="text-lg font-cairo font-bold">إنشاء ترخيص جديد</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
            placeholder="مفتاح الترخيص"
            className="pr-10"
          />
        </div>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={formData.userName}
            onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
            placeholder="اسم المستخدم"
            className="pr-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            className="pr-10"
          />
        </div>
        <div className="relative">
          <Monitor className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={formData.hwid}
            onChange={(e) => setFormData(prev => ({ ...prev, hwid: e.target.value }))}
            placeholder="HWID (اختياري)"
            className="pr-10"
          />
        </div>
      </div>

      <div className="relative mb-4">
        <FileText className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="ملاحظات إضافية (اختياري)"
          className="pr-10 resize-none"
          rows={2}
        />
      </div>

      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="gradient-success text-success-foreground hover:opacity-90 px-8"
        >
          <Plus className="w-4 h-4 ml-2" />
          {submitting ? 'جاري الإنشاء...' : 'إنشاء الترخيص'}
        </Button>
      </div>
    </div>
  );
}
