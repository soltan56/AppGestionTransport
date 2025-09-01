const { pool } = require('./db-mysql');

/**
 * Service de Consolidation Automatique des Plannings Hebdomadaires
 * 
 * Fonctionnalités:
 * - Détection automatique quand tous les chefs ont terminé
 * - Création du planning consolidé unique
 * - Gestion des statuts et de l'intégrité des données
 */

class ConsolidationService {
  
  /**
   * Vérifie si tous les chefs actifs ont complété leur planning pour une semaine donnée
   * @param {number} year 
   * @param {number} weekNumber 
   * @returns {Promise<{ready: boolean, completedChefs: number, totalActiveChefs: number}>}
   */
  async checkConsolidationReadiness(year, weekNumber) {
    try {
      // 1. Obtenir tous les chefs actifs qui ont des ateliers assignés
      const [activeChefs] = await pool.execute(`
        SELECT DISTINCT u.id, u.name
        FROM users u
        JOIN atelier_chefs ac ON u.id = ac.user_id
        WHERE u.role = 'chef_d_atelier'
        ORDER BY u.name
      `);
      
      // 2. Vérifier quels chefs ont des plannings 'completed' pour cette semaine
      const [completedPlannings] = await pool.execute(`
        SELECT DISTINCT created_by, u.name
        FROM weekly_plannings wp
        JOIN users u ON wp.created_by = u.id
        WHERE wp.year = ? AND wp.week_number = ? AND wp.status = 'completed'
      `, [year, weekNumber]);
      
      // 3. Vérifier s'il existe déjà un planning consolidé
      const [consolidatedExists] = await pool.execute(`
        SELECT id FROM weekly_plannings 
        WHERE year = ? AND week_number = ? AND is_consolidated = TRUE
      `, [year, weekNumber]);
      
      const totalActiveChefs = activeChefs.length;
      const completedChefs = completedPlannings.length;
      const isReady = completedChefs === totalActiveChefs && consolidatedExists.length === 0;
      
      console.log(`🔍 Consolidation Check - Semaine ${weekNumber}/${year}:`);
      console.log(`   - Chefs actifs: ${totalActiveChefs}`);
      console.log(`   - Plannings terminés: ${completedChefs}`);
      console.log(`   - Déjà consolidé: ${consolidatedExists.length > 0 ? 'Oui' : 'Non'}`);
      console.log(`   - Prêt pour consolidation: ${isReady ? 'Oui' : 'Non'}`);
      
      return {
        ready: isReady,
        totalActiveChefs,
        completedChefs,
        alreadyConsolidated: consolidatedExists.length > 0,
        missingChefs: activeChefs.filter(chef => 
          !completedPlannings.some(completed => completed.created_by === chef.id)
        )
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de consolidation:', error);
      throw error;
    }
  }
  
  /**
   * Consolide automatiquement les plannings d'une semaine
   * @param {number} year 
   * @param {number} weekNumber 
   * @returns {Promise<{success: boolean, consolidatedPlanningId?: number}>}
   */
  async consolidateWeeklyPlanning(year, weekNumber) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Vérifier qu'on est prêt pour la consolidation
      const readiness = await this.checkConsolidationReadiness(year, weekNumber);
      if (!readiness.ready) {
        throw new Error(`Consolidation non possible: ${readiness.completedChefs}/${readiness.totalActiveChefs} chefs ont terminé`);
      }
      
      // 2. Récupérer tous les plannings 'completed' de cette semaine
      const [sourcePlannings] = await connection.execute(`
        SELECT wp.*, u.name as chef_name
        FROM weekly_plannings wp
        JOIN users u ON wp.created_by = u.id
        WHERE wp.year = ? AND wp.week_number = ? AND wp.status = 'completed'
        ORDER BY u.name
      `, [year, weekNumber]);
      
      console.log(`📋 Consolidation de ${sourcePlannings.length} plannings pour semaine ${weekNumber}/${year}`);
      
      // 3. Fusionner toutes les données
      const consolidatedData = this.mergeProgressivelyPlannings(sourcePlannings);
      
      // 4. Créer le planning consolidé
      const [result] = await connection.execute(`
        INSERT INTO weekly_plannings (
          year, week_number, teams, assignments, status, is_consolidated, 
          consolidated_from, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'consolidated', TRUE, ?, 1, NOW(), NOW())
      `, [
        year,
        weekNumber,
        JSON.stringify(consolidatedData.teams),
        JSON.stringify(consolidatedData.assignments),
        JSON.stringify(sourcePlannings.map(p => ({ id: p.id, chef: p.chef_name })))
      ]);
      
      const consolidatedId = result.insertId;
      
      // 5. Marquer les plannings sources comme traités (sans les rendre "consolidés")
      for (const planning of sourcePlannings) {
        await connection.execute(`
          UPDATE weekly_plannings 
          SET updated_at = NOW()
          WHERE id = ?
        `, [planning.id]);
      }
      
      await connection.commit();
      
      console.log(`✅ Planning consolidé créé (ID: ${consolidatedId}) pour semaine ${weekNumber}/${year}`);
      console.log(`📊 Données consolidées: ${consolidatedData.teams.length} équipes, ${Object.keys(consolidatedData.assignments).length} groupes d'assignations`);
      
      return {
        success: true,
        consolidatedPlanningId: consolidatedId,
        sourcePlannings: sourcePlannings.length,
        teams: consolidatedData.teams.length
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Erreur lors de la consolidation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * Fusionne les plannings de plusieurs chefs en un seul planning consolidé
   * @param {Array} plannings 
   * @returns {Object} {teams: Array, assignments: Object}
   */
  mergeProgressivelyPlannings(plannings) {
    const consolidatedTeams = new Set();
    const consolidatedAssignments = {};
    
    plannings.forEach(planning => {
      try {
        // Fusionner les équipes
        const teams = planning.teams ? JSON.parse(planning.teams) : [];
        teams.forEach(team => consolidatedTeams.add(team));
        
        // Fusionner les assignations en évitant les conflits
        const assignments = planning.assignments ? JSON.parse(planning.assignments) : {};
        Object.entries(assignments).forEach(([teamKey, employeeIds]) => {
          if (!consolidatedAssignments[teamKey]) {
            consolidatedAssignments[teamKey] = [];
          }
          
          // Éviter les doublons d'employés
          const existingIds = new Set(consolidatedAssignments[teamKey]);
          const newIds = Array.isArray(employeeIds) ? employeeIds : [];
          
          newIds.forEach(employeeId => {
            if (!existingIds.has(employeeId)) {
              consolidatedAssignments[teamKey].push(employeeId);
            }
          });
        });
        
      } catch (parseError) {
        console.warn(`⚠️ Erreur parsing planning ${planning.id}:`, parseError);
      }
    });
    
    return {
      teams: Array.from(consolidatedTeams),
      assignments: consolidatedAssignments
    };
  }
  
  /**
   * Vérifie automatiquement si des consolidations sont possibles et les exécute
   * @param {number} year 
   * @returns {Promise<Array>} Liste des consolidations effectuées
   */
  async autoConsolidateAllReadyWeeks(year = new Date().getFullYear()) {
    try {
      console.log(`🔄 Vérification automatique des consolidations pour l'année ${year}...`);
      
      // Obtenir toutes les semaines avec des plannings 'completed'
      const [readyWeeks] = await pool.execute(`
        SELECT DISTINCT year, week_number
        FROM weekly_plannings 
        WHERE year = ? AND status = 'completed'
        AND NOT EXISTS (
          SELECT 1 FROM weekly_plannings wp2 
          WHERE wp2.year = weekly_plannings.year 
          AND wp2.week_number = weekly_plannings.week_number 
          AND wp2.is_consolidated = TRUE
        )
        ORDER BY week_number
      `, [year]);
      
      const consolidations = [];
      
      for (const week of readyWeeks) {
        const readiness = await this.checkConsolidationReadiness(week.year, week.week_number);
        
        if (readiness.ready) {
          console.log(`🚀 Consolidation automatique semaine ${week.week_number}/${week.year}...`);
          const result = await this.consolidateWeeklyPlanning(week.year, week.week_number);
          consolidations.push({
            year: week.year,
            weekNumber: week.week_number,
            ...result
          });
        }
      }
      
      console.log(`✅ Consolidation automatique terminée: ${consolidations.length} semaines consolidées`);
      return consolidations;
      
    } catch (error) {
      console.error('❌ Erreur lors de la consolidation automatique:', error);
      throw error;
    }
  }
}

module.exports = new ConsolidationService(); 