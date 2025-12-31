import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/Auth';
import Loading from './Loading';
import './ProgressView.css';

export default function ProgressView() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [gymDays, setGymDays] = useState([]); // Array of date strings 'YYYY-MM-DD'
    const [streak, setStreak] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);

    // Core exercises to track
    const CORE_EXERCISES = ['Sentadilla Trasera', 'Press Banca Plano', 'Peso Muerto Conv.', 'Press Militar'];

    useEffect(() => {
        if (user) {
            fetchProgress();
        }
    }, [user]);

    const fetchProgress = async () => {
        try {
            setLoading(true);

            // Fetch logs with routine info
            const { data: logs, error } = await supabase
                .from('exercise_logs')
                .select(`date, weight, completed, exercises (name, routine_id, training_routines (day_name))`)
                .eq('user_id', user.id)
                .order('date', { ascending: true });

            if (error) throw error;

            // Gym Days: Map date to day type (monday/wednesday/friday)
            // We use a Map to handle multiple logs per day, prioritizing if needed
            const daysMap = new Map();

            logs.forEach(l => {
                if (l.completed || (l.weight && l.weight > 0)) {
                    // Normalize to YYYY-MM-DD
                    const dateVal = l.date.includes('T') ? l.date.split('T')[0] : l.date;
                    const dayType = l.exercises?.training_routines?.day_name; // 'monday', 'wednesday', 'friday'

                    if (!daysMap.has(dateVal)) {
                        daysMap.set(dateVal, dayType);
                    }
                }
            });

            // Convert to array of objects for easier consumption { date: 'YYYY-MM-DD', type: 'monday' }
            const sortedDays = Array.from(daysMap.entries()).map(([date, type]) => ({ date, type })).sort((a, b) => a.date.localeCompare(b.date));
            setGymDays(sortedDays);

            // Streak (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentWorkouts = sortedDays.filter(d => new Date(d.date) >= thirtyDaysAgo).length;
            setStreak(recentWorkouts);

            // Chart Data: Dynamically include all exercises with weight history
            const dataMap = {};

            logs.forEach(log => {
                const exName = log.exercises?.name;
                if (exName && log.weight > 0) {
                    if (!dataMap[exName]) {
                        dataMap[exName] = [];
                    }
                    dataMap[exName].push({ date: log.date, weight: Number(log.weight) });
                }
            });

            setChartData(Object.entries(dataMap).map(([name, history]) => ({
                name,
                history
            })));

        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Helper Components
    const CalendarModal = ({ days, onClose }) => {
        const today = new Date();
        const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

        const getDaysInMonth = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

            // Adjust for Monday start (0 = Mon, 6 = Sun)
            const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

            const daysArray = [];
            // Padding
            for (let i = 0; i < adjustedFirstDay; i++) daysArray.push(null);
            // Days
            for (let i = 1; i <= daysInMonth; i++) daysArray.push(new Date(year, month, i));
            return daysArray;
        };

        const monthDays = getDaysInMonth(currentDate);
        const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        const changeMonth = (delta) => {
            const newDate = new Date(currentDate);
            newDate.setMonth(newDate.getMonth() + delta);
            setCurrentDate(newDate);
        };

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                    <div className="calendar-header">
                        <button onClick={() => changeMonth(-1)}>&lt;</button>
                        <h3>{monthName}</h3>
                        <button onClick={() => changeMonth(1)}>&gt;</button>
                    </div>
                    <div className="calendar-grid">
                        <div className="cal-day-header">L</div>
                        <div className="cal-day-header">M</div>
                        <div className="cal-day-header">X</div>
                        <div className="cal-day-header">J</div>
                        <div className="cal-day-header">V</div>
                        <div className="cal-day-header">S</div>
                        <div className="cal-day-header">D</div>
                        {monthDays.map((date, i) => {
                            if (!date) return <div key={i} className="cal-day empty"></div>;

                            // Format date as YYYY-MM-DD manually to avoid timezone shifts
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const dateStr = `${year}-${month}-${day}`;

                            // Find if this date is in gymDays array (which is now objects {date, type})
                            const gymDayObj = days.find(d => d.date === dateStr);
                            const isGymDay = !!gymDayObj;
                            const dayTypeClass = gymDayObj ? `type-${gymDayObj.type}` : '';
                            const isToday = date.toDateString() === today.toDateString();

                            return (
                                <div key={i} className={`cal-day ${isGymDay ? 'active' : ''} ${dayTypeClass} ${isToday ? 'today' : ''}`}>
                                    {date.getDate()}
                                </div>
                            );
                        })}
                    </div>
                    <button className="close-btn" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        );
    };

    // SVG Line Chart Component
    const SimpleLineChart = ({ data, color = '#6366f1' }) => {
        if (!data || data.length === 0) return null;

        const height = 200;
        const width = 300; // viewBox width
        const padding = 20;

        const maxVal = Math.max(...data.map(d => d.weight)) * 1.1; // +10% headroom
        const minVal = Math.min(...data.map(d => d.weight)) * 0.9;

        // Normalize X (index) and Y (weight)
        const getX = (index) => padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
        const getY = (val) => height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);

        const points = data.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="line-chart">
                {/* Grid Lines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="1" />

                {/* The Line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    points={points}
                />

                {/* Data Points */}
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={getX(i)}
                        cy={getY(d.weight)}
                        r="4"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                    />
                ))}

                {/* Labels for last point */}
                <text
                    x={width - padding}
                    y={getY(data[data.length - 1].weight) - 10}
                    fill="white"
                    fontSize="12"
                    textAnchor="end"
                >
                    {data[data.length - 1].weight}kg
                </text>
            </svg>
        );
    };

    if (loading) return <Loading type="mini" />;

    return (
        <div className="progress-view">
            <div className="progress-header">
                <h1 className="gradient-text">Panel de Rendimiento</h1>
                <p className="progress-subtitle">Constancia y Fuerza</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-value">{streak}</div>
                    <div className="stat-label">Sesiones (Últimos 30 días)</div>
                </div>
                <div className="stat-card glass-card clickable" onClick={() => setShowCalendar(true)}>
                    <div className="stat-value">{gymDays.length}</div>
                    <div className="stat-label">Calendario Histórico</div>
                </div>
            </div>

            <div className="charts-section">
                <h2 className="section-title">Progresión de Fuerza</h2>

                {chartData.every(c => c.history.length === 0) ? (
                    <div className="empty-chart glass-card">
                        <p>Aún no hay registros de peso en los ejercicios básicos.</p>
                    </div>
                ) : (
                    <div className="charts-grid">
                        {chartData.map((chart) => chart.history.length > 0 && (
                            <div key={chart.name} className="chart-card glass-card">
                                <h3>{chart.name}</h3>
                                <SimpleLineChart data={chart.history} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCalendar && <CalendarModal days={gymDays} onClose={() => setShowCalendar(false)} />}
        </div>
    );
}
