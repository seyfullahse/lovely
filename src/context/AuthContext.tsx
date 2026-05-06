import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import type { AuthContextValue, UserProfile } from '@/types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function signup(email: string, password: string, name: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    
    const profile: UserProfile = {
      uid: result.user.uid,
      name,
      email,
      pairingId: null,
      partnerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await setDoc(doc(db, 'users', result.user.uid), profile)
    return result
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const userDoc = await getDoc(doc(db, 'users', result.user.uid))
    if (!userDoc.exists()) {
      const profile: UserProfile = {
        uid: result.user.uid,
        name: result.user.displayName || 'Kullanıcı',
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        pairingId: null,
        partnerId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await setDoc(doc(db, 'users', result.user.uid), profile)
    }
    return result
  }

  function logout() {
    return signOut(auth)
  }

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (!user) {
        setUserProfile(null)
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  // User profile realtime listener
  useEffect(() => {
    if (!currentUser) return

    const userDocRef = doc(db, 'users', currentUser.uid)

    const fallbackProfile: UserProfile = {
      uid: currentUser.uid,
      name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Kullanıcı',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || undefined,
      pairingId: null,
      partnerId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Önce doküman var mı kontrol et, yoksa oluştur
    const ensureProfile = async () => {
      try {
        const snapshot = await getDoc(userDocRef)
        if (!snapshot.exists()) {
          await setDoc(userDocRef, fallbackProfile)
        }
      } catch (err) {
        console.error('Profil oluşturma hatası:', err)
        // Firestore'a erişilemese bile fallback profili kullan
        setUserProfile(fallbackProfile)
        setLoading(false)
      }
    }

    ensureProfile()

    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserProfile(snapshot.data() as UserProfile)
        } else {
          // Doküman yoksa fallback profili kullan
          setUserProfile(fallbackProfile)
        }
        setLoading(false)
      },
      (error) => {
        console.error('User profile listener error:', error)
        // Hata olursa fallback profili kullan
        setUserProfile(fallbackProfile)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

  const value: AuthContextValue = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
