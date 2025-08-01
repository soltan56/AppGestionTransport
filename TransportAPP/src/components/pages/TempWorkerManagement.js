import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUser,
  FiSave,
  FiX,
  FiFilter,
  FiDownload,
  FiMail,
  FiPhone,
  FiClock,
  FiCalendar
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import * as XLSX from 'xlsx';

const TempWorkerManagement = () => {
  const { employees, addEmployee } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  
  const tempWorkers = employees.filter(emp => emp.typeContrat === 'Intérimaire');

  useEffect(() => {
    let filtered = tempWorkers;

    if (searchTerm) {
      filtered = filtered.filter(worker =>
        `${worker.nom} ${worker.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWorkers(filtered);
  }, [tempWorkers, searchTerm]);

  const handleExportWorkers = () => {
    if (filteredWorkers.length === 0) {
      alert('Aucun intérimaire à exporter');
      return;
    }

    const workerData = filteredWorkers.map(worker => ({
      'Nom': worker.nom,
      'Prénom': worker.prenom,
      'Email': worker.email || '',
      'Téléphone': worker.telephone || '',
      'Équipe': worker.equipe || '',
      'Atelier': worker.atelier || '',
      'Date Embauche': worker.dateEmbauche || '',
      'Date Fin Contrat': worker.dateFin || '',
      'Status': worker.status || 'actif',
      'Créé le': worker.created_at ? new Date(worker.created_at).toLocaleDateString('fr-FR') : ''
    }));

    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(workerData);
      
      worksheet['!cols'] = [
        { wch: 20 }, 
        { wch: 20 }, 
        { wch: 30 }, 
        { wch: 15 }, 
        { wch: 10 }, 
        { wch: 20 }, 
        { wch: 12 }, 
        { wch: 12 }, 
        { wch: 10 }, 
        { wch: 12 }  
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Intérimaires');
      
      const today = new Date().toISOString().split('T')[0];
      const fileName = `interimaires_rh_${today}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      alert(`Export réussi ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export Excel');
    }
  };

  const getContractStatus = (worker) => {
    if (!worker.dateFin) return { status: 'Indéterminé', color: 'bg-gray-100 text-gray-800' };
    
    const today = new Date();
    const endDate = new Date(worker.dateFin);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'Expiré', color: 'bg-red-100 text-red-800' };
    } else if (diffDays <= 7) {
      return { status: `${diffDays}j restant`, color: 'bg-orange-100 text-orange-800' };
    } else if (diffDays <= 30) {
      return { status: `${diffDays}j restant`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: `${diffDays}j restant`, color: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Intérimaires</h1>
          <p className="text-gray-600 mt-1">
            {filteredWorkers.length} intérimaire(s) 
            {filteredWorkers.length !== tempWorkers.length && ` sur ${tempWorkers.length} total`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportWorkers}
            className="btn-secondary flex items-center space-x-2"
            disabled={filteredWorkers.length === 0}
            title="Exporter les intérimaires vers Excel"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedWorker(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Ajouter Intérimaire</span>
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Intérimaires</p>
              <p className="text-2xl font-bold text-gray-900">{tempWorkers.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiUser className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contrats Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {tempWorkers.filter(w => w.status === 'actif' && (!w.dateFin || new Date(w.dateFin) > new Date())).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiClock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expirent Bientôt</p>
              <p className="text-2xl font-bold text-orange-600">
                {tempWorkers.filter(w => {
                  if (!w.dateFin) return false;
                  const diffDays = Math.ceil((new Date(w.dateFin) - new Date()) / (1000 * 60 * 60 * 24));
                  return diffDays > 0 && diffDays <= 30;
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contrats Expirés</p>
              <p className="text-2xl font-bold text-red-600">
                {tempWorkers.filter(w => {
                  if (!w.dateFin) return false;
                  return new Date(w.dateFin) < new Date();
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FiX className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      
      <div className="card">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un intérimaire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      
      <div className="card">
        {filteredWorkers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nom Complet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Équipe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Période</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status Contrat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredWorkers.map((worker, index) => {
                    const contractStatus = getContractStatus(worker);
                    return (
                      <motion.tr
                        key={worker.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {worker.nom} {worker.prenom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {worker.atelier}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="space-y-1">
                            {worker.email && (
                              <div className="flex items-center text-sm">
                                <FiMail className="h-3 w-3 text-gray-400 mr-2" />
                                {worker.email}
                              </div>
                            )}
                            {worker.telephone && (
                              <div className="flex items-center text-sm">
                                <FiPhone className="h-3 w-3 text-gray-400 mr-2" />
                                {worker.telephone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {worker.equipe}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="text-sm">
                            <div>Début: {worker.dateEmbauche ? new Date(worker.dateEmbauche).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                            <div>Fin: {worker.dateFin ? new Date(worker.dateFin).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${contractStatus.color}`}>
                            {contractStatus.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedWorker(worker);
                                setShowForm(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="Modifier"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir supprimer cet intérimaire ?')) {
                                  console.log('Suppression de l\'intérimaire:', worker.id);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Supprimer"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiUser className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun intérimaire trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Aucun intérimaire ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier intérimaire.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setSelectedWorker(null);
                  setShowForm(true);
                }}
                className="btn-primary"
              >
                Ajouter un intérimaire
              </button>
            )}
          </div>
        )}
      </div>

      
      {showForm && (
        <TempWorkerForm
          worker={selectedWorker}
          onClose={() => {
            setShowForm(false);
            setSelectedWorker(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedWorker(null);
          }}
        />
      )}
    </div>
  );
};


