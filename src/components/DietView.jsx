import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/Auth';
import { dietData as defaultDietData } from '../data/dietData';
import Loading from './Loading';
import './DietView.css';

export default function DietView() {
    const { user } = useAuth();
    const [activeDay, setActiveDay] = useState('training'); // 'training' or 'rest'
    const [loading, setLoading] = useState(true);
    const [dietDays, setDietDays] = useState({}); // { training: {id, meals: []}, rest: {id, meals: []} }

    useEffect(() => {
        if (user) {
            fetchDietData();
        }
    }, [user]);

    const fetchDietData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Diet Days
            let { data: days, error: daysError } = await supabase
                .from('diet_days')
                .select('*')
                .eq('user_id', user.id);

            if (daysError) throw daysError;

            // 2. If no data, seed it
            if (!days || days.length === 0) {
                await seedDietData();
                return;
            }

            // 3. Fetch meals for these days
            const daysMap = {};
            for (const day of days) {
                const { data: meals, error: mealsError } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('diet_day_id', day.id)
                    .order('order', { ascending: true });

                if (mealsError) throw mealsError;

                daysMap[day.type] = {
                    ...day,
                    meals: meals
                };
            }

            setDietDays(daysMap);
        } catch (error) {
            console.error('Error fetching diet:', error);
        } finally {
            setLoading(false);
        }
    };

    const seedDietData = async () => {
        try {
            console.log("Seeding default data...");
            // Insert Training Day
            const { data: trainingDay, error: tdError } = await supabase
                .from('diet_days')
                .insert({ user_id: user.id, name: defaultDietData.training.title, type: 'training' })
                .select()
                .single();
            if (tdError) throw tdError;

            // Insert Training Meals
            const trainingMeals = defaultDietData.training.meals.map((m, i) => ({
                diet_day_id: trainingDay.id,
                time: m.time,
                name: m.name,
                foods: m.foods,
                quantity: m.quantity,
                notes: m.notes,
                order: i
            }));
            const { error: tmError } = await supabase.from('meals').insert(trainingMeals);
            if (tmError) throw tmError;

            // Insert Rest Day
            const { data: restDay, error: rdError } = await supabase
                .from('diet_days')
                .insert({ user_id: user.id, name: defaultDietData.rest.title, type: 'rest' })
                .select()
                .single();
            if (rdError) throw rdError;

            // Insert Rest Meals
            const restMeals = defaultDietData.rest.meals.map((m, i) => ({
                diet_day_id: restDay.id,
                time: m.time,
                name: m.name,
                foods: m.foods,
                quantity: m.quantity,
                notes: m.notes,
                order: i
            }));
            const { error: rmError } = await supabase.from('meals').insert(restMeals);
            if (rmError) throw rmError;

            // Re-fetch after seeding
            fetchDietData();
        } catch (error) {
            console.error("Error seeding data:", error);
        }
    };

    const currentDiet = dietDays[activeDay];

    if (loading) return <Loading type="mini" />;
    if (!currentDiet) return <div className="loading-state">No hay datos de dieta.</div>;

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
                {currentDiet.meals.map((meal) => (
                    <div key={meal.id} className="meal-card glass-card fade-in">
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
