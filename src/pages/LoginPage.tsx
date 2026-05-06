import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiHeart } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'
import FloatingHearts from '../components/romantic/FloatingHearts'

export default function LoginPage() {
  const { login, signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignup) {
        if (!form.name.trim()) {
          toast.error('İsim zorunludur! 💕')
          setLoading(false)
          return
        }
        await signup(form.email, form.password, form.name)
        toast.success('Hoş geldin! 💕 Şimdi partnerini davet edebilirsin.')
      } else {
        await login(form.email, form.password)
        toast.success('Tekrar hoş geldin! 💕')
      }
      navigate('/')
    } catch (error: any) {
      console.error(error)
      if (error.code === 'auth/user-not-found') {
        toast.error('Kullanıcı bulunamadı 😢')
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Yanlış şifre 🔑')
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('Bu e-posta zaten kayıtlı 📧')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Şifre en az 6 karakter olmalı 🔐')
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Geçersiz e-posta veya şifre 🔑')
      } else {
        toast.error('Bir hata oluştu 😢')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      toast.success('Google ile giriş başarılı! 💕')
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Google girişi başarısız 😢')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <FloatingHearts />

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(250,218,221,0.15)' }} />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(232,223,245,0.15)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="rounded-3xl p-8 shadow-sm" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(184,160,220,0.1)' }}>
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-2xl mb-4 inline-block" style={{ color: '#FADADD' }}
            >
              ♦
            </motion.div>
            <h1 
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
            >
              {isSignup ? 'Aramıza Katıl' : 'Hoş Geldin'}
            </h1>
            <p className="mt-2 text-sm" style={{ color: '#B8A9BC' }}>
              {isSignup ? 'Birlikte güzel planlar yapalım' : 'Seni özledik'}
            </p>
          </div>

          {/* Google Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl transition-all mb-6 font-medium text-sm cursor-pointer"
            style={{ border: '1px solid rgba(184,160,220,0.15)', color: '#6E5A73' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(184,160,220,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(184,160,220,0.15)'}
          >
            <FcGoogle size={22} />
            Google ile {isSignup ? 'Kayıt Ol' : 'Giriş Yap'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(184,160,220,0.1)' }} />
            <span className="text-xs font-medium" style={{ color: '#B8A9BC' }}>veya</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(184,160,220,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="block text-xs font-medium mb-1" style={{ color: '#6E5A73' }}>İsim</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#B8A0DC' }} size={16} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="İsmin..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none transition text-sm"
                    style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6E5A73' }}>E-posta</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#B8A0DC' }} size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="ornek@mail.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none transition text-sm"
                  style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6E5A73' }}>Şifre</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#B8A0DC' }} size={16} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl outline-none transition text-sm"
                  style={{ background: 'rgba(253,246,240,0.6)', border: '1px solid rgba(184,160,220,0.2)', color: '#3D2C3E' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(184,160,220,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(184,160,220,0.2)'}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition"
              style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
            >
              {loading ? (
                'Bekle...'
              ) : (
                <>
                  <FiHeart size={14} />
                  {isSignup ? 'Kayıt Ol' : 'Giriş Yap'}
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm" style={{ color: '#B8A9BC' }}>
            {isSignup ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}{' '}
            <button 
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium transition cursor-pointer"
              style={{ color: '#B8A0DC' }}
            >
              {isSignup ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
