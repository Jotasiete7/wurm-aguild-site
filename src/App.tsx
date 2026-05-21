import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/Admin/AdminPage';
import { LanguageProvider } from './contexts/LanguageContext';

import { GuildUtilitiesPage } from './pages/GuildUtilities/GuildUtilitiesPage';
import { CraftPulse } from './pages/GuildUtilities/CraftPulse/CraftPulse';

function App() {
    return (
        <LanguageProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    
                    {/* Guild Utilities */}
                    <Route path="/guildutilities" element={<GuildUtilitiesPage />} />
                    <Route path="/guildutilities/craft-pulse" element={<CraftPulse />} />
                    <Route path="/guildutilities/craft-pulse/focus" element={<CraftPulse focusMode={true} />} />
                </Routes>
            </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