const TempWorkerForm = ({ worker, onClose, onSuccess }) => {
  const { addEmployee } = useData();
  
  const [formData, setFormData] = useState({
    nom: worker?.nom || '',
    prenom: worker?.prenom || '',
    email: worker?.email || '',
    telephone: worker?.telephone || '',
    equipe: worker?.equipe || 'Matin',
    atelier: worker?.atelier || 'Atelier Principal',
    dateEmbauche: worker?.dateEmbauche || '',
    dateFin: worker?.dateFin || '',
    status: worker?.status || 'actif',
    typeContrat: 'Intérimaire'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teams = ['Matin', 'Soir', 'Nuit', 'Normal'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.dateEmbauche) {
      newErrors.dateEmbauche = 'La date d\'embauche est requise';
    }

    if (formData.dateFin && formData.dateEmbauche && new Date(formData.dateFin) <= new Date(formData.dateEmbauche)) {
      newErrors.dateFin = 'La date de fin doit être postérieure à la date d\'embauche';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const workerData = {
        ...formData,
        createdAt: new Date().toISOString()
      };

      addEmployee(workerData);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'intérimaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {worker ? 'Modifier l\'Intérimaire' : 'Ajouter un Intérimaire'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`input-field ${errors.nom ? 'border-red-300' : ''}`}
                placeholder="Ex: BENALI"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`input-field ${errors.prenom ? 'border-red-300' : ''}`}
                placeholder="Ex: Ahmed"
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                placeholder="ahmed.benali@transport.ma"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="input-field"
                placeholder="0612345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipe
              </label>
              <select
                name="equipe"
                value={formData.equipe}
                onChange={handleChange}
                className="input-field"
              >
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atelier
              </label>
              <input
                type="text"
                name="atelier"
                value={formData.atelier}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: Atelier Principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Début *
              </label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleChange}
                className={`input-field ${errors.dateEmbauche ? 'border-red-300' : ''}`}
              />
              {errors.dateEmbauche && (
                <p className="mt-1 text-sm text-red-600">{errors.dateEmbauche}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Fin de Contrat
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className={`input-field ${errors.dateFin ? 'border-red-300' : ''}`}
              />
              {errors.dateFin && (
                <p className="mt-1 text-sm text-red-600">{errors.dateFin}</p>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiUser className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Contrat Intérimaire</h4>
                <p className="text-sm text-orange-700">
                  Ce formulaire est spécialement conçu pour l'ajout d'intérimaires avec contrat à durée déterminée.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              <span>{isSubmitting ? 'Enregistrement...' : (worker ? 'Modifier' : 'Ajouter')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TempWorkerManagement; 