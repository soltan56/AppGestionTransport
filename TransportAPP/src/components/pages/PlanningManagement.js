import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiEye,
  FiFilter,
  FiSearch,
  FiFileText,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiTruck,
  FiSettings
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { exportPlanningsToExcel, exportPlanningsWithStats } from '../../services/excelExport';
import PlanningForm from '../forms/PlanningForm';

const PlanningManagement = () => {
  const { plannings, getStats } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEquipe, setFilterEquipe] = useState('all');
  const [filteredPlannings, setFilteredPlannings] = useState([]);

  const stats = getStats();

  // Filtrer les plannings
  useEffect(() => {
    let filtered = plannings;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(planning =>
        planning.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.point_ramassage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.pointRamassage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.circuit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planning.atelier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(planning => planning.status === filterStatus);
    }

    // Filtre par équipe
    if (filterEquipe !== 'all') {
      filtered = filtered.filter(planning => planning.equipe === filterEquipe);
    }

    setFilteredPlannings(filtered);
  }, [plannings, searchTerm, filterStatus, filterEquipe]);

  // Récupérer les équipes uniques
  const uniqueEquipes = [...new Set(plannings.map(p => p.equipe))];

  const handleExportSimple = () => {
    if (filteredPlannings.length === 0) {
      alert('Aucun planning à exporter');
      return;
    }
    
    try {
      const fileName = exportPlanningsToExcel(filteredPlannings);
      alert(`Export réussi ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export Excel');
    }
  };

  const handleExportWithStats = () => {
    if (filteredPlannings.length === 0) {
      alert('Aucun planning à exporter');
      return;
    }
    
    try {
      const fileName = exportPlanningsWithStats(filteredPlannings, stats);
      alert(`Rapport complet exporté ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du rapport');
    }
  };

  const handleEdit = (planning) => {
    setSelectedPlanning(planning);
    setShowForm(true);
  };

  const handleDelete = (planningId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      // Implémentation de la suppression
      console.log('Suppression du planning:', planningId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactif':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'termine':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Plannings</h1>
          <p className="text-gray-600 mt-1">
            {filteredPlannings.length} planning(s) 
            {filteredPlannings.length !== plannings.length && ` sur ${plannings.length} total`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Boutons d'export */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportSimple}
              className="btn-secondary flex items-center space-x-2"
              disabled={filteredPlannings.length === 0}
              title="Exporter la liste simple vers Excel"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            
            <button
              onClick={handleExportWithStats}
              className="btn-secondary flex items-center space-x-2"
              disabled={filteredPlannings.length === 0}
              title="Exporter le rapport complet avec statistiques"
            >
              <FiFileText className="h-4 w-4" />
              <span>Rapport Complet</span>
            </button>
          </div>
          
          <button
            onClick={() => {
              setSelectedPlanning(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Nouveau Planning</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plannings</p>
              <p className="text-2xl font-bold text-gray-900">{plannings.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">{stats.activePlannings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiClock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipes</p>
              <p className="text-2xl font-bold text-purple-600">{uniqueEquipes.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circuits</p>
              <p className="text-2xl font-bold text-orange-600">
                {new Set(plannings.map(p => p.circuit)).size}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiTruck className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, point de ramassage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">Tous statuts</option>
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
                <option value="termine">Terminé</option>
              </select>
            </div>
            
            <select
              value={filterEquipe}
              onChange={(e) => setFilterEquipe(e.target.value)}
              className="input-field min-w-[120px]"
            >
              <option value="all">Toutes équipes</option>
              {uniqueEquipes.map(equipe => (
                <option key={equipe} value={equipe}>{equipe}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Liste des plannings */}
      <div className="card">
        {filteredPlannings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Point Ramassage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Circuit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Équipe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Atelier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredPlannings.map((planning, index) => (
                    <motion.tr
                      key={planning.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{planning.nom}</div>
                        <div className="text-sm text-gray-500">
                          {planning.date_debut || planning.dateDebut}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <FiMapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {planning.point_ramassage || planning.pointRamassage}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <FiTruck className="h-4 w-4 text-gray-400 mr-2" />
                          {planning.circuit}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {planning.equipe}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center">
                          <FiSettings className="h-4 w-4 text-gray-400 mr-2" />
                          {planning.atelier}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(planning.status)}`}>
                          {planning.status || 'actif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(planning)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Modifier"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(planning.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Supprimer"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun planning trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterEquipe !== 'all'
                ? 'Aucun planning ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier planning.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterEquipe === 'all' && (
              <button
                onClick={() => {
                  setSelectedPlanning(null);
                  setShowForm(true);
                }}
                className="btn-primary"
              >
                Créer un planning
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <PlanningForm
          planning={selectedPlanning}
          onClose={() => {
            setShowForm(false);
            setSelectedPlanning(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedPlanning(null);
          }}
        />
      )}
    </div>
  );
};

export default PlanningManagement; 