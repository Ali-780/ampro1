import { SecurityConfig } from './types';

export const SECURITY_CONFIG: SecurityConfig = {
  password: "780431",
  maxAttempts: 5,
  sessionTimeout: 30, // minutes
  blockTime: 15 // minutes
};

export const FIREBASE_CONFIG = {
  mainDb: "https://amprousers-default-rtdb.firebaseio.com",
  authToken: "1hI1zkAiGvtkQEXwlbV8bm63qgtcIiythBTK5Z3I",
  db1: "https://amprofixwatool-default-rtdb.firebaseio.com/users.json",
  db2: "https://hiprotool-aa3f6-default-rtdb.firebaseio.com/users.json"
};

export const STORAGE_KEYS = {
  managers: 'ampro_managers',
  loggedIn: 'logged_in',
  sessionStart: 'session_start',
  loginAttempts: 'login_attempts',
  blocked: 'system_blocked',
  userType: 'user_type',
  managerId: 'manager_id'
};
