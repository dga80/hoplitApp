import { useState, useEffect } from 'react';
import { trainingData } from '../data/trainingData';
import { saveWorkoutCompletion, getWorkouts, saveWeight, getWeightLogs, getLatestWeight } from '../utils/storage';
import './TrainingView.css';

export default function TrainingView() {
    const [activeDay, setActiveDay] = useState('monday');
    const [workouts, setWorkouts] = useState({});
    const [weights, setWeights] = useState({});
    const [showGlossary, setShowGlossary] = useState(false);

    useEffect(() => {
        setWorkouts(getWorkouts());
    }, []);

    const handleCheckbox = (exerciseId) => {
        const newCompleted = !workouts[exerciseId]?.completed;
        saveWorkoutCompletion(exerciseId, newCompleted);
        setWorkouts(getWorkouts());
    };

    const handleWeightSubmit = (exerciseId, exerciseName) => {
        const weight = weights[exerciseId];
        if (weight && weight > 0) {
            saveWeight(exerciseId, exerciseName, weight);
            setWeights({ ...weights, [exerciseId]: '' });
            alert(`✅ Peso guardado: ${weight}kg para ${exerciseName}`);
        }
    };

    const currentTraining = trainingData[activeDay];

    return (
        <div className="training-view">
            <div className="training-header">
                <h1 className="gradient-text">Programa de Entrenamiento</h1>
                <p className="training-subtitle">Sistema Hoplita - 3 días por semana</p>

                <div className="training-toggle">
                    <button
                        className={`btn btn-secondary ${activeDay === 'monday' ? 'active' : ''}`}
                        onClick={() => setActiveDay('monday')}
                    >
                        LUN - Empuje
                    </button>
                    <button
                        className={`btn btn-secondary ${activeDay === 'wednesday' ? 'active' : ''}`}
                        onClick={() => setActiveDay('wednesday')}
                    >
                        MIÉ - Tirón
                    </button>
                    <button
                        className={`btn btn-secondary ${activeDay === 'friday' ? 'active' : ''}`}
                        onClick={() => setActiveDay('friday')}
                    >
                        VIE - Híbrido
                    </button>
                </div>
            </div>

            <div className="exercises-list">
                {currentTraining.exercises.map((exercise, index) => {
                    const isCompleted = workouts[exercise.id]?.completed;
                    const weightHistory = getWeightLogs(exercise.id);
                    const latestWeight = getLatestWeight(exercise.id);

                    return (
                        <div key={exercise.id} className="exercise-card glass-card fade-in" style={{ '--i': index }}>
                            <div className="exercise-header">
                                <input
                                    type="checkbox"
                                    checked={isCompleted || false}
                                    onChange={() => handleCheckbox(exercise.id)}
                                    className="exercise-checkbox"
                                />
                                <div className="exercise-title">
                                    <h3>{exercise.name}</h3>
                                    {latestWeight && (
                                        <span className="latest-weight">Último: {latestWeight}kg</span>
                                    )}
                                </div>
                            </div>

                            <div className="exercise-details">
                                <div className="detail-item">
                                    <span className="detail-label">Series/Reps:</span>
                                    <span className="detail-value">{exercise.sets}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Descanso:</span>
                                    <span className="detail-value">{exercise.rest}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">RIR:</span>
                                    <span className="detail-value rir-badge">{exercise.rir}</span>
                                </div>
                            </div>

                            <div className="exercise-notes">
                                <span className="notes-icon">📝</span>
                                <span>{exercise.notes}</span>
                            </div>

                            <div className="weight-input-section">
                                <input
                                    type="number"
                                    placeholder="Peso usado (kg)"
                                    value={weights[exercise.id] || ''}
                                    onChange={(e) => setWeights({ ...weights, [exercise.id]: e.target.value })}
                                    className="weight-input"
                                    step="0.5"
                                    min="0"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleWeightSubmit(exercise.id, exercise.name)}
                                    disabled={!weights[exercise.id]}
                                >
                                    💪 Guardar Peso
                                </button>
                            </div>

                            {weightHistory.length > 0 && (
                                <div className="weight-history">
                                    <div className="history-header">Historial de Pesos:</div>
                                    <div className="history-items">
                                        {weightHistory.slice(-3).reverse().map((log, i) => (
                                            <div key={i} className="history-item">
                                                <span className="history-weight">{log.weight}kg</span>
                                                <span className="history-date">
                                                    {new Date(log.date).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="glossary-section">
                <button
                    className="btn btn-secondary glossary-toggle"
                    onClick={() => setShowGlossary(!showGlossary)}
                >
                    {showGlossary ? '📖 Ocultar Glosario' : '📖 Mostrar Glosario'}
                </button>

                {showGlossary && (
                    <div className="glossary-content glass-card fade-in">
                        <div className="glossary-item">
                            <h3>{trainingData.glossary.rir.title}</h3>
                            {trainingData.glossary.rir.items.map((item, i) => (
                                <p key={i}>• {item}</p>
                            ))}
                        </div>

                        <div className="glossary-item">
                            <h3>{trainingData.glossary.progression.title}</h3>
                            {trainingData.glossary.progression.items.map((item, i) => (
                                <p key={i}>{item}</p>
                            ))}
                        </div>

                        <div className="glossary-item">
                            <h3>{trainingData.glossary.tempo.title}</h3>
                            {trainingData.glossary.tempo.items.map((item, i) => (
                                <p key={i}>• {item}</p>
                            ))}
                        </div>

                        <div className="pro-tip">
                            <span className="pro-tip-icon">🔥</span>
                            <strong>Consejo PRO:</strong> {trainingData.glossary.proTip}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
