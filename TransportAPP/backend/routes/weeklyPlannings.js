const express = require('express');
const router = express.Router();

// Middleware d'authentification basé sur le token (mock JWT)
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    const userId = token.replace('mock-jwt-token-', '');
    const [users] = await req.pool.query(
      'SELECT id, name, email, role, atelier_id FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// GET /api/weekly-plannings - Récupérer tous les plannings hebdomadaires
router.get('/', authenticate, async (req, res) => {
  try {
    const { year, createdBy } = req.query;

    let query = `
      SELECT wp.*, u.name as created_by_name 
      FROM weekly_plannings wp 
      LEFT JOIN users u ON wp.created_by = u.id
    `;
    const params = [];
    const where = [];

    if (year) {
      where.push('wp.year = ?');
      params.push(year);
    }

    // Filtrer par créateur si admin fournit createdBy
    if (createdBy && req.user.role === 'administrateur') {
      where.push('wp.created_by = ?');
      params.push(parseInt(createdBy));
    }

    if (where.length > 0) {
      query += ` WHERE ${where.join(' AND ')}`;
    }

    query += ' ORDER BY wp.year DESC, wp.week_number ASC';

    const [rows] = await req.pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des plannings hebdomadaires' });
  }
});

// GET /api/weekly-plannings/:year/:week - Récupérer un planning hebdomadaire spécifique
router.get('/:year/:week', authenticate, async (req, res) => {
  const { year, week } = req.params;
  
  try {
    // Récupérer le planning hebdomadaire
    const [planningRows] = await req.pool.query(`
      SELECT wp.*, u.name as created_by_name 
      FROM weekly_plannings wp 
      LEFT JOIN users u ON wp.created_by = u.id 
      WHERE wp.year = ? AND wp.week_number = ?
    `, [year, week]);
    
    if (planningRows.length === 0) {
      return res.status(404).json({ error: 'Planning hebdomadaire non trouvé' });
    }
    
    const planning = planningRows[0];
    
    // Récupérer les assignations d'employés
    const [assignmentRows] = await req.pool.query(`
      SELECT wa.*, e.nom, e.prenom, e.atelier 
      FROM weekly_assignments wa 
      JOIN employees e ON wa.employee_id = e.id 
      WHERE wa.weekly_planning_id = ?
    `, [planning.id]);
    
    // Organiser les assignations par équipe
    const assignments = {};
    assignmentRows.forEach(assignment => {
      if (!assignments[assignment.team]) {
        assignments[assignment.team] = [];
      }
      assignments[assignment.team].push({
        id: assignment.employee_id,
        nom: assignment.nom,
        prenom: assignment.prenom,
        atelier: assignment.atelier
      });
    });
    
    res.json({
      ...planning,
      assignments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du planning hebdomadaire' });
  }
});

// POST /api/weekly-plannings - Créer ou mettre à jour un planning hebdomadaire (draft uniquement)
router.post('/', authenticate, async (req, res) => {
  const { year, week_number, assignments, targetChefId, day_assignments } = req.body;
  
  if (!year || !week_number || !assignments) {
    return res.status(400).json({ 
      error: 'Champs manquants',
      required: ['year', 'week_number', 'assignments']
    });
  }
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let actualCreatedBy = req.user.id || null;

    // Si l'admin veut créer un planning pour un chef spécifique
    if (targetChefId && req.user.role === 'administrateur') {
      // Vérifier que le chef cible existe et a le bon rôle
      const [chefCheck] = await connection.query(
        'SELECT id FROM users WHERE id = ? AND role IN (\'chef\', \'chef_d_atelier\')',
        [targetChefId]
      );
      
      if (chefCheck.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'Chef cible introuvable ou invalide' });
      }
      
      actualCreatedBy = parseInt(targetChefId);
    }
    
    // Préparer JSON pour stockage (compat front)
    const assignmentsJson = JSON.stringify(assignments || {});
    const teamsJson = JSON.stringify(Object.keys(assignments || {}));
    const dayAssignmentsJson = JSON.stringify(day_assignments || {});
    
    // Rechercher planning existant pour contrôle de statut
    const [existingPlanning] = await connection.query(`
      SELECT id, status FROM weekly_plannings WHERE year = ? AND week_number = ? AND created_by = ?
    `, [year, week_number, actualCreatedBy]);
    
    let planningId;
    
    if (existingPlanning.length > 0) {
      // Interdire la mise à jour si non draft
      const status = existingPlanning[0].status || 'draft';
      if (status !== 'draft') {
        await connection.rollback();
        connection.release();
        return res.status(403).json({ error: 'Planning non modifiable (statut non-draft)' });
      }
      // Mettre à jour le planning existant (draft)
      planningId = existingPlanning[0].id;
      await connection.execute(`
        UPDATE weekly_plannings 
        SET updated_at = CURRENT_TIMESTAMP, updated_by = ?, day_assignments = ?, assignments = ?, teams = ?
        WHERE id = ?
      `, [req.user.id || null, dayAssignmentsJson, assignmentsJson, teamsJson, planningId]);
      
      // Supprimer les anciennes assignations
      await connection.execute(`
        DELETE FROM weekly_assignments WHERE weekly_planning_id = ?
      `, [planningId]);
    } else {
      // Créer un nouveau planning (statut default draft)
      const [result] = await connection.execute(`
        INSERT INTO weekly_plannings (year, week_number, created_by, day_assignments, assignments, teams) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [year, week_number, actualCreatedBy, dayAssignmentsJson, assignmentsJson, teamsJson]);
      planningId = result.insertId;
    }
    
    // Ajouter les nouvelles assignations
    for (const [team, employeeIds] of Object.entries(assignments)) {
      if (Array.isArray(employeeIds) && employeeIds.length > 0) {
        for (const employeeId of employeeIds) {
          await connection.execute(`
            INSERT INTO weekly_assignments (weekly_planning_id, employee_id, team) 
            VALUES (?, ?, ?)
          `, [planningId, employeeId, team]);
        }
      }
    }
    
    await connection.commit();
    
    // Récupérer le planning créé/mis à jour
    const [rows] = await connection.query(`
      SELECT wp.*, u.name as created_by_name 
      FROM weekly_plannings wp 
      LEFT JOIN users u ON wp.created_by = u.id 
      WHERE wp.id = ?
    `, [planningId]);
    
    res.status(201).json({
      ...rows[0],
      assignments
    });
    
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du planning hebdomadaire' });
  } finally {
    connection.release();
  }
});

// DELETE /api/weekly-plannings/:id - Supprimer un planning hebdomadaire par ID
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Supprimer les assignations
    await connection.execute(`
      DELETE FROM weekly_assignments WHERE weekly_planning_id = ?
    `, [id]);
    
    // Supprimer le planning
    const [result] = await connection.execute(`
      DELETE FROM weekly_plannings WHERE id = ?
    `, [id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Planning hebdomadaire non trouvé' });
    }
    
    await connection.commit();
    res.json({ message: 'Planning hebdomadaire supprimé avec succès' });
    
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du planning hebdomadaire' });
  } finally {
    connection.release();
  }
});

// GET /api/weekly-plannings/stats/:year - Statistiques pour une année
router.get('/stats/:year', authenticate, async (req, res) => {
  const { year } = req.params;
  
  try {
    // Nombre de plannings créés
    const [planningCount] = await req.pool.query(`
      SELECT COUNT(*) as count FROM weekly_plannings WHERE year = ?
    `, [year]);
    
    // Employés les plus assignés
    const [topEmployees] = await req.pool.query(`
      SELECT e.nom, e.prenom, COUNT(*) as assignments_count
      FROM weekly_assignments wa
      JOIN employees e ON wa.employee_id = e.id
      JOIN weekly_plannings wp ON wa.weekly_planning_id = wp.id
      WHERE wp.year = ?
      GROUP BY e.id, e.nom, e.prenom
      ORDER BY assignments_count DESC
      LIMIT 10
    `, [year]);
    
    // Répartition par équipe
    const [teamStats] = await req.pool.query(`
      SELECT wa.team, COUNT(*) as assignments_count
      FROM weekly_assignments wa
      JOIN weekly_plannings wp ON wa.weekly_planning_id = wp.id
      WHERE wp.year = ?
      GROUP BY wa.team
      ORDER BY assignments_count DESC
    `, [year]);
    
    res.json({
      year: parseInt(year),
      planningsCreated: planningCount[0].count,
      topEmployees,
      teamStats
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// DELETE /api/weekly-plannings/:year/:week - Supprimer un planning hebdomadaire (par année/semaine)
router.delete('/:year/:week', authenticate, async (req, res) => {
  try {
    const { year, week } = req.params;
    
    // Vérifier si le planning existe
    const [existingPlanning] = await req.pool.query(
      'SELECT id FROM weekly_plannings WHERE year = ? AND week_number = ?',
      [year, week]
    );
    
    if (existingPlanning.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    
    const planningId = existingPlanning[0].id;
    
    // Démarrer une transaction
    await req.pool.query('START TRANSACTION');
    
    try {
      // Supprimer d'abord toutes les assignations
      await req.pool.query(
        'DELETE FROM weekly_assignments WHERE weekly_planning_id = ?',
        [planningId]
      );
      
      // Puis supprimer le planning
      await req.pool.query(
        'DELETE FROM weekly_plannings WHERE id = ?',
        [planningId]
      );
      
      // Valider la transaction
      await req.pool.query('COMMIT');
      
      res.json({ 
        message: 'Planning supprimé avec succès',
        year: parseInt(year),
        week_number: parseInt(week)
      });
      
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await req.pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du planning' });
  }
});

// POST /api/weekly-plannings/:id/complete - Marquer un planning comme terminé
router.post('/:id/complete', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Charger le planning
    let query = `SELECT id, status, created_by FROM weekly_plannings WHERE id = ?`;
    const params = [id];
    if (req.user.role !== 'administrateur') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }
    const [rows] = await req.pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
    const planning = rows[0];
    if (planning.status === 'completed') {
      return res.json({ success: true, status: 'completed' });
    }
    await req.pool.query(
      `UPDATE weekly_plannings SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [planning.id]
    );
    res.json({ success: true, status: 'completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la finalisation du planning' });
  }
});

// POST /api/weekly-plannings/:id/request-reopen - Demander la réouverture (Chef)
router.post('/:id/request-reopen', authenticate, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  try {
    // Charger le planning (doit appartenir au chef demandeur sauf admin)
    let query = `SELECT id, status, created_by, reopen_requested FROM weekly_plannings WHERE id = ?`;
    const params = [id];
    if (req.user.role !== 'administrateur') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }
    const [rows] = await req.pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
    const planning = rows[0];
    if (planning.status !== 'completed') {
      return res.status(400).json({ error: 'Seuls les plannings terminés peuvent être demandés en réouverture' });
    }
    await req.pool.query(
      `UPDATE weekly_plannings 
       SET reopen_requested = 1, reopen_reason = ?, reopen_requested_by = ?, reopen_requested_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [reason || null, req.user.id, planning.id]
    );
    res.json({ success: true, requested: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la demande de réouverture' });
  }
});

// POST /api/weekly-plannings/:id/approve-reopen - Approuver la réouverture (RH/Admin)
router.post('/:id/approve-reopen', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Action réservée à RH/Admin' });
    }
    const [rows] = await req.pool.query(
      `SELECT id, status, reopen_requested FROM weekly_plannings WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    const planning = rows[0];
    if (planning.status !== 'completed' || planning.reopen_requested !== 1) {
      return res.status(400).json({ error: 'Aucune demande de réouverture active' });
    }
    await req.pool.query(
      `UPDATE weekly_plannings 
       SET status = 'draft', reopen_requested = 0, reopened_by = ?, reopened_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [req.user.id, planning.id]
    );
    res.json({ success: true, status: 'draft' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de réouverture' });
  }
});

module.exports = router; 