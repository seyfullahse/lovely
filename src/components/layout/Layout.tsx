import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePartner } from '../../context/PartnerContext'
import Navbar from './Navbar'
import { Toaster } from 'react-hot-toast'

function AppLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF6F0' }}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)' }}
          >
            ✦
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#FDF6F0]"
            style={{ background: 'linear-gradient(135deg, #B8A0DC, #FADADD)' }}
          >
            <div className="w-full h-full rounded-full animate-spin border-2 border-transparent border-t-white" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#3D2C3E', fontFamily: "'Playfair Display', serif" }}>
            Planora
          </p>
          <p className="text-[11px] mt-1" style={{ color: '#B8A9BC' }}>Yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { loading: authLoading } = useAuth()
  const { loading: partnerLoading } = usePartner()

  // Auth veya partner bilgisi yüklenirken splash ekranı göster
  if (authLoading || partnerLoading) {
    return <AppLoadingScreen />
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[72px] sm:pt-[96px] pb-20 md:pb-0">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#3D2C3E',
            borderRadius: '12px',
            border: '1px solid rgba(232,223,245,0.4)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '0.875rem'
          },
          success: {
            iconTheme: {
              primary: '#E8808C',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
  )
}
