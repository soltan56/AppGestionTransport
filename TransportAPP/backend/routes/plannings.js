const express = require('express');
const router = express.Router();

// GET /api/plannings - Récupérer tous les plannings
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.pool.query(`
      SELECT p.*, u.name as created_by_name 
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des plannings' });
  }
});

// GET /api/plannings/:id - Récupérer un planning par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await req.pool.query(`
      SELECT p.*, u.name as created_by_name 
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.id = ?
    `, [id]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du planning' });
  }
});

// POST /api/plannings - Créer un nouveau planning
router.post('/', async (req, res) => {
  const {
    nom,
    pointRamassage,
    circuit,
    equipe,
    atelier,
    dateDebut,
    dateFin,
    heureDebut,
    heureFin,
    status = 'actif'
  } = req.body;

  if (!nom || !pointRamassage || !circuit || !equipe || !atelier || !dateDebut || !heureDebut) {
    return res.status(400).json({ 
      error: 'Champs manquants',
      required: ['nom', 'pointRamassage', 'circuit', 'equipe', 'atelier', 'dateDebut', 'heureDebut']
    });
  }

  try {
    const [result] = await req.pool.execute(`
      INSERT INTO plannings (
        nom, point_ramassage, circuit, equipe, atelier, 
        date_debut, date_fin, heure_debut, heure_fin, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nom, pointRamassage, circuit, equipe, atelier, 
      dateDebut, dateFin, heureDebut, heureFin, status, 1 // TODO: récupérer l'ID utilisateur du token
    ]);
    const [rows] = await req.pool.query(`
      SELECT p.*, u.name as created_by_name 
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du planning' });
  }
});

// PUT /api/plannings/:id - Mettre à jour un planning
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    pointRamassage,
    circuit,
    equipe,
    atelier,
    dateDebut,
    dateFin,
    heureDebut,
    heureFin,
    status
  } = req.body;

  try {
    const [result] = await req.pool.execute(`
      UPDATE plannings SET 
        nom = ?, point_ramassage = ?, circuit = ?, equipe = ?, atelier = ?,
        date_debut = ?, date_fin = ?, heure_debut = ?, heure_fin = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      nom, pointRamassage, circuit, equipe, atelier,
      dateDebut, dateFin, heureDebut, heureFin, status, id
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    const [rows] = await req.pool.query(`
      SELECT p.*, u.name as created_by_name 
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.id = ?
    `, [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du planning' });
  }
});

// DELETE /api/plannings/:id - Supprimer un planning
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await req.pool.execute('DELETE FROM plannings WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    res.json({ message: 'Planning supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du planning' });
  }
});

// GET /api/plannings/stats/overview - Statistiques des plannings
router.get('/stats/overview', async (req, res) => {
  try {
    const [rows] = await req.pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        equipe,
        COUNT(DISTINCT circuit) as circuits_count,
        COUNT(DISTINCT atelier) as ateliers_count
      FROM plannings 
      GROUP BY status, equipe
    `);
    const totalPlannings = rows.reduce((sum, row) => sum + row.count, 0);
    const activePlannings = rows
      .filter(row => row.status === 'actif')
      .reduce((sum, row) => sum + row.count, 0);
    const stats = {
      total: totalPlannings,
      actifs: activePlannings,
      inactifs: totalPlannings - activePlannings,
      byEquipe: rows.reduce((acc, row) => {
        if (!acc[row.equipe]) {
          acc[row.equipe] = 0;
        }
        acc[row.equipe] += row.count;
        return acc;
      }, {}),
      byStatus: rows.reduce((acc, row) => {
        if (!acc[row.status]) {
          acc[row.status] = 0;
        }
        acc[row.status] += row.count;
        return acc;
      }, {})
    };
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router; 