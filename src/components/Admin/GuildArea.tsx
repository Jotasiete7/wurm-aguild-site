import { useEffect, useState } from 'react';
import { Map, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './GuildArea.css';

export default function GuildArea() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // State for Nickname Editing
    const [isEditing, setIsEditing] = useState(false);
    const [newNick, setNewNick] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            setNewNick(user.username || '');
        }
    }, [user, navigate]);

    const handleUpdateNick = async () => {
        if (!user || !newNick.trim()) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username: newNick.trim() })
                .eq('id', user.id);

            if (error) throw error;

            // Force reload to update context (simple way)
            window.location.reload();
        } catch (error) {
            console.error('Error updating nick:', error);
            alert('Erro ao atualizar nick. Tente novamente.');
        } finally {
            setLoading(false);
            setIsEditing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-container container fade-in">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="user-welcome">
                        <span className="welcome-label">Bem-vindo,</span>

                        {isEditing ? (
                            <div className="nick-edit-mode">
                                <input
                                    type="text"
                                    value={newNick}
                                    onChange={(e) => setNewNick(e.target.value)}
                                    className="nick-input"
                                    placeholder="Seu Nick In-Game"
                                    autoFocus
                                />
                                <button onClick={handleUpdateNick} disabled={loading} className="icon-btn save">
                                    <Check size={18} />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="icon-btn cancel">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="nick-display-mode">
                                <h2 className="user-nick">{user.username}</h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="edit-nick-btn"
                                    title="Alterar Nick (In-Game)"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        )}

                        <p className="role-badge">{user.role === 'superadmin' ? '👑 Superadmin' : 'Membro'}</p>
                    </div>

                    <button onClick={() => { signOut(); navigate('/'); }} className="logout-btn">
                        Sair
                    </button>
                </div>
            </header>

            <div className="dashboard-grid single-column">
                {/* Simplified Maps Card */}
                <div className="dash-banner glass">
                    <div className="banner-content">
                        <Map className="banner-icon" size={20} />
                        <span className="banner-text">Mapas Especiais (ferramenta a ser implementada futuramente)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
