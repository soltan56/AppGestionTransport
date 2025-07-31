import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiSearch,
  FiFileText,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiTruck,
  FiSettings,
  FiInfo,
  FiX
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { exportPlanningsToExcel, exportPlanningsWithStats } from '../../services/excelExport';

const PlanningConsultation = () => {
  const { plannings, getStats } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEquipe, setFilterEquipe] = useState('all');
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState(null);

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
      const fileName = exportPlanningsToExcel(filteredPlannings, 'consultation_plannings');
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
      const fileName = exportPlanningsWithStats(filteredPlannings, stats, 'rapport_rh_plannings');
      alert(`Rapport RH exporté ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du rapport');
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
      {/* Header avec notification lecture seule */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultation des Plannings</h1>
          <div className="flex items-center mt-2 text-sm text-blue-600">
            <FiInfo className="h-4 w-4 mr-1" />
            <span>Mode consultation seule - {filteredPlannings.length} planning(s)</span>
            {filteredPlannings.length !== plannings.length && ` sur ${plannings.length} total`}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Boutons d'export uniquement */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportSimple}
              className="btn-secondary flex items-center space-x-2"
              disabled={filteredPlannings.length === 0}
              title="Exporter la liste vers Excel"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            
            <button
              onClick={handleExportWithStats}
              className="btn-primary flex items-center space-x-2"
              disabled={filteredPlannings.length === 0}
              title="Exporter le rapport RH complet"
            >
              <FiFileText className="h-4 w-4" />
              <span>Rapport RH</span>
            </button>
          </div>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Détails</th>
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
                        <button
                          onClick={() => setSelectedPlanning(planning)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
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
                : 'Aucun planning disponible pour le moment.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedPlanning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Détails du Planning</h2>
              <button
                onClick={() => setSelectedPlanning(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom</label>
                  <p className="text-gray-900 font-medium">{selectedPlanning.nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPlanning.status)}`}>
                    {selectedPlanning.status || 'actif'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Point de Ramassage</label>
                  <p className="text-gray-900">{selectedPlanning.point_ramassage || selectedPlanning.pointRamassage}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Circuit</label>
                  <p className="text-gray-900">{selectedPlanning.circuit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Équipe</label>
                  <p className="text-gray-900">{selectedPlanning.equipe}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Atelier</label>
                  <p className="text-gray-900">{selectedPlanning.atelier}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de Début</label>
                  <p className="text-gray-900">{selectedPlanning.date_debut || selectedPlanning.dateDebut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date de Fin</label>
                  <p className="text-gray-900">{selectedPlanning.date_fin || selectedPlanning.dateFin || 'Non définie'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Heure de Début</label>
                  <p className="text-gray-900">{selectedPlanning.heure_debut || selectedPlanning.heureDebut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Heure de Fin</label>
                  <p className="text-gray-900">{selectedPlanning.heure_fin || selectedPlanning.heureFin || 'Non définie'}</p>
                </div>
              </div>
              
              {selectedPlanning.created_at && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600">Créé le</label>
                  <p className="text-gray-900">{new Date(selectedPlanning.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedPlanning(null)}
                className="btn-primary"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlanningConsultation; 