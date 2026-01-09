
import { useState } from 'react';
import Navbar from './components/Navbar';
import { Hero } from './components/Hero';
import Mural from './components/Mural/Mural';
import GuildArea from './components/Admin/GuildArea';
import { AuthProvider } from './context/AuthContext';


function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'mural' | 'guild'>('home');
  const [muralInitialTab, setMuralInitialTab] = useState<'services' | 'resources' | 'map'>('services');

  const handleNavigate = (page: 'home' | 'mural' | 'guild', tab?: 'services' | 'resources' | 'map') => {
    if (tab) setMuralInitialTab(tab);
    setCurrentPage(page);
  };

  return (
    <AuthProvider>
      <div className="app">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

        <main>
          {currentPage === 'home' && <Hero onNavigate={handleNavigate} />}
          {currentPage === 'mural' && <Mural initialTab={muralInitialTab} />}
          {currentPage === 'guild' && <GuildArea />}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
