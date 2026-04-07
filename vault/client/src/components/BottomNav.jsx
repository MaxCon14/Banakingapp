import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/',        icon: '⬡',  label: 'Home'    },
  { path: '/pots',    icon: '◎',  label: 'Pots'    },
  { path: '/history', icon: '↕',  label: 'History' },
]

export default function BottomNav() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Hide nav on action screens
  if (['/add', '/withdraw'].includes(location.pathname)) return null

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, icon, label }) => (
        <button
          key={path}
          className={`nav-item ${location.pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)}
          aria-label={label}
        >
          <span className="nav-icon">{icon}</span>
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
