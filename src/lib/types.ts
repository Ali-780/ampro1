export interface License {
  key: string;
  userName: string;
  expiresAt: string;
  hwid: string;
  notes: string;
  used: boolean;
  createdAt: string;
  lastUpdated?: string;
}

export interface SecurityConfig {
  password: string;
  maxAttempts: number;
  sessionTimeout: number;
  blockTime: number;
}

export interface AuthState {
  isLoggedIn: boolean;
  loginAttempts: number;
  blockedUntil: number | null;
  sessionStartTime: number | null;
}

export type LicenseStatus = 'active' | 'used' | 'expired' | 'all';
export type LicenseFilter = LicenseStatus | 'linked' | 'unlinked';
