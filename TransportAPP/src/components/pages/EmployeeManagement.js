import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiUser,
  FiSave,
  FiX,
  FiFilter,
  FiDownload,
  FiBriefcase,
  FiTruck
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';

const EmployeeManagement = () => {
  const { employees, deleteEmployee, plannings } = useData();
  const { user, token } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSearch, setRequestSearch] = useState('');
  const [selectedForRequest, setSelectedForRequest] = useState(new Set());
  const [sendingRequest, setSendingRequest] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  const loadMyRequests = async () => {
    try {
      const resp = await fetch('http://localhost:3001/api/requests/mine', {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const rows = await resp.json();
        setMyRequests(rows);
      }
    } catch (e) {}
  };

  useEffect(() => { loadMyRequests(); }, [token]);

  // Charger tous les employés pour la demande (chefs doivent voir tout le monde)
  useEffect(() => {
    const loadAll = async () => {
      try {
        const resp = await fetch('http://localhost:3001/api/employees/all', { credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
        if (resp.ok) { const rows = await resp.json(); setAllEmployees(rows); }
      } catch(e) {}
    };
    if (token) loadAll();
  }, [token]);

  // Déterminer les permissions selon le rôle
  const isChef = user?.role === 'chef' || user?.role === 'chef_d_atelier';
  const isAdmin = user?.role === 'administrateur';
  const isRH = user?.role === 'rh';

  // Les RH ont maintenant les mêmes permissions que les administrateurs
  const canManageEmployees = isChef || isAdmin || isRH;

  // Employés prédéfinis basés sur les données fournies (conservés dans la base de données)
  // Liste supprimée pour éviter les warnings ESLint car non utilisée dans le composant

  const teams = ['MATIN', 'SOIR', 'Normal']; // Valeurs réelles de la base de données

  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(employee =>
        `${employee.nom} ${employee.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.atelier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.point_ramassage?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTeam !== 'all') {
      filtered = filtered.filter(employee => employee.equipe === filterTeam);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filterTeam]);

  // Les employés sont maintenant chargés depuis l'API via le DataContext

  const handleExportEmployees = () => {
    if (filteredEmployees.length === 0) {
      alert('Aucun employé à exporter');
      return;
    }

    const employeeData = filteredEmployees.map(employee => ({
      'Nom': employee.nom,
      'Prénom': employee.prenom,
      'Point de Ramassage': employee.pointRamassage || employee.point_ramassage || '',
      'Circuit Affecté': employee.circuit_affecte || '',
      'Équipe': employee.equipe || '',
      'Atelier': employee.atelier || '',
      'Type Contrat': employee.type_contrat || '',
      'Date Embauche': employee.date_embauche || '',
      'Status': employee.status || 'actif',
      'Créé le': employee.created_at ? new Date(employee.created_at).toLocaleDateString('fr-FR') : ''
    }));

    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(employeeData);
      
      worksheet['!cols'] = [
        { wch: 20 }, // Nom
        { wch: 20 }, // Prénom
        { wch: 40 }, // Point de Ramassage
        { wch: 20 }, // Circuit Affecté
        { wch: 10 }, // Équipe
        { wch: 20 }, // Atelier
        { wch: 15 }, // Type Contrat
        { wch: 12 }, // Date Embauche
        { wch: 10 }, // Status
        { wch: 12 }  // Créé le
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employés');
      
      const today = new Date().toISOString().split('T')[0];
      const fileName = `employes_export_${today}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
      alert(`Export réussi ! Fichier téléchargé : ${fileName}`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export Excel');
    }
  };

  // Fonction supprimée car non utilisée (warning ESLint)
  // const getEmployeeUsage = (employeeName) => {
  //   return plannings.filter(p => 
  //     p.nom && p.nom.toLowerCase().includes(employeeName.toLowerCase())
  //   ).length;
  // };



  const getTeamColor = (team) => {
    switch (team) {
      case 'Matin':
        return 'bg-yellow-100 text-yellow-800';
      case 'Soir':
        return 'bg-blue-100 text-blue-800';
      case 'Nuit':
        return 'bg-purple-100 text-purple-800';
      case 'Normal':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isChef ? 'Mes Employés' : (isAdmin || isRH) ? 'Gestion Globale des Employés' : 'Consultation des Employés'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isChef && (
              <>Employés sous votre responsabilité - {filteredEmployees.length} employé(s)</>
            )}
            {isAdmin && (
              <>Gestion complète de tous les employés - {filteredEmployees.length} employé(s) 
              {filteredEmployees.length !== employees.length && ` sur ${employees.length} total`}</>
            )}
            {isRH && (
              <>Gestion complète de tous les employés - {filteredEmployees.length} employé(s) 
              {filteredEmployees.length !== employees.length && ` sur ${employees.length} total`}</>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isChef && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="btn-secondary flex items-center space-x-2"
              title="Demander des employés"
            >
              <FiUsers className="h-4 w-4" />
              <span>Demander des employés</span>
            </button>
          )}
          
          {/* Les RH ont maintenant accès à l'ajout d'employés */}
          {canManageEmployees && !isChef && (
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setShowForm(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus className="h-4 w-4" />
              <span>{isChef ? 'Ajouter un Employé' : 'Nouvel Employé'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employés</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipe Matin</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.equipe === 'MATIN').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiBriefcase className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipe Soir</p>
              <p className="text-2xl font-bold text-orange-600">
                {employees.filter(e => e.equipe === 'SOIR').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiUser className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Équipes</p>
              <p className="text-2xl font-bold text-purple-600">{teams.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, atelier, point de ramassage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">Toutes équipes</option>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="card">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nom Complet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Point de Ramassage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Circuit</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Équipe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Atelier</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {employee.nom} {employee.prenom}
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            <FiBriefcase className="h-3 w-3 text-gray-400 mr-1" />
                            {employee.type_contrat || 'Non défini'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="text-sm">
                          {employee.pointRamassage || employee.point_ramassage || 'Non défini'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center text-sm">
                          <FiTruck className="h-3 w-3 text-gray-400 mr-2" />
                          {employee.circuit_affecte || 'Non affecté'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTeamColor(employee.equipe)}`}>
                          {employee.equipe}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {employee.atelier}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {/* Les RH ont maintenant accès aux actions de modification et suppression */}
                          {canManageEmployees ? (
                            <>
                              {/* Admin, Chef et RH peuvent modifier et supprimer */}
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowForm(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Modifier"
                              >
                                <FiEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
                                    const success = await deleteEmployee(employee.id);
                                    if (success) {
                                      console.log('Employé supprimé avec succès');
                                    } else {
                                      alert('Erreur lors de la suppression de l\'employé');
                                    }
                                  }
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Supprimer"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                              Consultation seule
                            </span>
                          )}
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
            <FiUsers className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterTeam !== 'all'
                ? 'Aucun employé ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier employé.'
              }
            </p>
            {!searchTerm && filterTeam === 'all' && canManageEmployees && (
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setShowForm(true);
                }}
                className="btn-primary"
              >
                Ajouter un employé
              </button>
            )}
          </div>
        )}
      </div>

      {/* Demandes envoyées */}
      {isChef && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mes demandes envoyées</h3>
            <button onClick={loadMyRequests} className="text-sm text-blue-600 hover:underline">Rafraîchir</button>
          </div>
          {myRequests.length === 0 ? (
            <div className="text-sm text-gray-500">Aucune demande envoyée.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Détails</th>
                    <th className="text-left py-2 px-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {myRequests.map(req => (
                    <tr key={req.id} className="border-b border-gray-100 text-sm">
                      <td className="py-2 px-3">{new Date(req.requested_at).toLocaleString()}</td>
                      <td className="py-2 px-3">{req.type === 'employee' ? 'Employés' : 'Générale'}</td>
                      <td className="py-2 px-3">{req.type === 'employee' ? `${req.employee_count || 0} employé(s)` : (req.message || '')}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${req.status==='pending'?'bg-yellow-100 text-yellow-700':req.status==='approved'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{req.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => {
            setShowForm(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Modal demande d'employés */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Demander des employés</h3>
                <button onClick={()=>setShowRequestModal(false)} className="p-2 hover:bg-gray-100 rounded"><FiX className="h-5 w-5 text-gray-500"/></button>
              </div>
              <div className="p-4 border-b">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input value={requestSearch} onChange={(e)=>setRequestSearch(e.target.value)} className="input-field pl-9" placeholder="Rechercher par nom ou fonction..." />
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(allEmployees.length>0 ? allEmployees : employees)
                    .filter(e => {
                      const q = requestSearch.toLowerCase();
                      return !q || `${e.nom} ${e.prenom}`.toLowerCase().includes(q) || (e.type_contrat||'').toLowerCase().includes(q);
                    })
                    .map(emp => {
                      const checked = selectedForRequest.has(emp.id);
                      return (
                        <label key={emp.id} className={`flex items-center justify-between p-3 border rounded-lg ${checked?'bg-blue-50 border-blue-200':'bg-white border-gray-200'}`}>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{emp.nom} {emp.prenom}</div>
                            <div className="text-gray-500">{emp.atelier} • {emp.type_contrat || 'N/A'}</div>
                          </div>
                          <input type="checkbox" checked={checked} onChange={(e)=>{
                            const next = new Set(selectedForRequest);
                            if (e.target.checked) next.add(emp.id); else next.delete(emp.id);
                            setSelectedForRequest(next);
                          }} />
                        </label>
                      );
                    })}
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">Sélectionnés: {selectedForRequest.size}</div>
                <div className="space-x-2">
                  <button onClick={()=>setShowRequestModal(false)} className="btn-secondary">Annuler</button>
                  <button disabled={sendingRequest || selectedForRequest.size===0} onClick={async()=>{
                    try{
                      setSendingRequest(true);
                      const resp = await fetch('http://localhost:3001/api/requests', {
                        method:'POST', credentials:'include', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
                        body: JSON.stringify({ type:'employee', employee_ids: Array.from(selectedForRequest), target_role:'rh' })
                      });
                      if(!resp.ok){ const t=await resp.text(); return alert(`Erreur: ${t}`);} 
                      alert('✅ Demande envoyée');
                      setShowRequestModal(false); setSelectedForRequest(new Set());
                      loadMyRequests();
                    }catch(e){ alert('Erreur envoi demande'); } finally{ setSendingRequest(false);} 
                  }} className={`btn-primary ${sendingRequest?'opacity-70 cursor-not-allowed':''}`}>{sendingRequest?'Envoi...':'Envoyer la demande'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant formulaire d'employé
const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const { addEmployee, updateEmployee, ateliers, fetchAteliers } = useData();
  
  const [formData, setFormData] = useState({
    nom: employee?.nom || '',
    prenom: employee?.prenom || '',
    pointRamassage: employee?.pointRamassage || employee?.point_ramassage || '',
    circuit: employee?.circuit_affecte || '',
    equipe: employee?.equipe || 'MATIN',
    atelier: employee?.atelier || 'MPC',
    dateEmbauche: employee?.date_embauche || '',
    typeContrat: employee?.type_contrat || 'CDI',
    status: employee?.status || 'actif'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teams = ['MATIN', 'SOIR', 'Normal']; // Valeurs réelles de la base de données

  // Charger les ateliers au montage du composant
  useEffect(() => {
    fetchAteliers();
  }, [fetchAteliers]);

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

    // Validation email supprimée comme demandé

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const employeeData = {
        ...formData,
        createdAt: new Date().toISOString()
      };

      let result;
      if (employee) {
        // Modification d'un employé existant
        result = await updateEmployee(employee.id, employeeData);
      } else {
        // Création d'un nouvel employé
        result = await addEmployee(employeeData);
      }
      
      if (result) {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        alert('Erreur lors de la sauvegarde de l\'employé');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'employé:', error);
      alert('Erreur lors de la sauvegarde de l\'employé');
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
            {employee ? 'Modifier l\'Employé' : 'Ajouter un Employé'}
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
                Point de Ramassage
              </label>
              <input
                type="text"
                name="pointRamassage"
                value={formData.pointRamassage}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: HAY ELBARAKA RUE JOUDART"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Circuit Affecté
              </label>
              <input
                type="text"
                name="circuit"
                value={formData.circuit}
                onChange={handleChange}
                className="input-field"
                placeholder="Ex: HAY MOLAY RCHID"
              />
            </div>

            {/* Champs Email et Téléphone supprimés comme demandé */}

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
              <select
                name="atelier"
                value={formData.atelier}
                onChange={handleChange}
                className="input-field"
              >
                {ateliers.map(atelier => (
                  <option key={atelier.id} value={atelier.nom}>{atelier.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de Contrat
              </label>
              <select
                name="typeContrat"
                value={formData.typeContrat}
                onChange={handleChange}
                className="input-field"
              >
                <option value="CDI">CDI</option>
                <option value="Intérimaire">Intérimaire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'Embauche
              </label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleChange}
                className="input-field"
              />
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
              <span>{isSubmitting ? 'Enregistrement...' : (employee ? 'Modifier' : 'Ajouter')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EmployeeManagement; 