import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from './firebase';

export interface AppUser {
  uid: string;
  email: string;
}

const toAppUser = (user: User | null): AppUser | null => user?.email
  ? { uid: user.uid, email: user.email }
  : null;

export const listenToAuth = (callback: (user: AppUser | null) => void) =>
  onAuthStateChanged(auth, callbackUser => callback(toAppUser(callbackUser)));

export const signIn = async (email: string, password: string): Promise<void> => {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  await set(ref(database, `users/${credential.user.uid}/email`), credential.user.email);
};

export const register = async (email: string, password: string): Promise<void> => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await set(ref(database, `users/${credential.user.uid}/email`), credential.user.email);
};

export const signOut = (): Promise<void> => firebaseSignOut(auth);
