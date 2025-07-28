import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuR2-zHQAkjbLABtIuBcSo9MgIlCGWusg",
  authDomain: "cotizador-bba5a.firebaseapp.com",
  projectId: "cotizador-bba5a",
  storageBucket: "cotizador-bba5a.firebasestorage.app",
  messagingSenderId: "372617480143",
  appId: "1:372617480143:web:67bda8c05dbeebb6e6b4ba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 