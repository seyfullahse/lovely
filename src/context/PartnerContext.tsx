import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import type { PartnerContextValue, Pairing, PairingInvite, UserProfile } from '@/types'

const PartnerContext = createContext<PartnerContextValue | null>(null)

export function usePartner(): PartnerContextValue {
  const context = useContext(PartnerContext)
  if (!context) throw new Error('usePartner must be used within PartnerProvider')
  return context
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const { currentUser, userProfile } = useAuth()
  const [pairing, setPairing] = useState<Pairing | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)
  const [pendingInvites, setPendingInvites] = useState<PairingInvite[]>([])
  const [sentInvites, setSentInvites] = useState<PairingInvite[]>([])
  const [loading, setLoading] = useState(true)

  const isPaired = !!pairing && pairing.status === 'active'

  // Aktif eşleşmeyi dinle
  useEffect(() => {
    if (!currentUser || !userProfile?.pairingId) {
      setPairing(null)
      setPartnerProfile(null)
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'pairings', userProfile.pairingId),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as Pairing
          setPairing(data)

          // Partner profilini yükle
          const partnerId = data.user1Id === currentUser.uid ? data.user2Id : data.user1Id
          const partnerDoc = await getDoc(doc(db, 'users', partnerId))
          if (partnerDoc.exists()) {
            setPartnerProfile(partnerDoc.data() as UserProfile)
          }
        } else {
          setPairing(null)
          setPartnerProfile(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Pairing listener error:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [currentUser, userProfile?.pairingId])

  // Gelen davetleri dinle
  useEffect(() => {
    if (!currentUser) {
      setPendingInvites([])
      return
    }

    const invitesQuery = query(
      collection(db, 'pairingInvites'),
      where('toEmail', '==', currentUser.email),
      where('status', '==', 'pending')
    )

    const unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
      const invites = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PairingInvite[]
      setPendingInvites(invites)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Gönderilen davetleri dinle
  useEffect(() => {
    if (!currentUser) {
      setSentInvites([])
      return
    }

    const sentQuery = query(
      collection(db, 'pairingInvites'),
      where('fromUserId', '==', currentUser.uid)
    )

    const unsubscribe = onSnapshot(sentQuery, (snapshot) => {
      const invites = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as PairingInvite[]
      // En yeniler önce
      invites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setSentInvites(invites)
    })

    return () => unsubscribe()
  }, [currentUser])

  // Davet gönder
  const sendInvite = useCallback(async (toEmail: string, code: string) => {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    if (userProfile?.pairingId) throw new Error('Zaten bir partneriniz var')
    if (toEmail === currentUser.email) throw new Error('Kendinize davet gönderemezsiniz')
    if (!code || code.length < 4) throw new Error('Eşleşme kodu en az 4 karakter olmalı')

    // Aynı kişiye aktif davet var mı kontrol et
    const existingQuery = query(
      collection(db, 'pairingInvites'),
      where('fromUserId', '==', currentUser.uid),
      where('toEmail', '==', toEmail),
      where('status', '==', 'pending')
    )
    const existing = await getDocs(existingQuery)
    if (!existing.empty) {
      throw new Error('Bu kişiye zaten bir davet gönderilmiş')
    }

    const invite: Omit<PairingInvite, 'id'> = {
      fromUserId: currentUser.uid,
      fromUserName: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      fromUserEmail: currentUser.email || '',
      toEmail: toEmail.toLowerCase().trim(),
      pairingCode: code,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 gün
    }

    await addDoc(collection(db, 'pairingInvites'), invite)
  }, [currentUser, userProfile])

  // Daveti kabul et
  const acceptInvite = useCallback(async (inviteId: string, code: string) => {
    if (!currentUser) throw new Error('Giriş yapmalısınız')
    if (userProfile?.pairingId) throw new Error('Zaten bir partneriniz var')

    const inviteDoc = await getDoc(doc(db, 'pairingInvites', inviteId))
    if (!inviteDoc.exists()) throw new Error('Davet bulunamadı')

    const invite = inviteDoc.data() as PairingInvite

    // Kod kontrol
    if (invite.pairingCode !== code) {
      throw new Error('Eşleşme kodu yanlış')
    }

    // Süre kontrol
    if (new Date(invite.expiresAt) < new Date()) {
      await updateDoc(doc(db, 'pairingInvites', inviteId), { status: 'expired' })
      throw new Error('Davetin süresi dolmuş')
    }

    // Gönderen hala eşleşmemiş mi kontrol et
    const senderDoc = await getDoc(doc(db, 'users', invite.fromUserId))
    if (!senderDoc.exists()) throw new Error('Davet gönderen kullanıcı bulunamadı')
    const sender = senderDoc.data() as UserProfile
    if (sender.pairingId) throw new Error('Davet gönderen zaten eşleşmiş')

    // Eşleşme oluştur (batch write)
    const batch = writeBatch(db)
    const pairingRef = doc(collection(db, 'pairings'))
    const pairingId = pairingRef.id

    const pairingData: Omit<Pairing, 'id'> = {
      user1Id: invite.fromUserId,
      user2Id: currentUser.uid,
      user1Name: invite.fromUserName,
      user2Name: userProfile?.name || currentUser.displayName || 'Bilinmiyor',
      user1Email: invite.fromUserEmail,
      user2Email: currentUser.email || '',
      pairingCode: invite.pairingCode,
      status: 'active',
      createdAt: new Date().toISOString()
    }

    batch.set(pairingRef, pairingData)

    // Her iki kullanıcıyı güncelle
    batch.update(doc(db, 'users', invite.fromUserId), {
      pairingId,
      partnerId: currentUser.uid,
      updatedAt: new Date().toISOString()
    })
    batch.update(doc(db, 'users', currentUser.uid), {
      pairingId,
      partnerId: invite.fromUserId,
      updatedAt: new Date().toISOString()
    })

    // Daveti kabul edildi olarak işaretle
    batch.update(doc(db, 'pairingInvites', inviteId), { status: 'accepted' })

    // Mevcut kullanıcının planlarını ve todo'larını pairingId ile güncelle
    const userPlans = await getDocs(query(
      collection(db, 'plans'),
      where('userId', '==', currentUser.uid)
    ))
    userPlans.docs.forEach(d => {
      batch.update(d.ref, { pairingId, createdBy: currentUser.uid })
    })

    const userTodos = await getDocs(query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid)
    ))
    userTodos.docs.forEach(d => {
      batch.update(d.ref, { pairingId, createdBy: currentUser.uid })
    })

    // Gönderenin planlarını ve todolarını da güncelle
    const senderPlans = await getDocs(query(
      collection(db, 'plans'),
      where('userId', '==', invite.fromUserId)
    ))
    senderPlans.docs.forEach(d => {
      batch.update(d.ref, { pairingId, createdBy: invite.fromUserId })
    })

    const senderTodos = await getDocs(query(
      collection(db, 'todos'),
      where('userId', '==', invite.fromUserId)
    ))
    senderTodos.docs.forEach(d => {
      batch.update(d.ref, { pairingId, createdBy: invite.fromUserId })
    })

    try {
      await batch.commit()
      console.log('Eşleşme başarıyla kaydedildi! PairingId:', pairingId)
    } catch (commitError: any) {
      console.error('Batch commit hatası:', commitError)
      throw new Error('Eşleşme veritabanına kaydedilemedi: ' + (commitError.message || 'Bilinmeyen hata'))
    }
  }, [currentUser, userProfile])

  // Daveti reddet
  const rejectInvite = useCallback(async (inviteId: string) => {
    await updateDoc(doc(db, 'pairingInvites', inviteId), { status: 'rejected' })
  }, [])

  // Eşleşmeyi kaldır
  const dissolvePairing = useCallback(async () => {
    if (!currentUser || !userProfile?.pairingId || !pairing) {
      throw new Error('Aktif eşleşme yok')
    }

    const batch = writeBatch(db)
    const partnerId = pairing.user1Id === currentUser.uid ? pairing.user2Id : pairing.user1Id

    // Eşleşmeyi dissolved olarak işaretle
    batch.update(doc(db, 'pairings', userProfile.pairingId), {
      status: 'dissolved',
      dissolvedAt: new Date().toISOString()
    })

    // Her iki kullanıcıdan pairingId'yi kaldır
    batch.update(doc(db, 'users', currentUser.uid), {
      pairingId: null,
      partnerId: null,
      updatedAt: new Date().toISOString()
    })
    batch.update(doc(db, 'users', partnerId), {
      pairingId: null,
      partnerId: null,
      updatedAt: new Date().toISOString()
    })

    // Paylaşılan verileri ayır — her kullanıcının kendi oluşturduğu veriler kalır
    // pairingId olan planları userId=createdBy olacak şekilde güncelle
    const sharedPlans = await getDocs(query(
      collection(db, 'plans'),
      where('pairingId', '==', userProfile.pairingId)
    ))
    sharedPlans.docs.forEach(d => {
      const data = d.data()
      batch.update(d.ref, {
        pairingId: null,
        userId: data.createdBy || data.userId
      })
    })

    const sharedTodos = await getDocs(query(
      collection(db, 'todos'),
      where('pairingId', '==', userProfile.pairingId)
    ))
    sharedTodos.docs.forEach(d => {
      const data = d.data()
      batch.update(d.ref, {
        pairingId: null,
        userId: data.createdBy || data.userId
      })
    })

    await batch.commit()

    // Couple verisini temizle
    try {
      await deleteDoc(doc(db, 'couples', userProfile.pairingId))
    } catch {
      // Couple verisi yoksa sorun yok
    }

    setPairing(null)
    setPartnerProfile(null)
  }, [currentUser, userProfile, pairing])

  const value: PartnerContextValue = {
    pairing,
    partnerProfile,
    pendingInvites,
    sentInvites,
    loading,
    isPaired,
    sendInvite,
    acceptInvite,
    rejectInvite,
    dissolvePairing
  }

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  )
}
