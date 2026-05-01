import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { Hero } from './components/Hero';
import Mural from './components/Mural/Mural';
import GuildArea from './components/Admin/GuildArea';
import Login from './pages/Login';
import { Header as AgHeader } from '@ecossistema-guilda/layout/Header';
import { useAuth } from './context/AuthContext';
import { Home, Shield } from 'lucide-react';

import { AuthProvider } from './context/AuthContext';


// Wrapper to pass navigation props to Hero
const HeroWrapper = () => {
  const navigate = useNavigate();
  return <Hero onNavigate={(page, tab) => {
    if (page === 'mural') {
      navigate('/mural', { state: { tab } });
    } else if (page === 'guild') {
      navigate('/guild');
    }
  }} />;
}

function AppContent() {
  const { user, signOut, isAdmin } = useAuth();
  const [muralInitialTab] = useState<'services' | 'resources' | 'map'>('services');

  return (
    <Router>
      <div className="app">
        <AgHeader 
          currentToolId="live-site-check"
          LinkComponent={Link}
          auth={{
            user: user ? { name: user.email?.split('@')[0], image: undefined } : null,
            isAdmin,
            logoutForm: user ? (
              <button onClick={() => signOut()} className="btn" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}>
                Sair
              </button>
            ) : null,
            loginButton: !user ? (
              <Link to="/login" className="text-[10px] uppercase tracking-widest text-wurm-muted hover:text-wurm-accent transition-colors font-mono">
                Login
              </Link>
            ) : null
          }}
          navigation={[
            { label: <><Home size={16} /> Mural</>, href: '/mural' },
            { label: <><Shield size={16} /> {user ? 'Área VIP' : 'Membros'}</>, href: user ? '/guild' : '/login' }
          ]}
        />

        <main>
          <Routes>
            <Route path="/" element={<HeroWrapper />} />
            <Route path="/mural" element={<Mural initialTab={muralInitialTab} />} />
            <Route path="/guild" element={<GuildArea />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
