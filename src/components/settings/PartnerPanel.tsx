import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { usePartner } from '../../context/PartnerContext'
import { FiSend, FiCheck, FiX, FiLink, FiUserPlus, FiUsers, FiCopy, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function PartnerPanel() {
  const { currentUser, userProfile } = useAuth()
  const { 
    pairing, partnerProfile, pendingInvites, isPaired,
    sendInvite, acceptInvite, rejectInvite, dissolvePairing 
  } = usePartner()

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [acceptCode, setAcceptCode] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)

  if (!currentUser) return null

  // Eşleşmiş durum
  if (isPaired && pairing && partnerProfile) {
    return (
      <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.12)' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl flex items-center justify-center" 
            style={{ background: 'rgba(184,160,220,0.12)', color: '#B8A0DC' }}>
            <FiUsers size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>Partner Eşleşmesi</h3>
            <p className="text-xs" style={{ color: '#9A949D' }}>Aktif eşleşme</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'rgba(250,218,221,0.15)', border: '1px solid rgba(250,218,221,0.2)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
            {partnerProfile.name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>{partnerProfile.name}</p>
            <p className="text-xs" style={{ color: '#9A949D' }}>{partnerProfile.email}</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(147,181,225,0.15)', color: '#6B9BD2' }}>
            💕 Eşleşmiş
          </span>
        </div>

        {/* Eşleşmeyi Kaldır */}
        {!showDissolveConfirm ? (
          <button
            onClick={() => setShowDissolveConfirm(true)}
            className="w-full text-xs py-2 rounded-lg transition cursor-pointer"
            style={{ color: '#E8808C', background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.1)' }}
          >
            Eşleşmeyi Kaldır
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl" style={{ background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.15)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle size={14} style={{ color: '#E8808C' }} />
              <p className="text-xs font-medium" style={{ color: '#E8808C' }}>Emin misin?</p>
            </div>
            <p className="text-xs mb-3" style={{ color: '#9A949D' }}>
              Eşleşme kaldırıldığında herkesin kendi oluşturduğu veriler kendinde kalır.
            </p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await dissolvePairing()
                    toast.success('Eşleşme kaldırıldı')
                    setShowDissolveConfirm(false)
                  } catch (err: any) {
                    toast.error(err.message || 'Bir hata oluştu')
                  }
                }}
                className="flex-1 text-xs py-2 rounded-lg font-medium cursor-pointer"
                style={{ background: '#E8808C', color: '#fff' }}
              >
                Evet, Kaldır
              </button>
              <button
                onClick={() => setShowDissolveConfirm(false)}
                className="flex-1 text-xs py-2 rounded-lg font-medium cursor-pointer"
                style={{ background: 'rgba(184,160,220,0.1)', color: '#6E5A73' }}
              >
                İptal
              </button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  // Eşleşme yok — davet gönder veya gelen davetleri göster
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.12)' }}>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center" 
          style={{ background: 'rgba(250,218,221,0.2)', color: '#E8808C' }}>
          <FiUserPlus size={18} />
        </span>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>Partner Eşleştir</h3>
          <p className="text-xs" style={{ color: '#9A949D' }}>Partnerini davet et veya gelen daveti kabul et</p>
        </div>
      </div>

      {/* Gelen Davetler */}
      {pendingInvites.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold mb-3" style={{ color: '#B8A0DC' }}>
            📩 Gelen Davetler ({pendingInvites.length})
          </p>
          <div className="space-y-3">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="p-4 rounded-xl" style={{ background: 'rgba(250,218,221,0.1)', border: '1px solid rgba(250,218,221,0.2)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: '#3D2C3E' }}>
                  {invite.fromUserName}
                </p>
                <p className="text-xs mb-3" style={{ color: '#9A949D' }}>{invite.fromUserEmail}</p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-medium mb-1 block" style={{ color: '#6E5A73' }}>Eşleşme Kodu</label>
                    <input
                      type="text"
                      value={acceptCode}
                      onChange={e => setAcceptCode(e.target.value)}
                      placeholder="Kodu gir..."
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ background: 'rgba(253,246,240,0.8)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                    />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      try {
                        await acceptInvite(invite.id, acceptCode)
                        toast.success(`${invite.fromUserName} ile eşleştiniz! 💕`)
                        setAcceptCode('')
                      } catch (err: any) {
                        toast.error(err.message || 'Kod yanlış veya hata oluştu')
                      }
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1"
                    style={{ background: 'rgba(147,181,225,0.15)', color: '#6B9BD2' }}
                  >
                    <FiCheck size={12} /> Kabul Et
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      await rejectInvite(invite.id)
                      toast('Davet reddedildi')
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: 'rgba(232,128,140,0.08)', color: '#E8808C' }}
                  >
                    <FiX size={12} />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Davet Gönder */}
      <div className="space-y-3">
        <p className="text-xs font-semibold" style={{ color: '#6E5A73' }}>
          <FiSend size={11} className="inline mr-1" />
          Davet Gönder
        </p>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#6E5A73' }}>Partner E-postası</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="partner@mail.com"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition"
            style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
            onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: '#6E5A73' }}>
            <FiLink size={11} className="inline mr-1" />
            Eşleşme Kodu
            <span className="text-xs font-normal ml-1" style={{ color: '#B8A9BC' }}>(partnerine bu kodu ilet)</span>
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            placeholder="Özel kodunuz (min 4 karakter)"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition"
            style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
            onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={sendingInvite || !inviteEmail || !inviteCode}
          onClick={async () => {
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
          }}
          className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition"
          style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
        >
          <FiSend size={14} />
          {sendingInvite ? 'Gönderiliyor...' : 'Davet Gönder'}
        </motion.button>
      </div>

      {/* Bilgi notu */}
      <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(184,160,220,0.06)', border: '1px solid rgba(184,160,220,0.08)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: '#9A949D' }}>
          💡 Partnerine davet gönderdikten sonra eşleşme kodunu ayrıca ilet.
          Partner giriş yaptığında daveti görecek ve kodu girerek eşleşmeyi tamamlayacak.
        </p>
      </div>
    </div>
  )
}
