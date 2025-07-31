const express = require('express');
const router = express.Router();

// GET /api/circuits - Récupérer tous les circuits
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.pool.query('SELECT * FROM circuits ORDER BY nom ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des circuits' });
  }
});

// GET /api/circuits/:id - Récupérer un circuit par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await req.pool.query('SELECT * FROM circuits WHERE id = ?', [id]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Circuit non trouvé' });
    }
    // Parser les points d'arrêt
    if (rows[0].points_arret) {
      try {
        rows[0].pointsArret = JSON.parse(rows[0].points_arret);
      } catch (e) {
        rows[0].pointsArret = [];
      }
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du circuit' });
  }
});

// POST /api/circuits - Créer un nouveau circuit
router.post('/', async (req, res) => {
  const {
    nom,
    description,
    distance,
    pointsArret,
    duree_estimee,
    status = 'actif'
  } = req.body;

  if (!nom) {
    return res.status(400).json({ error: 'Champs manquants', required: ['nom'] });
  }
  const pointsArretJson = pointsArret ? JSON.stringify(pointsArret) : null;
  try {
    const [result] = await req.pool.execute(
      'INSERT INTO circuits (nom, description, distance, points_arret, duree_estimee, status) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, description, distance, pointsArretJson, duree_estimee, status]
    );
    const [rows] = await req.pool.query('SELECT * FROM circuits WHERE id = ?', [result.insertId]);
    // Parser les points d'arrêt
    if (rows[0].points_arret) {
      try {
        rows[0].pointsArret = JSON.parse(rows[0].points_arret);
      } catch (e) {
        rows[0].pointsArret = [];
      }
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du circuit' });
  }
});

// PUT /api/circuits/:id - Mettre à jour un circuit
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    description,
    distance,
    pointsArret,
    duree_estimee,
    status
  } = req.body;
  const pointsArretJson = pointsArret ? JSON.stringify(pointsArret) : null;
  try {
    const [result] = await req.pool.execute(
      'UPDATE circuits SET nom = ?, description = ?, distance = ?, points_arret = ?, duree_estimee = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [nom, description, distance, pointsArretJson, duree_estimee, status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Circuit non trouvé' });
    }
    const [rows] = await req.pool.query('SELECT * FROM circuits WHERE id = ?', [id]);
    // Parser les points d'arrêt
    if (rows[0].points_arret) {
      try {
        rows[0].pointsArret = JSON.parse(rows[0].points_arret);
      } catch (e) {
        rows[0].pointsArret = [];
      }
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du circuit' });
  }
});

// DELETE /api/circuits/:id - Supprimer un circuit
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier si le circuit est utilisé dans des plannings
    const [resultCheck] = await req.pool.query('SELECT COUNT(*) as count FROM plannings WHERE circuit = (SELECT nom FROM circuits WHERE id = ?)', [id]);
    if (resultCheck[0].count > 0) {
      return res.status(400).json({ error: `Ce circuit est utilisé dans ${resultCheck[0].count} planning(s). Impossible de le supprimer.` });
    }
    const [result] = await req.pool.execute('DELETE FROM circuits WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Circuit non trouvé' });
    }
    res.json({ message: 'Circuit supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du circuit' });
  }
});

// GET /api/circuits/stats/overview - Statistiques des circuits
router.get('/stats/overview', async (req, res) => {
  try {
    const [rows] = await req.pool.query(`
      SELECT 
        c.*,
        COUNT(p.id) as plannings_count
      FROM circuits c 
      LEFT JOIN plannings p ON p.circuit = c.nom
      GROUP BY c.id
    `);
    const circuits = rows.map(row => {
      if (row.points_arret) {
        try {
          row.pointsArret = JSON.parse(row.points_arret);
        } catch (e) {
          row.pointsArret = [];
        }
      }
      return row;
    });
    const stats = {
      totalCircuits: circuits.length,
      circuitsActifs: circuits.filter(c => c.status === 'actif').length,
      circuitsUtilises: circuits.filter(c => c.plannings_count > 0).length,
      distanceTotale: circuits.reduce((sum, c) => sum + (c.distance || 0), 0),
      circuits: circuits
    };
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

module.exports = router; 