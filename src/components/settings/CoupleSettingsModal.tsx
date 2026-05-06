import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCouple } from '../../context/CoupleContext'
import { useAuth } from '../../context/AuthContext'
import { FiX, FiUser, FiUsers, FiHeart, FiCalendar, FiBriefcase } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TurkishDatePicker from '@/components/ui/TurkishDatePicker'
import { DialogHeader, DialogBody } from '@/components/ui/dialog'
import PartnerPanel from './PartnerPanel'

export default function CoupleSettingsModal({ onClose }: { onClose: () => void }) {
  const { couple, setNames, updateCouple, updatePerson1, updatePerson2, stages } = useCouple()
  const { currentUser } = useAuth()

  const [name1, setName1] = useState(couple.person1.name)
  const [name2, setName2] = useState(couple.person2.name)
  const [role1, setRole1] = useState(couple.person1.role || '')
  const [role2, setRole2] = useState(couple.person2.role || '')
  const [anniversary, setAnniversary] = useState(couple.anniversary || '')
  const [stage, setStage] = useState(couple.stage || 'relationship')

  const handleSave = () => {
    setNames(name1.trim() || 'Kişi 1', name2.trim() || 'Kişi 2')
    updatePerson1({ role: role1.trim() })
    updatePerson2({ role: role2.trim() })
    updateCouple({ anniversary: anniversary || null, stage })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-card rounded-3xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[1.35rem] font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>Çift Ayarları</h2>
              <p className="text-sm mt-1.5 text-[#B8A9BC]">Planora'yı ikinize özel yapın</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl transition cursor-pointer hover:scale-105 text-[#B8A9BC] bg-[rgba(232,223,245,0.15)]"
            >
              <FiX size={20} />
            </button>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-7">
          {/* Kişi 1 */}
          <div className="p-5 sm:p-6 rounded-2xl" style={{ background: 'rgba(147,181,225,0.06)', border: '1px solid rgba(147,181,225,0.12)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(147,181,225,0.15)', color: '#93B5E1' }}>
                <FiUser size={16} />
              </span>
              <p className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Kişi 1</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#6E5A73' }}>İsim</label>
                <Input
                  type="text"
                  value={name1}
                  onChange={e => setName1(e.target.value)}
                  placeholder="İsim"
                  className="px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#6E5A73' }}>
                  <FiBriefcase size={11} className="inline mr-1" />Meslek / Rol
                </label>
                <Input
                  type="text"
                  value={role1}
                  onChange={e => setRole1(e.target.value)}
                  placeholder="Örn: Yazılımcı"
                  className="px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Kişi 2 */}
          <div className="p-5 sm:p-6 rounded-2xl" style={{ background: 'rgba(232,128,140,0.04)', border: '1px solid rgba(232,128,140,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(232,128,140,0.12)', color: '#E8808C' }}>
                <FiUser size={16} />
              </span>
              <p className="text-[15px] font-semibold" style={{ color: '#3D2C3E' }}>Kişi 2</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#6E5A73' }}>İsim</label>
                <Input
                  type="text"
                  value={name2}
                  onChange={e => setName2(e.target.value)}
                  placeholder="İsim"
                  className="px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-2 block" style={{ color: '#6E5A73' }}>
                  <FiBriefcase size={11} className="inline mr-1" />Meslek / Rol
                </label>
                <Input
                  type="text"
                  value={role2}
                  onChange={e => setRole2(e.target.value)}
                  placeholder="Örn: Mimar"
                  className="px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* İlişki Aşaması */}
          <div>
            <Label>
              <FiHeart size={15} className="text-[#E8808C]" />
              İlişki Aşaması
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(stages).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStage(key)}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl text-sm font-medium transition-all cursor-pointer"
                  style={{
                    background: stage === key ? 'rgba(184,160,220,0.12)' : '#FAFAFA',
                    border: stage === key ? '2px solid #B8A0DC' : '2px solid #F0ECF5',
                    color: stage === key ? '#3D2C3E' : '#9A949D',
                    boxShadow: stage === key ? '0 0 0 3px rgba(184,160,220,0.1)' : 'none',
                  }}
                >
                  <span className="text-xl">{val.icon}</span>
                  <span className="text-xs">{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Yıl Dönümü */}
          <div>
            <Label>
              <FiCalendar size={15} className="text-[#B8A0DC]" />
              Birlikte Olma Tarihi
              <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
            </Label>
            <TurkishDatePicker
              value={anniversary}
              onChange={setAnniversary}
            />
          </div>

          {/* Kaydet */}
          <div className="pt-2 space-y-3">
            {/* Partner Eşleşme Paneli */}
            {currentUser && <PartnerPanel />}

            <Button onClick={handleSave} className="w-full">
              Kaydet
            </Button>
          </div>
        </DialogBody>
      </motion.div>
    </motion.div>
  )
}
