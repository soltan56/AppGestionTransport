import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiSettings,
  FiSave,
  FiX,
  FiUserPlus,
  FiUserMinus,
  FiEye,
  FiEyeOff,
  FiUser
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const AdminAteliers = () => {
  const { user } = useAuth();
  const { fetchAteliers: fetchGlobalAteliers } = useData();
  const [ateliers, setAteliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAtelier, setEditingAtelier] = useState(null);
  const [showChefAssignment, setShowChefAssignment] = useState(null);
  const [availableChefs, setAvailableChefs] = useState([]);
  const [selectedChefs, setSelectedChefs] = useState([]);
  const [expandedAteliers, setExpandedAteliers] = useState({});
  const [atelierEmployees, setAtelierEmployees] = useState({});
  const [showEmployeeForm, setShowEmployeeForm] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    localisation: '',
    responsable: ''
  });

  const [employeeFormData, setEmployeeFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    equipe: '',
    type_contrat: 'CDI',
    date_embauche: '',
    point_ramassage: '',
    circuit_affecte: ''
  });

  useEffect(() => {
    if (user?.role === 'administrateur') {
      fetchAteliers();
      fetchAvailableChefs();
    }
  }, [user]);

  const fetchAteliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/ateliers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAteliers(data);
        // Mettre à jour aussi le contexte global
        fetchGlobalAteliers();
      } else {
        console.error('Erreur lors de la récupération des ateliers');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableChefs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/chefs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableChefs(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des chefs:', error);
    }
  };

  const fetchAtelierEmployees = async (atelierId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/ateliers/${atelierId}/employes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAtelierEmployees(prev => ({
          ...prev,
          [atelierId]: data
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
    }
  };

  const toggleAtelierExpansion = async (atelierId) => {
    const isExpanded = expandedAteliers[atelierId];
    setExpandedAteliers(prev => ({
      ...prev,
      [atelierId]: !isExpanded
    }));
    
    if (!isExpanded && !atelierEmployees[atelierId]) {
      await fetchAtelierEmployees(atelierId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingAtelier 
        ? `http://localhost:3001/api/ateliers/${editingAtelier.id}`
        : 'http://localhost:3001/api/ateliers';
      
      const method = editingAtelier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setEditingAtelier(null);
        setFormData({ nom: '', description: '', localisation: '', responsable: '' });
        fetchAteliers();
        alert(editingAtelier ? 'Atelier modifié avec succès' : 'Atelier créé avec succès');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const atelierId = showEmployeeForm;
      
      const url = editingEmployee 
        ? `http://localhost:3001/api/ateliers/${atelierId}/employes/${editingEmployee.id}`
        : `http://localhost:3001/api/ateliers/${atelierId}/employes`;
      
      const method = editingEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(employeeFormData)
      });
      
      if (response.ok) {
        setShowEmployeeForm(null);
        setEditingEmployee(null);
        setEmployeeFormData({
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          equipe: '',
          type_contrat: 'CDI',
          date_embauche: '',
          point_ramassage: '',
          circuit_affecte: ''
        });
        await fetchAtelierEmployees(atelierId);
        await fetchAteliers(); // Refresh count
        alert(editingEmployee ? 'Employé modifié avec succès' : 'Employé créé avec succès');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteEmployee = async (atelierId, employeeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/ateliers/${atelierId}/employes/${employeeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchAtelierEmployees(atelierId);
        await fetchAteliers(); // Refresh count
        alert('Employé supprimé avec succès');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const openEditEmployeeForm = (atelierId, employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(atelierId);
    setEmployeeFormData({
      nom: employee.nom || '',
      prenom: employee.prenom || '',
      email: employee.email || '',
      telephone: employee.telephone || '',
      equipe: employee.equipe || '',
      type_contrat: employee.type_contrat || 'CDI',
      date_embauche: employee.date_embauche ? employee.date_embauche.split('T')[0] : '',
      point_ramassage: employee.point_ramassage || '',
      circuit_affecte: employee.circuit_affecte || ''
    });
  };

  const handleDelete = async (atelierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet atelier ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/ateliers/${atelierId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchAteliers();
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleAssignChefs = async (atelierId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/ateliers/${atelierId}/chefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chef_ids: selectedChefs })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Mettre à jour la liste des ateliers
        await fetchAteliers();
        setShowChefAssignment(null);
        setSelectedChefs([]);
        alert('Chefs assignés avec succès');
      } else {
        alert(data.error || 'Erreur lors de l\'assignation des chefs');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'assignation des chefs');
    }
  };

  const openEditForm = (atelier) => {
    setEditingAtelier(atelier);
    setFormData({
      nom: atelier.nom,
      description: atelier.description || '',
      localisation: atelier.localisation || '',
      responsable: atelier.responsable || ''
    });
    setShowForm(true);
  };

  const openChefAssignment = (atelier) => {
    setShowChefAssignment(atelier);
    setSelectedChefs(atelier.chefs.map(chef => chef.id));
  };

  if (user?.role !== 'administrateur') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FiEyeOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ateliers</h1>
          <p className="text-gray-600">Administrer les ateliers et leurs chefs</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="h-4 w-4" />
          <span>Nouvel Atelier</span>
        </button>
      </div>

      {/* Formulaire d'ajout/modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAtelier ? 'Modifier l\'atelier' : 'Nouvel atelier'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAtelier(null);
                  setFormData({ nom: '', description: '', localisation: '', responsable: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'atelier *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={formData.localisation}
                    onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAtelier(null);
                    setFormData({ nom: '', description: '', localisation: '', responsable: '' });
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FiSave className="h-4 w-4 mr-2" />
                  {editingAtelier ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal d'assignation de chefs */}
      <AnimatePresence>
        {showChefAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigner des chefs à {showChefAssignment.nom}
                </h3>
                <button
                  onClick={() => {
                    setShowChefAssignment(null);
                    setSelectedChefs([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-600">
                  Sélectionnez jusqu'à 2 chefs pour cet atelier :
                </p>
                {availableChefs.map((chef) => {
                  // Vérifier si le chef est assigné à d'autres ateliers que celui en cours
                  const isAssignedToOthers = chef.ateliers && chef.ateliers.length > 0 && 
                    !chef.ateliers.some(a => a.id === showChefAssignment.id);
                  
                  // Le chef peut être sélectionné s'il n'est pas assigné ailleurs OU s'il est déjà assigné à CET atelier
                  const isDisabled = isAssignedToOthers;
                  
                  return (
                    <label 
                      key={chef.id} 
                      className={`flex items-start space-x-2 py-1 rounded transition-colors ${
                        isDisabled 
                          ? 'cursor-not-allowed opacity-60' 
                          : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChefs.includes(chef.id)}
                        onChange={(e) => {
                          if (!isDisabled) {
                            if (e.target.checked) {
                              if (selectedChefs.length < 2) {
                                setSelectedChefs([...selectedChefs, chef.id]);
                              }
                            } else {
                              setSelectedChefs(selectedChefs.filter(id => id !== chef.id));
                            }
                          }
                        }}
                        disabled={isDisabled}
                        className={`mt-1 rounded border-gray-300 ${
                          isDisabled 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-indigo-600 focus:ring-indigo-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          isDisabled ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {chef.name}
                        </div>
                        {chef.ateliers && chef.ateliers.length > 0 && (
                          <div className={`text-xs mt-0.5 ${
                            isDisabled ? 'text-red-500' : 'text-green-600'
                          }`}>
                            {isDisabled 
                              ? `⚠️ Déjà assigné`
                              : `✓ Dans: ${chef.ateliers[0]?.nom || ''}`
                            }
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowChefAssignment(null);
                    setSelectedChefs([]);
                  }}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleAssignChefs(showChefAssignment.id)}
                  className="btn-primary"
                >
                  Assigner
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Formulaire Employé */}
      <AnimatePresence>
        {showEmployeeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEmployeeForm(null);
              setEditingEmployee(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
                </h3>
                <button
                  onClick={() => {
                    setShowEmployeeForm(null);
                    setEditingEmployee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.nom}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, nom: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.prenom}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, prenom: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={employeeFormData.telephone}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, telephone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Équipe
                    </label>
                    <select
                      value={employeeFormData.equipe}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, equipe: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Matin">Matin</option>
                      <option value="Après-midi">Après-midi</option>
                      <option value="Nuit">Nuit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de contrat
                    </label>
                    <select
                      value={employeeFormData.type_contrat}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, type_contrat: e.target.value })}
                      className="input-field"
                    >
                      <option value="CDI">CDI</option>
                      <option value="Intérimaire">Intérimaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'embauche
                    </label>
                    <input
                      type="date"
                      value={employeeFormData.date_embauche}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, date_embauche: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point de ramassage
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.point_ramassage}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, point_ramassage: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Circuit affecté
                    </label>
                    <input
                      type="text"
                      value={employeeFormData.circuit_affecte}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, circuit_affecte: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmployeeForm(null);
                      setEditingEmployee(null);
                    }}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiSave className="h-4 w-4" />
                    <span>{editingEmployee ? 'Modifier' : 'Créer'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des ateliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ateliers.map((atelier) => (
          <motion.div
            key={atelier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{atelier.nom}</h3>
                {atelier.description && (
                  <p className="text-sm text-gray-600 mt-1">{atelier.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openChefAssignment(atelier)}
                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                  title="Assigner des chefs"
                >
                  <FiUserPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEditForm(atelier)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(atelier.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Informations de l'atelier */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {atelier.localisation && (
                  <div>
                    <span className="text-gray-500">Localisation:</span>
                    <p className="font-medium">{atelier.localisation}</p>
                  </div>
                )}
                {atelier.responsable && (
                  <div>
                    <span className="text-gray-500">Responsable:</span>
                    <p className="font-medium">{atelier.responsable}</p>
                  </div>
                )}
              </div>

              {/* Chefs assignés */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FiUsers className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    Chefs assignés ({(atelier.chefs || []).length}/2)
                  </span>
                </div>
                {(atelier.chefs && atelier.chefs.length > 0) ? (
                  <div className="space-y-1">
                    {atelier.chefs.map((chef) => (
                      <div key={chef.id} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900">{chef.name}</span>
                        <span className="text-gray-500">({chef.email})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucun chef assigné</p>
                )}
              </div>

              {/* Employés */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FiSettings className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Employés ({atelier.nombre_employes || 0})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setShowEmployeeForm(atelier.id);
                        setEditingEmployee(null);
                        setEmployeeFormData({
                          nom: '',
                          prenom: '',
                          email: '',
                          telephone: '',
                          equipe: '',
                          type_contrat: 'CDI',
                          date_embauche: '',
                          point_ramassage: '',
                          circuit_affecte: ''
                        });
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Ajouter un employé"
                    >
                      <FiUserPlus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleAtelierExpansion(atelier.id)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title={expandedAteliers[atelier.id] ? "Masquer" : "Afficher"}
                    >
                      {expandedAteliers[atelier.id] ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Liste des employés si l'atelier est étendu */}
                {expandedAteliers[atelier.id] && (
                  <div className="mt-2 space-y-2">
                    {atelierEmployees[atelier.id] && atelierEmployees[atelier.id].length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {atelierEmployees[atelier.id].map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <FiUser className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {employee.nom} {employee.prenom}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {employee.equipe} - {employee.type_contrat}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditEmployeeForm(atelier.id, employee)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Modifier"
                              >
                                <FiEdit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(atelier.id, employee.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Supprimer"
                              >
                                <FiTrash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                        Aucun employé dans cet atelier
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {ateliers.length === 0 && (
        <div className="text-center py-12">
          <FiSettings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun atelier</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre premier atelier.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Créer un atelier
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAteliers; 