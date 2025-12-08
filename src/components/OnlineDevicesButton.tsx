import { useState } from 'react';
import { Monitor, Wifi, WifiOff, Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOnlineDevices } from '@/hooks/useOnlineDevices';
import { useBannedDevices } from '@/hooks/useBannedDevices';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OnlineDevicesButtonProps {
  userType: 'admin' | 'manager' | null;
}

const BAN_DURATIONS = [
  { value: '5', label: '5 دقائق' },
  { value: '15', label: '15 دقيقة' },
  { value: '30', label: '30 دقيقة' },
  { value: '60', label: 'ساعة واحدة' },
  { value: '1440', label: 'يوم كامل' },
  { value: '10080', label: 'أسبوع' },
];

export function OnlineDevicesButton({ userType }: OnlineDevicesButtonProps) {
  const [open, setOpen] = useState(false);
  const [kickingDeviceId, setKickingDeviceId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('15');
  
  const { devices, loading, onlineCount, isDeviceOnline, refresh, kickDevice } = useOnlineDevices(userType);
  const { bannedDevices, banDevice, unbanDevice, isDeviceBanned } = useBannedDevices();

  const handleKickDevice = async (deviceId: string, deviceName: string) => {
    const durationMinutes = parseInt(selectedDuration);
    
    // First kick the device (remove from online_devices)
    await kickDevice(deviceId);
    
    // Then ban the device for the selected duration
    await banDevice(deviceName, durationMinutes);
    
    setKickingDeviceId(null);
    setSelectedDuration('15');
    refresh();
  };

  const formatBanUntil = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0 relative"
        >
          <Monitor className="w-4 h-4" />
          {onlineCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
              {onlineCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-cairo font-semibold text-foreground">الأجهزة المتصلة</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refresh}
              className="h-7 px-2"
            >
              تحديث
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {onlineCount} جهاز متصل حالياً
          </p>
        </div>
        
        <ScrollArea className="h-72">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              جاري التحميل...
            </div>
          ) : devices.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              لا توجد أجهزة متصلة
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {devices.map((device) => {
                const online = isDeviceOnline(device.last_seen);
                const banned = isDeviceBanned(device.device_name);
                
                return (
                  <div
                    key={device.id}
                    className={`p-3 rounded-lg border ${
                      banned
                        ? 'bg-destructive/10 border-destructive/30'
                        : online 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {banned ? (
                          <Ban className="w-4 h-4 text-destructive" />
                        ) : online ? (
                          <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm text-foreground">
                          {device.device_name}
                        </span>
                      </div>
                      
                      {userType === 'admin' && !banned && (
                        kickingDeviceId === device.id ? (
                          <div className="flex items-center gap-1">
                            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                              <SelectTrigger className="h-7 w-20 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BAN_DURATIONS.map((duration) => (
                                  <SelectItem key={duration.value} value={duration.value}>
                                    {duration.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleKickDevice(device.id, device.device_name)}
                            >
                              طرد
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => setKickingDeviceId(null)}
                            >
                              إلغاء
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setKickingDeviceId(device.id)}
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        )
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className={banned ? 'text-destructive' : online ? 'text-green-600' : 'text-muted-foreground'}>
                        {banned ? 'محظور' : online ? 'متصل' : 'غير متصل'}
                      </span>
                      <span className="text-muted-foreground">
                        {device.user_type === 'admin' ? 'مدير' : 'مسؤول'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      آخر ظهور: {new Date(device.last_seen).toLocaleTimeString('ar-EG')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Banned devices section */}
        {bannedDevices.length > 0 && (
          <>
            <div className="p-3 border-t border-border">
              <h4 className="font-cairo font-semibold text-sm text-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-destructive" />
                الأجهزة المحظورة ({bannedDevices.length})
              </h4>
            </div>
            <ScrollArea className="max-h-40">
              <div className="p-2 space-y-2">
                {bannedDevices.map((banned) => (
                  <div
                    key={banned.id}
                    className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{banned.device_name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => unbanDevice(banned.id)}
                      >
                        إلغاء الحظر
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>حتى: {formatBanUntil(banned.banned_until)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
