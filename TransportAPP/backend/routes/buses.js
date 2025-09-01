const express = require('express');
const router = express.Router();

// GET /api/buses
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.pool.query('SELECT * FROM buses ORDER BY numero');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des bus' });
  }
});

// POST /api/buses
router.post('/', async (req, res) => {
  const { numero, modele, capacite, status = 'disponible' } = req.body;
  if (!numero) {
    return res.status(400).json({ error: 'Le numéro du bus est requis' });
  }
  try {
    const [result] = await req.pool.execute(
      'INSERT INTO buses (numero, modele, capacite, status) VALUES (?, ?, ?, ?)',
      [numero, modele, capacite, status]
    );
    const [rows] = await req.pool.query('SELECT * FROM buses WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du bus' });
  }
});

module.exports = router; 