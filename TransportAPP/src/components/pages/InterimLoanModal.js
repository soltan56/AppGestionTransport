import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiShuffle,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiUser,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';

const InterimLoanModal = ({ isOpen, onClose, interimaire, ateliers, onSuccess }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    from_atelier_id: '',
    to_atelier_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (interimaire) {
      setFormData(prev => ({
        ...prev,
        employee_id: interimaire.id,
        from_atelier_id: interimaire.atelier_id
      }));
    }
  }, [interimaire]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation des dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        setError('La date de début ne peut pas être dans le passé');
        setLoading(false);
        return;
      }

      if (endDate <= startDate) {
        setError('La date de fin doit être après la date de début');
        setLoading(false);
        return;
      }

      // Récupérer le token d'authentification
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        setError('Token d\'authentification manquant');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/interim-loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création du prêt');
      }
    } catch (error) {
      console.error('Erreur lors de la création du prêt:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAtelierName = (atelierId) => {
    const atelier = ateliers.find(a => a.id === parseInt(atelierId));
    return atelier ? atelier.nom : 'Inconnu';
  };

  const isFormValid = () => {
    return formData.employee_id && 
           formData.from_atelier_id && 
           formData.to_atelier_id && 
           formData.start_date && 
           formData.end_date && 
           formData.reason.trim();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          >
            {/* En-tête */}
            <div className="bg-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiShuffle className="h-6 w-6 text-white mr-3" />
                  <h3 className="text-lg font-semibold text-white">
                    Prêt d'Intérimaire
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="px-6 py-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <FiCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Prêt créé avec succès !
                  </h3>
                  <p className="text-sm text-gray-500">
                    L'intérimaire a été prêté avec succès.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations de l'intérimaire */}
                  {interimaire && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {interimaire.prenom} {interimaire.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {interimaire.id} | Équipe: {interimaire.equipe}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sélection de l'intérimaire (si pas pré-sélectionné) */}
                  {!interimaire && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intérimaire à prêter
                      </label>
                      <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un intérimaire</option>
                        {/* Les options seront chargées dynamiquement */}
                      </select>
                    </div>
                  )}

                  {/* Atelier de destination */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline h-4 w-4 mr-1" />
                      Atelier de destination
                    </label>
                    <select
                      name="to_atelier_id"
                      value={formData.to_atelier_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un atelier</option>
                      {ateliers
                        .filter(a => a.id !== parseInt(formData.from_atelier_id))
                        .map(atelier => (
                          <option key={atelier.id} value={atelier.id}>
                            {atelier.nom}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Dates de prêt */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiCalendar className="inline h-4 w-4 mr-1" />
                        Date de début
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiCalendar className="inline h-4 w-4 mr-1" />
                        Date de fin
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Raison du prêt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiFileText className="inline h-4 w-4 mr-1" />
                      Raison du prêt
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Décrivez la raison du prêt d'intérimaire..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Message d'erreur */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <FiAlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid() || loading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ${
                        isFormValid() && !loading
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Création...
                        </div>
                      ) : (
                        'Créer le prêt'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default InterimLoanModal; 