import { useState } from 'react';
import DietView from './components/DietView';
import TrainingView from './components/TrainingView';
import ProgressView from './components/ProgressView';
import './App.css';

function App() {
    const [activeView, setActiveView] = useState('diet');

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1 className="app-title">
                        <span className="gradient-text">💪 HoplitApp</span>
                    </h1>
                    <nav className="app-nav">
                        <button
                            className={`nav-btn ${activeView === 'diet' ? 'active' : ''}`}
                            onClick={() => setActiveView('diet')}
                        >
                            🥗 Dieta
                        </button>
                        <button
                            className={`nav-btn ${activeView === 'training' ? 'active' : ''}`}
                            onClick={() => setActiveView('training')}
                        >
                            🏋️ Entrenamiento
                        </button>
                        <button
                            className={`nav-btn ${activeView === 'progress' ? 'active' : ''}`}
                            onClick={() => setActiveView('progress')}
                        >
                            📈 Progreso
                        </button>
                    </nav>
                </div>
            </header>

            <main className="app-main">
                {activeView === 'diet' && <DietView />}
                {activeView === 'training' && <TrainingView />}
                {activeView === 'progress' && <ProgressView />}
            </main>

            <footer className="app-footer">
                <p>HoplitApp © 2025 - Tu camino hacia la mejor versión de ti mismo 🔥</p>
            </footer>
        </div>
    );
}

export default App;
