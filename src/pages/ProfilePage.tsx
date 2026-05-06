import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCouple } from '../context/CoupleContext'
import { usePartner } from '../context/PartnerContext'
import { useNavigate } from 'react-router-dom'
import {
  FiUser, FiMail, FiCalendar, FiHeart, FiLogOut, FiChevronRight,
  FiUsers, FiBriefcase, FiEdit3, FiSave, FiShield, FiTrash2, FiLink
} from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TurkishDatePicker from '@/components/ui/TurkishDatePicker'
import toast from 'react-hot-toast'
import { updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '../config/firebase'

export default function ProfilePage() {
  const { currentUser, userProfile, logout } = useAuth()
  const { couple, setNames, updateCouple, updatePerson1, updatePerson2, stages, getDaysTogether } = useCouple()
  const { isPaired, partnerProfile } = usePartner()
  const navigate = useNavigate()

  // Profil düzenleme
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState(currentUser?.displayName || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // Çift ayarları
  const [editingCouple, setEditingCouple] = useState(false)
  const [name1, setName1] = useState(couple.person1.name)
  const [name2, setName2] = useState(couple.person2.name)
  const [role1, setRole1] = useState(couple.person1.role || '')
  const [role2, setRole2] = useState(couple.person2.role || '')
  const [anniversary, setAnniversary] = useState(couple.anniversary || '')
  const [stage, setStage] = useState(couple.stage || 'relationship')

  // Şifre değiştirme
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Hesap silme
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const daysTogether = getDaysTogether()

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-2xl p-12 max-w-md"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Giriş Yapmalısın
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9A949D' }}>Profili görmek için giriş yap.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-2.5 rounded-full font-medium text-sm cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
            Giriş Yap
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      if (currentUser) {
        await updateProfile(currentUser, { displayName: profileName.trim() })
        await updateDoc(doc(db, 'users', currentUser.uid), { name: profileName.trim(), updatedAt: new Date().toISOString() })
        toast.success('Profil güncellendi!')
        setEditingProfile(false)
      }
    } catch {
      toast.error('Profil güncellenemedi')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveCouple = () => {
    setNames(name1.trim() || 'Kişi 1', name2.trim() || 'Kişi 2')
    updatePerson1({ role: role1.trim() })
    updatePerson2({ role: role2.trim() })
    updateCouple({ anniversary: anniversary || null, stage })
    setEditingCouple(false)
    toast.success('Çift ayarları kaydedildi!')
  }

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalı')
      return
    }
    setChangingPassword(true)
    try {
      if (currentUser?.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword)
        await reauthenticateWithCredential(currentUser, credential)
        await updatePassword(currentUser, newPassword)
        toast.success('Şifre güncellendi!')
        setShowPasswordChange(false)
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch {
      toast.error('Mevcut şifre yanlış veya hata oluştu')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (currentUser?.email && deletePassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, deletePassword)
        await reauthenticateWithCredential(currentUser, credential)
      }
      if (currentUser) {
        await deleteDoc(doc(db, 'users', currentUser.uid))
        await deleteUser(currentUser)
        toast.success('Hesap silindi')
        navigate('/')
      }
    } catch {
      toast.error('Hesap silinemedi. Şifreyi kontrol et.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Görüşmek üzere!')
      navigate('/')
    } catch {
      toast.error('Çıkış yapılamadı')
    }
  }

  const isEmailUser = currentUser.providerData.some(p => p.providerId === 'password')

  return (
    <div className="min-h-screen px-4 py-6 sm:px-10 md:py-8 lg:px-14 2xl:px-20">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Sayfa Başlığı */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Profil Ayarları
          </h1>
          <p className="text-sm mt-1" style={{ color: '#B8A9BC' }}>Hesabını ve çift ayarlarını yönet</p>
        </motion.div>

        {/* ─── Kişisel Profil ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold"
                style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
                {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Kişisel Bilgiler</h2>
                <p className="text-xs" style={{ color: '#9A949D' }}>Hesap detayların</p>
              </div>
            </div>
            {!editingProfile && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditingProfile(true)}
                className="p-2 rounded-lg cursor-pointer transition" style={{ color: '#B8A0DC', background: 'rgba(184,160,220,0.08)' }}>
                <FiEdit3 size={15} />
              </motion.button>
            )}
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6E5A73' }}>İsim</label>
                <Input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="İsmin" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveProfile} disabled={savingProfile} className="flex-1">
                  <FiSave size={14} className="mr-1.5" />
                  {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <button onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                  style={{ background: 'rgba(184,160,220,0.08)', color: '#6E5A73' }}>
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                <FiUser size={15} style={{ color: '#B8A0DC' }} />
                <div>
                  <p className="text-[11px]" style={{ color: '#9A949D' }}>İsim</p>
                  <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{currentUser.displayName || 'Belirtilmemiş'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                <FiMail size={15} style={{ color: '#B8A0DC' }} />
                <div>
                  <p className="text-[11px]" style={{ color: '#9A949D' }}>E-posta</p>
                  <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{currentUser.email}</p>
                </div>
              </div>
              {isPaired && partnerProfile && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(250,218,221,0.1)' }}>
                  <FiUsers size={15} style={{ color: '#E8808C' }} />
                  <div>
                    <p className="text-[11px]" style={{ color: '#9A949D' }}>Partner</p>
                    <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{partnerProfile.name} 💕</p>
                  </div>
                </div>
              )}
              {daysTogether !== null && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(250,218,221,0.08)' }}>
                  <FiHeart size={15} style={{ color: '#E8808C' }} />
                  <div>
                    <p className="text-[11px]" style={{ color: '#9A949D' }}>Birliktelik</p>
                    <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{daysTogether} gündür birlikteyiz 💕</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ─── Çift Ayarları (sadece eşleşme sonrası) ─── */}
        {isPaired ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(250,218,221,0.2)', color: '#E8808C' }}>
                <FiHeart size={16} />
              </span>
              <div>
                <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Çift Ayarları</h2>
                <p className="text-xs" style={{ color: '#9A949D' }}>İsimler, roller ve ilişki bilgileri</p>
              </div>
            </div>
            {!editingCouple && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                setName1(couple.person1.name)
                setName2(couple.person2.name)
                setRole1(couple.person1.role || '')
                setRole2(couple.person2.role || '')
                setAnniversary(couple.anniversary || '')
                setStage(couple.stage || 'relationship')
                setEditingCouple(true)
              }}
                className="p-2 rounded-lg cursor-pointer transition" style={{ color: '#B8A0DC', background: 'rgba(184,160,220,0.08)' }}>
                <FiEdit3 size={15} />
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editingCouple ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Kişi 1 */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(147,181,225,0.06)', border: '1px solid rgba(147,181,225,0.12)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>
                    <FiUser size={12} className="inline mr-1" /> Kişi 1
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={name1} onChange={e => setName1(e.target.value)} placeholder="İsim" />
                    <Input value={role1} onChange={e => setRole1(e.target.value)} placeholder="Meslek / Rol" />
                  </div>
                </div>
                {/* Kişi 2 */}
                <div className="p-4 rounded-xl" style={{ background: 'rgba(232,128,140,0.04)', border: '1px solid rgba(232,128,140,0.1)' }}>
                  <p className="text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>
                    <FiUser size={12} className="inline mr-1" /> Kişi 2
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={name2} onChange={e => setName2(e.target.value)} placeholder="İsim" />
                    <Input value={role2} onChange={e => setRole2(e.target.value)} placeholder="Meslek / Rol" />
                  </div>
                </div>
                {/* İlişki Aşaması */}
                <div>
                  <label className="text-xs font-medium mb-2.5 block" style={{ color: '#6E5A73' }}>
                    <FiHeart size={12} className="inline mr-1" /> İlişki Aşaması
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {Object.entries(stages).map(([key, val]) => (
                      <button key={key} type="button" onClick={() => setStage(key as any)}
                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer"
                        style={{
                          background: stage === key ? 'rgba(184,160,220,0.12)' : '#FAFAFA',
                          border: stage === key ? '2px solid #B8A0DC' : '2px solid #F0ECF5',
                          color: stage === key ? '#3D2C3E' : '#9A949D',
                        }}>
                        <span className="text-lg">{val.icon}</span>
                        <span>{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Tarih */}
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6E5A73' }}>
                    <FiCalendar size={12} className="inline mr-1" /> Birlikte Olma Tarihi
                  </label>
                  <TurkishDatePicker value={anniversary} onChange={setAnniversary} />
                </div>
                {/* Kaydet */}
                <div className="flex gap-3">
                  <Button onClick={handleSaveCouple} className="flex-1"><FiSave size={14} className="mr-1.5" /> Kaydet</Button>
                  <button onClick={() => setEditingCouple(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
                    style={{ background: 'rgba(184,160,220,0.08)', color: '#6E5A73' }}>İptal</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl" style={{ background: 'rgba(147,181,225,0.06)' }}>
                    <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>Kişi 1</p>
                    <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{couple.person1.name}</p>
                    {couple.person1.role && <p className="text-[11px] mt-0.5" style={{ color: '#B8A9BC' }}>{couple.person1.role}</p>}
                  </div>
                  <div className="p-3.5 rounded-xl" style={{ background: 'rgba(232,128,140,0.04)' }}>
                    <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>Kişi 2</p>
                    <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{couple.person2.name}</p>
                    {couple.person2.role && <p className="text-[11px] mt-0.5" style={{ color: '#B8A9BC' }}>{couple.person2.role}</p>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                    <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>İlişki</p>
                    <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>
                      {stages[couple.stage]?.icon} {stages[couple.stage]?.label}
                    </p>
                  </div>
                  {couple.anniversary && (
                    <div className="flex-1 p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                      <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>Yıl Dönümü</p>
                      <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>
                        {new Date(couple.anniversary).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(250,218,221,0.2)', color: '#E8808C' }}>
              <FiHeart size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Çift Ayarları</h2>
              <p className="text-xs" style={{ color: '#9A949D' }}>Eşleşme yaptıktan sonra çift ayarlarını düzenleyebilirsiniz</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'rgba(184,160,220,0.06)', border: '1px dashed rgba(184,160,220,0.2)' }}>
            <p className="text-sm mb-3" style={{ color: '#9A949D' }}>Henüz bir partnerinizle eşleşmediniz</p>
            <Button variant="outline" onClick={() => navigate('/pairing')} className="text-sm">
              <FiUsers size={14} className="mr-1.5" /> Eşleşme Sayfasına Git
            </Button>
          </div>
        </motion.div>
        )}

        {/* ─── Eşleşme Yönetimi ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
              <FiLink size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Eşleşme</h2>
              <p className="text-xs" style={{ color: '#9A949D' }}>
                {isPaired
                  ? 'Partnerinle eşleşme tamamlandı'
                  : 'Henüz bir partnerle eşleşmedin'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/pairing')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition"
            style={{
              background: isPaired ? 'rgba(184,160,220,0.08)' : 'linear-gradient(135deg, #FADADD, #E8DFF5)',
              color: isPaired ? '#B8A0DC' : '#3D2C3E',
              border: isPaired ? '1px solid rgba(184,160,220,0.15)' : 'none',
            }}
          >
            <FiLink size={15} />
            {isPaired ? 'Eşleşme Ayarları' : 'Eşleşmeye Git'}
          </motion.button>
        </motion.div>

        {/* ─── Güvenlik ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
              <FiShield size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Güvenlik</h2>
              <p className="text-xs" style={{ color: '#9A949D' }}>Şifre ve hesap işlemleri</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Şifre Değiştir */}
            {isEmailUser && (
              <>
                <button onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition"
                  style={{ background: 'rgba(253,246,240,0.6)', color: '#3D2C3E' }}>
                  <span className="text-sm font-medium">Şifre Değiştir</span>
                  <FiChevronRight size={16} style={{ color: '#B8A9BC', transform: showPasswordChange ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                <AnimatePresence>
                  {showPasswordChange && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(184,160,220,0.04)', border: '1px solid rgba(184,160,220,0.08)' }}>
                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Mevcut şifre" />
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Yeni şifre (min 6 karakter)" />
                        <Button onClick={handlePasswordChange} disabled={changingPassword} className="w-full">
                          {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Güncelle'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Çıkış Yap */}
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition"
              style={{ background: 'rgba(253,246,240,0.6)', color: '#E8808C' }}>
              <FiLogOut size={15} />
              <span className="text-sm font-medium">Çıkış Yap</span>
            </button>

            {/* Hesap Sil */}
            <button onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition"
              style={{ background: 'rgba(232,128,140,0.04)', color: '#E8808C', border: '1px solid rgba(232,128,140,0.08)' }}>
              <FiTrash2 size={15} />
              <span className="text-sm font-medium">Hesabı Sil</span>
            </button>

            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden">
                  <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.12)' }}>
                    <p className="text-xs" style={{ color: '#E8808C' }}>⚠️ Bu işlem geri alınamaz! Tüm verilerin silinecek.</p>
                    {isPaired && (
                      <p className="text-xs" style={{ color: '#9A949D' }}>Partnerinin hesabı etkilenmez, eşleşme otomatik kaldırılır.</p>
                    )}
                    {isEmailUser && (
                      <Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Onay için şifreni gir" />
                    )}
                    <div className="flex gap-3">
                      <button onClick={handleDeleteAccount}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium cursor-pointer" style={{ background: '#E8808C', color: '#fff' }}>
                        Evet, Sil
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl text-xs font-medium cursor-pointer"
                        style={{ background: 'rgba(184,160,220,0.1)', color: '#6E5A73' }}>
                        İptal
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
