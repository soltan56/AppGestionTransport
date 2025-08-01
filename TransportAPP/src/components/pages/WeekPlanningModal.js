import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiSave, 
  FiUsers, 
  FiClock, 
  FiSun, 
  FiMoon, 
  FiSunrise,
  FiUserCheck,
  FiUserX,
  FiAlertCircle,
  FiCheck,
  FiLock,
  FiEdit
} from 'react-icons/fi';


const TEAMS = [
  { 
    key: 'Matin', 
    label: 'Équipe Matin', 
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    icon: FiSunrise,
    description: 'Service matinal (05h00 - 13h00)'
  },
  { 
    key: 'Soir', 
    label: 'Équipe Soir', 
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-800',
    icon: FiSun,
    description: 'Service soirée (13h00 - 21h00)'
  },
  { 
    key: 'Nuit', 
    label: 'Équipe Nuit', 
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-800',
    icon: FiMoon,
    description: 'Service nocturne (21h00 - 05h00)'
  },
  { 
    key: 'Normal', 
    label: 'Équipe Normale', 
    color: 'from-green-400 to-emerald-500',
    bgColor: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    icon: FiClock,
    description: 'Service régulier (08h00 - 17h00)'
  }
];

const WeekPlanningModal = ({ 
  isOpen, 
  onClose, 
  week, 
  year, 
  employees = [], 
  userRole, 
  onSave, 
  initialAssignments = {},
  readOnly = false 
}) => {
  const [selectedTeam, setSelectedTeam] = useState('Matin');
  const [assignments, setAssignments] = useState(initialAssignments);
  const [searchTerm, setSearchTerm] = useState('');

  const isPastWeek = () => {
    if (!week || !year) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    
    if (year < currentYear) return true;
    if (year === currentYear && week.number < currentWeek) return true;
    return false;
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const isWeekPast = isPastWeek();
  const isReadOnly = readOnly || isWeekPast;

  useEffect(() => {
    if (isOpen) {
      setAssignments(initialAssignments);
      setSelectedTeam('Matin');
      setSearchTerm('');
    }
  }, [isOpen, initialAssignments]);



  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.nom} ${emp.prenom}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) || 
           emp.atelier?.toLowerCase().includes(searchLower) ||
           emp.point_ramassage?.toLowerCase().includes(searchLower);
  });

  const getAllAssignedEmployees = () => {
    const assigned = new Set();
    Object.values(assignments).forEach(teamEmployees => {
      if (Array.isArray(teamEmployees)) {
        teamEmployees.forEach(empId => assigned.add(empId));
      }
    });
    return assigned;
  };

  const isEmployeeAssigned = (employeeId) => {
    return getAllAssignedEmployees().has(employeeId);
  };
  const getEmployeeTeam = (employeeId) => {
    for (const [team, employeeIds] of Object.entries(assignments)) {
      if (Array.isArray(employeeIds) && employeeIds.includes(employeeId)) {
        return team;
      }
    }
    return null;
  };

  const toggleEmployeeAssignment = (employeeId) => {
    if (isReadOnly) return;
    
    const currentTeamAssignments = assignments[selectedTeam] || [];
    const isCurrentlyAssigned = currentTeamAssignments.includes(employeeId);
    
    if (isCurrentlyAssigned) {
      const newAssignments = currentTeamAssignments.filter(id => id !== employeeId);
      setAssignments(prev => ({
        ...prev,
        [selectedTeam]: newAssignments
      }));
    } else {
      const assignedTeam = getEmployeeTeam(employeeId);
      if (assignedTeam && assignedTeam !== selectedTeam) {
        const oldTeamAssignments = assignments[assignedTeam] || [];
        const newOldTeamAssignments = oldTeamAssignments.filter(id => id !== employeeId);
        
        setAssignments(prev => ({
          ...prev,
          [assignedTeam]: newOldTeamAssignments,
          [selectedTeam]: [...(prev[selectedTeam] || []), employeeId]
        }));
      } else {
        setAssignments(prev => ({
          ...prev,
          [selectedTeam]: [...currentTeamAssignments, employeeId]
        }));
      }
    }
  };

  const getTeamCount = (teamKey) => {
    return (assignments[teamKey] || []).length;
  };
  const getTotalAssignments = () => {
    return Object.values(assignments).reduce((total, teamEmployees) => {
      return total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0);
    }, 0);
  };

  const handleSave = () => {
    if (isReadOnly) return; 
    onSave(assignments);
  };

  if (!isOpen || !week) return null;

  const formatWeekDates = () => {
    const startDate = week.startDate.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long' 
    });
    const endDate = week.endDate.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    return `${startDate} - ${endDate}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <FiUsers className="h-7 w-7" />
                <span>
                  {isReadOnly ? 'Consultation Planning' : 'Gestion Planning'} Semaine {week.label}
                </span>
                                 {isReadOnly && (
                  <div className="bg-red-500 bg-opacity-20 px-3 py-1 rounded-full flex items-center space-x-1">
                    <FiLock className="h-4 w-4" />
                    <span className="text-sm">Lecture seule</span>
                  </div>
                )}
                {!isReadOnly && (
                  <div className="bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full flex items-center space-x-1">
                    <FiEdit className="h-4 w-4" />
                    <span className="text-sm">Édition</span>
                  </div>
                )}
              </h2>
                <p className="text-blue-100 mt-1">
                                    {formatWeekDates()}
                                 {isReadOnly && (
                  <span className="ml-2 text-red-200 text-sm">
                   • {readOnly ? 'Mode consultation uniquement' : 'Cette semaine est terminée et ne peut plus être modifiée'}
                  </span>
                )}
                {!isReadOnly && (
                  <span className="ml-2 text-blue-200 text-sm">
                    • Cliquez sur les employés pour les assigner/désassigner
                  </span>
                )}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <p className="text-white text-sm">Total assigné</p>
                  <p className="text-2xl font-bold text-white">{getTotalAssignments()}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors"
                >
                  <FiX className="h-6 w-6 text-white" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            <div className="lg:w-80 bg-gray-50 border-r p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Équipes</h3>
              
              <div className="space-y-3">
                {TEAMS.map((team) => {
                  const Icon = team.icon;
                  const count = getTeamCount(team.key);
                  const isSelected = selectedTeam === team.key;
                  
                  return (
                    <motion.button
                      key={team.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTeam(team.key)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${isSelected 
                          ? `${team.bgColor} border-current shadow-lg` 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            p-2 rounded-lg bg-gradient-to-r ${team.color}
                          `}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${isSelected ? team.textColor : 'text-gray-900'}`}>
                              {team.label}
                            </h4>
                            <p className="text-xs text-gray-500">{team.description}</p>
                          </div>
                        </div>
                        
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-semibold
                          ${count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}
                        `}>
                          {count}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              
              <div className="mt-6 p-4 bg-white rounded-xl border">
                <h4 className="font-semibold text-gray-900 mb-2">Résumé</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employés disponibles</span>
                    <span className="font-medium">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total assigné</span>
                    <span className="font-medium">{getTotalAssignments()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Non assigné</span>
                    <span className="font-medium">{employees.length - getTotalAssignments()}</span>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="flex-1 flex flex-col">
              
              <div className="p-6 border-b bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const selectedTeamInfo = TEAMS.find(t => t.key === selectedTeam);
                      const Icon = selectedTeamInfo?.icon || FiUsers;
                      return (
                        <>
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${selectedTeamInfo?.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {selectedTeamInfo?.label}
                            </h3>
                            <p className="text-gray-600">{selectedTeamInfo?.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Assignés:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {getTeamCount(selectedTeam)}
                    </span>
                  </div>
                </div>

                
                <div className="relative">
                  <input
                    type="text"
                                    placeholder={isReadOnly ? "Rechercher un employé (lecture seule)..." : "Rechercher un employé..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isReadOnly}
                className={`w-full pl-4 pr-10 py-3 border rounded-xl transition-colors ${
                  isReadOnly
                    ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                  />
                  <FiUsers className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              
              <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                
                {filteredEmployees.length > 9 && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium text-center">
                      📋 {filteredEmployees.length} employés disponibles - Faites défiler pour voir tous ↓
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredEmployees.map((employee) => {
                    const isAssigned = isEmployeeAssigned(employee.id);
                    const assignedTeam = getEmployeeTeam(employee.id);
                    const isAssignedToCurrentTeam = assignedTeam === selectedTeam;
                    
                    return (
                      <motion.div
                        key={employee.id}
                        whileHover={!isReadOnly ? { scale: 1.02 } : {}}
                        whileTap={!isReadOnly ? { scale: 0.98 } : {}}
                        onClick={() => toggleEmployeeAssignment(employee.id)}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-300
                          ${isReadOnly 
                            ? 'cursor-not-allowed opacity-70'
                            : 'cursor-pointer'
                          }
                          ${isAssignedToCurrentTeam
                            ? 'border-green-300 bg-green-50'
                            : isAssigned
                              ? 'border-yellow-300 bg-yellow-50'
                              : isReadOnly 
                                ? 'border-gray-200 bg-gray-100'
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {employee.nom} {employee.prenom}
                            </h4>
                            <p className="text-sm text-gray-600">{employee.atelier}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {employee.point_ramassage}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isAssignedToCurrentTeam ? (
                              <FiUserCheck className="h-5 w-5 text-green-600" />
                            ) : isAssigned ? (
                              <div className="flex items-center space-x-1">
                                <FiUserX className="h-4 w-4 text-yellow-600" />
                                <span className="text-xs text-yellow-600 font-medium">
                                  {assignedTeam}
                                </span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12">
                    <FiUsers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun employé trouvé</p>
                  </div>
                )}

                
                {filteredEmployees.length > 9 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700 font-medium">
                      📋 {filteredEmployees.length} employés disponibles
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ↕️ Faites défiler pour voir tous les employés
                    </p>
                  </div>
                )}
              </div>

              
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                                    {isReadOnly && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiLock className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {readOnly ? 'Planning en lecture seule' : 'Planning en lecture seule - Semaine terminée'}
                    </span>
                  </div>
                )}

                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </motion.button>
                    
                    <motion.button
                      whileHover={!isReadOnly ? { scale: 1.05 } : {}}
                      whileTap={!isReadOnly ? { scale: 0.95 } : {}}
                      onClick={handleSave}
                      disabled={isReadOnly}
                      className={`
                        px-6 py-3 rounded-xl text-white transition-colors flex items-center space-x-2
                        ${isReadOnly
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg'
                        }
                      `}
                    >
                      <FiSave className="h-5 w-5" />
                      <span>
                        {isReadOnly ? 'Lecture seule' : 'Sauvegarder'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WeekPlanningModal; 