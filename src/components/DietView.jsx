import { useState } from 'react';
import { dietData } from '../data/dietData';
import './DietView.css';

export default function DietView() {
    const [activeDay, setActiveDay] = useState('training');
    const currentDiet = dietData[activeDay];

    return (
        <div className="diet-view">
            <div className="diet-header">
                <h1 className="gradient-text">Plan de Dieta Hoplita</h1>
                <p className="diet-subtitle">Nutrición optimizada para máximo rendimiento</p>

                <div className="diet-toggle">
                    <button
                        className={`btn btn-secondary ${activeDay === 'training' ? 'active' : ''}`}
                        onClick={() => setActiveDay('training')}
                    >
                        🔥 Día de Entreno
                    </button>
                    <button
                        className={`btn btn-secondary ${activeDay === 'rest' ? 'active' : ''}`}
                        onClick={() => setActiveDay('rest')}
                    >
                        💤 Día de Descanso
                    </button>
                </div>
            </div>

            <div className="meals-grid">
                {currentDiet.meals.map((meal, index) => (
                    <div key={index} className="meal-card glass-card fade-in">
                        <div className="meal-header">
                            <div className="meal-time">{meal.time}</div>
                            <div className="meal-name">{meal.name}</div>
                        </div>

                        <div className="meal-content">
                            <div className="meal-foods">
                                <span className="label">Alimentos:</span>
                                <span className="value">{meal.foods}</span>
                            </div>

                            <div className="meal-quantity">
                                <span className="label">Cantidad:</span>
                                <span className="value">{meal.quantity}</span>
                            </div>

                            {meal.notes && (
                                <div className="meal-notes">
                                    <span className="notes-icon">💡</span>
                                    <span>{meal.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
