import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiDownload,
  FiFilter,
  FiEye,
  FiClock,
  FiMapPin,
  FiTruck,
  FiUsers,
  FiFileText,
  FiX,
  FiSearch,
  FiTrash2,
  FiGitMerge
} from 'react-icons/fi';
import '../../styles/csvExport.css';

const RHPlanningListView = () => {
  const [plannings, setPlannings] = useState([]);
  const [filteredPlannings, setFilteredPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [filterChef, setFilterChef] = useState('all');
  const [filterAtelier, setFilterAtelier] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // États pour le merge manuel
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedPlanningsForMerge, setSelectedPlanningsForMerge] = useState([]);
  const [mergeLoading, setMergeLoading] = useState(false);

  // Fonction pour nettoyer les anciennes entrées supprimées
  const cleanupDeletedWeeks = () => {
    try {
      const deletedWeeks = JSON.parse(localStorage.getItem('deletedWeeks') || '{}');
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);
      
      let hasChanges = false;
      Object.keys(deletedWeeks).forEach(weekKey => {
        if (deletedWeeks[weekKey] < fiveMinutesAgo) {
          delete deletedWeeks[weekKey];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        localStorage.setItem('deletedWeeks', JSON.stringify(deletedWeeks));
        console.log('🧹 Nettoyage des anciennes entrées supprimées effectué dans RHPlanningListView');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du nettoyage des semaines supprimées:', error);
    }
  };

  // Fonction pour supprimer un planning (Admin seulement)
  const handleDeletePlanning = async (planning) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le planning "${planning.nom}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ Token d\'authentification manquant');
        return;
      }

      // Supprimer le planning via l'API
      const response = await fetch(`http://localhost:3001/api/weekly-plannings/id/${planning.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Planning "${planning.nom}" supprimé avec succès`);
        
        // Marquer comme supprimé dans le localStorage pour éviter le rechargement
        const weekKey = `${planning.year}-W${planning.week_number}`;
        const deletedWeeks = JSON.parse(localStorage.getItem('deletedWeeks') || '{}');
        deletedWeeks[weekKey] = Date.now();
        localStorage.setItem('deletedWeeks', JSON.stringify(deletedWeeks));
        
        // Retirer le planning de la liste locale
        setPlannings(prev => prev.filter(p => p.id !== planning.id));
        setFilteredPlannings(prev => prev.filter(p => p.id !== planning.id));
        
        // Fermer le modal si ce planning était sélectionné
        if (selectedPlanning && selectedPlanning.id === planning.id) {
          setSelectedPlanning(null);
        }
        
        alert('✅ Planning supprimé avec succès');
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur lors de la suppression:', errorData);
        alert(`❌ Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('❌ Erreur réseau lors de la suppression');
    }
  };

  // Fonction pour exporter un planning individuel en CSV
  const handleExportPlanningCSV = (planning) => {
    try {
      // Préparer les données pour l'export CSV
      const csvData = [];
      const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
      const dayAssignments = planning.day_assignments ? (typeof planning.day_assignments === 'string' ? JSON.parse(planning.day_assignments) : planning.day_assignments) : {};
      const teamKeys = ['Matin','Soir','Nuit','Normal'];
      
      if (planning.enriched_assignments && Object.keys(planning.enriched_assignments).length > 0) {
        // Ajouter l'en-tête
        csvData.push(['Équipe', 'NomEmployés', 'Circuit', 'PointDeRamassage', ...DAYS]);
        
        // Ajouter les données: une ligne par couple (employé, équipe)
        Object.entries(planning.enriched_assignments).forEach(([employeeId, employee]) => {
          const idNum = parseInt(employeeId, 10);
          teamKeys.forEach(team => {
            const hasAny = DAYS.some(day => {
              const arr = Array.isArray((dayAssignments?.[day] || {})[team]) ? (dayAssignments?.[day] || {})[team] : [];
              return arr.some(v => parseInt(v, 10) === idNum);
            });
            if (!hasAny) return;
            const dayFlags = DAYS.map(day => {
              const arr = Array.isArray((dayAssignments?.[day] || {})[team]) ? (dayAssignments?.[day] || {})[team] : [];
              return arr.some(v => parseInt(v, 10) === idNum) ? '✔' : '';
            });
            const displayTeam = team === 'Normal' ? 'Heure supp' : team;
            csvData.push([
              displayTeam,
              `${employee.nom} ${employee.prenom}`.trim() || 'N/A',
              employee.circuit_affecte || 'N/A',
              employee.point_ramassage || 'N/A',
              ...dayFlags
            ]);
          });
        });
      } else {
        // Si pas d'employés assignés, exporter les informations de base
        csvData.push(['Équipe', 'NomEmployés', 'Circuit', 'PointDeRamassage', ...DAYS]);
        csvData.push([
          planning.equipe || 'N/A',
          'Aucun employé assigné',
          planning.circuit || 'N/A',
          planning.point_ramassage || 'N/A',
          ...DAYS.map(() => '')
        ]);
      }
      
      // Convertir en CSV
      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      
      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `planning_${planning.nom || planning.week_number}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Export CSV du planning "${planning.nom || planning.week_number}" effectué`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'export CSV:', error);
      alert('❌ Erreur lors de l\'export CSV');
    }
  };

  // Charger les plannings depuis l'API
  const loadPlannings = async () => {
    try {
      // Nettoyer les anciennes entrées supprimées avant de charger
      cleanupDeletedWeeks();
      
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Récupérer la liste des semaines supprimées pour éviter d'afficher les plannings supprimés
      const deletedWeeks = JSON.parse(localStorage.getItem('deletedWeeks') || '{}');
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000);

      const response = await fetch('http://localhost:3001/api/weekly-plannings', {
        credentials: 'include',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const weeklyPlannings = await response.json();
      
      // Filtrer les plannings supprimés récemment
      const filtered = weeklyPlannings.filter(planning => {
        const weekKey = `${planning.year}-W${planning.week_number}`;
        
        if (deletedWeeks[weekKey]) {
          const deletionTime = deletedWeeks[weekKey];
          const timeSinceDeletion = now - deletionTime;
          
          // Si la suppression date de moins de 5 minutes, on ignore ce planning
          if (timeSinceDeletion < 5 * 60 * 1000) {
            console.log(`🚫 Planning semaine ${planning.week_number}/${planning.year} ignoré (supprimé récemment par un chef)`);
            return false;
          } else {
            // Nettoyer les anciennes entrées supprimées (plus de 5 minutes)
            delete deletedWeeks[weekKey];
            localStorage.setItem('deletedWeeks', JSON.stringify(deletedWeeks));
          }
        }
        
        return true;
      });
      
      console.log(`📊 ${weeklyPlannings.length} plannings récupérés, ${filtered.length} après filtrage des suppressions`);
      
      // Récupérer les informations des employés pour enrichir les données
      const usersResponse = await fetch('http://localhost:3001/api/employees', {
        credentials: 'include',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const users = usersResponse.ok ? await usersResponse.json() : [];
      
      // Récupérer aussi les informations des chefs depuis l'API
      const chefsResponse = await fetch('http://localhost:3001/api/chefs', {
        credentials: 'include',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const chefs = chefsResponse.ok ? await chefsResponse.json() : [];
      
      // Transformer les weekly-plannings en format compatible avec l'affichage
      const transformedPlannings = filtered.map(planning => {
        // Trouver le chef créateur dans la liste des chefs
        let creator = chefs.find(chef => chef.id === planning.created_by);
        const teamsArray = planning.teams ? JSON.parse(planning.teams) : [];
        const assignmentsObj = planning.assignments ? JSON.parse(planning.assignments) : {};
        
        // Calculer le nombre d'employés assignés (somme des employés de toutes les équipes)
        const assignedEmployeesCount = Object.values(assignmentsObj).reduce((total, employeeIds) => {
          return total + (Array.isArray(employeeIds) ? employeeIds.length : 0);
        }, 0);
        
        // Gestion spéciale pour les plannings consolidés
        const isConsolidated = (
          (typeof planning.status === 'string' && planning.status.toLowerCase() === 'consolidated') ||
          planning.is_consolidated === 1 ||
          planning.is_consolidated === true ||
          planning.is_consolidated === '1'
        );
        let consolidatedSources = [];
        
        if (isConsolidated && planning.consolidated_from) {
          try {
            consolidatedSources = JSON.parse(planning.consolidated_from);
          } catch (e) {
            console.warn('Erreur parsing consolidated_from:', e);
          }
        }
        
        // Enrichir les assignations avec les détails des employés (multi-équipes par employé)
        const enrichedAssignments = {};
        Object.entries(assignmentsObj).forEach(([equipe, employeeIds]) => {
          if (!Array.isArray(employeeIds)) return;
          employeeIds.forEach(employeeId => {
            const idNum = parseInt(employeeId, 10);
            const employee = users.find(u => u.id === idNum);
            if (!employee) return;
            if (!enrichedAssignments[String(idNum)]) {
              enrichedAssignments[String(idNum)] = {
                id: idNum,
                equipes: [],
                nom: employee.nom,
                prenom: employee.prenom,
                email: employee.email || 'N/A',
                type_contrat: employee.type_contrat || 'N/A',
                atelier: employee.atelier_name || employee.atelier || 'N/A',
                chef_atelier: employee.chef_name || 'N/A',
                circuit_affecte: employee.circuit_affecte || 'N/A',
                point_ramassage: employee.point_ramassage || 'N/A'
              };
            }
            if (!enrichedAssignments[String(idNum)].equipes.includes(equipe)) {
              enrichedAssignments[String(idNum)].equipes.push(equipe);
            }
          });
        });
        
        // Calculer les équipes assignées réellement (toutes équipes présentes avec au moins un employé)
        const assignedTeams = Object.entries(assignmentsObj)
          .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
          .map(([k]) => k);
        
        // Calculer l'atelier basé sur les employés assignés
        const assignedAteliers = [...new Set(Object.values(enrichedAssignments).map(emp => emp.atelier).filter(Boolean))];
        const atelierName = assignedAteliers.length > 0 ? assignedAteliers[0] : 'Non défini';
        
        // Définir le nom et le statut selon le type de planning
        let planningName, planningStatus, creatorName;
        
        if (isConsolidated) {
          planningName = `⭐ Planning Consolidé - Semaine ${planning.week_number} (${planning.year})`;
          planningStatus = 'Consolidé - Lecture seule';
          creatorName = 'Système (Auto-consolidation)';
        } else {
          planningName = `Planning Semaine ${planning.week_number} - ${planning.year}`;
          planningStatus = planning.status === 'completed' ? 'Terminé' : 
                         planning.status === 'draft' ? 'Brouillon' : 
                         assignedEmployeesCount > 0 ? 'Configuré' : 'Vide';
          creatorName = creator ? creator.name : 'Chef inconnu';
        }
        
        return {
          id: planning.id,
          nom: planningName,
          equipe: assignedTeams.length > 0 ? assignedTeams.join(', ') : 'Aucune équipe assignée',
          created_by: planning.created_by,
          created_by_name: creatorName,
          atelier: atelierName,
          date_debut: new Date(planning.year, 0, 1 + (planning.week_number - 1) * 7).toLocaleDateString('fr-FR'),
          date_fin: new Date(planning.year, 0, 7 + (planning.week_number - 1) * 7).toLocaleDateString('fr-FR'),
          heure_debut: '07:00',
          heure_fin: '17:00',
          status: planningStatus,
          raw_status: planning.status,
          year: planning.year,
          week_number: planning.week_number,
          teams: planning.teams,
          assignments: planning.assignments,
          day_assignments: planning.day_assignments, // <-- inclure pour l'export
          enriched_assignments: enrichedAssignments,
          assigned_employees_count: assignedEmployeesCount,
          assigned_teams: assignedTeams,
          created_at: planning.created_at,
          updated_at: planning.updated_at,
          // Nouveaux champs pour la consolidation
          is_consolidated: isConsolidated,
          consolidated_sources: consolidatedSources,
          planning_type: isConsolidated ? 'consolidated' : 'individual'
        };
      });
      
      setPlannings(transformedPlannings);
      setFilteredPlannings(transformedPlannings);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannings();
  }, []);

  // Filtrer les plannings
  useEffect(() => {
    let filtered = plannings;

    // Filtrer par chef
    if (filterChef !== 'all') {
      filtered = filtered.filter(p => p.created_by_name === filterChef);
    }

    // Filtrer par atelier
    if (filterAtelier !== 'all') {
      filtered = filtered.filter(p => p.atelier === filterAtelier);
    }

    // Filtrer par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.point_ramassage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.circuit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPlannings(filtered);
  }, [plannings, filterChef, filterAtelier, filterStatus, searchTerm]);

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Erreur: Token d\'authentification manquant');
        return;
      }

      const response = await fetch('http://localhost:3001/api/plannings/export/csv', {
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plannings_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('✅ Export CSV téléchargé avec succès !');
      } else {
        const errorData = await response.text();
        console.error('Erreur réponse:', errorData);
        alert('Erreur lors de l\'export CSV');
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export CSV');
    }
  };

  // Merge manuel des plannings
  const handleMergePlannings = async () => {
    if (selectedPlanningsForMerge.length < 2) {
      alert('⚠️ Veuillez sélectionner au moins 2 plannings pour le merge');
      return;
    }

    // Vérifier que tous les plannings sont de la même semaine
    const firstPlanning = selectedPlanningsForMerge[0];
    const sameWeek = selectedPlanningsForMerge.every(p => 
      p.year === firstPlanning.year && p.week_number === firstPlanning.week_number
    );

    if (!sameWeek) {
      alert('⚠️ Tous les plannings sélectionnés doivent être de la même semaine');
      return;
    }

    setMergeLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Erreur: Token d\'authentification manquant');
        return;
      }

      const response = await fetch('http://localhost:3001/api/plannings/merge-manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planningIds: selectedPlanningsForMerge.map(p => p.id),
          year: firstPlanning.year,
          weekNumber: firstPlanning.week_number
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merge_plannings_S${firstPlanning.week_number}_${firstPlanning.year}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`✅ Merge réussi ! ${selectedPlanningsForMerge.length} plannings fusionnés et exportés en CSV`);
        setShowMergeModal(false);
        setSelectedPlanningsForMerge([]);
      } else {
        const errorData = await response.json();
        console.error('Erreur merge:', errorData);
        alert(`❌ Erreur lors du merge: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du merge:', error);
      alert('❌ Erreur lors du merge des plannings');
    } finally {
      setMergeLoading(false);
    }
  };

  // Obtenir la liste unique des chefs
  const uniqueChefs = [...new Set(plannings.map(p => p.created_by_name).filter(Boolean))];
  
  // Obtenir la liste unique des ateliers
  const uniqueAteliers = [...new Set(plannings.map(p => p.atelier).filter(Boolean))];

  const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  const TEAM_KEYS = ['Matin','Soir','Nuit','Normal'];

  const formatDate = (dateStr, fallbackYear, fallbackWeek) => {
    if (!dateStr || dateStr === 'Invalid Date') {
      // Recompute from ISO week (approx: lundi de la semaine)
      if (fallbackYear && fallbackWeek) {
        const simple = (y, w) => {
          const d = new Date(y, 0, 1 + (w - 1) * 7);
          const day = d.getDay();
          const diff = (day <= 1 ? (1 - day) : (8 - day)); // go to Monday
          d.setDate(d.getDate() + diff);
          return d;
        };
        const d = simple(fallbackYear, fallbackWeek);
        return d.toLocaleDateString('fr-FR');
      }
      return '';
    }
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR');
    } catch { return ''; }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const reopenPlanning = async (planning) => {
    try {
      const token = localStorage.getItem('authToken');
      if (planning.raw_status === 'completed') {
        const resp = await fetch(`http://localhost:3001/api/weekly-plannings/${planning.id}/approve-reopen`, {
          method: 'POST', credentials: 'include', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resp.ok) { const t = await resp.text(); return alert(`Erreur réouverture: ${t}`);} 
        alert('Planning réouvert en brouillon');
        await loadPlannings();
      } else {
        alert('Ce planning n\'est pas terminé.');
      }
    } catch (e) { alert('Erreur réseau réouverture'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
              <FiFileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Plannings
              </h1>
              <p className="text-gray-600 mt-1">
                Visualisation et export des plannings créés par les chefs d'atelier
              </p>
            </div>
          </div>

          {/* Bouton Merge Plannings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMergeModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            title="Merge manuel des plannings sélectionnés avec style professionnel"
          >
            <FiGitMerge className="h-6 w-6" />
            <span>Merge Plannings</span>
          </motion.button>

          {/* Bouton Export CSV */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            title="Exporter tous les plannings en CSV avec style professionnel"
          >
            <FiDownload className="h-6 w-6" />
            <span>Export CSV</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Filtres et Recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex items-center space-x-2 mb-4">
          <FiFilter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher un planning..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre Chef */}
          <select
            value={filterChef}
            onChange={(e) => setFilterChef(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les chefs</option>
            {uniqueChefs.map(chef => (
              <option key={chef} value={chef}>{chef}</option>
            ))}
          </select>

          {/* Filtre Atelier */}
          <select
            value={filterAtelier}
            onChange={(e) => setFilterAtelier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les ateliers</option>
            {uniqueAteliers.map(atelier => (
              <option key={atelier} value={atelier}>{atelier}</option>
            ))}
          </select>

          {/* Filtre Statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredPlannings.length} planning(s) trouvé(s) sur {plannings.length} total
        </div>
      </motion.div>

      {/* Liste des Plannings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des plannings...</p>
          </div>
        ) : filteredPlannings.length === 0 ? (
          <div className="p-8 text-center">
            <FiFileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun planning trouvé</h3>
            <p className="text-gray-600">Aucun planning ne correspond aux critères de recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef / Atelier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlannings.map((planning) => (
                  <motion.tr
                    key={planning.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {planning.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          Équipe: {planning.equipe}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {planning.created_by_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {planning.atelier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{formatDate(planning.date_debut)}</div>
                        {planning.date_fin && (
                          <div className="text-gray-500">au {formatDate(planning.date_fin)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <FiClock className="h-4 w-4 text-gray-400" />
                        <span>{planning.heure_debut} - {planning.heure_fin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(planning.status)}`}>
                        {planning.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPlanning(planning)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <FiEye className="h-4 w-4" />
                          <span>Voir</span>
                        </button>
                        
                        <button
                          onClick={() => reopenPlanning(planning)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                          title="Réouvrir ce planning"
                        >
                          <FiGitMerge className="h-4 w-4" />
                          <span>Réouvrir</span>
                        </button>
                        
                        {/* Bouton Supprimer - Admin seulement */}
                        <button
                          onClick={() => handleDeletePlanning(planning)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          title="Supprimer ce planning"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal Détails du Planning */}
      <AnimatePresence>
        {selectedPlanning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-screen overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Détails du Planning
                </h3>
                <button
                  onClick={() => setSelectedPlanning(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du Planning
                  </label>
                  <p className="text-gray-900">{selectedPlanning.nom}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chef Responsable
                    </label>
                    <p className="text-gray-900 font-medium">{selectedPlanning.created_by_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Atelier
                    </label>
                    <p className="text-gray-900 font-medium">{selectedPlanning.atelier}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Résumé du Planning</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Employés assignés:</span>
                      <span className="ml-2 font-semibold text-blue-900">{selectedPlanning.assigned_employees_count}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Équipes:</span>
                      <span className="ml-2 font-semibold text-blue-900">{selectedPlanning.assigned_teams.length}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Début
                    </label>
                    <p className="text-gray-900">{formatDate(selectedPlanning.date_debut, selectedPlanning.year, selectedPlanning.week_number)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Fin
                    </label>
                    <p className="text-gray-900">{formatDate(selectedPlanning.date_fin, selectedPlanning.year, selectedPlanning.week_number)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure Début
                    </label>
                    <p className="text-gray-900">{selectedPlanning.heure_debut}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure Fin
                    </label>
                    <p className="text-gray-900">{selectedPlanning.heure_fin}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Équipes Assignées
                  </label>
                  <p className="text-gray-900">{selectedPlanning.equipe}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employés Assignés ({selectedPlanning.assigned_employees_count})
                  </label>
                  {selectedPlanning.enriched_assignments && Object.keys(selectedPlanning.enriched_assignments).length > 0 ? (
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 text-xs font-bold border-b-2 border-blue-200">
                        <div className="grid grid-cols-5 gap-3">
                          <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-md">Équipe</span>
                          <span className="text-purple-700 bg-purple-100 px-2 py-1 rounded-md">Nom Employé</span>
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded-md">Circuit</span>
                          <span className="text-orange-700 bg-orange-100 px-2 py-1 rounded-md">Point de Ramassage</span>
                          <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-md">Jours</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {Object.values(selectedPlanning.enriched_assignments).map((employee, index) => {
                          const da = selectedPlanning.day_assignments ? (typeof selectedPlanning.day_assignments === 'string' ? JSON.parse(selectedPlanning.day_assignments) : selectedPlanning.day_assignments) : {};
                          const rows = TEAM_KEYS.map(team => {
                            const hasAny = DAYS.some(day => {
                              const arr = Array.isArray((da?.[day] || {})[team]) ? (da?.[day] || {})[team] : [];
                              return arr.some(v => parseInt(v, 10) === parseInt(employee.id, 10));
                            });
                            if (!hasAny) return null;
                            const dayChips = DAYS.map(day => {
                              const arr = Array.isArray((da?.[day] || {})[team]) ? (da?.[day] || {})[team] : [];
                              const checked = arr.some(v => parseInt(v, 10) === parseInt(employee.id, 10));
                              return (
                                <span key={`${employee.id}-${team}-${day}`} className={`px-2 py-0.5 rounded border text-[10px] ${checked ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>{day}{checked ? ' ✔' : ''}</span>
                              );
                            });
                            const displayTeam = team === 'Normal' ? 'Heure supp' : team;
                            return (
                              <div key={`${employee.id}-${team}`} className="px-3 py-2 text-xs hover:bg-gray-50 transition-colors">
                                <div className="grid grid-cols-5 gap-3 items-start">
                                  <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                    {displayTeam}
                                  </span>
                                  <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                                    {employee.nom} {employee.prenom}
                                  </span>
                                  <span className="text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                                    {employee.circuit_affecte}
                                  </span>
                                  <span className="text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                    {employee.point_ramassage}
                                  </span>
                                  <span className="flex flex-wrap gap-1">{dayChips}</span>
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                          return rows;
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Aucun employé assigné</p>
                  )}
                </div>

                {selectedPlanning.point_ramassage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Point de Ramassage
                    </label>
                    <p className="text-gray-900">{selectedPlanning.point_ramassage}</p>
                  </div>
                )}

                {selectedPlanning.circuit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Circuit
                    </label>
                    <p className="text-gray-900">{selectedPlanning.circuit}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPlanning.status)}`}>
                      {selectedPlanning.status}
                    </span>
                  </div>
                  
                  {/* Bouton Exporter CSV */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportPlanningCSV(selectedPlanning)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    title="Exporter ce planning en CSV avec style professionnel"
                  >
                    <FiDownload className="h-5 w-5" />
                    <span>Exporter CSV</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale de Merge Manuel */}
      <AnimatePresence>
        {showMergeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header de la modale */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  <FiGitMerge className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Merge Manuel des Plannings - Style Professionnel</h2>
                </div>
                <button
                  onClick={() => {
                    setShowMergeModal(false);
                    setSelectedPlanningsForMerge([]);
                  }}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {/* Contenu de la modale */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Sélectionnez les plannings non consolidés que vous souhaitez fusionner. 
                    Tous les plannings sélectionnés doivent être de la même semaine.
                  </p>
                  
                  {/* Filtres pour le merge */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Année
                      </label>
                      <select
                        value={filterChef === 'all' ? new Date().getFullYear() : filterChef}
                        onChange={(e) => setFilterChef(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semaine
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                          <option key={week} value={week}>Semaine {week}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chef
                      </label>
                      <select
                        value={filterChef}
                        onChange={(e) => setFilterChef(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">Tous les chefs</option>
                        {uniqueChefs.map(chef => (
                          <option key={chef} value={chef}>{chef}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Liste des plannings disponibles pour le merge */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Plannings Disponibles pour le Merge
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {filteredPlannings
                        .filter(p => !p.is_consolidated && p.status !== 'consolidated')
                        .map(planning => (
                          <div
                            key={planning.id}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPlanningsForMerge.some(p => p.id === planning.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            onClick={() => {
                              const isSelected = selectedPlanningsForMerge.some(p => p.id === planning.id);
                              if (isSelected) {
                                setSelectedPlanningsForMerge(prev => 
                                  prev.filter(p => p.id !== planning.id)
                                );
                              } else {
                                setSelectedPlanningsForMerge(prev => [...prev, planning]);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedPlanningsForMerge.some(p => p.id === planning.id)}
                                onChange={() => {}} // Géré par onClick du parent
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  Semaine {planning.week_number} - {planning.year}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Chef: {planning.created_by_name || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Créé le: {formatDate(planning.created_at)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(planning.status)}`}>
                                {planning.status || 'Brouillon'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {filteredPlannings.filter(p => !p.is_consolidated && p.status !== 'consolidated').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FiFileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Aucun planning non consolidé disponible pour le merge</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Résumé de la sélection */}
                {selectedPlanningsForMerge.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-2">
                      Résumé de la Sélection
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-purple-700">Plannings sélectionnés:</span>
                        <span className="ml-2 font-semibold text-purple-900">{selectedPlanningsForMerge.length}</span>
                      </div>
                      <div>
                        <span className="text-purple-700">Semaine:</span>
                        <span className="ml-2 font-semibold text-purple-900">
                          {selectedPlanningsForMerge[0]?.week_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-700">Année:</span>
                        <span className="ml-2 font-semibold text-purple-900">
                          {selectedPlanningsForMerge[0]?.year}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-700">Chefs:</span>
                        <span className="ml-2 font-semibold text-purple-900">
                          {[...new Set(selectedPlanningsForMerge.map(p => p.created_by_name))].length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer de la modale */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedPlanningsForMerge.length >= 2 ? (
                    <span className="text-green-600 font-medium">
                      ✅ Prêt pour le merge ({selectedPlanningsForMerge.length} plannings sélectionnés)
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      ⚠️ Sélectionnez au moins 2 plannings pour le merge
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowMergeModal(false);
                      setSelectedPlanningsForMerge([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={handleMergePlannings}
                    disabled={selectedPlanningsForMerge.length < 2 || mergeLoading}
                    className={`px-8 py-3 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
                      selectedPlanningsForMerge.length >= 2 && !mergeLoading
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {mergeLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Fusion en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FiGitMerge className="h-5 w-5" />
                        <span>Fusionner et Exporter</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RHPlanningListView; 