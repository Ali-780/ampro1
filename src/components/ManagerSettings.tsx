import { useState } from 'react';
import { UserPlus, Trash2, Edit2, Users, Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Manager } from '@/lib/types';
import { toast } from 'sonner';

interface ManagerSettingsProps {
  open: boolean;
  onClose: () => void;
  managers: Manager[];
  onAddManager: (name: string, password: string, maxLicenses: number) => void;
  onUpdateManager: (id: string, updates: Partial<Manager>) => void;
  onDeleteManager: (id: string) => void;
}

export function ManagerSettings({
  open,
  onClose,
  managers,
  onAddManager,
  onUpdateManager,
  onDeleteManager
}: ManagerSettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [maxLicenses, setMaxLicenses] = useState(10);

  const handleAdd = () => {
    if (!name.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    
    if (managers.some(m => m.password === password)) {
      toast.error('كلمة المرور مستخدمة بالفعل');
      return;
    }
    
    onAddManager(name, password, maxLicenses);
    toast.success('تم إضافة المسؤول بنجاح');
    resetForm();
  };

  const handleUpdate = (id: string) => {
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المسؤول');
      return;
    }
    
    const updates: Partial<Manager> = { name, maxLicenses };
    if (password.trim()) {
      if (managers.some(m => m.password === password && m.id !== id)) {
        toast.error('كلمة المرور مستخدمة بالفعل');
        return;
      }
      updates.password = password;
    }
    
    onUpdateManager(id, updates);
    toast.success('تم تحديث المسؤول بنجاح');
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المسؤول؟')) {
      onDeleteManager(id);
      toast.success('تم حذف المسؤول');
    }
  };

  const startEdit = (manager: Manager) => {
    setEditingId(manager.id);
    setName(manager.name);
    setPassword('');
    setMaxLicenses(manager.maxLicenses);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setName('');
    setPassword('');
    setMaxLicenses(10);
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            إدارة المسؤولين
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Button */}
          {!showAddForm && !editingId && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full gradient-primary"
            >
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مسؤول جديد
            </Button>
          )}

          {/* Add/Edit Form */}
          {(showAddForm || editingId) && (
            <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
              <h3 className="font-semibold">
                {editingId ? 'تعديل المسؤول' : 'إضافة مسؤول جديد'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">اسم المسؤول</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="أدخل اسم المسؤول"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    كلمة المرور {editingId && '(اتركه فارغاً للإبقاء)'}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">الحد الأقصى للتراخيص</label>
                  <Input
                    type="number"
                    min={0}
                    value={maxLicenses}
                    onChange={e => setMaxLicenses(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => editingId ? handleUpdate(editingId) : handleAdd()}
                  className="gradient-success"
                >
                  <Check className="w-4 h-4 ml-1" />
                  {editingId ? 'حفظ التغييرات' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 ml-1" />
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {/* Managers List */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              قائمة المسؤولين ({managers.length})
            </h3>
            
            {managers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا يوجد مسؤولين حالياً
              </div>
            ) : (
              <div className="space-y-2">
                {managers.map(manager => (
                  <div 
                    key={manager.id}
                    className="bg-card border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{manager.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          manager.isActive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                        }`}>
                          {manager.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        التراخيص: {manager.createdLicenses} / {manager.maxLicenses}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={manager.isActive}
                        onCheckedChange={(checked) => onUpdateManager(manager.id, { isActive: checked })}
                      />
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => startEdit(manager)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(manager.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
