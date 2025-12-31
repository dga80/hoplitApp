import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/Auth';
import { trainingData as defaultTrainingData } from '../data/trainingData';
import Loading from './Loading';
import './TrainingView.css';

export default function TrainingView() {
    const { user } = useAuth();
    const [activeDay, setActiveDay] = useState('monday');
    const [routines, setRoutines] = useState({});
    const [logs, setLogs] = useState({}); // Map: exercise_id -> { completed: bool, weight: val, history: [] }
    const [inputWeights, setInputWeights] = useState({});
    const [showGlossary, setShowGlossary] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchTrainingData();
        }
    }, [user, activeDay]); // Refetch when changing day to ensure fresh logs? Or just fetch all once.

    const fetchTrainingData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Routines
            const { data: routinesData, error: routinesError } = await supabase
                .from('training_routines')
                .select('*')
                .eq('user_id', user.id);

            if (routinesError) throw routinesError;

            if (!routinesData || routinesData.length === 0) {
                await seedTrainingData();
                return;
            }

            // 2. Build Routines Map & Fetch Exercises
            const routinesMap = {};
            const allExerciseIds = [];

            for (const routine of routinesData) {
                const { data: exercises, error: exercisesError } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('routine_id', routine.id)
                    .order('order', { ascending: true });

                if (exercisesError) throw exercisesError;

                routinesMap[routine.day_name] = {
                    ...routine,
                    exercises: exercises
                };

                exercises.forEach(ex => allExerciseIds.push(ex.id));
            }

            setRoutines(routinesMap);

            // 3. Fetch Logs (History & Today's Status) for ALL exercises
            if (allExerciseIds.length > 0) {
                const { data: logsData, error: logsError } = await supabase
                    .from('exercise_logs')
                    .select('*')
                    .in('exercise_id', allExerciseIds)
                    .eq('user_id', user.id)
                    .order('date', { ascending: false }); // Newest first

                if (logsError) throw logsError;

                // Process logs
                const logsMap = {};
                const today = new Date().toISOString().split('T')[0];

                allExerciseIds.forEach(id => {
                    const exerciseLogs = logsData.filter(l => l.exercise_id === id);
                    const todayLog = exerciseLogs.find(l => l.date === today);

                    logsMap[id] = {
                        completed: todayLog ? todayLog.completed : false,
                        todayLogId: todayLog ? todayLog.id : null,
                        lastWeight: exerciseLogs.find(l => l.weight > 0)?.weight || null,
                        history: exerciseLogs.filter(l => l.weight > 0)
                    };
                });
                setLogs(logsMap);
            }

        } catch (error) {
            console.error("Error fetching training:", error);
        } finally {
            setLoading(false);
        }
    };

    const seedTrainingData = async () => {
        try {
            console.log("Seeding training data...");
            const daysMap = { monday: 'monday', wednesday: 'wednesday', friday: 'friday' };
            for (const dayKey of Object.keys(daysMap)) {
                if (dayKey === 'glossary') continue;
                const dayData = defaultTrainingData[dayKey];
                const { data: routine, error: rError } = await supabase
                    .from('training_routines')
                    .insert({ user_id: user.id, day_label: dayData.day, day_name: dayKey, type: dayData.type })
                    .select().single();
                if (rError) throw rError;

                const exercisesToInsert = dayData.exercises.map((ex, index) => ({
                    routine_id: routine.id,
                    name: ex.name, sets: ex.sets, rest: ex.rest, rir: ex.rir, notes: ex.notes, "order": index
                }));
                const { error: exError } = await supabase.from('exercises').insert(exercisesToInsert);
                if (exError) throw exError;
            }
            fetchTrainingData();
        } catch (error) {
            console.error("Error seeding:", error);
        }
    };

    const handleCheckbox = async (exerciseId) => {
        const currentStatus = logs[exerciseId]?.completed || false;
        const newStatus = !currentStatus;
        const todayLogId = logs[exerciseId]?.todayLogId;
        const today = new Date().toISOString().split('T')[0];

        setLogs(prev => ({
            ...prev,
            [exerciseId]: { ...prev[exerciseId], completed: newStatus }
        }));

        try {
            if (todayLogId) {
                await supabase.from('exercise_logs').update({ completed: newStatus }).eq('id', todayLogId);
            } else {
                const { data, error } = await supabase.from('exercise_logs').insert({
                    user_id: user.id,
                    exercise_id: exerciseId,
                    date: today,
                    completed: newStatus
                }).select().single();

                if (error) throw error;

                setLogs(prev => ({
                    ...prev,
                    [exerciseId]: { ...prev[exerciseId], todayLogId: data.id }
                }));
            }
        } catch (err) {
            console.error("Error toggling check:", err);
            setLogs(prev => ({
                ...prev,
                [exerciseId]: { ...prev[exerciseId], completed: currentStatus }
            }));
        }
    };

    const handleWeightSubmit = async (exerciseId, exerciseName) => {
        const weightVal = inputWeights[exerciseId];
        if (!weightVal || weightVal <= 0) return;

        const todayLogId = logs[exerciseId]?.todayLogId;
        const today = new Date().toISOString().split('T')[0];

        try {
            if (todayLogId) {
                await supabase.from('exercise_logs').update({ weight: weightVal }).eq('id', todayLogId);
            } else {
                const { data, error } = await supabase.from('exercise_logs').insert({
                    user_id: user.id,
                    exercise_id: exerciseId,
                    date: today,
                    weight: weightVal,
                    completed: false
                }).select().single();
                if (error) throw error;

                setLogs(prev => ({
                    ...prev,
                    [exerciseId]: { ...prev[exerciseId], todayLogId: data.id }
                }));
            }

            setInputWeights(prev => ({ ...prev, [exerciseId]: '' }));
            fetchTrainingData();
        } catch (err) {
            console.error("Error saving weight:", err);
        }
    };

    const handleDeleteAllData = async () => {
        if (!window.confirm("⚠️ ATENCIÓN: ¿Estás seguro de que quieres borrar TODOS tus datos de entrenamiento y progreso? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('exercise_logs')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            alert("✅ Todos los datos han sido eliminados.");
            fetchTrainingData();
        } catch (err) {
            console.error("Error deleting all data:", err);
            alert("Error al eliminar los datos.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWeight = async (logId, exerciseId, isCompleted) => {
        if (!window.confirm("¿Estás seguro de que quieres borrar este registro de peso?")) return;

        try {
            if (isCompleted) {
                await supabase.from('exercise_logs').update({ weight: null }).eq('id', logId);
            } else {
                await supabase.from('exercise_logs').delete().eq('id', logId);
            }
            fetchTrainingData();
        } catch (err) {
            console.error("Error deleting weight:", err);
            alert("Error al borrar el peso");
        }
    };

    const currentRoutine = routines[activeDay];
    const glossary = defaultTrainingData.glossary;

    if (loading) return <Loading type="mini" />;
    if (!currentRoutine) return <div className="loading-state">No hay datos.</div>;

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
                        Día 1 - Empuje
                    </button>
                    <button
                        className={`btn btn-secondary ${activeDay === 'wednesday' ? 'active' : ''}`}
                        onClick={() => setActiveDay('wednesday')}
                    >
                        Día 2 - Tirón
                    </button>
                    <button
                        className={`btn btn-secondary ${activeDay === 'friday' ? 'active' : ''}`}
                        onClick={() => setActiveDay('friday')}
                    >
                        Día 3 - Híbrido
                    </button>
                </div>
            </div>

            <div className="exercises-list">
                {currentRoutine.exercises.map((exercise, index) => {
                    const logData = logs[exercise.id] || {};

                    return (
                        <div key={exercise.id} className="exercise-card glass-card fade-in" style={{ '--i': index }}>
                            <div className="exercise-header">
                                <input
                                    type="checkbox"
                                    checked={logData.completed || false}
                                    onChange={() => handleCheckbox(exercise.id)}
                                    className="exercise-checkbox"
                                />
                                <div className="exercise-title">
                                    <h3>{exercise.name}</h3>
                                    {logData.lastWeight && (
                                        <span className="latest-weight">Último: {logData.lastWeight}kg</span>
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
                                    placeholder="Peso (kg)"
                                    value={inputWeights[exercise.id] || ''}
                                    onChange={(e) => setInputWeights({ ...inputWeights, [exercise.id]: e.target.value })}
                                    className="weight-input"
                                    step="0.5"
                                    min="0"
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleWeightSubmit(exercise.id, exercise.name)}
                                    disabled={!inputWeights[exercise.id]}
                                >
                                    Guardar
                                </button>
                            </div>

                            {logData.history && logData.history.length > 0 && (
                                <div className="weight-history">
                                    <div className="history-header">Historial:</div>
                                    <div className="history-items">
                                        {logData.history.slice(0, 3).map((h, i) => (
                                            <div key={i} className="history-item">
                                                <div className="history-info">
                                                    <span className="history-weight">{h.weight}kg</span>
                                                    <span className="history-date">
                                                        {new Date(h.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                                    </span>
                                                </div>
                                                <button
                                                    className="delete-weight-btn"
                                                    onClick={() => handleDeleteWeight(h.id, exercise.id, h.completed)}
                                                    title="Borrar peso"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
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
                            <h3>{glossary.rir.title}</h3>
                            {glossary.rir.items.map((item, i) => <p key={i}>• {item}</p>)}
                        </div>
                        <div className="glossary-item">
                            <h3>{glossary.progression.title}</h3>
                            {glossary.progression.items.map((item, i) => <p key={i}>{item}</p>)}
                        </div>
                        <div className="glossary-item">
                            <h3>{glossary.tempo.title}</h3>
                            {glossary.tempo.items.map((item, i) => <p key={i}>• {item}</p>)}
                        </div>
                        <div className="pro-tip">
                            <span className="pro-tip-icon">🔥</span>
                            <strong>Consejo PRO:</strong> {glossary.proTip}
                        </div>
                    </div>
                )}
            </div>

            <div className="danger-zone">
                <button
                    className="btn-text-muted"
                    onClick={handleDeleteAllData}
                >
                    Reiniciar todos mis datos
                </button>
            </div>
        </div>
    );
}
