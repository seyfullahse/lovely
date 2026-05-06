import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import PlanCard from './PlanCard'
import AddPlanModal from './AddPlanModal'
import type { Plan } from '@/types'

export default function PlanList() {
  const { plans } = useData()
  const [showAdd, setShowAdd] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [showPast, setShowPast] = useState(false)

  const todayStr = new Date().toISOString().slice(0, 10)

  // Bugün + gelecek planları (yakın tarih önce)
  const futurePlans = useMemo(() => {
    return plans
      .filter(p => p.plannedDate.slice(0, 10) >= todayStr || p.status === 'planned')
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate))
  }, [plans, todayStr])

  // Geçmiş planlar (en yakın geçmiş önce)
  const pastPlans = useMemo(() => {
    return plans
      .filter(p => p.plannedDate.slice(0, 10) < todayStr && p.status !== 'planned')
      .sort((a, b) => b.plannedDate.localeCompare(a.plannedDate))
  }, [plans, todayStr])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl p-5 sm:p-6 md:p-7"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 
          className="text-lg font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
        >
          Planlarımız
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingPlan(null); setShowAdd(true) }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition"
          style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
        >
          <FiPlus size={15} /> Yeni Plan
        </motion.button>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        <AnimatePresence>
          {futurePlans.length === 0 && pastPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              style={{ color: '#B8A9BC' }}
            >
              <span className="text-2xl block mb-2" style={{ opacity: 0.5 }}>○</span>
              <p className="text-sm">Henüz plan yok. İlk planı ekle!</p>
            </motion.div>
          ) : (
            <>
              {futurePlans.length === 0 && (
                <div className="text-center py-6" style={{ color: '#B8A9BC' }}>
                  <p className="text-xs">Yaklaşan plan yok — yeni bir plan oluştur!</p>
                </div>
              )}
              {futurePlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => { setEditingPlan(plan); setShowAdd(true) }}
                />
              ))}

              {/* Geçmiş butonu */}
              {pastPlans.length > 0 && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowPast(prev => !prev)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    style={{
                      background: 'rgba(184,160,220,0.08)',
                      color: '#B8A9BC',
                      border: '1px solid rgba(184,160,220,0.15)',
                    }}
                  >
                    {showPast ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    Geçmiş ({pastPlans.length})
                  </motion.button>

                  <AnimatePresence>
                    {showPast && pastPlans.map(plan => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 0.7, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PlanCard
                          plan={plan}
                          onEdit={() => { setEditingPlan(plan); setShowAdd(true) }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAdd && (
          <AddPlanModal
            onClose={() => { setShowAdd(false); setEditingPlan(null) }}
            editPlan={editingPlan}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
