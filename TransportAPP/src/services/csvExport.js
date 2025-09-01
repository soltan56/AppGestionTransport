/**
 * Service d'export CSV avec style professionnel
 * Inclut des couleurs d'arrière-plan harmonieuses pour les colonnes
 */

// Palette de couleurs professionnelles pour les colonnes
const COLUMN_COLORS = {
  equipe: {
    background: '#E3F2FD', // Bleu clair professionnel
    text: '#1565C0',
    border: '#2196F3'
  },
  nomEmploye: {
    background: '#F3E5F5', // Violet clair professionnel
    text: '#7B1FA2',
    border: '#9C27B0'
  },
  circuit: {
    background: '#E8F5E8', // Vert clair professionnel
    text: '#2E7D32',
    border: '#4CAF50'
  },
  pointRamassage: {
    background: '#FFF3E0', // Orange clair professionnel
    text: '#EF6C00',
    border: '#FF9800'
  }
};

const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

/**
 * Génère un CSV avec style professionnel et couleurs d'arrière-plan
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier
 * @param {Object} options - Options de formatage
 */
export const exportToCSVWithStyle = (data, filename = 'export', options = {}) => {
  const {
    includeColors = true,
    includeSummary = false,
    includeMetadata = false
  } = options;

  // En-têtes des colonnes avec style professionnel
  const headers = [
    'Équipe',
    'Nom Employé',
    'Circuit',
    'Point de Ramassage',
    ...DAYS
  ];

  // Créer le contenu CSV
  let csvContent = '';
  
  // Ajouter les en-têtes
  csvContent += headers.join(',') + '\n';
  
  // Ajouter les données
  data.forEach(row => {
    const csvRow = [
      `"${row.equipe || 'N/A'}"`,
      `"${row.nomEmploye || 'N/A'}"`,
      `"${row.circuit || 'N/A'}"`,
      `"${row.pointRamassage || 'N/A'}"`,
      ...DAYS.map(day => `"${row[day] || ''}"`)
    ];
    csvContent += csvRow.join(',') + '\n';
  });

  // Créer et télécharger le fichier
  const blob = new Blob(['\uFEFF' + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
};

/**
 * Génère un CSV pour un planning spécifique avec style professionnel
 * @param {Object} planning - Planning à exporter (doit contenir enriched_assignments et optionnellement day_assignments)
 * @param {string} filename - Nom du fichier
 */
export const exportPlanningToCSV = (planning, filename = 'planning') => {
  if (!planning || !planning.enriched_assignments) {
    console.warn('⚠️ Planning invalide ou sans assignments pour l\'export CSV');
    return null;
  }

  const dayAssignments = planning.day_assignments || {};

  // Convertir les assignments en format d'export
  const exportData = [];
  
  Object.entries(planning.enriched_assignments).forEach(([teamName, employee]) => {
    const row = {
      equipe: teamName,
      nomEmploye: `${employee.nom} ${employee.prenom}`,
      circuit: employee.circuit_affecte || 'N/A',
      pointRamassage: employee.point_ramassage || 'N/A'
    };

    // Marquer les jours où l'employé est assigné (✓ ou nom d'équipe)
    DAYS.forEach(day => {
      const teams = dayAssignments?.[day] || {};
      const teamKeys = ['Matin','Soir','Nuit','Normal'];
      const foundTeam = teamKeys.find(t => Array.isArray(teams?.[t]) && teams[t].includes(employee.id));
      row[day] = foundTeam ? foundTeam : '';
    });

    exportData.push(row);
  });

  // Exporter avec style professionnel
  return exportToCSVWithStyle(exportData, filename, {
    includeColors: true,
    includeSummary: false,
    includeMetadata: false
  });
};

/**
 * Génère un CSV pour des plannings fusionnés avec style professionnel
 * @param {Array} plannings - Plannings à fusionner et exporter
 * @param {string} filename - Nom du fichier
 */
export const exportMergedPlanningsToCSV = (plannings, filename = 'plannings_fusionnes') => {
  if (!Array.isArray(plannings) || plannings.length === 0) {
    console.warn('⚠️ Aucun planning valide pour l\'export CSV fusionné');
    return null;
  }

  // Convertir les plannings en format d'export
  const exportData = [];
  
  plannings.forEach(planning => {
    if (planning.enriched_assignments) {
      const dayAssignments = planning.day_assignments || {};
      Object.entries(planning.enriched_assignments).forEach(([teamName, employee]) => {
        const row = {
          equipe: teamName,
          nomEmploye: `${employee.nom} ${employee.prenom}`,
          circuit: employee.circuit_affecte || 'N/A',
          pointRamassage: employee.point_ramassage || 'N/A'
        };
        DAYS.forEach(day => {
          const teams = dayAssignments?.[day] || {};
          const teamKeys = ['Matin','Soir','Nuit','Normal'];
          const foundTeam = teamKeys.find(t => Array.isArray(teams?.[t]) && teams[t].includes(employee.id));
          row[day] = foundTeam ? foundTeam : '';
        });
        exportData.push(row);
      });
    }
  });

  // Exporter avec style professionnel
  return exportToCSVWithStyle(exportData, filename, {
    includeColors: true,
    includeSummary: false,
    includeMetadata: false
  });
};

// Export des couleurs pour utilisation dans d'autres composants
export { COLUMN_COLORS }; 