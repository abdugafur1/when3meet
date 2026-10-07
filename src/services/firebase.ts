import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyBENrKu3l9oviZQmmvAd5HQWqGyFu1s_WY',
  authDomain: 'when3meet-544231.firebaseapp.com',
  databaseURL: 'https://when3meet-544231-default-rtdb.firebaseio.com',
  projectId: 'when3meet-544231',
  storageBucket: 'when3meet-544231.firebasestorage.app',
  messagingSenderId: '704328051008',
  appId: '1:704328051008:web:74febed9e22ca9ae9372a5',
});

export const auth = getAuth(firebaseApp);
export const database = getDatabase(firebaseApp);
