const express = require('express');
const router = express.Router();

// Middleware simple pour vérifier l'authentification (à améliorer avec JWT)
const authenticate = async (req, res, next) => {
  try {
    // Pour l'instant, on récupère le premier admin disponible
    const [users] = await req.pool.query('SELECT id, role FROM users WHERE role = "administrateur" LIMIT 1');
    
    if (users.length > 0) {
      req.user = { id: users[0].id, role: users[0].role };
    } else {
      // Si aucun admin, créer un utilisateur temporaire
      req.user = { id: null, role: 'administrateur' };
    }
    
    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    req.user = { id: null, role: 'administrateur' };
    next();
  }
};

// GET /api/weekly-plannings - Récupérer tous les plannings hebdomadaires
router.get('/', authenticate, async (req, res) => {
  try {
    const { year } = req.query;
    
    let query = `
      SELECT wp.*, u.name as created_by_name 
      FROM weekly_plannings wp 
      LEFT JOIN users u ON wp.created_by = u.id
    `;
    let params = [];
    
    if (year) {
      query += ' WHERE wp.year = ?';
      params.push(year);
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

router.post('/', authenticate, async (req, res) => {
  const { year, week_number, assignments } = req.body;
  
  if (!year || !week_number || !assignments) {
    return res.status(400).json({ 
      error: 'Champs manquants',
      required: ['year', 'week_number', 'assignments']
    });
  }
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Créer ou mettre à jour le planning hebdomadaire
    const [existingPlanning] = await connection.query(`
      SELECT id FROM weekly_plannings WHERE year = ? AND week_number = ?
    `, [year, week_number]);
    
    let planningId;
    
    if (existingPlanning.length > 0) {
      planningId = existingPlanning[0].id;
      await connection.execute(`
        UPDATE weekly_plannings 
        SET updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE id = ?
      `, [req.user.id || null, planningId]);
      
      await connection.execute(`
        DELETE FROM weekly_assignments WHERE weekly_planning_id = ?
      `, [planningId]);
    } else {
      const [result] = await connection.execute(`
        INSERT INTO weekly_plannings (year, week_number, created_by) 
        VALUES (?, ?, ?)
      `, [year, week_number, req.user.id || null]);
      planningId = result.insertId;
    }
    
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

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    await connection.execute(`
      DELETE FROM weekly_assignments WHERE weekly_planning_id = ?
    `, [id]);
    
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

router.get('/stats/:year', authenticate, async (req, res) => {
  const { year } = req.params;
  
  try {
    
    const [planningCount] = await req.pool.query(`
      SELECT COUNT(*) as count FROM weekly_plannings WHERE year = ?
    `, [year]);
    
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

router.delete('/:year/:week', authenticate, async (req, res) => {
  try {
    const { year, week } = req.params;
    
    
    const [existingPlanning] = await req.pool.query(
      'SELECT id FROM weekly_plannings WHERE year = ? AND week_number = ?',
      [year, week]
    );
    
    if (existingPlanning.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    
    const planningId = existingPlanning[0].id;
    
    
    await req.pool.query('START TRANSACTION');
    
    try {
      
      await req.pool.query(
        'DELETE FROM weekly_assignments WHERE weekly_planning_id = ?',
        [planningId]
      );
      
      
      await req.pool.query(
        'DELETE FROM weekly_plannings WHERE id = ?',
        [planningId]
      );
      
      
      await req.pool.query('COMMIT');
      
      res.json({ 
        message: 'Planning supprimé avec succès',
        year: parseInt(year),
        week_number: parseInt(week)
      });
      
    } catch (error) {
      
      await req.pool.query('ROLLBACK');
      throw error;
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du planning' });
  }
});

module.exports = router; 