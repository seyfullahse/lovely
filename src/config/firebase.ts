import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase yapılandırması - couply-ai projesi
const firebaseConfig = {
  apiKey: "AIzaSyCBoyvQvvM5sRfV9JFl-_K-1pPhJiatY28",
  authDomain: "couply-ai.firebaseapp.com",
  projectId: "couply-ai",
  storageBucket: "couply-ai.firebasestorage.app",
  messagingSenderId: "686668760204",
  appId: "1:686668760204:web:5e008ee51844ab162667a9",
  measurementId: "G-J0LZ1ZHZQZ"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
