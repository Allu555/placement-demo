import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const hasFirebaseAdminConfig = !!process.env.FIREBASE_PROJECT_ID && !!process.env.FIREBASE_PRIVATE_KEY;

let adminApp: App | null = null;

if (hasFirebaseAdminConfig) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      adminApp = apps[0]!;
    }
  } catch (e) {
    console.error('Firebase Admin initialization failed:', e);
  }
}

export interface DecodedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
}

export class FirebaseAdminService {
  async verifyIdToken(token: string): Promise<DecodedFirebaseUser> {
    if (hasFirebaseAdminConfig && adminApp) {
      try {
        const decoded = await getAuth(adminApp).verifyIdToken(token);
        return {
          uid: decoded.uid,
          email: decoded.email || '',
          name: decoded.name || decoded.email?.split('@')[0],
        };
      } catch (err: any) {
        throw new Error(`Firebase token verification failed: ${err.message}`);
      }
    }

    // Mock Token Decoder Fallback
    if (token && token.startsWith('mock_id_token_for_')) {
      const email = token.replace('mock_id_token_for_', '');
      const uid = `mock_uid_${email.split('@')[0]}`;
      return {
        uid,
        email,
        name: email.split('@')[0],
      };
    }

    throw new Error('No Firebase Admin credentials set and invalid mock token.');
  }
}

export const firebaseAdmin = new FirebaseAdminService();
