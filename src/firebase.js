import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnzvAZFUn2zPIEXGpPmdOnqZbk0TJ_-TU",
  authDomain: "skillswap-50485.firebaseapp.com",
  projectId: "skillswap-50485",
  storageBucket: "skillswap-50485.firebasestorage.app",
  messagingSenderId: "1072715453012",
  appId: "1:1072715453012:web:450c671d9d9f81bbc453c1",
  measurementId: "G-3B4CR5MEZ2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

const timestamp = serverTimestamp;

export {
  app,
  auth,
  provider,
  db,
  storage,
  timestamp,
};
