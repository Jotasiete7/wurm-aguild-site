import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Hero } from './components/Hero';
import Mural from './components/Mural/Mural';
import GuildArea from './components/Admin/GuildArea';
import Login from './pages/Login';
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

function App() {
  const [muralInitialTab] = useState<'services' | 'resources' | 'map'>('services');

  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />

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
    </AuthProvider>
  );
}

export default App;
