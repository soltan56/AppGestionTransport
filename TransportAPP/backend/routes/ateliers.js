const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const [rows] = await req.pool.query('SELECT * FROM ateliers ORDER BY nom');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des ateliers" });
  }
});


router.post('/', async (req, res) => {
  const { nom, description, localisation, responsable } = req.body;
  if (!nom) {
    return res.status(400).json({ error: "Le nom de l'atelier est requis" });
  }
  try {
    const [result] = await req.pool.execute(
      'INSERT INTO ateliers (nom, description, localisation, responsable) VALUES (?, ?, ?, ?)',
      [nom, description, localisation, responsable]
    );
    const [rows] = await req.pool.query('SELECT * FROM ateliers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'atelier" });
  }
});

module.exports = router; 