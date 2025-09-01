import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiEye,
  FiClock,
  FiMapPin,
  FiTruck,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiX
} from 'react-icons/fi';

const PlanningCalendarView = () => {
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [filterChef, setFilterChef] = useState('all');
  const [filterAtelier, setFilterAtelier] = useState('all');
  const [loading, setLoading] = useState(true);

  // Charger les plannings depuis l'API
  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/plannings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setPlannings(data);
        setFilteredPlannings(data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des plannings:', error);
        setLoading(false);
      }
    };

    fetchPlannings();
  }, []);

  // Filtrer les plannings
  useEffect(() => {
    let filtered = plannings;

    if (filterChef !== 'all') {
      filtered = filtered.filter(p => p.created_by_name === filterChef);
    }

    if (filterAtelier !== 'all') {
      filtered = filtered.filter(p => p.atelier === filterAtelier);
    }

    setFilteredPlannings(filtered);
  }, [plannings, filterChef, filterAtelier]);

  // Générer le calendrier du mois
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Obtenir les plannings pour une date donnée
  const getPlanningsForDate = (date) => {
    return filteredPlannings.filter(planning => {
      if (!planning.date_debut) return false;
      const planningDate = new Date(planning.date_debut);
      return (
        planningDate.getDate() === date.getDate() &&
        planningDate.getMonth() === date.getMonth() &&
        planningDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigation du calendrier
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/plannings/export/csv', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plannings_calendar_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Erreur lors de l\'export CSV');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  // Obtenir les options de filtrage
  const getChefOptions = () => {
    const chefs = [...new Set(plannings.map(p => p.created_by_name).filter(Boolean))];
    return chefs.sort();
  };

  const getAtelierOptions = () => {
    const ateliers = [...new Set(plannings.map(p => p.atelier).filter(Boolean))];
    return ateliers.sort();
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendrier des Plannings</h1>
          <p className="text-gray-600 mt-1">Visualisation des plannings créés par les chefs d'atelier</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="btn-primary flex items-center space-x-2"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <FiFilter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chef d'Atelier</label>
            <select
              value={filterChef}
              onChange={(e) => setFilterChef(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous les chefs</option>
              {getChefOptions().map(chef => (
                <option key={chef} value={chef}>{chef}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Atelier</label>
            <select
              value={filterAtelier}
              onChange={(e) => setFilterAtelier(e.target.value)}
              className="input-field"
            >
              <option value="all">Tous les ateliers</option>
              {getAtelierOptions().map(atelier => (
                <option key={atelier} value={atelier}>{atelier}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredPlannings.length}</span> planning(s) trouvé(s)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation du calendrier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendrier */}
        <div className="p-6">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const dayPlannings = getPlanningsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    min-h-[80px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'}
                    ${isToday ? 'border-blue-500 bg-blue-50' : ''}
                    ${dayPlannings.length > 0 ? 'border-green-300 bg-green-50' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  {dayPlannings.length > 0 && (
                    <div className="space-y-1">
                      {dayPlannings.slice(0, 2).map((planning, idx) => (
                        <motion.div
                          key={planning.id}
                          onClick={() => setSelectedPlanning(planning)}
                          className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                          whileHover={{ scale: 1.05 }}
                        >
                          {planning.nom}
                        </motion.div>
                      ))}
                      {dayPlannings.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayPlannings.length - 2} autre(s)
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de détails du planning */}
      <AnimatePresence>
        {selectedPlanning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Détails du Planning</h3>
                <button
                  onClick={() => setSelectedPlanning(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedPlanning.nom}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    
                    <div className="flex items-center space-x-2">
                      <FiUsers className="h-4 w-4 text-gray-400" />
                      <span><strong>Créé par:</strong> {selectedPlanning.created_by_name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiTruck className="h-4 w-4 text-gray-400" />
                      <span><strong>Atelier:</strong> {selectedPlanning.atelier}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                      <span><strong>Date:</strong> {selectedPlanning.date_debut && new Date(selectedPlanning.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiClock className="h-4 w-4 text-gray-400" />
                      <span><strong>Horaire:</strong> {selectedPlanning.heure_debut} - {selectedPlanning.heure_fin}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiUsers className="h-4 w-4 text-gray-400" />
                      <span><strong>Équipe:</strong> {selectedPlanning.equipe}</span>
                    </div>

                    {selectedPlanning.point_ramassage && (
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="h-4 w-4 text-gray-400" />
                        <span><strong>Point de ramassage:</strong> {selectedPlanning.point_ramassage}</span>
                      </div>
                    )}

                    {selectedPlanning.circuit && (
                      <div className="flex items-center space-x-2">
                        <FiTruck className="h-4 w-4 text-gray-400" />
                        <span><strong>Circuit:</strong> {selectedPlanning.circuit}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <FiFileText className="h-4 w-4 text-gray-400" />
                      <span><strong>Statut:</strong> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedPlanning.status === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedPlanning.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPlanning.created_at && (
                  <div className="text-xs text-gray-500 border-t pt-4">
                    Créé le {new Date(selectedPlanning.created_at).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanningCalendarView;