
import { useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import type { Recipe } from '../../types';
import { Check, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './RecipeManagement.css';

export default function RecipeManagement() {
    const { user } = useAuth();
    const { data: recipes, update, remove, create } = useSupabase<Recipe>('recipes');
    const [pendingRecipes, setPendingRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        if (recipes) {
            setPendingRecipes(recipes.filter(r => r.status === 'pending'));
        }
    }, [recipes]);

    const handleApprove = async (id: string) => {
        if (confirm('Aprovar esta receita?')) {
            await update(id, { status: 'approved' });
        }
    };

    const handleReject = async (id: string) => {
        if (confirm('Rejeitar e remover esta receita?')) {
            await remove(id);
        }
    };

    // DEBUG: Create Mock Recipe
    const createMockRecipe = async () => {
        await create({
            name: 'Bolo de Teste ' + Math.floor(Math.random() * 100),
            ingredients: 'Farinha, Ovo, Leite',
            steps: 'Misture tudo e asse.',
            skill: 'Cooking',
            status: 'pending',
            author: user?.username || 'Dev'
        });
    };

    return (
        <div className="recipe-management-container glass">
            <div className="rm-header">
                <div>
                    <h3>Aprovação de Receitas</h3>
                    <span className="subtitle-architecture">Controle de Qualidade (Wurm cooking)</span>
                </div>
                {/* DEV ONLY BUTTON */}
                <button onClick={createMockRecipe} className="dev-btn">
                    <Plus size={14} /> Criar Teste
                </button>
            </div>

            <div className="recipe-list">
                {pendingRecipes.length === 0 ? (
                    <div className="empty-state">
                        <Check size={48} className="text-success" style={{ opacity: 0.5 }} />
                        <p>Tudo limpo! Nenhuma receita pendente.</p>
                    </div>
                ) : (
                    pendingRecipes.map(recipe => (
                        <div key={recipe.id} className="recipe-card-admin">
                            <div className="recipe-info">
                                <h4>{recipe.name}</h4>
                                <div className="meta">
                                    <span className="skill-tag">{recipe.skill}</span>
                                    <span className="author">por {recipe.author}</span>
                                </div>
                                <details>
                                    <summary>Ver Detalhes</summary>
                                    <div className="details-content">
                                        <p><strong>Ingredientes:</strong> {recipe.ingredients}</p>
                                        <p><strong>Passos:</strong> {recipe.steps}</p>
                                    </div>
                                </details>
                            </div>
                            <div className="recipe-actions">
                                <button onClick={() => handleApprove(recipe.id)} className="btn-approve" title="Aprovar">
                                    <Check size={18} />
                                </button>
                                <button onClick={() => handleReject(recipe.id)} className="btn-reject" title="Rejeitar">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
