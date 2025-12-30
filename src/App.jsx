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
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z" />
                            </svg>
                            Dieta
                        </button>
                        <button
                            className={`nav-btn ${activeView === 'training' ? 'active' : ''}`}
                            onClick={() => setActiveView('training')}
                        >
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                {/* Handle */}
                                <rect x="8" y="11" width="8" height="2" rx="0.5" />
                                {/* Left Plates */}
                                <rect x="9" y="3" width="2.5" height="18" rx="1.25" />
                                <rect x="5.5" y="5.5" width="2.5" height="13" rx="1.25" />
                                <rect x="2" y="8" width="2.5" height="8" rx="1.25" />
                                {/* Right Plates */}
                                <rect x="12.5" y="3" width="2.5" height="18" rx="1.25" />
                                <rect x="16" y="5.5" width="2.5" height="13" rx="1.25" />
                                <rect x="19.5" y="8" width="2.5" height="8" rx="1.25" />
                            </svg>
                            Entrenamiento
                        </button>
                        <button
                            className={`nav-btn ${activeView === 'progress' ? 'active' : ''}`}
                            onClick={() => setActiveView('progress')}
                        >
                            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            Progreso
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
