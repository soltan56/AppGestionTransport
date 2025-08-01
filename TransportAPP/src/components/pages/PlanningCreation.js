import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  FiCalendar, 
  FiUsers, 
  FiSave, 
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiSettings,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiLock,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';
import WeekPlanningModal from './WeekPlanningModal';

const PlanningCreation = () => {
  const { user } = useAuth();
  const { employees, circuits, ateliers } = useData();
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [weeklyPlannings, setWeeklyPlannings] = useState({});
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0, isVisible: false });

  const loadExistingPlannings = async (year = selectedYear) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/weekly-plannings?year=${year}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const existingPlannings = await response.json();
        const planningsMap = {};
        
        for (let i = 0; i < existingPlannings.length; i++) {
          const planning = existingPlannings[i];
          const weekKey = `${planning.year}-W${planning.week_number}`;
          
          try {
            const detailResponse = await fetch(
              `http://localhost:3001/api/weekly-plannings/${planning.year}/${planning.week_number}`,
              { credentials: 'include' }
            );
            
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              planningsMap[weekKey] = detail.assignments || {};
            } else if (detailResponse.status === 429) {
              console.warn(`🔄 Erreur 429 pour semaine ${planning.week_number}, on passe...`);
            }
          } catch (error) {
            console.error(`Erreur chargement semaine ${planning.week_number}:`, error);
          }

         
          if (i < existingPlannings.length - 1) {
            await delay(200); 
          }
        }
        
        setWeeklyPlannings(planningsMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExistingPlannings();
  }, [selectedYear]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // L'utilisateur est revenu sur la page, recharger les données
        loadExistingPlannings();
      }
    };

    const handleFocus = () => {
      loadExistingPlannings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedYear]);

  const generateWeeks = (year) => {
    const weeks = [];
    for (let week = 1; week <= 53; week++) {
      const startDate = getDateOfWeek(week, year);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      weeks.push({
        number: week,
        startDate,
        endDate,
        label: `S${week}`,
        isCurrentWeek: isCurrentWeek(week, year)
      });
    }
    return weeks;
  };

  const getDateOfWeek = (week, year) => {
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const isCurrentWeek = (week, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    return year === currentYear && week === currentWeek;
  };

  const isPastWeek = (week, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    
    if (year < currentYear) return true;
    if (year === currentYear && week < currentWeek) return true;
    return false;
  };

  const isWeekEditable = (week, year) => {
    return !isPastWeek(week, year);
  };
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const weeks = generateWeeks(selectedYear);

  const handleWeekClick = (week) => {
    const weekKey = `${selectedYear}-W${week.number}`;
    const hasExistingPlanning = weeklyPlannings[weekKey] && Object.keys(weeklyPlannings[weekKey]).length > 0;
    
    
    
    // 2. OU il existe déjà un planning (modification)
    if (!isWeekEditable(week.number, selectedYear) && !hasExistingPlanning) {
      return; // Ne pas ouvrir pour les semaines passées sans planning
    }
    
    setSelectedWeek(week);
    setShowModal(true);
  };

  const getAvailableEmployees = () => {
    if (user?.role === 'administrateur') {
      return employees; 
    } else if (user?.role === 'chef') {
      return employees.filter(emp => 
        emp.atelier_chef_id === user.id || emp.atelier_chef_id === null
      );
    }
    return [];
  };

  const hasAssignments = (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    return weeklyPlannings[weekKey] && Object.keys(weeklyPlannings[weekKey]).length > 0;
  };
  const getWeekAssignmentsCount = (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    const weekPlanning = weeklyPlannings[weekKey];
    if (!weekPlanning) return 0;
    
    return Object.values(weekPlanning).reduce((total, teamEmployees) => {
      return total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0);
    }, 0);
  };

  const handleWeekPlanningUpdate = (weekNumber, assignments) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    
    
    setWeeklyPlannings(prev => ({
      ...prev,
      [weekKey]: assignments
    }));

    console.log(`📝 Planning semaine ${weekNumber} modifié localement (utiliser "Sauvegarder Tout" pour persister)`);
  };

  const handleDeletePlanning = async (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    
    try {
      
      const response = await fetch(`http://localhost:3001/api/weekly-plannings/${selectedYear}/${weekNumber}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        console.log(`🗑️ Planning semaine ${weekNumber} supprimé de la base de données`);
      } else if (response.status === 404) {
        console.log(`📝 Planning semaine ${weekNumber} n'existait que localement`);
      } else {
        console.warn(`⚠️ Erreur suppression base: ${response.status}`);
      }
    } catch (error) {
      console.warn(`⚠️ Erreur API suppression:`, error);
    }
    
    
    setWeeklyPlannings(prev => {
      const updated = { ...prev };
      delete updated[weekKey];
      return updated;
    });

    console.log(`🗑️ Planning semaine ${weekNumber} supprimé localement`);
  };

  const handleClearAllPlannings = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir effacer tous les plannings locaux ?\n\nCette action supprimera toutes les modifications non sauvegardées.')) {
      setWeeklyPlannings({});
      console.log('🗑️ Tous les plannings locaux effacés');
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const saveWithRetry = async (url, data, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (response.status === 429) {
          // Erreur 429, attendre avant de réessayer (délais plus longs)
          const waitTime = Math.min(2000 * attempt, 10000); // 2s, 4s, 10s max
          console.warn(`🔄 Tentative ${attempt}/${maxRetries} - Attente ${waitTime}ms...`);
          if (attempt < maxRetries) {
            await delay(waitTime);
            continue;
          }
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await delay(1000 * attempt);
      }
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      let savedCount = 0;
      let errors = 0;

      const planningsToSave = Object.entries(weeklyPlannings)
        .filter(([, assignments]) => Object.keys(assignments).length > 0);

      setSaveProgress({ current: 0, total: planningsToSave.length, isVisible: true });
      console.log(`🚀 Sauvegarde de ${planningsToSave.length} planning(s)...`);

      for (let i = 0; i < planningsToSave.length; i++) {
        const [weekKey, assignments] = planningsToSave[i];
        const [year, weekPart] = weekKey.split('-W');
        const week_number = parseInt(weekPart);

        try {
          console.log(`📅 Sauvegarde semaine ${week_number} (${i + 1}/${planningsToSave.length})...`);

          const response = await saveWithRetry('http://localhost:3001/api/weekly-plannings', {
            year: parseInt(year),
            week_number,
            assignments
          });

          if (response && response.ok) {
            savedCount++;
            console.log(`✅ Semaine ${week_number} sauvegardée`);
          } else {
            errors++;
            const errorText = response ? await response.text() : 'Erreur inconnue';
            console.error(`❌ Erreur semaine ${week_number}:`, errorText);
          }

          setSaveProgress(prev => ({ ...prev, current: i + 1 }));
        } catch (error) {
          errors++;
          console.error(`❌ Erreur semaine ${week_number}:`, error);
          setSaveProgress(prev => ({ ...prev, current: i + 1 }));
        }

        if (i < planningsToSave.length - 1) {
          await delay(1000); 
        }
      }

      if (errors === 0) {
        alert(`✅ ${savedCount} planning(s) sauvegardé(s) avec succès !`);
      } else {
        alert(`⚠️ ${savedCount} planning(s) sauvegardé(s), ${errors} erreur(s) rencontrée(s)`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSaveProgress({ current: 0, total: 0, isVisible: false });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <FiCalendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Plannings
              </h1>
              <p className="text-gray-600 mt-1">
                Créer et gérer les plannings hebdomadaires de vos équipes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear(selectedYear - 1)}
                disabled={selectedYear <= currentYear}
                className={`p-2 rounded-lg shadow-md transition-all ${
                  selectedYear <= currentYear 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:shadow-lg text-gray-600'
                }`}
              >
                <FiChevronLeft className="h-5 w-5" />
              </motion.button>
              
              <div className="bg-white px-4 py-2 rounded-lg shadow-md border">
                <span className="text-lg font-semibold text-gray-900">{selectedYear}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
              >
                <FiChevronRight className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>



            
            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              onClick={handleSaveAll}
              disabled={loading}
              className={`
                px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-white
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiSave className="h-5 w-5" />
              )}
              <span>{loading ? 'Sauvegarde en cours...' : 'Sauvegarder Tout'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Semaines planifiées</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(weeklyPlannings).length}/53
              </p>
            </div>
            <FiCalendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employés disponibles</p>
              <p className="text-2xl font-bold text-green-600">
                {getAvailableEmployees().length}
              </p>
            </div>
            <FiUsers className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Circuits actifs</p>
              <p className="text-2xl font-bold text-purple-600">{circuits.length}</p>
            </div>
            <FiMapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ateliers</p>
              <p className="text-2xl font-bold text-orange-600">{ateliers.length}</p>
            </div>
            <FiSettings className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-xl border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FiCalendar className="h-6 w-6" />
            <span>Planification Annuelle - {selectedYear}</span>
          </h2>
          <p className="text-blue-100 mt-1">
            Cliquez sur une semaine pour créer un nouveau planning ou modifier un planning existant
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-8 lg:grid-cols-12 xl:grid-cols-16 gap-3">
            {weeks.map((week) => {
              const hasPlanning = hasAssignments(week.number);
              const assignmentsCount = getWeekAssignmentsCount(week.number);
              const isPast = isPastWeek(week.number, selectedYear);
              const isEditable = isWeekEditable(week.number, selectedYear);
              const isClickable = isEditable || hasPlanning; // Modifiable si futur/actuel OU si planning existe
              
              return (
                <motion.div
                  key={week.number}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => handleWeekClick(week)}
                  onMouseEnter={() => setHoveredWeek(week.number)}
                  onMouseLeave={() => setHoveredWeek(null)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300 group
                    ${isPast && !hasPlanning
                      ? 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed opacity-60'
                      : isPast && hasPlanning
                        ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer shadow-md'
                        : week.isCurrentWeek 
                          ? 'border-blue-500 bg-blue-50 shadow-lg cursor-pointer' 
                          : hasPlanning
                            ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    }
                    ${hoveredWeek === week.number && isClickable ? 'shadow-lg transform scale-105' : 'shadow-sm'}
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      text-lg font-bold mb-1 flex items-center justify-center space-x-1
                      ${isPast && !hasPlanning
                        ? 'text-gray-500' 
                        : isPast && hasPlanning
                          ? 'text-orange-600'
                          : week.isCurrentWeek 
                            ? 'text-blue-600' 
                            : hasPlanning 
                              ? 'text-green-600' 
                              : 'text-gray-700'
                      }
                    `}>
                      <span>{week.label}</span>
                      {isPast && !hasPlanning && <FiLock className="h-3 w-3" />}
                      {isPast && hasPlanning && <FiEdit className="h-3 w-3" />}
                    </div>
                    <div className={`text-xs ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                      {week.startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    
                    {hasPlanning && (
                      <div className="mt-2">
                        <div className={`text-white text-xs px-2 py-1 rounded-full ${
                          isPast ? 'bg-orange-500' : 'bg-green-500'
                        }`}>
                          {assignmentsCount} employé{assignmentsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    {isPast && !hasPlanning && (
                      <div className="mt-1">
                        <div className="text-xs text-gray-400 font-medium">
                          Terminé
                        </div>
                      </div>
                    )}

                    {isPast && hasPlanning && (
                      <div className="mt-1">
                        <div className="text-xs text-orange-600 font-medium">
                          Modifiable
                        </div>
                      </div>
                    )}
                  </div>

                  
                  {week.isCurrentWeek && !isPast && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <FiClock className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  
                  {isPast && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <FiLock className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  
                  {isEditable && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
                  )}

                  
                  {isPast && (
                    <div className="absolute inset-0 bg-gray-600 opacity-5 rounded-xl"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white rounded-xl p-6 shadow-lg border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
            <span className="text-sm text-gray-600">Semaine actuelle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50"></div>
            <span className="text-sm text-gray-600">Planning configuré</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-50 relative">
              <FiEdit className="h-2 w-2 text-orange-600 absolute top-0.5 left-0.5" />
            </div>
            <span className="text-sm text-gray-600">Planning passé (modifiable)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Planning à configurer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 opacity-60 relative">
              <FiLock className="h-2 w-2 text-gray-500 absolute top-0.5 left-0.5" />
            </div>
            <span className="text-sm text-gray-600">Semaine passée (non modifiable)</span>
          </div>
        </div>
      </motion.div>

      
      {Object.keys(weeklyPlannings).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FiCalendar className="h-6 w-6 mr-3 text-blue-600" />
              Plannings Actifs ({Object.keys(weeklyPlannings).length})
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Année {selectedYear}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadExistingPlannings}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
              >
                <FiRefreshCw className="h-3 w-3" />
                <span>Recharger</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAllPlannings}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
              >
                <FiTrash2 className="h-3 w-3" />
                <span>Tout effacer</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(weeklyPlannings)
              .filter(([, assignments]) => Object.keys(assignments).length > 0)
              .sort(([a], [b]) => {
                const weekA = parseInt(a.split('-W')[1]);
                const weekB = parseInt(b.split('-W')[1]);
                return weekA - weekB;
              })
              .map(([weekKey, assignments]) => {
                const weekNumber = parseInt(weekKey.split('-W')[1]);
                const totalEmployees = Object.values(assignments).reduce((total, teamEmployees) => {
                  return total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0);
                }, 0);

                return (
                  <motion.div
                    key={weekKey}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      const week = generateWeeks(selectedYear).find(w => w.number === weekNumber);
                      setSelectedWeek(week);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          Semaine {weekNumber}
                        </h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                          Local
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          {totalEmployees} employés
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Supprimer le planning de la semaine ${weekNumber} ?\n\nCette action supprimera le planning localement et en base de données s'il existe.`)) {
                              await handleDeletePlanning(weekNumber);
                            }
                          }}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Supprimer ce planning"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(assignments).map(([teamName, employeeIds]) => {
                        if (!Array.isArray(employeeIds) || employeeIds.length === 0) return null;

                        const teamConfig = {
                          'Matin': { color: 'text-yellow-700 bg-yellow-100', icon: '🌅' },
                          'Soir': { color: 'text-purple-700 bg-purple-100', icon: '🌆' },
                          'Nuit': { color: 'text-indigo-700 bg-indigo-100', icon: '🌙' },
                          'Normal': { color: 'text-gray-700 bg-gray-100', icon: '⏰' }
                        };

                        const config = teamConfig[teamName] || teamConfig['Normal'];


                        
                        return (
                          <div key={teamName} className="border-l-4 border-blue-300 pl-3">
                            <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-lg ${config.color} text-xs font-medium mb-2`}>
                              <span>{config.icon}</span>
                              <span>{teamName}</span>
                              <span className="bg-white bg-opacity-60 px-1 rounded">
                                {Array.isArray(employeeIds) ? employeeIds.length : 0}
                              </span>
                            </div>
                                                         <div className="text-sm text-gray-700 space-y-1 mt-2">
                               {employeeIds.map((empData, index) => {
                                 let employee = null;
                                 let empKey = index;
                                 
                                 // Vérifier si empData est déjà un objet employé complet
                                 if (typeof empData === 'object' && empData !== null && empData.id) {
                                   employee = empData;
                                   empKey = empData.id;
                                 } else {
                                   // empData est un ID, rechercher l'employé
                                   const empId = empData;
                                   employee = employees.find(emp => emp.id === empId);
                                   if (!employee && typeof empId === 'string') {
                                     employee = employees.find(emp => emp.id === parseInt(empId));
                                   }
                                   if (!employee && typeof empId === 'number') {
                                     employee = employees.find(emp => emp.id === empId.toString());
                                   }
                                   empKey = empId;
                                 }
                                 
                                 if (!employee || !employee.nom) {
                                   console.warn(`Employé non trouvé ou invalide:`, empData);
                                   return (
                                     <div key={empKey} className="text-red-500 text-xs">
                                       ⚠️ Employé non trouvé ({String(empData)})
                                     </div>
                                   );
                                 }
                                 
                                 return (
                                   <div key={empKey} className="flex items-center space-x-2 py-1 px-2 bg-white bg-opacity-60 rounded">
                                     <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                     <span className="font-medium text-gray-900">
                                       {String(employee.nom)} {String(employee.prenom)}
                                     </span>
                                     <span className="text-gray-500 text-xs">
                                       ({String(employee.atelier || 'N/A')})
                                     </span>
                                   </div>
                                 );
                               })}
                               {employeeIds.length === 0 && (
                                 <div className="text-gray-400 text-xs italic">Aucun employé assigné</div>
                               )}
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Cliquer pour modifier</span>
                        <FiEdit className="h-3 w-3" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      
      <WeekPlanningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        week={selectedWeek}
        year={selectedYear}
        employees={getAvailableEmployees()}
        userRole={user?.role}
        onSave={(assignments) => {
          if (selectedWeek) {
            handleWeekPlanningUpdate(selectedWeek.number, assignments);
          }
          setShowModal(false);
        }}
        initialAssignments={selectedWeek ? weeklyPlannings[`${selectedYear}-W${selectedWeek.number}`] || {} : {}}
      />

      
      {saveProgress.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border p-4 min-w-[300px]"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Sauvegarde en cours...
              </p>
              <p className="text-xs text-gray-600">
                {saveProgress.current} / {saveProgress.total} plannings
              </p>
            </div>
          </div>
          
          
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${saveProgress.total > 0 ? (saveProgress.current / saveProgress.total) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlanningCreation; 