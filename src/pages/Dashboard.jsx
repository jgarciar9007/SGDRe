import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    Users,
    Clock,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useDocuments } from '../context/DocumentContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { documents } = useDocuments();

    // --- KPI CALCULATIONS ---
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const total = documents.length;

        let entradasMes = 0;
        let salidasMes = 0;
        let internosMes = 0;
        let withAttachments = 0;

        documents.forEach(doc => {
            const docDate = new Date(doc.registrationDate);
            const isThisMonth = docDate.getMonth() === currentMonth && docDate.getFullYear() === currentYear;

            if (isThisMonth) {
                if (doc.type === 'Entrada') entradasMes++;
                if (doc.type === 'Salida') salidasMes++;
                if (doc.type === 'Interno') internosMes++;
            }

            if ((doc.attachments && doc.attachments.length > 0) || doc.fileName) {
                withAttachments++;
            }
        });

        return [
            { label: 'Total Registros', value: total, trend: 'Activo', icon: <FileText />, color: '#003366' },
            { label: 'Entradas (Mes)', value: entradasMes, trend: 'Este mes', icon: <TrendingUp />, color: '#008037' },
            { label: 'Salidas (Mes)', value: salidasMes, trend: 'Este mes', icon: <ArrowUp />, color: '#f4b400' },
            { label: 'Internos (Mes)', value: internosMes, trend: 'Este mes', icon: <Users />, color: '#6366f1' },
            { label: 'Digitalizados', value: withAttachments, trend: `${((withAttachments / total || 0) * 100).toFixed(0)}%`, icon: <FileText />, color: '#64748b' },
        ];
    }, [documents]);

    // --- CHART CALCULATIONS ---

    // 1. Weekly Flow (Last 7 Days)
    const lineData = useMemo(() => {
        const labels = [];
        const dataPoints = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];

            // Label: e.g., "Lun 05"
            const dayName = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
            labels.push(dayName);

            // Count docs for this day
            const count = documents.filter(doc => doc.registrationDate === dayStr).length;
            dataPoints.push(count);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Movimientos Diarios',
                    data: dataPoints,
                    fill: true,
                    borderColor: '#003366',
                    backgroundColor: 'rgba(0, 51, 102, 0.05)',
                    tension: 0.4,
                },
            ],
        };
    }, [documents]);

    // 2. Monthly Comparison (Entradas vs Salidas vs Internos)
    const barData = useMemo(() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const entradasData = new Array(12).fill(0);
        const salidasData = new Array(12).fill(0);
        const internosData = new Array(12).fill(0);

        documents.forEach(doc => {
            const d = new Date(doc.registrationDate);
            if (d.getFullYear() === new Date().getFullYear()) {
                const monthIdx = d.getMonth();
                if (doc.type === 'Entrada') entradasData[monthIdx]++;
                if (doc.type === 'Salida') salidasData[monthIdx]++;
                if (doc.type === 'Interno') internosData[monthIdx]++;
            }
        });

        // Slice to current month + 1 just to show relevant history? Or show all year. Let's show all.

        return {
            labels: months,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradasData,
                    backgroundColor: '#008037',
                    borderRadius: 4,
                },
                {
                    label: 'Salidas',
                    data: salidasData,
                    backgroundColor: '#003366',
                    borderRadius: 4,
                },
                {
                    label: 'Internos',
                    data: internosData,
                    backgroundColor: '#6366f1',
                    borderRadius: 4,
                },
            ],
        };
    }, [documents]);

    return (
        <div className="dashboard-wrapper">
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card glass"
                    >
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <p>{stat.label}</p>
                            <h3>{stat.value}</h3>
                            <span className="trend-neutral">
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="charts-grid mt-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="chart-card glass p-6"
                >
                    <h3>Flujo Semanal de Documentos</h3>
                    <div className="chart-container">
                        <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="chart-card glass p-6"
                >
                    <h3>Comparativa Anual (Entrada/Salida)</h3>
                    <div className="chart-container">
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-sm);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info p {
          font-size: 0.85rem;
          color: var(--color-text-light);
          margin-bottom: 4px;
        }

        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--color-text);
        }

        .trend-neutral { color: var(--color-text-light); font-size: 0.8rem; font-weight: 600; }

        .mt-6 { margin-top: 32px; }
        .p-6 { padding: 32px; }

        .charts-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
        }

        .chart-card h3 {
          font-size: 1rem;
          margin-bottom: 24px;
          color: var(--color-text);
        }

        .chart-container {
          height: 300px;
        }

        @media (max-width: 1100px) {
          .charts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default Dashboard;
