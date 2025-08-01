import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar,
  FiTruck,
  FiBarChart2,
  FiUsers,
  FiPlus,
  FiEdit,
  FiEye,
  FiClock,
  FiMapPin,
  FiActivity,
  FiDownload,
  FiRefreshCw,
  FiSettings
} from 'react-icons/fi';
import {
  EmployeesByTeamChart,
  BusAvailabilityChart,
  EmployeeTrendChart,
  CircuitOccupancyChart,
  PickupHeatmapChart,
  StatsContainer
} from '../../charts/ChartComponents';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import PlanningCreation from '../../pages/PlanningCreation';

const ChefHome = () => {
  const { plannings, employees, buses, circuits, getStats } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentWeeklyPlannings, setRecentWeeklyPlannings] = useState([]);
  const [activeWeeklyPlannings, setActiveWeeklyPlannings] = useState([]);
  
  useEffect(() => {
    const fetchPlannings = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentDate = new Date();
        const currentWeek = getWeekNumber(currentDate);
        
        const response = await fetch(`http://localhost:3001/api/weekly-plannings?year=${currentYear}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const weeklyPlannings = await response.json();
          
          const enrichedPlannings = await Promise.all(
            weeklyPlannings.map(async (planning) => {
              try {
                const detailResponse = await fetch(
                  `http://localhost:3001/api/weekly-plannings/${planning.year}/${planning.week_number}`,
                  { credentials: 'include' }
                );
                
                if (detailResponse.ok) {
                  const detail = await detailResponse.json();
                  const totalEmployees = Object.values(detail.assignments || {})
                    .reduce((total, teamEmployees) => total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0), 0);
                  
                  const activeTeams = Object.keys(detail.assignments || {})
                    .filter(team => Array.isArray(detail.assignments[team]) && detail.assignments[team].length > 0);
                  
                  return {
                    week_number: planning.week_number,
                    year: planning.year,
                    totalEmployees,
                    activeTeams,
                    created_at: planning.created_at,
                    assignments: detail.assignments || {}
                  };
                }
              } catch (error) {
                console.error('Erreur détail planning:', error);
              }
              return null;
            })
          );
          
          const validPlannings = enrichedPlannings.filter(p => p !== null);
          
          setRecentWeeklyPlannings(validPlannings.slice(0, 4));
          
          const activePlannings = validPlannings.filter(planning => 
            planning.week_number >= currentWeek
          );
          setActiveWeeklyPlannings(activePlannings.slice(0, 5));
        }
      } catch (error) {
        console.error('Erreur chargement plannings:', error);
      }
    };

    const getWeekNumber = (date) => {
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = date - start;
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
      return Math.ceil(diff / oneWeek);
    };

    fetchPlannings();
  }, []);
  
  const stats = getStats();
  const displayStats = [
    { label: 'Circuits Actifs', value: circuits.length.toString(), icon: FiTruck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Employés Totaux', value: employees.length.toString(), icon: FiUsers, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Bus Disponibles', value: stats.availableBuses.toString(), icon: FiActivity, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Plannings Actifs', value: activeWeeklyPlannings.length.toString(), icon: FiCalendar, color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  const formatRecentPlannings = () => {
    return recentWeeklyPlannings.map(planning => ({
      action: `Planning Semaine ${planning.week_number}`,
      details: `${planning.totalEmployees} employés - ${planning.activeTeams.length} équipe(s) : ${planning.activeTeams.join(', ')}`,
      time: new Date(planning.created_at).toLocaleDateString('fr-FR'),
      week: planning.week_number,
      year: planning.year
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Chef d'Atelier</h1>
          <p className="text-gray-600">Gérez vos plannings, circuits et équipes</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/chef/planning')}
          className="card cursor-pointer border border-emerald-200 hover:border-emerald-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Plannings</h3>
            <p className="text-sm text-gray-600">Créer et gérer les plannings</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/chef/circuits')}
          className="card cursor-pointer border border-blue-200 hover:border-blue-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiTruck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Voir Circuits</h3>
            <p className="text-sm text-gray-600">Gérer les circuits existants</p>
          </div>
        </motion.div>

                         <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/chef/stats')}
          className="card cursor-pointer border border-purple-200 hover:border-purple-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiBarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Statistiques</h3>
            <p className="text-sm text-gray-600">Analyses et rapports</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/chef/management')}
          className="card cursor-pointer border border-orange-200 hover:border-orange-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestion</h3>
            <p className="text-sm text-gray-600">Bus et employés</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plannings Récents</h3>
          <div className="space-y-4">
            {formatRecentPlannings().length > 0 ? formatRecentPlannings().map((activity, index) => (
              <motion.div 
                key={index} 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/dashboard/chef/planning')}
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                  <FiCalendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <FiClock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
                <FiEye className="h-4 w-4 text-gray-400" />
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Aucun planning créé pour le moment</p>

              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plannings Actifs</h3>
          <div className="space-y-3">
            {activeWeeklyPlannings.length > 0 ? 
              activeWeeklyPlannings.map((planning, index) => (
                <motion.div 
                  key={`${planning.year}-${planning.week_number}`} 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/dashboard/chef/planning')}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Semaine {planning.week_number}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                      <FiEye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <FiUsers className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">{planning.totalEmployees} employés</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">{planning.activeTeams.length} équipe(s)</span>
                    </div>
                  </div>
                  
                  {planning.activeTeams.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {planning.activeTeams.map((team, teamIndex) => {
                          const teamConfig = {
                            'Matin': { color: 'bg-yellow-100 text-yellow-700', icon: '🌅' },
                            'Soir': { color: 'bg-purple-100 text-purple-700', icon: '🌆' },
                            'Nuit': { color: 'bg-indigo-100 text-indigo-700', icon: '🌙' },
                            'Normal': { color: 'bg-gray-100 text-gray-700', icon: '⏰' }
                          };
                          const config = teamConfig[team] || teamConfig['Normal'];
                          
                          return (
                            <span 
                              key={teamIndex} 
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                            >
                              <span>{config.icon}</span>
                              <span>{team}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aucun planning actif</p>
                  <p className="text-xs mt-1">Créez un planning pour la semaine actuelle ou future</p>
                </div>
              )
            }
          </div>
        </div>
      </div>


    </div>
  );
};

const PlanningPage = () => {
  return <PlanningCreation />;
};

const CircuitsPage = () => {
  const CircuitManagement = React.lazy(() => import('../../pages/CircuitManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <CircuitManagement />
    </React.Suspense>
  );
};

const StatsPage = () => {
  const { employees, circuits, plannings } = useData();

  const realStats = {
    equipeStats: {
      matin: employees.filter(e => e.equipe === 'MATIN').length,
      soir: employees.filter(e => e.equipe === 'SOIR').length,
      na: employees.filter(e => e.equipe === 'N/A').length,
    },
    
    circuitStats: circuits.length > 0 ? {
      total: circuits.length,
      utilises: [...new Set(employees.map(e => e.circuit).filter(c => c))].length,
      tauxUtilisation: Math.round((([...new Set(employees.map(e => e.circuit).filter(c => c))].length) / circuits.length) * 100)
    } : { total: 9, utilises: 8, tauxUtilisation: 89 },
    
    atelierStats: [...new Set(employees.map(e => e.atelier).filter(a => a))].reduce((acc, atelier) => {
      acc[atelier] = employees.filter(e => e.atelier === atelier).length;
      return acc;
    }, {}),
    

    pointsRamassageStats: [...new Set(employees.map(e => e.point_ramassage).filter(p => p))].map(point => ({
      point,
      count: employees.filter(e => e.point_ramassage === point).length
    })).sort((a, b) => b.count - a.count).slice(0, 5),
    
    circuitUtilisation: [...new Set(employees.map(e => e.circuit).filter(c => c))].map(circuit => ({
      circuit,
      count: employees.filter(e => e.circuit === circuit).length
    })).sort((a, b) => b.count - a.count)
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques Visuelles</h2>
          <p className="text-gray-600">Analyses des données réelles de transport et employés</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <FiDownload className="h-4 w-4 mr-2" />
            Exporter PDF
          </button>
          <button className="btn-primary">
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circuits Actifs</p>
              <p className="text-2xl font-bold text-green-600">{realStats.circuitStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTruck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circuits Utilisés</p>
              <p className="text-2xl font-bold text-orange-600">{realStats.circuitStats.utilises}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiActivity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ateliers</p>
              <p className="text-2xl font-bold text-purple-600">{Object.keys(realStats.atelierStats).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatsContainer title="Effectifs par Équipe">
          <EmployeesByTeamChart data={[
            realStats.equipeStats.matin,
            realStats.equipeStats.soir,
            0,
            realStats.equipeStats.na
          ]} />
        </StatsContainer>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Circuit</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {realStats.circuitUtilisation.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiTruck className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-900">{item.circuit}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{item.count} employés</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${(item.count / Math.max(...realStats.circuitUtilisation.map(c => c.count))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Effectifs par Atelier</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Object.entries(realStats.atelierStats)
              .sort(([,a], [,b]) => b - a)
              .map(([atelier, count], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiSettings className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-900">{atelier}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{count} employés</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{width: `${(count / Math.max(...Object.values(realStats.atelierStats))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Points de Ramassage Principaux</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {realStats.pointsRamassageStats.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FiMapPin className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-900 text-sm">{item.point}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{width: `${(item.count / realStats.pointsRamassageStats[0]?.count) * 100}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{realStats.circuitStats.tauxUtilisation}%</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Taux d'utilisation circuits</div>
          <div className="text-xs text-gray-500">{realStats.circuitStats.utilises}/{realStats.circuitStats.total} circuits utilisés</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(employees.length / realStats.circuitStats.utilises)}</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Employés par circuit</div>
          <div className="text-xs text-gray-500">Moyenne de répartition</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{realStats.pointsRamassageStats.length}</div>
          <div className="text-sm font-medium text-gray-700 mb-1">Points de ramassage actifs</div>
          <div className="text-xs text-gray-500">Zones géographiques couvertes</div>
        </div>
      </div>
    </div>
  );
};

const ManagementPage = () => {
  const EmployeeManagement = React.lazy(() => import('../../pages/EmployeeManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <EmployeeManagement />
    </React.Suspense>
  );
};

const ChefDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<ChefHome />} />
      <Route path="/planning" element={<PlanningPage />} />

      <Route path="/circuits" element={<CircuitsPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/management" element={<ManagementPage />} />
      <Route path="*" element={<Navigate to="/dashboard/chef" replace />} />
    </Routes>
  );
};

export default ChefDashboard; 