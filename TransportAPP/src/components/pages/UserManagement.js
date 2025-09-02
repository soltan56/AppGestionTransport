import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiUser,
  FiUserCheck,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiShield,
  FiTool,
  FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [chefs, setChefs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [expandedChefs, setExpandedChefs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showNewChefModal, setShowNewChefModal] = useState(false);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  
  // États pour l'assignation d'employés
  const [showAssignSection, setShowAssignSection] = useState(false);
  const [unassignedEmployees, setUnassignedEmployees] = useState([]);
  const [availableChefs, setAvailableChefs] = useState([]);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [selectedChefForAssign, setSelectedChefForAssign] = useState('');
  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    equipe: '',
    atelier: '',
    point_ramassage: '',
    circuit_affecte: '',
    type_contrat: ''
  });
  const [newChefForm, setNewChefForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'chef',
    atelier_id: null
  });

  // Gestion des chefs masqués (localStorage)
  const [hiddenChefIds, setHiddenChefIds] = useState(() => {
    try {
      const raw = localStorage.getItem('hiddenChefIds');
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });
  const [showHiddenChefsPanel, setShowHiddenChefsPanel] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('hiddenChefIds', JSON.stringify(Array.from(hiddenChefIds)));
    } catch {}
  }, [hiddenChefIds]);

  // Charger les données
  useEffect(() => {
    // Nettoyer les données en cache au démarrage
    setEmployees([]);
    setChefs([]);
    setUnassignedEmployees([]);
    setAvailableChefs([]);
    
    console.log('🧹 Nettoyage du cache des données...');
    
    fetchUsersAndEmployees();
    if (user?.role === 'administrateur' || user?.role === 'rh') {
      fetchAssignmentData();
    }
  }, []);

  // Build chefs from backend /api/chefs + /api/employees to attach employees by chef atelier
  const fetchUsersAndEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const [employeesResponse, chefsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/chefs', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (employeesResponse.ok && chefsResponse.ok) {
        const employeesData = await employeesResponse.json();
        const chefsData = await chefsResponse.json();

        setEmployees(employeesData);

        // Index employees by atelier_id
        const atelierIdToEmployees = new Map();
        for (const emp of employeesData) {
          const key = emp.atelier_id || 'none';
          if (!atelierIdToEmployees.has(key)) atelierIdToEmployees.set(key, []);
          atelierIdToEmployees.get(key).push(emp);
        }

        // Build chefs list with employees
        const chefsList = chefsData
          .map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            ateliers: c.ateliers || [],
            employees: c.ateliers && c.ateliers[0] ? (atelierIdToEmployees.get(c.ateliers[0].id) || []) : []
          }));

        setChefs(chefsList);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données pour l'assignation
  const fetchAssignmentData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('🔄 Récupération des données d\'assignation...');
      
      // Récupérer tous les employés
      const employeesResponse = await fetch('http://localhost:3001/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Récupérer tous les chefs
      const chefsResponse = await fetch('http://localhost:3001/api/chefs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (employeesResponse.ok && chefsResponse.ok) {
        const allEmployees = await employeesResponse.json();
        const allChefs = await chefsResponse.json();
        
        console.log(`📊 Employés récupérés: ${allEmployees.length}`);
        
        // Filtrer les employés non assignés
        const unassigned = allEmployees.filter(emp => !emp.atelier_chef_id);
        
        console.log(`📊 Employés non assignés: ${unassigned.length}`);
        unassigned.forEach(emp => {
          console.log(`  - ${emp.nom} ${emp.prenom} (ID: ${emp.id})`);
        });
        
        setUnassignedEmployees(unassigned);
        setAvailableChefs(allChefs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'assignation:', error);
    }
  };

  // Assigner un employé à un chef
  const handleAssignEmployee = async (employeeId, chefId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('🔄 Assignation employé:', employeeId, 'vers chef:', chefId);
      
      const response = await fetch(`http://localhost:3001/api/employees/${employeeId}/assign-chef`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chef_id: parseInt(chefId) })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Assignation réussie:', result);
        alert(`${result.employee.nom} ${result.employee.prenom} a été assigné avec succès !`);
        
        // Rafraîchir les données
        fetchUsersAndEmployees();
        fetchAssignmentData();
        setAssigningEmployee(null);
        setSelectedChefForAssign('');
      } else {
        const error = await response.json();
        console.error('❌ Erreur assignation:', error);
        alert(`Erreur d'assignation: ${error.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur de connexion assignation:', error);
      alert('Erreur de connexion lors de l\'assignation');
    }
  };

  // Désassigner un employé (le remettre en non assigné)
  const handleUnassignEmployee = async (employeeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cet employé de son chef ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('🔄 Désassignation employé:', employeeId);
      
      const response = await fetch(`http://localhost:3001/api/employees/${employeeId}/assign-chef`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chef_id: null })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Désassignation réussie:', result);
        alert(`${result.employee.nom} ${result.employee.prenom} a été retiré de son chef`);
        
        // Rafraîchir les données
        fetchUsersAndEmployees();
        fetchAssignmentData();
      } else {
        const error = await response.json();
        console.error('❌ Erreur désassignation:', error);
        alert(`Erreur de désassignation: ${error.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur de connexion désassignation:', error);
      alert('Erreur de connexion lors de la désassignation');
    }
  };

  const toggleChefExpansion = (chefId) => {
    const newExpanded = new Set(expandedChefs);
    if (newExpanded.has(chefId)) {
      newExpanded.delete(chefId);
    } else {
      newExpanded.add(chefId);
    }
    setExpandedChefs(newExpanded);
  };

  const getEmployeeStatusColor = (employee) => {
    const status = employee.type_contrat || 'CDI';
    switch (status) {
      case 'CDI': return 'bg-green-100 text-green-800';
      case 'Intérimaire': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTeamColor = (team) => {
    switch (team) {
      case 'Matin': return 'bg-yellow-100 text-yellow-800';
      case 'Soir': return 'bg-purple-100 text-purple-800';
      case 'Nuit': return 'bg-indigo-100 text-indigo-800';
      case 'Normal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditEmployee = (employee) => {
    console.log('📝 Modification employé:', employee);
    setEditingEmployee(employee);
    setEditForm({
      nom: employee.nom || '',
      prenom: employee.prenom || '',
      equipe: employee.equipe || '',
      atelier: employee.atelier || '',
      point_ramassage: employee.point_ramassage || '',
      circuit_affecte: employee.circuit_affecte || '',
      type_contrat: employee.type_contrat || 'CDI'
    });
  };

  // Save edited employee
  const saveEditedEmployee = async () => {
    if (!editingEmployee) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (response.ok) {
        setEditingEmployee(null);
        await fetchUsersAndEmployees();
        await fetchAssignmentData();
        alert('Employé mis à jour');
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    }
  };

  // Delete employee
  const deleteEmployeeApi = async (employeeId) => {
    if (!window.confirm('Supprimer cet employé ?')) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUsersAndEmployees();
        await fetchAssignmentData();
        alert('Employé supprimé');
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    }
  };

  // Unassign employee from chef
  const unassignEmployeeFromChef = async (employeeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/employees/${employeeId}/assign-chef`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ chef_id: null })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUsersAndEmployees();
        await fetchAssignmentData();
        alert('Employé retiré du chef');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    }
  };

  // Assign multiple employees to chef
  const assignEmployeesBatch = async (chefId, employeeIds) => {
    if (!employeeIds || employeeIds.length === 0) return;
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/chefs/${chefId}/assign-employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employee_ids: employeeIds })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchUsersAndEmployees();
        await fetchAssignmentData();
        alert('Employés assignés');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditForm({
      nom: '',
      prenom: '',
      equipe: '',
      atelier: '',
      point_ramassage: '',
      circuit_affecte: '',
      type_contrat: ''
    });
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/api/employees/${employeeId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          alert('Employé supprimé avec succès !');
          fetchUsersAndEmployees(); // Recharger les données
          fetchAssignmentData(); // Recharger aussi les données d'assignation
        } else if (response.status === 404) {
          alert('❌ Erreur: Cet employé n\'existe pas ou a déjà été supprimé');
          console.error('Employé ID non trouvé:', employeeId);
          // Recharger les données pour synchroniser l'affichage
          fetchUsersAndEmployees();
          fetchAssignmentData();
        } else {
          const errorData = await response.json();
          console.error('Erreur de suppression:', errorData);
          alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error('Erreur de connexion:', error);
        alert(`Erreur de connexion au serveur: ${error.message}`);
      }
    }
  };

  const handleNewChef = () => {
    setShowNewChefModal(true);
  };

  const handleCloseNewChefModal = () => {
    setShowNewChefModal(false);
    setNewChefForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'chef',
      atelier_id: null
    });
  };

  const handleCreateChef = async () => {
    try {
      // Validation
      if (!newChefForm.name || !newChefForm.email || !newChefForm.password) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (newChefForm.password !== newChefForm.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (newChefForm.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newChefForm.name,
          email: newChefForm.email,
          password: newChefForm.password,
          role: 'chef', // Toujours chef
          atelier_id: newChefForm.atelier_id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Chef créé avec succès : ${result.user.name}`);
        handleCloseNewChefModal();
        fetchUsersAndEmployees(); // Recharger les données
      } else {
        const errorData = await response.json();
        alert(`Erreur lors de la création: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    }
  };

  // Statistiques
  const totalEmployees = employees.length;
  const employeesWithChef = employees.filter(emp => emp.atelier_chef_id).length;
  const employeesWithoutChef = totalEmployees - employeesWithChef;
  const totalChefs = chefs.length;

  // Filtrage
  const filteredChefs = chefs.filter(chef => 
    chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.atelier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.employees.some(emp => 
      `${emp.nom} ${emp.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Appliquer le masquage
  const visibleChefs = filteredChefs.filter(c => !hiddenChefIds.has(c.id));
  const maskedChefs = chefs.filter(c => hiddenChefIds.has(c.id));

  const handleHideChef = (chefId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setHiddenChefIds(prev => {
      const next = new Set(prev);
      next.add(chefId);
      return next;
    });
  };

  const handleUnhideChef = (chefId) => {
    setHiddenChefIds(prev => {
      const next = new Set(prev);
      next.delete(chefId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Chefs</h1>
          <p className="text-gray-600 mt-1">
            Administration complète des chefs d'atelier et gestion de leurs équipes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {(user?.role === 'administrateur' || user?.role === 'rh') && (
            <button
              onClick={() => setShowHiddenChefsPanel(v => !v)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showHiddenChefsPanel ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              title="Afficher les chefs masqués"
            >
              <FiEyeOff className="h-4 w-4" />
              <span>Chefs masqués{maskedChefs.length ? ` (${maskedChefs.length})` : ''}</span>
            </button>
          )}
          {(user?.role === 'administrateur' || user?.role === 'rh') && (
            <button
              onClick={() => setShowAssignSection(!showAssignSection)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAssignSection 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <FiSettings className="h-4 w-4" />
              <span>{showAssignSection ? 'Masquer Assignation' : 'Assigner Employés'}</span>
            </button>
          )}
          {(user?.role === 'administrateur' || user?.role === 'rh') && (
            <button 
              onClick={handleNewChef}
              className="btn-primary flex items-center space-x-2"
            >
              <FiUserPlus className="h-4 w-4" />
              <span>Nouveau Chef</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chefs d'Atelier</p>
              <p className="text-2xl font-bold text-green-600">{totalChefs}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTool className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec Chef Assigné</p>
              <p className="text-2xl font-bold text-purple-600">{employeesWithChef}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gestion Globale</p>
              <p className="text-2xl font-bold text-orange-600">{employeesWithoutChef}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiShield className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section d'assignation des employés */}
      {showAssignSection && (user?.role === 'administrateur' || user?.role === 'rh') && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <FiSettings className="w-5 h-5 text-orange-600" />
            <span>Assignation des Employés aux Chefs</span>
          </h2>
          
          {employees.filter(emp => !emp.atelier_chef_id).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Employés non assignés ({employees.filter(emp => !emp.atelier_chef_id).length})
              </h3>
              <div className="grid gap-3">
                {employees.filter(emp => !emp.atelier_chef_id).map(employee => (
                  <div key={employee.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {employee.nom} {employee.prenom}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{employee.equipe}</span>
                          {employee.atelier && (
                            <>
                              <span>•</span>
                              <span>{employee.atelier}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {assigningEmployee === employee.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedChefForAssign}
                            onChange={(e) => setSelectedChefForAssign(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Sélectionner un chef</option>
                            {availableChefs.filter(c => !hiddenChefIds.has(c.id)).map(chef => (
                              <option key={chef.id} value={chef.id}>
                                {chef.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignEmployee(employee.id, selectedChefForAssign)}
                            disabled={!selectedChefForAssign}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Assigner
                          </button>
                          <button
                            onClick={() => {
                              setAssigningEmployee(null);
                              setSelectedChefForAssign('');
                            }}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningEmployee(employee.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <FiUserCheck className="w-4 h-4" />
                          <span>Assigner</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {employees.filter(emp => !emp.atelier_chef_id).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FiUserCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Tous les employés sont assignés à des chefs !</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Barre de recherche */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un chef, atelier ou employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="btn-secondary">
            <FiSettings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Panneau des chefs masqués */}
      {showHiddenChefsPanel && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chefs masqués ({maskedChefs.length})</h3>
          </div>
          {maskedChefs.length === 0 ? (
            <div className="text-gray-500">Aucun chef masqué</div>
          ) : (
            <div className="space-y-2">
              {maskedChefs.map((chef) => (
                <div key={chef.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg" />
                    <div>
                      <div className="font-medium text-gray-900">{chef.name}</div>
                      <div className="text-sm text-gray-600">{chef.ateliers && chef.ateliers[0] ? chef.ateliers[0].nom : '—'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnhideChef(chef.id)}
                    className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  >
                    Réactiver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vue hiérarchique Chefs -> Employés */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Structure Organisationnelle</h3>
        
        <div className="space-y-4">
          {visibleChefs.map((chef) => (
            <motion.div
              key={chef.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* En-tête du chef */}
              <div
                onClick={() => toggleChefExpansion(chef.id)}
                className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 cursor-pointer hover:from-emerald-100 hover:to-emerald-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {expandedChefs.has(chef.id) ? (
                        <FiChevronDown className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <FiChevronRight className="h-5 w-5 text-emerald-600" />
                      )}
                      <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <FiTool className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">Chef de {chef.ateliers && chef.ateliers[0] ? chef.ateliers[0].nom : '—'}</h4>
                      <p className="text-sm text-gray-600">({chef.name})</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {chef.employees.length} employé(s)
                      </p>
                      <p className="text-xs text-gray-500">
                        Équipes: {[...new Set(chef.employees.map(emp => emp.equipe))].join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button onClick={(e) => { e.stopPropagation(); /* edit */ }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); /* view */ }} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleHideChef(chef.id, e)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Masquer ce chef"
                      >
                        <FiEyeOff className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des employés */}
              <AnimatePresence>
                {expandedChefs.has(chef.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border-t border-gray-200"
                  >
                    <div className="p-4">
                      <div className="grid gap-3">
                        {chef.employees.map((employee, index) => (
                          <motion.div
                            key={employee.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiUser className="h-4 w-4 text-white" />
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-900">
                                  {employee.nom} {employee.prenom}
                                </h5>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <FiTool className="h-3 w-3 mr-1" />
                                    {employee.point_ramassage || employee.circuit_affecte || 'Point de ramassage non défini'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getTeamColor(employee.equipe)}`}>
                                {employee.equipe}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getEmployeeStatusColor(employee)}`}>
                                {employee.type_contrat || 'CDI'}
                              </span>
                              
                              <div className="flex items-center space-x-1">
                                {(user?.role === 'administrateur' || user?.role === 'rh') && (
                                  <button
                                    onClick={() => unassignEmployeeFromChef(employee.id)}
                                    className="p-1 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                                    title="Retirer de ce chef"
                                  >
                                    <FiUserCheck className="h-3 w-3" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleEditEmployee(employee)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <FiEdit className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => deleteEmployeeApi(employee.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                >
                                  <FiTrash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {chef.employees.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FiUsers className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                          <p>Aucun employé assigné à ce chef</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {visibleChefs.length === 0 && (
          <div className="text-center py-12">
            <FiTool className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun chef trouvé</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun chef d\'atelier configuré'}
            </p>
          </div>
        )}
      </div>

      {/* Employés sans chef (gestion globale) */}
      {employeesWithoutChef > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiShield className="h-5 w-5 text-orange-600 mr-2" />
            Employés en Gestion Globale ({employeesWithoutChef})
          </h3>
          
          <div className="grid gap-3">
            {employees.filter(emp => !emp.atelier_chef_id).map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiUser className="h-4 w-4 text-white" />
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {employee.nom} {employee.prenom}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {employee.atelier || 'Atelier non défini'} • {employee.point_ramassage || employee.circuit_affecte || 'Point de ramassage non défini'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTeamColor(employee.equipe)}`}>
                    {employee.equipe}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    {(user?.role === 'administrateur' || user?.role === 'rh') && (
                      <>
                        <button 
                          onClick={() => handleEditEmployee(employee)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <FiEdit className="h-3 w-3" />
                        </button>
                        <button 
                          onClick={() => deleteEmployeeApi(employee.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifier l'employé
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={editForm.prenom}
                    onChange={(e) => setEditForm({...editForm, prenom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Équipe
                </label>
                <select
                  value={editForm.equipe}
                  onChange={(e) => setEditForm({...editForm, equipe: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une équipe</option>
                  <option value="MATIN">MATIN</option>
                  <option value="SOIR">SOIR</option>
                  <option value="Normal">Normal</option>
                  <option value="Nuit">Nuit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atelier
                </label>
                <select
                  value={editForm.atelier}
                  onChange={(e) => setEditForm({...editForm, atelier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un atelier</option>
                  <option value="MPC">MPC</option>
                  <option value="EOLE">EOLE</option>
                  <option value="VEG">VEG</option>
                  <option value="IND BTES">IND BTES</option>
                  <option value="QUALITE">QUALITE</option>
                  <option value="EXPEDITIONS">EXPEDITIONS</option>
                  <option value="TECHNIQUE">TECHNIQUE</option>
                  <option value="INFIRMERIE">INFIRMERIE</option>
                  <option value="ELECTRIQUE">ELECTRIQUE</option>
                  <option value="ANAPEC">ANAPEC</option>
                  <option value="INTERIM QUALITE">INTERIM QUALITE</option>
                  <option value="ACC">ACC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Point de Ramassage
                </label>
                <input
                  type="text"
                  value={editForm.point_ramassage}
                  onChange={(e) => setEditForm({...editForm, point_ramassage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: HAY ELBARAKA RUE JOUDART"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Circuit Affecté
                </label>
                <select
                  value={editForm.circuit_affecte}
                  onChange={(e) => setEditForm({...editForm, circuit_affecte: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un circuit</option>
                  <option value="HAY MOLAY RCHID">HAY MOLAY RCHID</option>
                  <option value="RAHMA">RAHMA</option>
                  <option value="SIDI MOUMEN">SIDI MOUMEN</option>
                  <option value="AZHAR">AZHAR</option>
                  <option value="HAY MOHAMMEDI">HAY MOHAMMEDI</option>
                  <option value="DERB SULTAN">DERB SULTAN</option>
                  <option value="ANASSI">ANASSI</option>
                  <option value="SIDI OTHMANE">SIDI OTHMANE</option>
                  <option value="MOHAMMEDIA">MOHAMMEDIA</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de Contrat
                </label>
                <select
                  value={editForm.type_contrat}
                  onChange={(e) => setEditForm({...editForm, type_contrat: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CDI">CDI</option>
                  <option value="Intérimaire">Intérimaire</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveEditedEmployee}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de création de nouveau chef */}
      {showNewChefModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <FiUserPlus className="inline h-5 w-5 mr-2 text-blue-600" />
              Créer un nouveau chef d'atelier
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={newChefForm.name}
                  onChange={(e) => setNewChefForm({...newChefForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ahmed Ben Ali"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newChefForm.email}
                  onChange={(e) => setNewChefForm({...newChefForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ahmed.benali@transport.ma"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={newChefForm.password}
                  onChange={(e) => setNewChefForm({...newChefForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  value={newChefForm.confirmPassword}
                  onChange={(e) => setNewChefForm({...newChefForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Répéter le mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-gray-700">Chef d'Atelier</span>
                </div>
                <input type="hidden" value="chef" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atelier assigné
                </label>
                <select
                  value={newChefForm.atelier_id || ''}
                  onChange={(e) => setNewChefForm({...newChefForm, atelier_id: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un atelier (optionnel)</option>
                  <option value="1">Atelier Nord</option>
                  <option value="2">Atelier Sud</option>
                  <option value="3">Atelier Ouest</option>
                  <option value="4">Atelier Est</option>
                  <option value="5">Atelier Central</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseNewChefModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateChef}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer le chef
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;