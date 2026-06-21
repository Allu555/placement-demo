import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, Auth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if configuration is present
const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

let app;
let realAuth: Auth | null = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    realAuth = getAuth(app);
  } catch (e) {
    console.error('Firebase initialization failed, using mock auth:', e);
  }
}

/**
 * Mock Auth interface to mimic Firebase Client SDK.
 */
class MockAuthService {
  currentUser: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock_firebase_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
  }

  async createUserWithEmailAndPassword(email: string, password?: string): Promise<any> {
    const mockUser = {
      uid: `mock_uid_${Math.random().toString(36).slice(2, 10)}`,
      email,
      displayName: email.split('@')[0],
      getIdToken: async () => `mock_id_token_for_${email}`,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_firebase_user', JSON.stringify(mockUser));
      // Save password and uid mapping in global mocks list
      const users = JSON.parse(localStorage.getItem('mock_firebase_users_list') || '{}');
      users[email] = { uid: mockUser.uid, password };
      localStorage.setItem('mock_firebase_users_list', JSON.stringify(users));
    }
    
    this.currentUser = mockUser;
    return { user: mockUser };
  }

  async signInWithEmailAndPassword(email: string, password?: string): Promise<any> {
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('mock_firebase_users_list') || '{}');
      const record = users[email];
      
      const mockUid = record?.uid || `mock_uid_${Math.random().toString(36).slice(2, 10)}`;
      const mockUser = {
        uid: mockUid,
        email,
        displayName: email.split('@')[0],
        getIdToken: async () => `mock_id_token_for_${email}`,
      };

      localStorage.setItem('mock_firebase_user', JSON.stringify(mockUser));
      this.currentUser = mockUser;
      return { user: mockUser };
    }
    throw new Error('Not running in client window.');
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_firebase_user');
    }
  }
}

const mockAuthInstance = new MockAuthService();

export function getFirebaseAuth(): any {
  if (hasFirebaseConfig && realAuth) {
    return realAuth;
  }
  return mockAuthInstance;
}

export function isFirebaseMockActive(): boolean {
  return !hasFirebaseConfig || !realAuth;
}

/**
 * Unified auth sign in wrapper.
 */
export async function clientSignIn(email: string, password?: string): Promise<string> {
  const auth = getFirebaseAuth();
  if (isFirebaseMockActive()) {
    const res = await auth.signInWithEmailAndPassword(email, password);
    return res.user.getIdToken();
  } else {
    const res = await fbSignIn(auth, email, password!);
    return res.user.getIdToken();
  }
}

/**
 * Unified auth sign up wrapper.
 */
export async function clientSignUp(email: string, password?: string): Promise<string> {
  const auth = getFirebaseAuth();
  if (isFirebaseMockActive()) {
    const res = await auth.createUserWithEmailAndPassword(email, password);
    return res.user.getIdToken();
  } else {
    const res = await fbCreateUser(auth, email, password!);
    return res.user.getIdToken();
  }
}
