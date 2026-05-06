import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import { usePartner } from './PartnerContext'
import type { CoupleData, CoupleContextValue, Person, RelationshipStage, StageInfo, Assignee } from '@/types'

const CoupleContext = createContext<CoupleContextValue | null>(null)

export function useCouple(): CoupleContextValue {
  const context = useContext(CoupleContext)
  if (!context) throw new Error('useCouple must be used within CoupleProvider')
  return context
}

// Varsayılan çift bilgileri
const DEFAULT_COUPLE: CoupleData = {
  person1: {
    name: 'Kişi 1',
    short: 'K',
    role: '',
    color: '#93B5E1',
  },
  person2: {
    name: 'Kişi 2',
    short: 'K',
    role: '',
    color: '#E8808C',
  },
  coupleName: 'Planora Çifti',
  coupleShort: 'P',
  anniversary: null,
  stage: 'relationship',
}

const STAGES: Record<RelationshipStage, StageInfo> = {
  relationship: { label: 'İlişki', icon: '💕' },
  engaged: { label: 'Nişanlı', icon: '💍' },
  married: { label: 'Evli', icon: '💒' },
}

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { currentUser, userProfile } = useAuth()
  const { pairing, partnerProfile, isPaired } = usePartner()
  const [couple, setCouple] = useState<CoupleData>(DEFAULT_COUPLE)

  // Firestore belge ID'si — SADECE eşleşme varsa pairingId kullan
  const coupleDocId = userProfile?.pairingId || null

  // Kullanıcıya özel localStorage anahtarı
  const storageKey = currentUser ? `planora-couple-${currentUser.uid}` : null

  // Kullanıcı değiştiğinde localStorage'dan yükle
  useEffect(() => {
    // Eski paylaşımlı anahtarı temizle
    localStorage.removeItem('planora-couple')

    if (!storageKey) {
      setCouple(DEFAULT_COUPLE)
      return
    }
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        setCouple({ ...DEFAULT_COUPLE, ...JSON.parse(saved) })
      } catch {
        setCouple(DEFAULT_COUPLE)
      }
    } else {
      setCouple(DEFAULT_COUPLE)
    }
  }, [storageKey])

  // Firestore'a kaydet
  const saveToFirestore = useCallback(async (data: CoupleData) => {
    if (!coupleDocId) return
    try {
      await setDoc(doc(db, 'couples', coupleDocId), {
        ...data,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Firestore couple kayıt hatası:', error)
    }
  }, [coupleDocId])

  // Eşleşme olduğunda partner isimlerini otomatik ayarla
  useEffect(() => {
    if (isPaired && pairing && userProfile && partnerProfile) {
      const myName = userProfile.name || 'Ben'
      const pName = partnerProfile.name || 'Partner'
      setCouple(prev => {
        // Sadece isimler farklıysa güncelle
        if (prev.person1.name === myName && prev.person2.name === pName) return prev
        const updated: CoupleData = {
          ...prev,
          person1: { ...prev.person1, name: myName, short: myName.charAt(0).toUpperCase() },
          person2: { ...prev.person2, name: pName, short: pName.charAt(0).toUpperCase() },
          coupleName: `${myName} & ${pName}`,
          coupleShort: `${myName.charAt(0).toUpperCase()} & ${pName.charAt(0).toUpperCase()}`,
        }
        return updated
      })
    }
  }, [isPaired, pairing, userProfile, partnerProfile])

  // Firestore'dan dinle (realtime) — sadece eşleşme varsa
  useEffect(() => {
    if (!coupleDocId) return

    const unsubscribe = onSnapshot(
      doc(db, 'couples', coupleDocId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CoupleData
          const merged = { ...DEFAULT_COUPLE, ...data }
          setCouple(merged)
          if (storageKey) localStorage.setItem(storageKey, JSON.stringify(merged))
        }
        // Belge yoksa otomatik oluşturma — sadece eşleşme ayarlarından oluşturulacak
      },
      (error) => {
        console.error('Couple listener error:', error)
      }
    )

    return () => unsubscribe()
  }, [coupleDocId, storageKey])

  // localStorage sync
  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(couple))
  }, [couple, storageKey])

  const updateCouple = (updates: Partial<CoupleData>) => {
    setCouple(prev => {
      const updated = { ...prev, ...updates }
      saveToFirestore(updated)
      return updated
    })
  }

  const updatePerson1 = (updates: Partial<Person>) => {
    setCouple(prev => {
      const updated = { ...prev, person1: { ...prev.person1, ...updates } }
      saveToFirestore(updated)
      return updated
    })
  }

  const updatePerson2 = (updates: Partial<Person>) => {
    setCouple(prev => {
      const updated = { ...prev, person2: { ...prev.person2, ...updates } }
      saveToFirestore(updated)
      return updated
    })
  }

  // Çift adını otomatik güncelle
  const setNames = (name1: string, name2: string) => {
    setCouple(prev => {
      const updated = {
        ...prev,
        person1: { ...prev.person1, name: name1, short: name1.charAt(0).toUpperCase() },
        person2: { ...prev.person2, name: name2, short: name2.charAt(0).toUpperCase() },
        coupleName: `${name1} & ${name2}`,
        coupleShort: `${name1.charAt(0).toUpperCase()} & ${name2.charAt(0).toUpperCase()}`,
      }
      saveToFirestore(updated)
      return updated
    })
  }

  // Atama seçenekleri (dinamik) — UID tabanlı
  const getAssignees = (): Assignee[] => {
    const myUid = currentUser?.uid || 'person1'
    const partnerUid = pairing
      ? (pairing.user1Id === currentUser?.uid ? pairing.user2Id : pairing.user1Id)
      : 'person2'

    return [
      { value: myUid, label: couple.person1.name, short: couple.person1.short, icon: 'user', color: couple.person1.color },
      { value: partnerUid, label: couple.person2.name, short: couple.person2.short, icon: 'user', color: couple.person2.color },
      { value: 'both', label: 'İkimiz', short: `${couple.person1.short}&${couple.person2.short}`, icon: 'users', color: '#B8A0DC' },
    ]
  }

  // Eski person1/person2 değerlerini UID'ye çevir (geriye uyumluluk)
  const resolveAssignee = (assigneeValue: string | undefined): string | undefined => {
    if (!assigneeValue) return assigneeValue
    if (assigneeValue === 'both') return 'both'

    const myUid = currentUser?.uid || ''
    const partnerUid = pairing
      ? (pairing.user1Id === currentUser?.uid ? pairing.user2Id : pairing.user1Id)
      : ''

    // Eski formatı UID'ye çevir
    if (assigneeValue === 'person1') return myUid
    if (assigneeValue === 'person2') return partnerUid

    // Zaten UID ise aynen döndür
    return assigneeValue
  }

  // İlişki günü hesapla
  const getDaysTogether = (): number | null => {
    if (!couple.anniversary) return null
    const start = new Date(couple.anniversary)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const value: CoupleContextValue = {
    couple,
    updateCouple,
    updatePerson1,
    updatePerson2,
    setNames,
    getAssignees,
    resolveAssignee,
    getDaysTogether,
    stages: STAGES,
  }

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  )
}
