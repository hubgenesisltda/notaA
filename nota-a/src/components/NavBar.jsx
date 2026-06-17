import { useNavigate } from 'react-router-dom';

const C = {
  surface: "#111827", border: "#1E2D45",
  primary: "#00D4FF", muted: "#64748B",
};

const NAV_ITEMS = [
  { id: 'inicio',   icon: '🏠', label: 'Início',   route: '/onboarding' },
  { id: 'praticar', icon: '⚡', label: 'Praticar', route: '/quiz' },
  { id: 'redacao',  icon: '✍️', label: 'Redação',  route: '/estudo' },
  { id: 'turma',    icon: '📊', label: 'Turma',    route: '/dashboard' },
  { id: 'perfil',   icon: '👤', label: 'Perfil',   route: '/estudante' },
];

export default function NavBar({ active }) {
  const navigate = useNavigate();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: `${C.surface}F0`, backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${C.border}`,
      display: 'flex', justifyContent: 'center', zIndex: 100,
    }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 480 }}>
        {NAV_ITEMS.map(({ id, icon, label, route }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => navigate(route)}
              style={{
                flex: 1, padding: '10px 0 7px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2, transition: 'all .2s',
              }}
            >
              <span style={{ fontSize: 18, opacity: isActive ? 1 : 0.3 }}>{icon}</span>
              <span style={{
                fontSize: 9, fontWeight: isActive ? 800 : 500,
                color: isActive ? C.primary : C.muted,
                fontFamily: "'Syne', sans-serif",
              }}>{label}</span>
              {isActive && <div style={{ width: 18, height: 2, borderRadius: 99, background: C.primary }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
