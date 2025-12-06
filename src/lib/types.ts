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

export interface Manager {
  id: string;
  name: string;
  password: string;
  maxLicenses: number;
  createdLicenses: number;
  createdAt: string;
  isActive: boolean;
}

export interface AuthState {
  isLoggedIn: boolean;
  loginAttempts: number;
  blockedUntil: number | null;
  sessionStartTime: number | null;
  userType: 'admin' | 'manager' | null;
  managerId: string | null;
}

export type LicenseStatus = 'active' | 'used' | 'expired' | 'all';
export type LicenseFilter = LicenseStatus | 'linked' | 'unlinked';
