const STORAGE_KEYS = {
    WORKOUTS: 'hoplitapp_workouts',
    WEIGHTS: 'hoplitapp_weights',
    HISTORY: 'hoplitapp_history'
};

// Save workout completion
export const saveWorkoutCompletion = (exerciseId, completed) => {
    const workouts = getWorkouts();
    workouts[exerciseId] = {
        completed,
        date: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
};

// Get all workout completions
export const getWorkouts = () => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : {};
};

// Save weight log
export const saveWeight = (exerciseId, exerciseName, weight) => {
    const weights = getWeights();
    if (!weights[exerciseId]) {
        weights[exerciseId] = {
            name: exerciseName,
            logs: []
        };
    }
    weights[exerciseId].logs.push({
        weight: parseFloat(weight),
        date: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));

    // Also save to history
    addToHistory(exerciseId, exerciseName, weight);
};

// Get weight logs for an exercise
export const getWeightLogs = (exerciseId) => {
    const weights = getWeights();
    return weights[exerciseId]?.logs || [];
};

// Get all weights
export const getWeights = () => {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
    return data ? JSON.parse(data) : {};
};

// Add to workout history
const addToHistory = (exerciseId, exerciseName, weight) => {
    const history = getHistory();
    const today = new Date().toISOString().split('T')[0];

    if (!history[today]) {
        history[today] = [];
    }

    history[today].push({
        exerciseId,
        exerciseName,
        weight: parseFloat(weight),
        timestamp: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

// Get workout history
export const getHistory = () => {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : {};
};

// Clear all history
export const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        localStorage.removeItem(STORAGE_KEYS.WEIGHTS);
        localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
        return true;
    }
    return false;
};

// Get latest weight for exercise
export const getLatestWeight = (exerciseId) => {
    const logs = getWeightLogs(exerciseId);
    if (logs.length === 0) return null;
    return logs[logs.length - 1].weight;
};
