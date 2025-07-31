import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { FiSave, FiX, FiMapPin, FiUsers, FiTruck, FiSettings } from 'react-icons/fi';

const PlanningForm = ({ onClose, onSuccess }) => {
  const { addPlanning, circuits, ateliers, teams, employees } = useData();
  
  const [formData, setFormData] = useState({
    nom: '',
    pointRamassage: '',
    circuit: '',
    equipe: '',
    atelier: '',
    dateDebut: '',
    dateFin: '',
    status: 'actif'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Points de ramassage extraits des employés existants
  const pointsRamassage = [...new Set(employees
    .map(emp => emp.point_ramassage || emp.pointRamassage)
    .filter(point => point && point.trim() !== '')
  )].sort();

  // Ateliers extraits des employés existants
  const ateliersFromEmployees = [...new Set(employees
    .map(emp => emp.atelier)
    .filter(atelier => atelier && atelier.trim() !== '')
  )].sort();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur si le champ est corrigé
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
      newErrors.nom = 'Le nom du planning est requis';
    }

    if (!formData.pointRamassage) {
      newErrors.pointRamassage = 'Le point de ramassage est requis';
    }

    if (!formData.circuit) {
      newErrors.circuit = 'Le circuit est requis';
    }

    if (!formData.equipe) {
      newErrors.equipe = 'L\'équipe est requise';
    }

    if (!formData.atelier) {
      newErrors.atelier = 'L\'atelier est requis';
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const planning = {
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user' // À remplacer par l'utilisateur connecté
      };

      addPlanning(planning);
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la création du planning:', error);
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Créer un Planning</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du planning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiSettings className="inline mr-2" />
              Nom du Planning *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`input-field ${errors.nom ? 'border-red-500' : ''}`}
              placeholder="Ex: Planning Transport Matin Zone A"
            />
            {errors.nom && (
              <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
            )}
          </div>

          {/* Point de ramassage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline mr-2" />
              Point de Ramassage *
            </label>
            <select
              name="pointRamassage"
              value={formData.pointRamassage}
              onChange={handleChange}
              className={`input-field ${errors.pointRamassage ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner un point de ramassage</option>
              {pointsRamassage.map((point, index) => (
                <option key={index} value={point}>{point}</option>
              ))}
            </select>
            {errors.pointRamassage && (
              <p className="mt-1 text-sm text-red-600">{errors.pointRamassage}</p>
            )}
          </div>

          {/* Circuit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiTruck className="inline mr-2" />
              Circuit *
            </label>
            <select
              name="circuit"
              value={formData.circuit}
              onChange={handleChange}
              className={`input-field ${errors.circuit ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner un circuit</option>
              {circuits.map((circuit) => (
                <option key={circuit.id} value={circuit.nom}>
                  {circuit.nom}
                </option>
              ))}
            </select>
            {errors.circuit && (
              <p className="mt-1 text-sm text-red-600">{errors.circuit}</p>
            )}
            {circuits.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">
                Aucun circuit disponible. Créez d'abord des circuits.
              </p>
            )}
          </div>

          {/* Équipe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUsers className="inline mr-2" />
              Équipe *
            </label>
            <select
              name="equipe"
              value={formData.equipe}
              onChange={handleChange}
              className={`input-field ${errors.equipe ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner une équipe</option>
              {teams.map((team, index) => (
                <option key={index} value={team}>{team}</option>
              ))}
            </select>
            {errors.equipe && (
              <p className="mt-1 text-sm text-red-600">{errors.equipe}</p>
            )}
          </div>

          {/* Atelier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiSettings className="inline mr-2" />
              Atelier *
            </label>
            <select
              name="atelier"
              value={formData.atelier}
              onChange={handleChange}
              className={`input-field ${errors.atelier ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner un atelier</option>
              {ateliersFromEmployees.map((atelier, index) => (
                <option key={index} value={atelier}>{atelier}</option>
              ))}
            </select>
            {errors.atelier && (
              <p className="mt-1 text-sm text-red-600">{errors.atelier}</p>
            )}
            {ateliersFromEmployees.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">
                Aucun atelier disponible. Créez d'abord des ateliers.
              </p>
            )}
          </div>

          {/* Dates et heures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Début *
              </label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                className={`input-field ${errors.dateDebut ? 'border-red-500' : ''}`}
              />
              {errors.dateDebut && (
                <p className="mt-1 text-sm text-red-600">{errors.dateDebut}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de Fin
              </label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Boutons */}
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
              <span>{isSubmitting ? 'Création...' : 'Créer Planning'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PlanningForm; 