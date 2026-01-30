import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Crown, AlertTriangle, Search } from 'lucide-react';
import './UserManagement.css';

interface Profile {
    id: string;
    email: string;
    username: string;
    global_role: 'superadmin' | 'admin' | 'member';
    created_at: string;
}

export default function UserManagement() {
    const { user } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    // Only fetch if user is admin/superadmin
    useEffect(() => {
        if (user?.role === 'superadmin' || user?.role === 'admin') {
            fetchProfiles();
        }
    }, [user]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        if (!confirm(`Tem certeza que deseja mudar o cargo deste usuário para ${newRole}?`)) return;

        try {
            setUpdating(userId);
            const { error } = await supabase
                .from('profiles')
                .update({ global_role: newRole })
                .eq('id', userId);

            if (error) throw error;

            // Optimistic update
            setProfiles(profiles.map(p =>
                p.id === userId ? { ...p, global_role: newRole as any } : p
            ));

        } catch (error) {
            console.error('Error updating role:', error);
            alert('Erro ao atualizar cargo.');
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'superadmin':
                return <span className="badge badge-superadmin"><Crown size={12} /> Super Admin</span>;
            case 'admin':
                return <span className="badge badge-admin"><Shield size={12} /> Admin</span>;
            default:
                return <span className="badge badge-member"><User size={12} /> Membro</span>;
        }
    };

    const filteredProfiles = profiles.filter(p =>
        (p.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (user?.role !== 'superadmin' && user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="user-management-container glass">
            <div className="um-header">
                <h3>Gerenciamento de Guilda</h3>
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Carregando membros...</div>
            ) : (
                <div className="table-responsive">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Membro</th>
                                <th>Email</th>
                                <th>Cargo Atual</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfiles.map(profile => (
                                <tr key={profile.id} className={updating === profile.id ? 'updating' : ''}>
                                    <td>
                                        <div className="user-info">
                                            <div className="avatar-placeholder">
                                                {profile.username?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="username">{profile.username || 'Sem Nick'}</span>
                                        </div>
                                    </td>
                                    <td className="email-cell">{profile.email}</td>
                                    <td>{getRoleBadge(profile.global_role)}</td>
                                    <td>
                                        <div className="action-buttons">
                                            {/* Only Superadmin can promote to Admin/Superadmin */}
                                            {user.role === 'superadmin' && (
                                                <select
                                                    className="role-select"
                                                    value={profile.global_role}
                                                    onChange={(e) => handleRoleUpdate(profile.id, e.target.value)}
                                                    disabled={profile.id === user.id} // Can't demote self easily to avoid lockout
                                                >
                                                    <option value="member">Membro</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="superadmin">Super Admin</option>
                                                </select>
                                            )}

                                            {/* Regular Admin view (ReadOnly for now or limited) */}
                                            {user.role === 'admin' && profile.global_role === 'member' && (
                                                <span className="text-dim">Sem permissão</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProfiles.length === 0 && (
                        <div className="empty-state">
                            Nenhum membro encontrado.
                        </div>
                    )}
                </div>
            )}

            <div className="um-footer">
                <AlertTriangle size={14} className="text-warning" />
                <span>Cuidado: Super Admins têm controle total sobre o sistema.</span>
            </div>
        </div>
    );
}
