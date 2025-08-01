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
  FiMail,
  FiPhone,
  FiBriefcase,
  FiTruck
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import * as XLSX from 'xlsx';

const EmployeeManagement = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, plannings } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');

  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const predefinedEmployees = [
    'DENNI AZIZ', 'EL BAKRI REDOUANE', 'FADEL Imad', 'JAMILI MOHAMED', 'SOFIANE MOURAD',
    'WAKRIM MOHAMED', 'KARNBAH MOHAMED', 'MOUDAKIR SMAIN', 'FEROUAL ABDELALI', 'AZLAG HASSAN',
    'NASSOUR ABDELILAH', 'TABARANE YOUNES', 'OUAJHI YOUNESS', 'ELHANSALI ABDERRAZAK', 'LABNI MUSTAPHA',
    'IJABA MOUNA', 'OUAHID ADIL', 'SAIS BRAHIM', 'ENNAJOUI CHAKIR', 'KTRI Abdelkarim',
    'ADDAHR AYOUB', 'EZZINE ABDELALI', 'MAAGLI SAID', 'JAWAD ABDERRAHIM', 'TALEB Rachid',
    'NADI TARIK', 'FELLAKI ABDELKARIM', 'SANID TAOUFIK', 'BACHRI HICHAM', 'FARID MOHAMMED',
    'BENNANNA DRISS', 'AOUZANE Hamid', 'AMIZ REDOUANE', 'HAILI MOHAMED', 'HIRMANE FOUAD',
    'BAHROUNE MOHAMED', 'MASSAKI ABDESSAMAD', 'AZOUZI AHMED', 'KOBBI AHMED', 'ERRADI ABDELWAHED',
    'ESSOLAMI HASSAN', 'MARBOUH MUSTAPHA', 'KAITER RACHID', 'ERREJIOUI SAID', 'JMOUHI MOHAMED',
    'GHOUFRAOUI MUSTAPHA', 'ALSAFI KAMAL', 'ESSAIDI MOHAMED', 'FADEL ABDELLATIF', 'FADEL SAMI',
    'BOUABID JAWAD', 'SAHRANI MOHAMED', 'KARBAL BOUCHAIB', 'BELYAKOUT AZIZ', 'HOUAFI AHMED',
    'SOULMANI RACHID', 'HADDOU Fatima Zahra', 'TIJAHI ASMAA', 'SAADOUNI SAID', 'KASSI AHMED',
    'NABBAR ABID', 'ANWAR AZIZ', 'RJAFALLAH LARBI', 'EL AZAR ABDELJALIL', 'FAIZ SAID',
    'SABIR NOUREDDINE', 'ERRAJI ELMEHDI', 'MISSAOUI ABDELMAJID', 'FETHERRAHIM BADR', 'MAHMAH AYOUB',
    'BELHACHEMI OTHMANE', 'SAIS TARIK', 'DARWICH SAID', 'SKOURI ABDELAZIZ', 'ORANGE MOHAMMED',
    'AITBRAHIM SAID', 'SOUAT MALIKA', 'BROGI MINA', 'MARHRAOUI SAADIA', 'ARICHI SOUAD',
    'HOSNI KHADIJA', 'RAFYA SAADIA', 'HMIMSY FATIMA', 'HABIBI MINA', 'HASSI NAIMA',
    'HABACHI MOHAMED', 'FATHY MEHDI', 'MAOUHOUB JIHANE', 'SOUALI KHALISA', 'BOUKHAMI Abdessamad',
    'RTAIMAT HAMZA', 'BAYI HICHAM', 'LMERS ACHERAF', 'NASSIR Abdelali', 'HATOULI OMAR',
    'ABDELKAML YOUSSEF', 'BIYANI AHEMAD', 'SOUBAIR HANANE', 'NABIL MOHAMED', 'CHAFIQ SAFAA',
    'AYADI MOSTAFA', 'LAABID KABIRA', 'HABACHI SOUFIANE', 'HAMZA OULHADR', 'AIT IDAR RACHID',
    'KHAMLICHI AHEMAD', 'LAHMIDI ABDELHAMID', 'CHAMITI Salah Eddine', 'JARNIJA ABDLAH', 'YASSINE ABDLHADI',
    'ERRADOUANI KARIMA', 'DAHR KHALID', 'BOUKADOM MOHAMED', 'ADLANI MOHAMED', 'EZZOUBIR Akram',
    'LAHRICHI HAMZA', 'MOUHAL SOUAD', 'ZITOUNI TALALI', 'ELMAABADY MOHAMED', 'MOUKHTAM NABIL',
    'LKIHAL MEHDI', 'OUMALELK MOUAD', 'MORABIT SALAHDINE'
  ];

  const teams = ['Matin', 'Soir', 'Nuit', 'Normal'];

  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(employee =>
        `${employee.nom} ${employee.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTeam !== 'all') {
      filtered = filtered.filter(employee => employee.equipe === filterTeam);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filterTeam]);

  const handleExportEmployees = () => {
    if (filteredEmployees.length === 0) {
      alert('Aucun employé à exporter');
      return;
    }

    const employeeData = filteredEmployees.map(employee => ({
      'Nom': employee.nom,
      'Prénom': employee.prenom,
      'Point de Ramassage': employee.pointRamassage || employee.point_ramassage || '',
      'Circuit Affecté': employee.circuit || '',
      'Email': employee.email || '',
      'Téléphone': employee.telephone || '',
      'Équipe': employee.equipe || '',
      'Atelier': employee.atelier || '',
      'Date Embauche': employee.dateEmbauche || '',
      'Status': employee.status || 'actif',
      'Créé le': employee.created_at ? new Date(employee.created_at).toLocaleDateString('fr-FR') : ''
    }));

    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(employeeData);
      
      worksheet['!cols'] = [
        { wch: 20 },
        { wch: 20 },
        { wch: 40 },
        { wch: 20 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 10 },
        { wch: 20 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 }  
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

  const getEmployeeUsage = (employeeName) => {
    return plannings.filter(p => 
      p.nom && p.nom.toLowerCase().includes(employeeName.toLowerCase())
    ).length;
  };



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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Employés</h1>
          <p className="text-gray-600 mt-1">
            {filteredEmployees.length} employé(s) 
            {filteredEmployees.length !== employees.length && ` sur ${employees.length} total`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportEmployees}
            className="btn-secondary flex items-center space-x-2"
            disabled={filteredEmployees.length === 0}
            title="Exporter les employés vers Excel"
          >
            <FiDownload className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Nouvel Employé</span>
          </button>
        </div>
      </div>

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

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, email..."
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
                        <div className="text-sm text-gray-500 space-y-1">
                          {employee.email && (
                            <div className="flex items-center">
                              <FiMail className="h-3 w-3 text-gray-400 mr-1" />
                              {employee.email}
                            </div>
                          )}
                          {employee.telephone && (
                            <div className="flex items-center">
                              <FiPhone className="h-3 w-3 text-gray-400 mr-1" />
                              {employee.telephone}
                            </div>
                          )}
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
                          {employee.circuit || 'Non affecté'}
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
            {!searchTerm && filterTeam === 'all' && (
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
    </div>
  );
};

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const { addEmployee, updateEmployee } = useData();
  
  const [formData, setFormData] = useState({
    nom: employee?.nom || '',
    prenom: employee?.prenom || '',
    pointRamassage: employee?.pointRamassage || employee?.point_ramassage || '',
    circuit: employee?.circuit || '',
    email: employee?.email || '',
    telephone: employee?.telephone || '',
    equipe: employee?.equipe || 'Matin',
    atelier: employee?.atelier || 'Atelier Principal',
    dateEmbauche: employee?.dateEmbauche || '',
    status: employee?.status || 'actif'
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
        result = await updateEmployee(employee.id, employeeData);
      } else {
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