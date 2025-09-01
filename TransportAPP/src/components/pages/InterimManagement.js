import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiUsers,
  FiShuffle,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiClock,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiFileText
} from 'react-icons/fi';
import InterimLoanModal from './InterimLoanModal';

const InterimManagement = () => {
  const { user } = useAuth();
  const [interimaires, setInterimaires] = useState([]);
  const [prêts, setPrêts] = useState([]);
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedInterimaire, setSelectedInterimaire] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsInterimaire, setDetailsInterimaire] = useState(null);

  // États pour les statistiques
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    enPrêt: 0,
    disponibles: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Récupérer le token d'authentification depuis le contexte
      const token = user?.token || localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Charger les intérimaires
      const interimairesResponse = await fetch('http://localhost:3001/api/employees?type_contrat=Intérimaire', { headers });
      if (!interimairesResponse.ok) {
        throw new Error(`Erreur employés: ${interimairesResponse.status}`);
      }
      const interimairesData = await interimairesResponse.json();
      setInterimaires(interimairesData);

      // Charger les prêts actifs
      const prêtsResponse = await fetch('http://localhost:3001/api/interim-loans?status=active', { headers });
      if (!prêtsResponse.ok) {
        throw new Error(`Erreur prêts: ${prêtsResponse.status}`);
      }
      const prêtsData = await prêtsResponse.json();
      setPrêts(prêtsData);

      // Charger les ateliers
      const ateliersResponse = await fetch('http://localhost:3001/api/ateliers', { headers });
      if (!ateliersResponse.ok) {
        throw new Error(`Erreur ateliers: ${ateliersResponse.status}`);
      }
      const ateliersData = await ateliersResponse.json();
      setAteliers(ateliersData);

      // Calculer les statistiques
      const total = interimairesData.length;
      const enPrêt = prêtsData.length;
      const disponibles = total - enPrêt;
      
      setStats({
        total,
        actifs: total,
        enPrêt,
        disponibles
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrêt = (interimaire) => {
    setSelectedInterimaire(interimaire);
    setShowLoanModal(true);
  };

  const handleViewDetails = (interimaire) => {
    setDetailsInterimaire(interimaire);
    setShowDetailsModal(true);
  };

  const handleDelete = async (interimaire) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'intérimaire ${interimaire.prenom} ${interimaire.nom} ?\n\nCette action supprimera complètement l'employé de la base de données.`)) {
      return;
    }

    try {
      const token = user?.token || localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/employees/${interimaire.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Retirer l'intérimaire de la liste locale
        setInterimaires(prev => prev.filter(i => i.id !== interimaire.id));
        
        // Mettre à jour les statistiques
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          actifs: prev.actifs - 1,
          disponibles: prev.disponibles - (prêts.find(p => p.employee_id === interimaire.id) ? 0 : 1),
          enPrêt: prev.enPrêt - (prêts.find(p => p.employee_id === interimaire.id) ? 1 : 0)
        }));
        
        alert(`L'intérimaire ${interimaire.prenom} ${interimaire.nom} a été supprimé avec succès.`);
      } else {
        const error = await response.json();
        alert(`Erreur lors de la suppression: ${error.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'intérimaire');
    }
  };

  const handleTerminerPrêt = async (prêtId) => {
    try {
      const token = user?.token || localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Token d\'authentification manquant');
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/interim-loans/${prêtId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          end_date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        // Recharger les données
        loadData();
      } else {
        console.error('Erreur lors de la terminaison du prêt');
      }
    } catch (error) {
      console.error('Erreur lors de la terminaison du prêt:', error);
    }
  };

  const filteredInterimaires = interimaires.filter(interimaire => {
    const matchesSearch = interimaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interimaire.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam === 'all' || interimaire.equipe === filterTeam;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'disponible' && !prêts.find(p => p.employee_id === interimaire.id)) ||
                         (filterStatus === 'en_prêt' && prêts.find(p => p.employee_id === interimaire.id));
    
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const getAtelierName = (atelierId) => {
    const atelier = ateliers.find(a => a.id === atelierId);
    return atelier ? atelier.nom : 'Inconnu';
  };

  const getPrêtInfo = (employeeId) => {
    return prêts.find(p => p.employee_id === employeeId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Intérimaires</h1>
          <p className="text-gray-600 mt-1">
            Gestion complète des intérimaires et des prêts entre ateliers
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLoanModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <FiShuffle className="h-4 w-4" />
          <span>Nouveau Prêt</span>
        </motion.button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Intérimaires', value: stats.total, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Disponibles', value: stats.disponibles, icon: FiUser, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'En Prêt', value: stats.enPrêt, icon: FiShuffle, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Taux Utilisation', value: `${Math.round((stats.enPrêt / stats.total) * 100)}%`, icon: FiClock, color: 'text-orange-600', bg: 'bg-orange-100' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
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

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un intérimaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Toutes les équipes</option>
              <option value="MATIN">Matin</option>
              <option value="SOIR">Soir</option>
              <option value="NUIT">Nuit</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponibles</option>
              <option value="en_prêt">En prêt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des intérimaires */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Intérimaires ({filteredInterimaires.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intérimaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atelier Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prêt Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterimaires.map((interimaire) => {
                const prêtActuel = getPrêtInfo(interimaire.id);
                const isEnPrêt = !!prêtActuel;
                
                return (
                  <tr key={interimaire.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {interimaire.prenom} {interimaire.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {interimaire.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        interimaire.equipe === 'MATIN' ? 'bg-blue-100 text-blue-800' :
                        interimaire.equipe === 'SOIR' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {interimaire.equipe}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getAtelierName(interimaire.atelier_id)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isEnPrêt ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEnPrêt ? 'En Prêt' : 'Disponible'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEnPrêt ? (
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <FiMapPin className="h-3 w-3 mr-1" />
                            {getAtelierName(prêtActuel.to_atelier_id)}
                          </div>
                          <div className="flex items-center text-xs text-gray-600">
                            <FiCalendar className="h-3 w-3 mr-1" />
                            {new Date(prêtActuel.start_date).toLocaleDateString()} - {new Date(prêtActuel.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucun prêt</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {!isEnPrêt ? (
                          <button
                            onClick={() => handlePrêt(interimaire)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded transition-colors"
                            title="Prêter cet intérimaire"
                          >
                            <FiShuffle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTerminerPrêt(prêtActuel.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Terminer le prêt"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleViewDetails(interimaire)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          title="Voir les détails"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(interimaire)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Supprimer cet intérimaire"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredInterimaires.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun intérimaire trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterTeam !== 'all' || filterStatus !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche.' 
                : 'Commencez par ajouter des intérimaires.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de prêt */}
      {showLoanModal && (
        <InterimLoanModal
          isOpen={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          interimaire={selectedInterimaire}
          ateliers={ateliers}
          onSuccess={() => {
            setShowLoanModal(false);
            setSelectedInterimaire(null);
            loadData();
          }}
        />
      )}

      {/* Modal de détails */}
      {showDetailsModal && detailsInterimaire && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Détails de l'intérimaire</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiUser className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nom complet</p>
                      <p className="font-medium text-gray-900">
                        {detailsInterimaire.prenom} {detailsInterimaire.nom}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Employé</p>
                      <p className="font-medium text-gray-900">{detailsInterimaire.id}</p>
                    </div>
                    {detailsInterimaire.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <FiMail className="h-4 w-4 mr-1" />
                          {detailsInterimaire.email}
                        </p>
                      </div>
                    )}
                    {detailsInterimaire.telephone && (
                      <div>
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium text-gray-900 flex items-center">
                          <FiPhone className="h-4 w-4 mr-1" />
                          {detailsInterimaire.telephone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FiBriefcase className="h-5 w-5 mr-2" />
                    Informations professionnelles
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Type de contrat</p>
                      <p className="font-medium text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {detailsInterimaire.type_contrat}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Équipe</p>
                      <p className="font-medium text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          detailsInterimaire.equipe === 'MATIN' ? 'bg-blue-100 text-blue-800' :
                          detailsInterimaire.equipe === 'SOIR' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {detailsInterimaire.equipe}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Atelier actuel</p>
                      <p className="font-medium text-gray-900 flex items-center">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        {getAtelierName(detailsInterimaire.atelier_id)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Statut</p>
                      <p className="font-medium text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getPrêtInfo(detailsInterimaire.id) ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {getPrêtInfo(detailsInterimaire.id) ? 'En Prêt' : 'Disponible'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Historique des prêts si disponible */}
                {getPrêtInfo(detailsInterimaire.id) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <FiShuffle className="h-5 w-5 mr-2" />
                      Prêt actuel
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Prêté à l'atelier</span>
                        <span className="font-medium text-gray-900">
                          {getAtelierName(getPrêtInfo(detailsInterimaire.id).to_atelier_id)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date de début</span>
                        <span className="font-medium text-gray-900">
                          {new Date(getPrêtInfo(detailsInterimaire.id).start_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date de fin prévue</span>
                        <span className="font-medium text-gray-900">
                          {new Date(getPrêtInfo(detailsInterimaire.id).end_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDelete(detailsInterimaire);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer l'intérimaire
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InterimManagement; 