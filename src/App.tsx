
import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Mural from './components/Mural/Mural';
import GuildArea from './components/Admin/GuildArea';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'mural' | 'guild'>('home');

  return (
    <AuthProvider>
      <div className="app">
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

        <main>
          {currentPage === 'home' && <Hero onNavigate={setCurrentPage} />}
          {currentPage === 'mural' && <Mural />}
          {currentPage === 'guild' && <GuildArea />}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
