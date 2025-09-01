import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  FiCalendar, 
  FiUsers, 
  FiSave, 
  FiRefreshCw,
  FiClock,
  FiMapPin,
  FiSettings,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiLock,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiCheck
} from 'react-icons/fi';
import WeekPlanningModal from './WeekPlanningModal';

const PlanningCreation = () => {
  const { user, token } = useAuth();
  const { employees, circuits, ateliers } = useData();
  const navigate = useNavigate();
  
  // Debug initial (supprimé pour plus de clarté)
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [weeklyPlannings, setWeeklyPlannings] = useState({});
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0, isVisible: false });
  
  // États pour la sélection de chef (admin seulement)
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [loadingChefs, setLoadingChefs] = useState(false);
  
  // États pour les employés du chef sélectionné
  const [chefEmployees, setChefEmployees] = useState([]);
  const [loadingChefEmployees, setLoadingChefEmployees] = useState(false);

  // Fonction pour charger les plannings existants
  const loadExistingPlannings = async (year = selectedYear) => {
    try {
      setLoading(true);
      
      // Récupérer la liste des semaines supprimées pour éviter de les recharger
      const deletedWeeks = JSON.parse(localStorage.getItem('deletedWeeks') || '{}');
      
      const createdByParam = user?.role === 'administrateur' && selectedChef ? `&createdBy=${selectedChef}` : '';
      const response = await fetch(`http://localhost:3001/api/weekly-plannings?year=${year}${createdByParam}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const existingPlannings = await response.json();
        const planningsMap = {};
        
        for (let i = 0; i < existingPlannings.length; i++) {
          const planning = existingPlannings[i];
          const weekKey = `${planning.year}-W${planning.week_number}`;
          
          // Vérifier si cette semaine a été supprimée récemment
          if (deletedWeeks[weekKey]) {
            const deletionTime = deletedWeeks[weekKey];
            const now = Date.now();
            const timeSinceDeletion = now - deletionTime;
            
            // Si la suppression date de moins de 5 minutes, on ignore cette semaine
            if (timeSinceDeletion < 5 * 60 * 1000) {
              console.log(`🚫 Semaine ${planning.week_number} ignorée (supprimée récemment)`);
              continue;
            } else {
              // Nettoyer les anciennes entrées supprimées (plus de 5 minutes)
              delete deletedWeeks[weekKey];
              localStorage.setItem('deletedWeeks', JSON.stringify(deletedWeeks));
            }
          }
          
          try {
            // Charger les détails avec assignations (ajout createdBy pour admin)
            const createdByQuery = (user?.role === 'administrateur' && selectedChef) ? `?createdBy=${selectedChef}` : '';
            const detailResponse = await fetch(
              `http://localhost:3001/api/weekly-plannings/${planning.year}/${planning.week_number}${createdByQuery}`,
              { 
                credentials: 'include',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              // Assurer que les assignments sont parsées si c'est une chaîne JSON
              let assignments = detail.assignments || {};
              if (typeof assignments === 'string') {
                try {
                  assignments = JSON.parse(assignments);
                } catch (e) {
                  console.warn(`Erreur parsing assignments pour semaine ${planning.week_number}:`, e);
                  assignments = {};
                }
              }
              // Normaliser: convertir éventuels objets employés en IDs
              const normalized = {};
              Object.entries(assignments).forEach(([team, arr]) => {
                if (Array.isArray(arr)) {
                  normalized[team] = arr.map(v => (v && typeof v === 'object' ? v.id : v)).filter(v => Number.isFinite(parseInt(v)) ).map(v => parseInt(v));
                }
              });
              // Injecter day_assignments (s'il existe en base) pour le modal
              if (detail.day_assignments) {
                try {
                  const days = typeof detail.day_assignments === 'string' ? JSON.parse(detail.day_assignments) : detail.day_assignments;
                  normalized._dayAssignments = days || {};
                } catch (e) {
                  console.warn('Erreur parsing day_assignments:', e);
                }
              }
              // Ajouter métadonnées status/id
              normalized._status = detail.status || planning.status || 'draft';
              normalized._id = detail.id || planning.id;
              normalized._isConsolidated = !!detail.is_consolidated;
              normalized._reopenRequested = !!detail.reopen_requested;

              planningsMap[weekKey] = normalized;
              console.log(`📊 Assignments (normalisés) chargées pour semaine ${planning.week_number}:`, normalized);
            } else if (detailResponse.status === 429) {
              console.warn(`🔄 Erreur 429 pour semaine ${planning.week_number}, on passe...`);
            }
          } catch (error) {
            console.error(`Erreur chargement semaine ${planning.week_number}:`, error);
          }

          // Délai entre chaque requête pour éviter le spam
          if (i < existingPlannings.length - 1) {
            await delay(200); // 200ms entre chaque requête
          }
        }
        
        setWeeklyPlannings(planningsMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les chefs si l'utilisateur est admin
  const loadChefs = async () => {
    if (user?.role !== 'administrateur') return;
    
    try {
      setLoadingChefs(true);
      const response = await fetch('http://localhost:3001/api/chefs', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const chefsData = await response.json();
        console.log('🧑‍💼 Chefs chargés avec compteurs:', chefsData);
        setChefs(chefsData);
      } else {
        console.error('❌ Erreur réponse API chefs:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Détails erreur:', errorText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des chefs:', error);
    } finally {
      setLoadingChefs(false);
    }
  };

  // Fonction pour rafraîchir les données des chefs
  const refreshChefs = async () => {
    console.log('🔄 Rafraîchissement des données des chefs...');
    await loadChefs();
  };

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
        console.log('🧹 Nettoyage des anciennes entrées supprimées effectué');
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du nettoyage des semaines supprimées:', error);
    }
  };

  // Charger les plannings existants pour l'année sélectionnée
  useEffect(() => {
    cleanupDeletedWeeks(); // Nettoyer avant de charger
    loadExistingPlannings();
  }, [selectedYear]);

  // Charger les chefs si admin
  useEffect(() => {
    if (user?.role === 'administrateur') {
      loadChefs();
    }
  }, [user, token]);

  // Recharger les plannings quand le chef sélectionné change (admin)
  useEffect(() => {
    if (user?.role === 'administrateur') {
      // Réinitialiser l'état local pour éviter l'affichage d'un ancien chef
      setWeeklyPlannings({});
      setSelectedWeek(null);
      // Recharger les plannings pour ce chef
      loadExistingPlannings(selectedYear);
    }
  }, [selectedChef]);

  // Rafraîchir les données quand on revient sur la page (pour capturer les changements depuis d'autres pages)
  useEffect(() => {
    const handleFocus = () => {
      if (user?.role === 'administrateur' && document.visibilityState === 'visible') {
        console.log('🔄 Page redevenue visible - rafraîchissement des chefs...');
        loadChefs();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Générer les 53 semaines de l'année
  const generateWeeks = (year) => {
    const weeks = [];
    for (let week = 1; week <= 53; week++) {
      const startDate = getDateOfWeek(week, year);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      weeks.push({
        number: week,
        startDate,
        endDate,
        label: `S${week}`,
        isCurrentWeek: isCurrentWeek(week, year)
      });
    }
    return weeks;
  };

  // Obtenir la date du lundi d'une semaine donnée
  const getDateOfWeek = (week, year) => {
    const date = new Date(year, 0, 1 + (week - 1) * 7);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // Vérifier si c'est la semaine actuelle
  const isCurrentWeek = (week, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    return year === currentYear && week === currentWeek;
  };

  // Vérifier si une semaine est dans le passé
  const isPastWeek = (week, year) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    
    if (year < currentYear) return true;
    if (year === currentYear && week < currentWeek) return true;
    return false;
  };

  // Vérifier si une semaine est modifiable
  const isWeekEditable = (week, year) => {
    return !isPastWeek(week, year);
  };

  // Obtenir le numéro de semaine d'une date
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const weeks = generateWeeks(selectedYear);

  // Ouvrir le modal pour une semaine (création ou modification)
  const handleWeekClick = (week) => {
    const weekKey = `${selectedYear}-W${week.number}`;
    const hasExistingPlanning = weeklyPlannings[weekKey] && Object.keys(weeklyPlannings[weekKey]).length > 0;
    
      // Vérifier qu'un chef est sélectionné si l'utilisateur est admin
  if (user?.role === 'administrateur' && !selectedChef) {
    alert('⚠️ Veuillez d\'abord sélectionner un chef dans le menu déroulant en haut à droite.');
    return;
  }

  // Permettre l'ouverture si :
  // 1. La semaine est modifiable (future/actuelle)
  // 2. OU il existe déjà un planning (modification)
  if (!isWeekEditable(week.number, selectedYear) && !hasExistingPlanning) {
    return; // Ne pas ouvrir pour les semaines passées sans planning
  }
  
  setSelectedWeek(week);
  setShowModal(true);
  };

  // Fonction pour charger les employés d'un chef spécifique
  const loadChefEmployees = async (chefId) => {
    if (!chefId || user?.role !== 'administrateur') {
      setChefEmployees([]);
      return;
    }
    
    try {
      setLoadingChefEmployees(true);
      const response = await fetch(`http://localhost:3001/api/chefs/${chefId}/employees`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`👥 Employés du chef ${data.chef.name}: ${data.totalCount}`);
        setChefEmployees(data.employees || []);
      } else {
        console.error('❌ Erreur réponse API employés du chef:', response.status);
        setChefEmployees([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés du chef:', error);
      setChefEmployees([]);
    } finally {
      setLoadingChefEmployees(false);
    }
  };

  // Effet pour charger les employés quand un chef est sélectionné
  useEffect(() => {
    if (selectedChef) {
      loadChefEmployees(selectedChef);
    } else {
      setChefEmployees([]);
    }
  }, [selectedChef, token]);

  // Obtenir les employés selon le rôle et le chef sélectionné
  const getAvailableEmployees = () => {
    if (user?.role === 'administrateur') {
      // Si un chef est sélectionné, retourner ses employés
      if (selectedChef && chefEmployees.length > 0) {
        console.log(`👥 Employés du chef sélectionné (ID: ${selectedChef}):`, chefEmployees.length);
        return chefEmployees;
      }
      // Sinon, retourner tous les employés du contexte
      console.log('👥 Admin - tous les employés:', employees.length);
      return employees;
    } else if (user?.role === 'chef' || user?.role === 'chef_d_atelier') {
      // Pour les chefs d'atelier, la liste employees est déjà filtrée côté backend
      // pour ne contenir que les employés de leur atelier. On la renvoie telle quelle.
      return employees;
    }
    return [];
  };

  // Vérifier si une semaine a des assignations
  const hasAssignments = (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    return weeklyPlannings[weekKey] && Object.keys(weeklyPlannings[weekKey]).length > 0;
  };

  // Obtenir le nombre total d'employés assignés pour une semaine
  const getWeekAssignmentsCount = (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    const weekPlanning = weeklyPlannings[weekKey];
    if (!weekPlanning) return 0;
    
    return Object.values(weekPlanning).reduce((total, teamEmployees) => {
      return total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0);
    }, 0);
  };

  // Mettre à jour les assignations d'une semaine (local seulement)
  const handleWeekPlanningUpdate = (weekNumber, assignments) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    
    // Mettre à jour l'état local uniquement
    setWeeklyPlannings(prev => ({
      ...prev,
      [weekKey]: assignments
    }));

    console.log(`📝 Planning semaine ${weekNumber} modifié localement (utiliser "Sauvegarder Tout" pour persister)`);
  };

  // Supprimer un planning localement et en base si il existe
  const handleDeletePlanning = async (weekNumber) => {
    const weekKey = `${selectedYear}-W${weekNumber}`;
    
    try {
      // 1) Trouver l'ID du planning à supprimer (selon le rôle)
      const tokenLocal = localStorage.getItem('authToken');
      const createdByParam = (user?.role === 'administrateur' && selectedChef) ? `&createdBy=${selectedChef}` : '';
      const listResponse = await fetch(`http://localhost:3001/api/weekly-plannings?year=${selectedYear}${createdByParam}`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${tokenLocal}` }
      });
      if (!listResponse.ok) {
        const errTxt = await listResponse.text();
        alert(`❌ Impossible de récupérer les plannings: ${errTxt}`);
        return;
      }
      const list = await listResponse.json();
      const currentWeekNumber = weekNumber;
      const planningToDelete = list.find(p => 
        p.week_number === currentWeekNumber && 
        p.year === selectedYear &&
        (user?.role === 'administrateur' ? p.created_by === parseInt(selectedChef) : p.created_by === user.id) &&
        !p.is_consolidated
      );

      // Si pas de planning en base, on nettoie juste localement
      if (!planningToDelete) {
        setWeeklyPlannings(prev => {
          const updated = { ...prev };
          delete updated[weekKey];
          return updated;
        });
        console.log(`📝 Planning semaine ${weekNumber} non trouvé en base (suppression locale)`);
        return;
      }

      // 2) Supprimer en base par ID (sécurisé)
      const response = await fetch(`http://localhost:3001/api/weekly-plannings/id/${planningToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok || response.status === 404) {
        // 3) Supprimer localement uniquement si succès API (ou déjà inexistant)
        setWeeklyPlannings(prev => {
          const updated = { ...prev };
          delete updated[weekKey];
          return updated;
        });
        console.log(`🗑️ Planning semaine ${weekNumber} supprimé localement et en base`);
        
        // 4) IMPORTANT: Empêcher le rechargement automatique qui ferait réapparaître le planning
        // On marque cette semaine comme "supprimée" pour éviter qu'elle soit rechargée
        const deletedWeeks = JSON.parse(localStorage.getItem('deletedWeeks') || '{}');
        deletedWeeks[weekKey] = Date.now();
        localStorage.setItem('deletedWeeks', JSON.stringify(deletedWeeks));
        
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ Erreur suppression base (${response.status}): ${errorText}`);
        alert(`❌ Suppression échouée (code ${response.status}). Le planning n'a pas été retiré localement.`);
        return;
      }
    } catch (error) {
      console.warn(`⚠️ Erreur API suppression:`, error);
      alert('❌ Erreur réseau lors de la suppression. Le planning n\'a pas été retiré localement.');
      return;
    }
  };

  // Effacer tous les plannings locaux
  const handleClearAllPlannings = () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir effacer tous les plannings locaux ?\n\nCette action supprimera toutes les modifications non sauvegardées.')) {
      setWeeklyPlannings({});
      console.log('🗑️ Tous les plannings locaux effacés');
    }
  };

  // Fonction utilitaire pour attendre
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fonction utilitaire pour retry en cas d'erreur 429
  const saveWithRetry = async (url, data, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (response.status === 429) {
          // Erreur 429, attendre avant de réessayer (délais plus longs)
          const waitTime = Math.min(2000 * attempt, 10000); // 2s, 4s, 10s max
          console.warn(`🔄 Tentative ${attempt}/${maxRetries} - Attente ${waitTime}ms...`);
          if (attempt < maxRetries) {
            await delay(waitTime);
            continue;
          }
        }

        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await delay(1000 * attempt);
      }
    }
  };

  // Nouvelle fonction: Terminer le planning
  const handleCompletePlanning = async () => {
    if (!selectedWeek) {
      alert('⚠️ Veuillez sélectionner une semaine pour terminer le planning.');
      return;
    }

    try {
      setLoading(true);
      
      // Récupérer l'ID du planning de cette semaine pour ce chef
      const token = localStorage.getItem('authToken');
      const createdByParam = (user?.role === 'administrateur' && selectedChef) ? `&createdBy=${selectedChef}` : '';
      const planningsResponse = await fetch(`http://localhost:3001/api/weekly-plannings?year=${selectedYear}${createdByParam}`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!planningsResponse.ok) {
        throw new Error('Erreur lors de la récupération des plannings');
      }
      
      const allPlannings = await planningsResponse.json();
      const currentWeekNumber = selectedWeek?.number;
      
      // Trouver le planning de ce chef pour cette semaine
      const currentUserPlanning = allPlannings.find(p => 
        p.week_number === currentWeekNumber && 
        p.year === selectedYear && 
        (user?.role === 'administrateur' ? p.created_by === parseInt(selectedChef) : p.created_by === user.id) &&
        !p.is_consolidated
      );
      
      if (!currentUserPlanning) {
        alert('❌ Aucun planning trouvé pour cette semaine. Veuillez d\'abord sauvegarder votre planning.');
        return;
      }
      
      if (currentUserPlanning.status === 'completed') {
        alert('✅ Ce planning est déjà marqué comme terminé !');
        return;
      }
      
      // Marquer le planning comme terminé (nouvelle route)
      const updateResponse = await fetch(`http://localhost:3001/api/weekly-plannings/${currentUserPlanning.id}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Erreur lors de la finalisation: ${errorText}`);
      }
      
      alert('✅ Planning terminé avec succès ! Il sera pris en compte pour la consolidation automatique.');
      
      // Rafraîchir la page
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erreur lors de la finalisation du planning:', error);
      alert(`❌ Erreur lors de la finalisation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder tous les plannings avec délais
  const handleSaveAll = async () => {
    // Vérifier qu'un chef est sélectionné si l'utilisateur est admin
    if (user?.role === 'administrateur' && !selectedChef) {
      alert('⚠️ Veuillez sélectionner un chef pour créer le planning.');
      return;
    }

    try {
      setLoading(true);
      let savedCount = 0;
      let errors = 0;

      const planningsToSave = Object.entries(weeklyPlannings)
        .filter(([, assignments]) => Object.keys(assignments).length > 0);

      // Initialiser le progrès
      setSaveProgress({ current: 0, total: planningsToSave.length, isVisible: true });
      console.log(`🚀 Sauvegarde de ${planningsToSave.length} planning(s)...`);

      for (let i = 0; i < planningsToSave.length; i++) {
        const [weekKey, assignments] = planningsToSave[i];
        const [year, weekPart] = weekKey.split('-W');
        const week_number = parseInt(weekPart);

        try {
          console.log(`📅 Sauvegarde semaine ${week_number} (${i + 1}/${planningsToSave.length})...`);
          
          // Extraire les équipes des assignations (calcul déplacé plus bas)
          // const teams (deprecated)
          
          // Extraire day_assignments depuis assignments._dayAssignments si présent
          const day_assignments = assignments._dayAssignments || {};
          // Préparer payload en retirant _dayAssignments
          const { _dayAssignments, ...assignmentsPayload } = assignments;

          // Corriger: teams = clés des assignments (sans _dayAssignments)
          const teams = Object.keys(assignmentsPayload).filter(k => k !== '_dayAssignments');

          const planningData = {
            year: parseInt(year),
            week_number,
            teams,
            assignments: assignmentsPayload,
            day_assignments,
            ...(selectedChef && { targetChefId: parseInt(selectedChef) })
          };
          
          console.log(`📊 Données à sauvegarder pour semaine ${week_number}:`, planningData);

          const response = await saveWithRetry('http://localhost:3001/api/weekly-plannings', planningData);

          if (response && response.ok) {
            savedCount++;
            console.log(`✅ Semaine ${week_number} sauvegardée`);
          } else {
            errors++;
            const errorText = response ? await response.text() : 'Erreur inconnue';
            console.error(`❌ Erreur semaine ${week_number}:`, errorText);
          }

          // Mettre à jour le progrès
          setSaveProgress(prev => ({ ...prev, current: i + 1 }));
        } catch (error) {
          errors++;
          console.error(`❌ Erreur semaine ${week_number}:`, error);
          // Mettre à jour le progrès même en cas d'erreur
          setSaveProgress(prev => ({ ...prev, current: i + 1 }));
        }

        // Délai entre chaque requête pour éviter le spam
        if (i < planningsToSave.length - 1) {
          await delay(1000); // 1s entre chaque requête
        }
      }

      if (errors === 0) {
        alert(`✅ ${savedCount} planning(s) sauvegardé(s) avec succès !`);
        // Recharger les données depuis la base pour synchroniser l'affichage
        console.log('🔄 Rechargement des plannings depuis la base...');
        await loadExistingPlannings();
      } else {
        alert(`⚠️ ${savedCount} planning(s) sauvegardé(s), ${errors} erreur(s) rencontrée(s)`);
        // Même en cas d'erreurs partielles, recharger pour voir ce qui a été sauvé
        console.log('🔄 Rechargement des plannings depuis la base...');
        await loadExistingPlannings();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
      // Masquer la notification de progression après un délai
      setTimeout(() => {
        setSaveProgress({ current: 0, total: 0, isVisible: false });
      }, 2000);
    }
  };

  // Export CSV des plannings
  const handleExportCSV = async () => {
    try {
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
              <FiCalendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Plannings
              </h1>
              <p className="text-gray-600 mt-1">
                Créer et gérer les plannings hebdomadaires de vos équipes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sélecteur d'année (limitée aux années actuelles et futures) */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear(selectedYear - 1)}
                disabled={selectedYear <= currentYear}
                className={`p-2 rounded-lg shadow-md transition-all ${
                  selectedYear <= currentYear 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:shadow-lg text-gray-600'
                }`}
              >
                <FiChevronLeft className="h-5 w-5" />
              </motion.button>
              
              <div className="bg-white px-4 py-2 rounded-lg shadow-md border">
                <span className="text-lg font-semibold text-gray-900">{selectedYear}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedYear(selectedYear + 1)}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
              >
                <FiChevronRight className="h-5 w-5 text-gray-600" />
              </motion.button>
            </div>

            {/* Sélecteur de chef (admin seulement) */}
            {user?.role === 'administrateur' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Créer pour le chef:</label>
                <select
                  value={selectedChef || ''}
                  onChange={(e) => setSelectedChef(e.target.value || null)}
                  disabled={loadingChefs}
                  className={`min-w-[250px] bg-white border rounded-lg px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !selectedChef ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">-- Sélectionner un chef --</option>
                  {chefs.map(chef => (
                    <option key={chef.id} value={chef.id}>
                      {chef.name} ({chef.employee_count || 0} employés)
                    </option>
                  ))}
                </select>
                
                {/* Bouton de rafraîchissement */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshChefs}
                  disabled={loadingChefs}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                  title="Rafraîchir les compteurs d'employés"
                >
                  <FiRefreshCw className={`h-4 w-4 ${loadingChefs ? 'animate-spin' : ''}`} />
                </motion.button>
                
                {!selectedChef && (
                  <div className="flex items-center text-red-600 text-xs">
                    <span>⚠️ Sélection obligatoire</span>
                  </div>
                )}
                {loadingChefs && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
            )}

            {/* Bouton Export CSV */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <FiDownload className="h-4 w-4" />
              <span>Export CSV</span>
            </motion.button>

            {/* Bouton de sauvegarde */}
            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              onClick={handleSaveAll}
              disabled={loading}
              className={`
                px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-white
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiSave className="h-5 w-5" />
              )}
              <span>{loading ? 'Sauvegarde en cours...' : 'Sauvegarder Tout'}</span>
            </motion.button>

            {/* Nouveau bouton: Terminer le planning */}
            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              onClick={handleCompletePlanning}
              disabled={loading || !selectedWeek || !hasAssignments(selectedWeek?.number)}
              className={`
                px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-white
                ${loading || !selectedWeek || !hasAssignments(selectedWeek?.number)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl'
                }
              `}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiCheck className="h-5 w-5" />
              )}
              <span>{loading ? 'Finalisation...' : 'Terminer le Planning'}</span>
            </motion.button>

            {/* Bouton: Demander réouverture (visible pour Chef si terminé) */}
            {(() => {
              if (!selectedWeek) return null;
              const wkKey = `${selectedYear}-W${selectedWeek.number}`;
              const status = weeklyPlannings[wkKey]?._status || 'draft';
              if (status !== 'completed') return null;
              if (user?.role !== 'chef' && user?.role !== 'chef_d_atelier') return null;
              const handleRequestReopen = async () => {
                try {
                  const reason = window.prompt('Raison de la demande de réouverture ? (optionnel)') || '';
                  const tokenLocal = localStorage.getItem('authToken');
                  const planningId = weeklyPlannings[wkKey]?._id;
                  if (!planningId) return alert('Planning introuvable');
                  const resp = await fetch(`http://localhost:3001/api/weekly-plannings/${planningId}/request-reopen`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLocal}` },
                    body: JSON.stringify({ reason })
                  });
                  if (!resp.ok) {
                    const t = await resp.text();
                    return alert(`Échec demande réouverture: ${t}`);
                  }
                  alert('✅ Demande de réouverture envoyée');
                } catch (e) {
                  console.warn('Erreur demande réouverture:', e);
                  alert('Erreur demande réouverture');
                }
              };
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestReopen}
                  className="px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-white bg-gradient-to-r from-violet-500 to-purple-600 hover:shadow-xl"
                >
                  <FiRefreshCw className="h-5 w-5" />
                  <span>Demander réouverture</span>
                </motion.button>
              );
            })()}

            {/* Bouton: Approuver réouverture (visible pour RH/Admin si demande en attente) */}
            {(() => {
              if (!selectedWeek) return null;
              const wkKey = `${selectedYear}-W${selectedWeek.number}`;
              const status = weeklyPlannings[wkKey]?._status || 'draft';
              const requested = !!weeklyPlannings[wkKey]?._reopenRequested;
              if (status !== 'completed' || !requested) return null;
              if (user?.role !== 'administrateur' && user?.role !== 'rh') return null;
              const handleApproveReopen = async () => {
                try {
                  const tokenLocal = localStorage.getItem('authToken');
                  const planningId = weeklyPlannings[wkKey]?._id;
                  if (!planningId) return alert('Planning introuvable');
                  const resp = await fetch(`http://localhost:3001/api/weekly-plannings/${planningId}/approve-reopen`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Authorization': `Bearer ${tokenLocal}` }
                  });
                  if (!resp.ok) {
                    const t = await resp.text();
                    return alert(`Échec approbation: ${t}`);
                  }
                  alert('✅ Réouverture approuvée (planning en brouillon)');
                  window.location.reload();
                } catch (e) {
                  console.warn('Erreur approbation réouverture:', e);
                  alert('Erreur approbation réouverture');
                }
              };
              return (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApproveReopen}
                  className="px-6 py-3 rounded-xl shadow-lg transition-all flex items-center space-x-2 text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl"
                >
                  <FiCheck className="h-5 w-5" />
                  <span>Approuver réouverture</span>
                </motion.button>
              );
            })()}
          </div>
          {(!selectedWeek || !hasAssignments(selectedWeek?.number)) && (
            <p className="text-sm text-gray-500 mt-2">
              Sélectionnez une semaine et sauvegardez un planning avant de le terminer.
            </p>
          )}
        </div>
      </motion.div>

      {/* Statistiques rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Semaines planifiées</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(weeklyPlannings).length}/53
              </p>
            </div>
            <FiCalendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employés disponibles</p>
              <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-green-600">
                  {user?.role === 'administrateur' && selectedChef 
                    ? (loadingChefEmployees ? '...' : chefEmployees.length)
                    : getAvailableEmployees().length
                  }
                </p>
                {loadingChefEmployees && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                )}
              </div>
              {user?.role === 'administrateur' && selectedChef && (
                <p className="text-xs text-gray-500 mt-1">
                  Chef sélectionné: {chefs.find(c => c.id == selectedChef)?.name || 'Inconnu'}
                </p>
              )}
            </div>
            <FiUsers className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Circuits actifs</p>
              <p className="text-2xl font-bold text-purple-600">{circuits.length}</p>
            </div>
            <FiMapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ateliers</p>
              <p className="text-2xl font-bold text-orange-600">{ateliers.length}</p>
            </div>
            <FiSettings className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </motion.div>

      {/* Agenda des semaines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-xl border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <FiCalendar className="h-6 w-6" />
            <span>Planification Annuelle - {selectedYear}</span>
          </h2>
          <p className="text-blue-100 mt-1">
            Cliquez sur une semaine pour créer un nouveau planning ou modifier un planning existant
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-12 xl:grid-cols-16 gap-3">
            {weeks.map((week) => {
              const hasPlanning = hasAssignments(week.number);
              const assignmentsCount = getWeekAssignmentsCount(week.number);
              const isPast = isPastWeek(week.number, selectedYear);
              const isEditable = isWeekEditable(week.number, selectedYear);
              const isClickable = isEditable || hasPlanning; // Modifiable si futur/actuel OU si planning existe
              
              // Lire status si dispo
              const weekKey = `${selectedYear}-W${week.number}`;
              const status = weeklyPlannings[weekKey]?._status || 'draft';
              const isCompleted = status === 'completed';
              
              return (
                <motion.div
                  key={week.number}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  onClick={() => handleWeekClick(week)}
                  onMouseEnter={() => setHoveredWeek(week.number)}
                  onMouseLeave={() => setHoveredWeek(null)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300 group
                    ${isCompleted
                      ? 'border-violet-300 bg-violet-50 cursor-pointer'
                      : isPast && !hasPlanning
                        ? 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 cursor-not-allowed opacity-60'
                        : isPast && hasPlanning
                          ? 'border-orange-300 bg-orange-50 hover:bg-orange-100 cursor-pointer shadow-md'
                          : week.isCurrentWeek 
                            ? 'border-blue-500 bg-blue-50 shadow-lg cursor-pointer' 
                            : hasPlanning
                              ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer'
                              : 'border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                    }
                    ${hoveredWeek === week.number && isClickable ? 'shadow-lg transform scale-105' : 'shadow-sm'}
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      text-lg font-bold mb-1 flex items-center justify-center space-x-1
                      ${isCompleted
                        ? 'text-violet-600'
                        : isPast && !hasPlanning
                          ? 'text-gray-500' 
                          : isPast && hasPlanning
                            ? 'text-orange-600'
                            : week.isCurrentWeek 
                              ? 'text-blue-600' 
                              : hasPlanning 
                                ? 'text-green-600' 
                                : 'text-gray-700'
                      }
                    `}>
                      <span>{week.label}</span>
                      {isCompleted && <FiLock className="h-3 w-3" />}
                      {isPast && !hasPlanning && <FiLock className="h-3 w-3" />}
                      {isPast && hasPlanning && <FiEdit className="h-3 w-3" />}
                    </div>
                    <div className={`text-xs ${isPast ? 'text-gray-400' : 'text-gray-500'}`}>
                      {week.startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </div>
                    
                    {hasPlanning && (
                      <div className="mt-2">
                        <div className={`text-white text-xs px-2 py-1 rounded-full ${
                          isCompleted ? 'bg-violet-500' : (isPast ? 'bg-orange-500' : 'bg-green-500')
                        }`}>
                          {assignmentsCount} employé{assignmentsCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-1">
                        <div className="text-xs text-violet-700 font-medium">
                          Terminé (lecture seule)
                        </div>
                      </div>
                    )}

                    {isPast && !hasPlanning && (
                      <div className="mt-1">
                        <div className="text-xs text-gray-400 font-medium">
                          Terminé
                        </div>
                      </div>
                    )}

                    {isPast && hasPlanning && !isCompleted && (
                      <div className="mt-1">
                        <div className="text-xs text-orange-600 font-medium">
                          Modifiable
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Indicateur semaine actuelle */}
                  {week.isCurrentWeek && !isPast && !isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <FiClock className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  {/* Indicateur semaine passée */}
                  {(isPast || isCompleted) && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`text-white text-xs px-2 py-1 rounded-full shadow-lg ${isCompleted ? 'bg-violet-500' : 'bg-gray-400'}`}>
                        <FiLock className="h-3 w-3" />
                      </div>
                    </div>
                  )}

                  {/* Animation hover pour les semaines modifiables */}
                  {isEditable && !isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300" />
                  )}

                  {/* Overlay pour les semaines passées / terminées */}
                  {(isPast || isCompleted) && (
                    <div className="absolute inset-0 bg-gray-600 opacity-5 rounded-xl"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Légende */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white rounded-xl p-6 shadow-lg border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50"></div>
            <span className="text-sm text-gray-600">Semaine actuelle</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-green-300 bg-green-50"></div>
            <span className="text-sm text-gray-600">Planning configuré</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-50 relative">
              <FiEdit className="h-2 w-2 text-orange-600 absolute top-0.5 left-0.5" />
            </div>
            <span className="text-sm text-gray-600">Planning passé (modifiable)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-50"></div>
            <span className="text-sm text-gray-600">Planning à configurer</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 opacity-60 relative">
              <FiLock className="h-2 w-2 text-gray-500 absolute top-0.5 left-0.5" />
            </div>
            <span className="text-sm text-gray-600">Semaine passée (non modifiable)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border-2 border-violet-300 bg-violet-50 relative">
              <FiLock className="h-2 w-2 text-violet-600 absolute top-0.5 left-0.5" />
            </div>
            <span className="text-sm text-gray-600">Planning terminé (non modifiable sauf validation RH/Admin)</span>
          </div>
        </div>
      </motion.div>

      {/* Section Plannings Actifs */}
      {Object.keys(weeklyPlannings).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <FiCalendar className="h-6 w-6 mr-3 text-blue-600" />
              Plannings Actifs ({Object.keys(weeklyPlannings).length})
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">Année {selectedYear}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadExistingPlannings}
                disabled={loading}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
              >
                <FiRefreshCw className="h-3 w-3" />
                <span>Recharger</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearAllPlannings}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
              >
                <FiTrash2 className="h-3 w-3" />
                <span>Tout effacer</span>
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(weeklyPlannings)
              .filter(([, assignments]) => Object.keys(assignments).length > 0)
              .sort(([a], [b]) => {
                const weekA = parseInt(a.split('-W')[1]);
                const weekB = parseInt(b.split('-W')[1]);
                return weekA - weekB;
              })
              .map(([weekKey, assignments]) => {
                const weekNumber = parseInt(weekKey.split('-W')[1]);
                const totalEmployees = Object.values(assignments).reduce((total, teamEmployees) => {
                  return total + (Array.isArray(teamEmployees) ? teamEmployees.length : 0);
                }, 0);

                return (
                  <motion.div
                    key={weekKey}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => {
                      const week = generateWeeks(selectedYear).find(w => w.number === weekNumber);
                      setSelectedWeek(week);
                      setShowModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          Semaine {weekNumber}
                        </h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                          Local
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                          {totalEmployees} employés
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Supprimer le planning de la semaine ${weekNumber} ?\n\nCette action supprimera le planning localement et en base de données s'il existe.`)) {
                              await handleDeletePlanning(weekNumber);
                            }
                          }}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Supprimer ce planning"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(assignments).map(([teamName, employeeIds]) => {
                        if (!Array.isArray(employeeIds) || employeeIds.length === 0) return null;

                        const teamConfig = {
                          'Matin': { color: 'text-yellow-700 bg-yellow-100', icon: '🌅' },
                          'Soir': { color: 'text-purple-700 bg-purple-100', icon: '🌆' },
                          'Nuit': { color: 'text-indigo-700 bg-indigo-100', icon: '🌙' },
                          'Normal': { color: 'text-gray-700 bg-gray-100', icon: '⏰' }
                        };

                        const config = teamConfig[teamName] || teamConfig['Normal'];


                        
                        return (
                          <div key={teamName} className="border-l-4 border-blue-300 pl-3">
                            <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-lg ${config.color} text-xs font-medium mb-2`}>
                              <span>{config.icon}</span>
                              <span>{teamName}</span>
                              <span className="bg-white bg-opacity-60 px-1 rounded">
                                {Array.isArray(employeeIds) ? employeeIds.length : 0}
                              </span>
                            </div>
                                                         <div className="text-sm text-gray-700 space-y-1 mt-2">
                               {employeeIds.map((empData, index) => {
                                 let employee = null;
                                 let empKey = index;
                                 
                                 // Vérifier si empData est déjà un objet employé complet
                                 if (typeof empData === 'object' && empData !== null && empData.id) {
                                   employee = empData;
                                   empKey = empData.id;
                                 } else {
                                   // empData est un ID, rechercher l'employé
                                   const empId = empData;
                                   employee = employees.find(emp => emp.id === empId);
                                   if (!employee && typeof empId === 'string') {
                                     employee = employees.find(emp => emp.id === parseInt(empId));
                                   }
                                   if (!employee && typeof empId === 'number') {
                                     employee = employees.find(emp => emp.id === empId.toString());
                                   }
                                   empKey = empId;
                                 }
                                 
                                 if (!employee || !employee.nom) {
                                   console.warn(`Employé non trouvé ou invalide:`, empData);
                                   return (
                                     <div key={empKey} className="text-red-500 text-xs">
                                       ⚠️ Employé non trouvé ({String(empData)})
                                     </div>
                                   );
                                 }
                                 
                                 return (
                                   <div key={empKey} className="flex items-center space-x-2 py-1 px-2 bg-white bg-opacity-60 rounded">
                                     <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                     <span className="font-medium text-gray-900">
                                       {String(employee.nom)} {String(employee.prenom)}
                                     </span>
                                     <span className="text-gray-500 text-xs">
                                       ({String(employee.atelier || 'N/A')})
                                     </span>
                                   </div>
                                 );
                               })}
                               {employeeIds.length === 0 && (
                                 <div className="text-gray-400 text-xs italic">Aucun employé assigné</div>
                               )}
                             </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Cliquer pour modifier</span>
                        <FiEdit className="h-3 w-3" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

                    {/* Modal de gestion hebdomadaire */}
              <WeekPlanningModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                week={selectedWeek}
                year={selectedYear}
                employees={getAvailableEmployees()}
                userRole={user?.role}
                readOnly={selectedWeek ? (weeklyPlannings[`${selectedYear}-W${selectedWeek.number}`]?._status === 'completed') : false}
                onSave={async (assignments) => {
                  if (selectedWeek) {
                    // Mettre à jour localement
                    handleWeekPlanningUpdate(selectedWeek.number, assignments);
                    // Persister immédiatement en base
                    try {
                      const current = assignments || {};
                      const day_assignments = current._dayAssignments || {};
                      const { _dayAssignments, ...assignmentsPayload } = current;
                      const teams = Object.keys(assignmentsPayload);
                      const planningData = {
                        year: parseInt(selectedYear),
                        week_number: selectedWeek.number,
                        teams,
                        assignments: assignmentsPayload,
                        day_assignments,
                        ...(user?.role === 'administrateur' && selectedChef ? { targetChefId: parseInt(selectedChef) } : {})
                      };
                      await saveWithRetry('http://localhost:3001/api/weekly-plannings', planningData);
                    } catch (e) {
                      console.warn('⚠️ Sauvegarde immédiate échouée:', e);
                    }
                  }
                  setShowModal(false);
                }}
                initialAssignments={selectedWeek ? weeklyPlannings[`${selectedYear}-W${selectedWeek.number}`] || {} : {}}
              />

      {/* Notification de progression de sauvegarde */}
      {saveProgress.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border p-4 min-w-[300px]"
        >
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Sauvegarde en cours...
              </p>
              <p className="text-xs text-gray-600">
                {saveProgress.current} / {saveProgress.total} plannings
              </p>
            </div>
          </div>
          
          {/* Barre de progression */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${saveProgress.total > 0 ? (saveProgress.current / saveProgress.total) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlanningCreation; 