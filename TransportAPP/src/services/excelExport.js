import * as XLSX from 'xlsx';

export const exportPlanningsToExcel = (plannings, filename = 'plannings_export') => {
  // Préparer les données pour Excel avec les colonnes françaises
  const excelData = plannings.map(planning => ({
    'Noms': planning.nom,
    'Point ramassage': planning.point_ramassage || planning.pointRamassage,
    'Circuit': planning.circuit,
    'Équipe': planning.equipe,
    'Atelier': planning.atelier,
    'Date Début': planning.date_debut || planning.dateDebut,
    'Date Fin': planning.date_fin || planning.dateFin || '',
    'Heure Début': planning.heure_debut || planning.heureDebut,
    'Heure Fin': planning.heure_fin || planning.heureFin || '',
    'Status': planning.status || 'actif',
    'Créé le': planning.created_at ? new Date(planning.created_at).toLocaleDateString('fr-FR') : '',
    'Créé par': planning.created_by_name || planning.createdBy || ''
  }));

  // Créer un nouveau workbook
  const workbook = XLSX.utils.book_new();
  
  // Créer une feuille avec les données
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Ajuster la largeur des colonnes
  const columnWidths = [
    { wch: 25 }, // Noms
    { wch: 30 }, // Point ramassage
    { wch: 20 }, // Circuit
    { wch: 15 }, // Équipe
    { wch: 20 }, // Atelier
    { wch: 12 }, // Date Début
    { wch: 12 }, // Date Fin
    { wch: 12 }, // Heure Début
    { wch: 12 }, // Heure Fin
    { wch: 10 }, // Status
    { wch: 12 }, // Créé le
    { wch: 20 }  // Créé par
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plannings');
  
  // Générer et télécharger le fichier
  const today = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${today}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};

export const exportPlanningsWithStats = (plannings, stats, filename = 'rapport_plannings') => {
  const workbook = XLSX.utils.book_new();
  
  // Feuille 1: Plannings détaillés
  const planningsData = plannings.map(planning => ({
    'Noms': planning.nom,
    'Point ramassage': planning.point_ramassage || planning.pointRamassage,
    'Circuit': planning.circuit,
    'Équipe': planning.equipe,
    'Atelier': planning.atelier,
    'Date Début': planning.date_debut || planning.dateDebut,
    'Date Fin': planning.date_fin || planning.dateFin || '',
    'Heure Début': planning.heure_debut || planning.heureDebut,
    'Heure Fin': planning.heure_fin || planning.heureFin || '',
    'Status': planning.status || 'actif'
  }));
  
  const planningsSheet = XLSX.utils.json_to_sheet(planningsData);
  planningsSheet['!cols'] = [
    { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }
  ];
  
  // Feuille 2: Statistiques
  const statsData = [
    { 'Indicateur': 'Total Plannings', 'Valeur': stats.totalPlannings || plannings.length },
    { 'Indicateur': 'Plannings Actifs', 'Valeur': stats.activePlannings || plannings.filter(p => p.status === 'actif').length },
    { 'Indicateur': 'Plannings Inactifs', 'Valeur': stats.inactivePlannings || plannings.filter(p => p.status === 'inactif').length },
    { 'Indicateur': 'Équipes Différentes', 'Valeur': new Set(plannings.map(p => p.equipe)).size },
    { 'Indicateur': 'Circuits Différents', 'Valeur': new Set(plannings.map(p => p.circuit)).size },
    { 'Indicateur': 'Ateliers Différents', 'Valeur': new Set(plannings.map(p => p.atelier)).size }
  ];
  
  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  statsSheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
  
  // Feuille 3: Répartition par équipe
  const teamData = {};
  plannings.forEach(planning => {
    if (!teamData[planning.equipe]) {
      teamData[planning.equipe] = 0;
    }
    teamData[planning.equipe]++;
  });
  
  const teamStatsData = Object.entries(teamData).map(([equipe, count]) => ({
    'Équipe': equipe,
    'Nombre de Plannings': count,
    'Pourcentage': `${((count / plannings.length) * 100).toFixed(1)}%`
  }));
  
  const teamSheet = XLSX.utils.json_to_sheet(teamStatsData);
  teamSheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }];
  
  // Ajouter toutes les feuilles
  XLSX.utils.book_append_sheet(workbook, planningsSheet, 'Plannings');
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
  XLSX.utils.book_append_sheet(workbook, teamSheet, 'Répartition Équipes');
  
  // Générer et télécharger le fichier
  const today = new Date().toISOString().split('T')[0];
  const fileName = `${filename}_${today}.xlsx`;
  
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
}; 