import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiTruck,
  FiMapPin,
  FiSave,
  FiX,
  FiFilter,
  FiDownload
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { exportPlanningsToExcel } from '../../services/excelExport';
import * as XLSX from 'xlsx';

const CircuitManagement = () => {
  const { circuits, addCircuit, plannings } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCircuits, setFilteredCircuits] = useState([]);

  // Circuits prédéfinis basés sur les données fournies (sans doublons)
  const predefinedCircuits = [
    'HAY MOLAY RCHID',
    'RAHMA', 
    'SIDI MOUMEN',
    'AZHAR',
    'HAY MOHAMMEDI',
    'DERB SULTAN',
    'ANASSI',
    'SIDI OTHMANE',
    'MOHAMMEDIA'
  ];

  useEffect(() => {
    let filtered = circuits;

    if (searchTerm) {
      filtered = filtered.filter(circuit =>
        circuit.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        circuit.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCircuits(filtered);
  }, [circuits, searchTerm]);

  // Initialiser les circuits prédéfinis s'ils n'existent pas
  useEffect(() => {
    if (circuits.length === 0) {
      predefinedCircuits.forEach(circuitName => {
        addCircuit({
          nom: circuitName,
          description: `Circuit ${circuitName}`,
          status: 'actif',
          pointsArret: []
        });
      });
    }
  }, [circuits, addCircuit]);

  const handleExportCircuits = () => {
    if (filteredCircuits.length === 0) {
      alert('Aucun circuit à exporter');
      return;
    }

    // Créer un format d'export pour les circuits
    const circuitData = filteredCircuits.map(circuit => ({
      'Nom Circuit': circuit.nom,
      'Description': circuit.description || '',
      'Status': circuit.status || 'actif',
      'Nombre Plannings': plannings.filter(p => p.circuit === circuit.nom).length,
      'Points d\'Arrêt': circuit.pointsArret?.join(', ') || '',
      'Créé le': circuit.created_at ? new Date(circuit.created_at).toLocaleDateString('fr-FR') : ''
    }));

    // Utiliser le service d'export existant mais adapter pour les circuits
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(circuitData);
      
      worksheet['!cols'] = [
        { wch: 20 }, // Nom Circuit
        { wch: 30 }, // Description
        { wch: 10 }, // Status
        { wch: 15 }, // Nombre Plannings
        { wch: 40 }, // Points d'Arrêt
        { wch: 12 }  // Créé le
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Circuits');
      
      const today = new Date().toISOString().split('T')[0];
      const fileName = `circuits_export_${today}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      alert(`Export réussi ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export Excel');
    }
  };

  const getCircuitUsage = (circuitName) => {
    return plannings.filter(p => p.circuit === circuitName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Circuits</h1>
          <p className="text-gray-600 mt-1">
            {filteredCircuits.length} circuit(s) 
            {filteredCircuits.length !== circuits.length && ` sur ${circuits.length} total`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCircuits}
            className="btn-secondary flex items-center space-x-2"
            disabled={filteredCircuits.length === 0}
            title="Exporter les circuits vers Excel"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedCircuit(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Nouveau Circuit</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Circuits</p>
              <p className="text-2xl font-bold text-gray-900">{circuits.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiTruck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circuits Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {circuits.filter(c => c.status === 'actif').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Circuits Utilisés</p>
              <p className="text-2xl font-bold text-purple-600">
                {circuits.filter(c => getCircuitUsage(c.nom) > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiTruck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Plannings Totaux</p>
              <p className="text-2xl font-bold text-orange-600">{plannings.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="card">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Rechercher un circuit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Liste des circuits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCircuits.map((circuit, index) => {
            const usage = getCircuitUsage(circuit.nom);
            return (
              <motion.div
                key={circuit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiTruck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{circuit.nom}</h3>
                      <p className="text-sm text-gray-600">{circuit.description}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    circuit.status === 'actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {circuit.status || 'actif'}
                  </span>
                </div>

                <div className="space-y-3">
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Plannings:</span>
                    <span className={`font-medium ${usage > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {usage} planning(s)
                    </span>
                  </div>



                  {circuit.pointsArret && circuit.pointsArret.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Points d'arrêt:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {circuit.pointsArret.slice(0, 3).map((point, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {point}
                          </span>
                        ))}
                        {circuit.pointsArret.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            +{circuit.pointsArret.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedCircuit(circuit);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Modifier"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (usage > 0) {
                        alert(`Ce circuit est utilisé dans ${usage} planning(s). Impossible de le supprimer.`);
                      } else if (window.confirm('Êtes-vous sûr de vouloir supprimer ce circuit ?')) {
                        console.log('Suppression du circuit:', circuit.id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title={usage > 0 ? `Utilisé dans ${usage} planning(s)` : "Supprimer"}
                    disabled={usage > 0}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCircuits.length === 0 && (
        <div className="text-center py-12">
          <FiTruck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun circuit trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Aucun circuit ne correspond à votre recherche.'
              : 'Commencez par créer votre premier circuit.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setSelectedCircuit(null);
                setShowForm(true);
              }}
              className="btn-primary"
            >
              Créer un circuit
            </button>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <CircuitForm
          circuit={selectedCircuit}
          onClose={() => {
            setShowForm(false);
            setSelectedCircuit(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedCircuit(null);
          }}
        />
      )}
    </div>
  );
};

// Composant formulaire de circuit
const CircuitForm = ({ circuit, onClose, onSuccess }) => {
  const { addCircuit } = useData();
  
  const [formData, setFormData] = useState({
    nom: circuit?.nom || '',
    description: circuit?.description || '',
    status: circuit?.status || 'actif',
    pointsArret: circuit?.pointsArret || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPoint, setNewPoint] = useState('');

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

  const addPointArret = () => {
    if (newPoint.trim() && !formData.pointsArret.includes(newPoint.trim())) {
      setFormData(prev => ({
        ...prev,
        pointsArret: [...prev.pointsArret, newPoint.trim()]
      }));
      setNewPoint('');
    }
  };

  const removePointArret = (index) => {
    setFormData(prev => ({
      ...prev,
      pointsArret: prev.pointsArret.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du circuit est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const circuitData = {
        ...formData,
        createdAt: new Date().toISOString()
      };

      addCircuit(circuitData);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Erreur lors de la création du circuit:', error);
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
            {circuit ? 'Modifier le Circuit' : 'Créer un Circuit'}
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
                Nom du Circuit *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`input-field ${errors.nom ? 'border-red-300' : ''}`}
                placeholder="Ex: HAY MOHAMMEDI"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>


          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Description du circuit..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points d'Arrêt
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newPoint}
                onChange={(e) => setNewPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPointArret())}
                className="input-field flex-1"
                placeholder="Ajouter un point d'arrêt..."
              />
              <button
                type="button"
                onClick={addPointArret}
                className="btn-secondary"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.pointsArret.map((point, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {point}
                  <button
                    type="button"
                    onClick={() => removePointArret(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              ))}
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
              <span>{isSubmitting ? 'Enregistrement...' : (circuit ? 'Modifier' : 'Créer')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CircuitManagement; 