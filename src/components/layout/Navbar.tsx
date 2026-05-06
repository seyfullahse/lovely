import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useCouple } from '../../context/CoupleContext'
import { usePartner } from '../../context/PartnerContext'
import { useTheme, hexToRgba } from '../../context/ThemeContext'
import { FiHome, FiHeart, FiLogOut, FiUser, FiUsers, FiPlus, FiCheckSquare, FiCalendar, FiDollarSign, FiSettings, FiSmile, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const { couple } = useCouple()
  const { isPaired } = usePartner()
  const { colors } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Görüşmek üzere!')
      navigate('/')
    } catch {
      toast.error('Çıkış yapılamadı')
    }
  }

  // Desktop üst navigasyon linkleri
  const desktopNavLinks = [
    { to: '/', icon: <FiHome size={16} />, label: 'Ana Sayfa' },
    { to: '/dashboard', icon: <FiCalendar size={16} />, label: 'Dashboard' },
    { to: '/new-plan', icon: <FiPlus size={16} />, label: 'Yeni Plan' },
    { to: '/new-todo', icon: <FiCheckSquare size={16} />, label: 'Yeni Görev' },
    { to: '/expenses', icon: <FiDollarSign size={16} />, label: 'Harcamalar' },
    { to: '/mood', icon: <FiSmile size={16} />, label: 'Günlük' },
    { to: '/timeline', icon: <FiClock size={16} />, label: 'Akış' },
  ]

  // Mobil alt tab bar linkleri (en fazla 5 tab — thumb zone)
  const mobileTabLinks = [
    { to: '/', icon: <FiHome size={20} />, label: 'Ana Sayfa' },
    { to: '/dashboard', icon: <FiCalendar size={20} />, label: 'Takvim' },
    { to: '/new-plan', icon: <FiPlus size={22} />, label: 'Ekle', accent: true },
    { to: '/timeline', icon: <FiClock size={20} />, label: 'Akış' },
    { to: '/mood', icon: <FiSmile size={20} />, label: 'Günlük' },
  ]

  return (
    <>
      {/* ═══════ ÜST NAVBAR (hem desktop hem mobil) ═══════ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: colors.navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${hexToRgba(colors.accent, 0.2)}`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-14 2xl:px-20 h-14 sm:h-16 flex items-center justify-between">
          {/* Sol: Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: colors.fg }}
            >
              Planora
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1"
              style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.1) }}
            >
              {isPaired && <FiUsers size={10} />}
              {couple.coupleShort}
            </span>
          </NavLink>

          {/* Mobil: Küçük badge + ayar ikonları */}
          <div className="flex md:hidden items-center gap-1">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 sm:hidden"
              style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.1) }}
            >
              {isPaired && <FiUsers size={9} />}
              {couple.coupleShort}
            </span>
            <NavLink
              to="/settings"
              className="p-2 rounded-lg transition cursor-pointer"
              style={({ isActive }) => ({
                color: isActive ? colors.fg : colors.softLight,
              })}
            >
              <FiSettings size={16} />
            </NavLink>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {desktopNavLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={({ isActive }) => ({
                  color: isActive ? colors.fg : colors.softLight,
                  background: isActive ? hexToRgba(colors.secondary, 0.25) : 'transparent',
                })}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}

            {/* Profil butonu + isim */}
            {currentUser && (
              <NavLink
                to="/profile"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition cursor-pointer ml-1"
                style={({ isActive }) => ({
                  color: isActive ? colors.fg : colors.softLight,
                  background: isActive ? hexToRgba(colors.secondary, 0.25) : 'transparent',
                })}
                title="Profil Ayarları"
              >
                <FiUser size={14} />
                <span className="text-xs font-medium">
                  {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                </span>
              </NavLink>
            )}

            {/* Ayarlar butonu */}
            <NavLink
              to="/settings"
              className="p-1.5 rounded-md transition cursor-pointer"
              style={({ isActive }) => ({
                color: isActive ? colors.fg : colors.softLight,
              })}
              title="Ayarlar"
            >
              <FiSettings size={14} />
            </NavLink>

            {currentUser && (
              <div className="flex items-center ml-2 pl-2" style={{ borderLeft: `1px solid ${hexToRgba(colors.accent, 0.3)}` }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-md transition cursor-pointer"
                  style={{ color: colors.softLight }}
                >
                  <FiLogOut size={13} />
                </motion.button>
              </div>
            )}

            {!currentUser && (
              <NavLink
                to="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all ml-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                  color: colors.fg,
                }}
              >
                Giriş Yap
              </NavLink>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ═══════ MOBİL BOTTOM TAB BAR ═══════ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          background: colors.navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${hexToRgba(colors.accent, 0.2)}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {mobileTabLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-all"
              style={({ isActive }) => {
                // Orta "Ekle" butonu özel stil
                if (link.accent) {
                  return {
                    color: isActive ? '#fff' : colors.primary,
                  }
                }
                return {
                  color: isActive ? colors.fg : colors.softLight,
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {link.accent ? (
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center -mt-5 shadow-lg"
                      style={{
                        background: isActive
                          ? colors.primary
                          : `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                        color: isActive ? '#fff' : colors.fg,
                      }}
                    >
                      {link.icon}
                    </span>
                  ) : (
                    <span className="relative">
                      {link.icon}
                      {isActive && (
                        <motion.span
                          layoutId="tab-dot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: colors.primary }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-medium leading-tight"
                    style={{ opacity: link.accent && !isActive ? 0.7 : 1 }}
                  >
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
