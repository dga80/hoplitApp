import { useState, useEffect } from 'react';
import { getHistory, clearHistory } from '../utils/storage';
import './ProgressView.css';

export default function ProgressView() {
    const [history, setHistory] = useState({});

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        setHistory(getHistory());
    };

    const handleClearHistory = () => {
        if (clearHistory()) {
            loadHistory();
        }
    };

    const historyDates = Object.keys(history).sort().reverse();

    return (
        <div className="progress-view">
            <div className="progress-header">
                <h1 className="gradient-text">Progreso de Entrenamientos</h1>
                <p className="progress-subtitle">Historial completo de tus sesiones</p>

                {historyDates.length > 0 && (
                    <button className="btn btn-secondary" onClick={handleClearHistory}>
                        🗑️ Limpiar Historial
                    </button>
                )}
            </div>

            {historyDates.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="empty-icon">📊</div>
                    <h2>No hay entrenamientos registrados</h2>
                    <p>Comienza a registrar pesos en la sección de Entrenamiento</p>
                </div>
            ) : (
                <div className="history-timeline">
                    {historyDates.map((date) => {
                        const workouts = history[date];
                        const dateObj = new Date(date);
                        const formattedDate = dateObj.toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });

                        return (
                            <div key={date} className="timeline-day glass-card fade-in">
                                <div className="timeline-date">
                                    <span className="date-badge">{formattedDate}</span>
                                    <span className="workout-count">{workouts.length} ejercicios</span>
                                </div>

                                <div className="timeline-workouts">
                                    {workouts.map((workout, index) => (
                                        <div key={index} className="timeline-workout">
                                            <div className="workout-info">
                                                <span className="workout-name">{workout.exerciseName}</span>
                                                <span className="workout-weight">{workout.weight}kg</span>
                                            </div>
                                            <div className="workout-time">
                                                {new Date(workout.timestamp).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
