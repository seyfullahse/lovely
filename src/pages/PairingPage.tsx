import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/PartnerContext'
import { useNavigate } from 'react-router-dom'
import {
  FiUsers, FiUserPlus, FiSend, FiCheck, FiX, FiLink, FiAlertTriangle,
  FiClock, FiMail, FiShield, FiHeart
} from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function PairingPage() {
  const { currentUser, userProfile, loading: authLoading } = useAuth()
  const {
    pairing, partnerProfile, pendingInvites, sentInvites, isPaired,
    sendInvite, acceptInvite, rejectInvite, dissolvePairing
  } = usePartner()
  const navigate = useNavigate()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [acceptCode, setAcceptCode] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
  const [pairingSuccess, setPairingSuccess] = useState(false)

  // Eşleşme başarılı olunca 2.5sn sonra dashboard'a yönlendir
  useEffect(() => {
    if (pairingSuccess) {
      const timer = setTimeout(() => navigate('/dashboard'), 2500)
      return () => clearTimeout(timer)
    }
  }, [pairingSuccess, navigate])

  // Sadece auth yükleniyorsa loading göster
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#B8A0DC', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#9A949D' }}>Yükleniyor...</p>
        </motion.div>
      </div>
    )
  }

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
          <p className="text-sm mb-6" style={{ color: '#9A949D' }}>Eşleşme için önce giriş yap.</p>
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

  const handleSendInvite = async () => {
    setSendingInvite(true)
    try {
      await sendInvite(inviteEmail.trim(), inviteCode.trim())
      toast.success('Davet gönderildi! 💌 Partnerine eşleşme kodunu ilet.')
      setInviteEmail('')
      setInviteCode('')
    } catch (err: any) {
      toast.error(err.message || 'Davet gönderilemedi')
    } finally {
      setSendingInvite(false)
    }
  }

  const handleAcceptInvite = async (inviteId: string) => {
    if (!acceptCode.trim()) {
      toast.error('Eşleşme kodunu girmelisin')
      return
    }
    try {
      await acceptInvite(inviteId, acceptCode.trim())
      setAcceptCode('')
      setPairingSuccess(true)
    } catch (err: any) {
      console.error('Eşleşme kabul hatası:', err)
      toast.error(err.message || 'Eşleşme sırasında bir hata oluştu')
    }
  }

  const handleDissolve = async () => {
    try {
      await dissolvePairing()
      toast.success('Eşleşme kaldırıldı')
      setShowDissolveConfirm(false)
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu')
    }
  }

  // Eşleşme başarı animasyonu
  if (pairingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md"
        >
          {/* Kalp animasyonu */}
          <div className="relative mx-auto mb-8" style={{ width: 120, height: 120 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)' }}>
                <FiHeart size={40} style={{ color: '#E8808C', fill: '#E8808C' }} />
              </div>
            </motion.div>
            {/* Parçacıklar */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0.5],
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                }}
                transition={{ duration: 1.2, delay: 0.4 + i * 0.05 }}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ background: i % 2 === 0 ? '#FADADD' : '#B8A0DC' }}
              />
            ))}
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-semibold mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
          >
            Eşleşme Tamamlandı! 💕
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-sm mb-2"
            style={{ color: '#9A949D' }}
          >
            Artık geleceği birlikte planlayabilirsiniz
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs mb-8"
            style={{ color: '#B8A9BC' }}
          >
            Planlar, görevler ve sürprizler artık paylaşılıyor ✨
            <br />
            <span className="text-[11px]" style={{ color: '#B8A0DC' }}>Dashboard'a yönlendiriliyorsun...</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-full font-medium text-sm cursor-pointer text-white"
              style={{ background: 'linear-gradient(135deg, #B8A0DC, #9B7FC7)' }}
            >
              Hemen Git
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPairingSuccess(false)}
              className="px-6 py-2.5 rounded-full font-medium text-sm cursor-pointer"
              style={{ background: 'rgba(232,223,245,0.4)', color: '#3D2C3E' }}
            >
              Eşleşmeyi Gör
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-10 md:py-8 lg:px-14 2xl:px-20">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Başlık */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Partner Eşleşmesi
          </h1>
          <p className="text-sm mt-1" style={{ color: '#B8A9BC' }}>
            {isPaired ? 'Partnerinle eşleşmiş durumdasın' : 'Partnerini davet et veya gelen daveti kabul et'}
          </p>
        </motion.div>

        {/* ─── Eşleşmiş Durum ─── */}
        {isPaired && pairing && partnerProfile && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
          >
            {/* Partner Banner */}
            <div className="p-6 sm:p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(250,218,221,0.15), rgba(232,223,245,0.15))' }}>
              <div className="flex items-center justify-center gap-6 mb-4">
                {/* Ben */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #E8DFF5, #B8A0DC)', color: '#fff' }}>
                    {userProfile?.name?.charAt(0).toUpperCase() || 'B'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>{userProfile?.name || 'Ben'}</p>
                    <p className="text-[11px]" style={{ color: '#9A949D' }}>Sen</p>
                  </div>
                </div>

                {/* Kalp */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  💕
                </motion.div>

                {/* Partner */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #FADADD, #E8808C)', color: '#fff' }}>
                    {partnerProfile.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>{partnerProfile.name}</p>
                    <p className="text-[11px]" style={{ color: '#9A949D' }}>Partner</p>
                  </div>
                </div>
              </div>

              <p className="text-xs" style={{ color: '#B8A9BC' }}>
                Eşleşme tarihi: {new Date(pairing.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Detaylar */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                  <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>Partner E-posta</p>
                  <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{partnerProfile.email}</p>
                </div>
                <div className="p-3.5 rounded-xl" style={{ background: 'rgba(253,246,240,0.6)' }}>
                  <p className="text-[11px] mb-1" style={{ color: '#9A949D' }}>Durum</p>
                  <p className="text-sm font-medium" style={{ color: '#6B9BD2' }}>✓ Aktif Eşleşme</p>
                </div>
              </div>

              {/* Bilgi Notu */}
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(184,160,220,0.06)', border: '1px solid rgba(184,160,220,0.08)' }}>
                <FiShield size={16} className="shrink-0 mt-0.5" style={{ color: '#B8A0DC' }} />
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#6E5A73' }}>Veri Güvenliği</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: '#9A949D' }}>
                    Eşleşme kaldırılırsa herkesin kendi oluşturduğu planlar ve görevler kendinde kalır.
                    Partnerinin hesabı etkilenmez.
                  </p>
                </div>
              </div>

              {/* Eşleşmeyi Kaldır */}
              {!showDissolveConfirm ? (
                <button onClick={() => setShowDissolveConfirm(true)}
                  className="w-full text-xs py-3 rounded-xl transition cursor-pointer font-medium"
                  style={{ color: '#E8808C', background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.1)' }}>
                  Eşleşmeyi Kaldır
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-xl" style={{ background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.15)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <FiAlertTriangle size={16} style={{ color: '#E8808C' }} />
                    <p className="text-sm font-medium" style={{ color: '#E8808C' }}>Emin misin?</p>
                  </div>
                  <p className="text-xs mb-4" style={{ color: '#9A949D' }}>
                    Eşleşme kaldırıldığında paylaşılan veriler herkese kendi oluşturduğu şekilde geri dönecek.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleDissolve}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                      style={{ background: '#E8808C', color: '#fff' }}>
                      Evet, Kaldır
                    </button>
                    <button onClick={() => setShowDissolveConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                      style={{ background: 'rgba(184,160,220,0.1)', color: '#6E5A73' }}>
                      İptal
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Eşleşme Yok ─── */}
        {!isPaired && (
          <>
            {/* Gelen Davetler */}
            {pendingInvites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-2xl p-6 sm:p-7"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(250,218,221,0.2)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(250,218,221,0.2)', color: '#E8808C' }}>
                    <FiMail size={16} />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>
                      Gelen Davetler
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(250,218,221,0.3)', color: '#E8808C' }}>
                        {pendingInvites.length}
                      </span>
                    </h2>
                    <p className="text-xs" style={{ color: '#9A949D' }}>Sana gönderilen eşleşme davetleri</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingInvites.map(invite => (
                    <motion.div key={invite.id} layout
                      className="p-5 rounded-xl"
                      style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(250,218,221,0.15)' }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
                          {invite.fromUserName?.charAt(0).toUpperCase() ||'?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>{invite.fromUserName}</p>
                          <p className="text-xs" style={{ color: '#9A949D' }}>{invite.fromUserEmail}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: '#B8A9BC' }}>
                          <FiClock size={11} />
                          {new Date(invite.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6E5A73' }}>
                            <FiLink size={11} className="inline mr-1" /> Eşleşme Kodu
                          </label>
                          <input
                            type="text"
                            value={acceptCode}
                            onChange={e => setAcceptCode(e.target.value)}
                            placeholder="Kodu gir..."
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                            style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                          />
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptInvite(invite.id)}
                          className="px-5 py-3 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
                          <FiCheck size={14} /> Kabul Et
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }}
                          onClick={async () => { await rejectInvite(invite.id); toast('Davet reddedildi') }}
                          className="px-3 py-3 rounded-xl text-sm cursor-pointer"
                          style={{ background: 'rgba(232,128,140,0.08)', color: '#E8808C' }}>
                          <FiX size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Davet Gönder */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-6 sm:p-7"
              style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
                  <FiUserPlus size={16} />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Davet Gönder</h2>
                  <p className="text-xs" style={{ color: '#9A949D' }}>Partnerinin e-postasını gir ve özel bir eşleşme kodu belirle</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6E5A73' }}>
                    <FiMail size={12} className="inline mr-1" /> Partner E-postası
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="partner@mail.com"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition"
                    style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6E5A73' }}>
                    <FiLink size={12} className="inline mr-1" /> Eşleşme Kodu
                    <span className="text-xs font-normal ml-1" style={{ color: '#B8A9BC' }}>(partnerine bu kodu ilet)</span>
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    placeholder="Özel kodunuz (min 4 karakter)"
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition"
                    style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={sendingInvite || !inviteEmail || !inviteCode}
                  onClick={handleSendInvite}
                  className="w-full py-3.5 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition"
                  style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
                >
                  <FiSend size={15} />
                  {sendingInvite ? 'Gönderiliyor...' : 'Davet Gönder'}
                </motion.button>
              </div>

              {/* Nasıl Çalışır */}
              <div className="mt-6 p-5 rounded-xl" style={{ background: 'rgba(184,160,220,0.05)', border: '1px solid rgba(184,160,220,0.08)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>Nasıl Çalışır?</p>
                <div className="space-y-2.5">
                  {[
                    { step: '1', text: 'Partnerinin kayıtlı e-postasını gir' },
                    { step: '2', text: 'Özel bir eşleşme kodu belirle (min 4 karakter)' },
                    { step: '3', text: 'Kodu partnerine WhatsApp, SMS vb. ile ilet' },
                    { step: '4', text: 'Partner giriş yapıp kodu girerek eşleşmeyi tamamlar' },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: 'rgba(184,160,220,0.15)', color: '#B8A0DC' }}>
                        {item.step}
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: '#9A949D' }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Gönderilen Davetler */}
            {sentInvites.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl p-6 sm:p-7"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
                    <FiSend size={16} />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>
                      Gönderilen Davetler
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,160,220,0.15)', color: '#B8A0DC' }}>
                        {sentInvites.length}
                      </span>
                    </h2>
                    <p className="text-xs" style={{ color: '#9A949D' }}>Gönderdiğin eşleşme davetlerinin durumu</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sentInvites.map(invite => {
                    const statusMap: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                      pending: { label: 'Bekliyor', color: '#E8C97D', bg: 'rgba(232,201,125,0.1)', icon: '◌' },
                      accepted: { label: 'Kabul Edildi', color: '#8ECFB0', bg: 'rgba(142,207,176,0.1)', icon: '✓' },
                      rejected: { label: 'Reddedildi', color: '#E8808C', bg: 'rgba(232,128,140,0.1)', icon: '✕' },
                      expired: { label: 'Süresi Doldu', color: '#B0AAB3', bg: 'rgba(176,170,179,0.1)', icon: '⏱' },
                    }
                    const st = statusMap[invite.status] || statusMap.pending

                    return (
                      <div key={invite.id}
                        className="p-4 rounded-xl flex items-center justify-between gap-3"
                        style={{ background: st.bg, border: `1px solid ${st.color}20` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
                            {invite.toEmail.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#3D2C3E' }}>{invite.toEmail}</p>
                            <p className="text-[11px]" style={{ color: '#9A949D' }}>
                              {new Date(invite.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1"
                          style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}>
                          <span>{st.icon}</span> {st.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
