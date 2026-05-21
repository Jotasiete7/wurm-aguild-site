import { Link } from 'react-router-dom';
import styles from './GuildUtilitiesPage.module.css'; // I will create a basic css module for this

export function GuildUtilitiesPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Guild Utilities Suite</h1>
                <p className={styles.subtitle}>Ferramentas operacionais para Wurm Online</p>
            </header>

            <div className={styles.grid}>
                <Link to="/guildutilities/craft-pulse" className={styles.card}>
                    <h2>Craft Pulse</h2>
                    <p>Timer operacional minimalista voltado para eficiência de crafting raro.</p>
                </Link>
                {/* Futuras ferramentas (forge timers, market alerts, etc) serão adicionadas aqui */}
            </div>
            
            <div style={{ marginTop: '2rem' }}>
                <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>&larr; Voltar para a Home</Link>
            </div>
        </div>
    );
}
