import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Graphique en barres pour les effectifs par équipe
export const EmployeesByTeamChart = ({ data }) => {
  const chartData = {
    labels: ['Équipe Matin', 'Équipe Soir', 'Équipe Nuit', 'Équipe Normal'],
    datasets: [
      {
        label: 'Effectif',
        data: data || [25, 20, 15, 25],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(139, 92, 246, 0.8)', // Purple
          'rgba(245, 158, 11, 0.8)', // Yellow
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Effectif par Type d\'Équipe',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1F2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Graphique circulaire pour la disponibilité des bus
export const BusAvailabilityChart = ({ available = 8, total = 12 }) => {
  const used = total - available;
  
  const chartData = {
    labels: ['Bus Disponibles', 'Bus Utilisés'],
    datasets: [
      {
        data: [available, used],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green for available
          'rgba(239, 68, 68, 0.8)',  // Red for used
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: `Disponibilité Bus (${available}/${total})`,
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1F2937',
        padding: {
          bottom: 20,
        },
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

// Graphique linéaire pour l'évolution des effectifs
export const EmployeeTrendChart = ({ data }) => {
  const chartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'CDI',
        data: data?.cdi || [45, 48, 47, 49, 52, 51],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Intérimaires',
        data: data?.interim || [12, 15, 18, 20, 23, 25],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: 'Évolution des Effectifs',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1F2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return <Line data={chartData} options={options} />;
};

// Graphique pour l'occupation des circuits
export const CircuitOccupancyChart = ({ data }) => {
  const chartData = {
    labels: ['Circuit Nord', 'Circuit Sud', 'Circuit Est', 'Circuit Ouest'],
    datasets: [
      {
        label: 'Employés',
        data: data?.employees || [25, 20, 18, 22],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'Capacité Max',
        data: data?.capacity || [30, 25, 25, 28],
        backgroundColor: 'rgba(156, 163, 175, 0.4)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: 'Occupation des Circuits',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#1F2937',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        ticks: {
          color: '#6B7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

// Heatmap simple pour les points de ramassage (simulation)
export const PickupHeatmapChart = () => {
  // Simulation d'une heatmap avec des données factices
  const heatmapData = [
    { zone: 'Zone A', frequency: 85, color: 'bg-red-500' },
    { zone: 'Zone B', frequency: 67, color: 'bg-orange-500' },
    { zone: 'Zone C', frequency: 45, color: 'bg-yellow-500' },
    { zone: 'Zone D', frequency: 23, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Points de Ramassage Fréquents</h3>
      <div className="grid grid-cols-2 gap-4">
        {heatmapData.map((zone, index) => (
          <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{zone.zone}</span>
              <div className={`w-4 h-4 rounded-full ${zone.color}`}></div>
            </div>
            <div className="text-sm text-gray-600">{zone.frequency} passages/jour</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${zone.color}`}
                style={{ width: `${zone.frequency}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Faible</span>
        <div className="flex space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <div className="w-4 h-4 bg-red-500 rounded"></div>
        </div>
        <span>Élevé</span>
      </div>
    </div>
  );
};

// Composant conteneur pour plusieurs graphiques
export const StatsContainer = ({ children, title, className = "" }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>}
      <div className="h-80">
        {children}
      </div>
    </div>
  );
}; 