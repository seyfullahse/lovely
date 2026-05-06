import { useState } from 'react'
import { motion } from 'framer-motion'
import CalendarView from '../components/calendar/CalendarView'
import TodoList from '../components/todos/TodoList'
import PlanList from '../components/plans/PlanList'
import StatsPanel from '../components/stats/StatsPanel'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/PartnerContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const { isPaired, partnerProfile } = usePartner()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-2xl p-12 max-w-md"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <span className="text-3xl block mb-4" style={{ opacity: 0.4 }}>○</span>
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
          >
            Giriş Yapmalısın
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9A949D' }}>Planları görmek için önce giriş yap.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-2.5 rounded-full font-medium text-sm cursor-pointer transition"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
          >
            Giriş Yap
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Genel' },
    { id: 'calendar', label: 'Takvim' },
    { id: 'todos', label: 'Görevler' },
    { id: 'plans', label: 'Planlar' },
  ]

  return (
    <div className="min-h-screen px-6 py-4 sm:px-10 md:py-6 lg:px-14 2xl:px-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 
            className="text-2xl md:text-3xl font-semibold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
          >
            Merhaba, {currentUser.displayName || 'Sevgilim'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#B8A9BC' }}>
            {isPaired && partnerProfile
              ? `${partnerProfile.name} ile birlikte planlıyorsunuz 💕`
              : 'Bugün birlikte neler planlayalım?'
            }
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'shadow-sm'
                  : ''
              }`}
              style={activeTab === tab.id 
                ? { background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }
                : { background: 'rgba(255,255,255,0.5)', color: '#B8A9BC', border: '1px solid rgba(184,160,220,0.1)' }
              }
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <StatsPanel />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CalendarView />
              <TodoList />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <CalendarView />
        )}

        {activeTab === 'todos' && (
          <div className="max-w-2xl mx-auto">
            <TodoList />
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="max-w-2xl mx-auto">
            <PlanList />
          </div>
        )}
      </div>
    </div>
  )
}
