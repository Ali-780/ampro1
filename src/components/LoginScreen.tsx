import { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Clock, KeyRound, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { SECURITY_CONFIG } from '@/lib/constants';
import { Manager } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LoginScreenProps {
  attemptsLeft: number;
  isBlocked: boolean;
  blockMinutesLeft: number;
  onAdminLogin: (password: string) => boolean;
  onManagerLogin: (manager: Manager) => void;
  onFailedAttempt: () => void;
  validateManager: (password: string) => Manager | null;
}

export function LoginScreen({ 
  attemptsLeft, 
  isBlocked, 
  blockMinutesLeft,
  onAdminLogin,
  onManagerLogin,
  onFailedAttempt,
  validateManager
}: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'manager'>('admin');

  const handleLogin = () => {
    if (!password.trim()) return;
    
    if (loginMode === 'admin') {
      const success = onAdminLogin(password);
      if (!success) {
        setShakeError(true);
        setPassword('');
        setTimeout(() => setShakeError(false), 500);
      }
    } else {
      const manager = validateManager(password);
      if (manager) {
        onManagerLogin(manager);
        toast.success(`مرحباً ${manager.name}`);
      } else {
        onFailedAttempt();
        setShakeError(true);
        setPassword('');
        setTimeout(() => setShakeError(false), 500);
        toast.error('كلمة مرور المسؤول غير صحيحة');
      }
    }
  };

  const progressValue = (attemptsLeft / SECURITY_CONFIG.maxAttempts) * 100;

  if (isBlocked) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-cairo font-bold text-foreground">النظام مغلق مؤقتاً</h2>
            <p className="text-muted-foreground mt-2">تم تجاوز عدد المحاولات المسموحة</p>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 text-destructive">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">سيتم فتح النظام بعد: {blockMinutesLeft} دقيقة</span>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full"
          >
            تحديث الصفحة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-cairo font-bold text-foreground">نظام إدارة التراخيص</h1>
          <p className="text-muted-foreground mt-1">AmPro License Management System</p>
        </div>

        {/* Login Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={loginMode === 'admin' ? 'default' : 'outline'}
            onClick={() => setLoginMode('admin')}
            className={cn(
              "flex-1",
              loginMode === 'admin' && "gradient-primary"
            )}
          >
            <KeyRound className="w-4 h-4 ml-2" />
            المدير
          </Button>
          <Button
            variant={loginMode === 'manager' ? 'default' : 'outline'}
            onClick={() => setLoginMode('manager')}
            className={cn(
              "flex-1",
              loginMode === 'manager' && "gradient-accent"
            )}
          >
            <UserCog className="w-4 h-4 ml-2" />
            مسؤول
          </Button>
        </div>

        {/* Security Box */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6 border-2 border-dashed border-border">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span>الأمان</span>
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold text-primary-foreground",
              attemptsLeft <= 1 ? "bg-destructive" : 
              attemptsLeft <= 2 ? "bg-warning" : "bg-success"
            )}>
              {attemptsLeft}
            </span>
          </div>
          
          <Progress 
            value={progressValue} 
            className={cn(
              "h-2 mb-2",
              attemptsLeft <= 1 ? "[&>div]:bg-destructive" : 
              attemptsLeft <= 2 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
            )} 
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>المحاولات المتبقية</span>
            <span>الحماية نشطة</span>
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            {loginMode === 'admin' ? 'كلمة مرور المدير' : 'كلمة مرور المسؤول'}
          </label>
          <div className={cn(
            "relative",
            shakeError && "animate-shake"
          )}>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="أدخل كلمة المرور"
              className="pl-12 h-12 text-lg"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {loginMode === 'admin' && (
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">تلميح:</span>
                <span className="font-mono">{showHint ? 'المطور:967777966865' : '••••••'}</span>
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="text-primary hover:underline text-xs"
                >
                  {showHint ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Login Button */}
        <Button 
          onClick={handleLogin}
          className={cn(
            "w-full h-12 text-lg font-semibold hover:opacity-90 transition-opacity",
            loginMode === 'admin' ? "gradient-primary" : "gradient-accent"
          )}
        >
          {loginMode === 'admin' ? (
            <KeyRound className="w-5 h-5 ml-2" />
          ) : (
            <UserCog className="w-5 h-5 ml-2" />
          )}
          دخول
        </Button>

        {/* Session Info */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 inline ml-1" />
          تم التطوير بواسطة {SECURITY_CONFIG.sessionTimeout} ENGAli-Mansoor
        </div>
      </div>
    </div>
  );
}
