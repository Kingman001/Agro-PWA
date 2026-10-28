import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection testing constraint
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore test connection: client is offline.');
    }
  }
}
testConnection();

// Firestore error handler conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
}

/**
 * Ensures or loads the user's role profile in Firestore /users/{uid}
 */
export async function syncUserProfile(
  user: FirebaseUser,
  fallbackRole: UserRole = 'Field Officer'
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Staff Member',
        role: data.role as UserRole,
        station: data.station || 'Regional Operations Station',
        avatarUrl: user.photoURL || undefined,
        active: data.active !== false,
      };
    } else {
      // If user is Joshaku911@gmail.com, automatically Administrator
      const assignedRole: UserRole =
        user.email === 'Joshaku911@gmail.com' ? 'Administrator' : fallbackRole;

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Staff Member',
        role: assignedRole,
        station:
          assignedRole === 'Administrator'
            ? 'Headquarters & Processing Hub'
            : 'Regional Operations Hub',
        avatarUrl: user.photoURL || undefined,
        active: true,
      };

      await setDoc(userDocRef, {
        uid: newProfile.uid,
        email: newProfile.email,
        displayName: newProfile.displayName,
        role: newProfile.role,
        station: newProfile.station,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
