const express = require('express');
const router = express.Router();

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.pool.query('SELECT * FROM employees ORDER BY nom, prenom');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// POST /api/employees
router.post('/', async (req, res) => {
  const { nom, prenom, email, telephone, equipe, atelier, type_contrat, date_embauche } = req.body;

  if (!nom || !prenom || !equipe || !type_contrat) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await req.pool.execute(
      'INSERT INTO employees (nom, prenom, email, telephone, equipe, atelier, type_contrat, date_embauche) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, equipe, atelier, type_contrat, date_embauche]
    );
    const [rows] = await req.pool.query('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'employé" });
  }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, equipe, atelier, type_contrat, date_embauche } = req.body;

  if (!nom || !prenom || !equipe || !type_contrat) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await req.pool.execute(
      'UPDATE employees SET nom = ?, prenom = ?, email = ?, telephone = ?, equipe = ?, atelier = ?, type_contrat = ?, date_embauche = ? WHERE id = ?',
      [nom, prenom, email, telephone, equipe, atelier, type_contrat, date_embauche, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    const [rows] = await req.pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la modification de l'employé" });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await req.pool.execute('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de l'employé" });
  }
});

module.exports = router; 