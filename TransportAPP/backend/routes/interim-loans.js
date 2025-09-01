const express = require('express');
const router = express.Router();

// GET /api/interim-loans - Récupérer les prêts d'intérimaires
router.get('/', async (req, res) => {
  console.log(`📊 Requête prêts d'intérimaires de ${req.user.name} (${req.user.role})`);
  
  try {
    let query = `
      SELECT il.*, 
             e.nom as employee_nom, e.prenom as employee_prenom, e.equipe as employee_equipe,
             a1.nom as from_atelier_nom, a2.nom as to_atelier_nom,
             u.name as created_by_name
      FROM interim_loans il
      LEFT JOIN employees e ON il.employee_id = e.id
      LEFT JOIN ateliers a1 ON il.from_atelier_id = a1.id
      LEFT JOIN ateliers a2 ON il.to_atelier_id = a2.id
      LEFT JOIN users u ON il.created_by = u.id
    `;
    
    let params = [];
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      query += ' WHERE il.status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY il.created_at DESC';
    
    const [rows] = await req.pool.execute(query, params);
    console.log(`✅ ${rows.length} prêts trouvés pour ${req.user.name}`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête prêts:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des prêts' });
  }
});

// POST /api/interim-loans - Créer un nouveau prêt
router.post('/', async (req, res) => {
  console.log(`🆕 Création prêt d'intérimaire par ${req.user.name} (${req.user.role})`);
  
  // Vérifier les permissions (RH et Admin peuvent créer des prêts)
  if (req.user.role !== 'rh' && req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les RH et administrateurs peuvent créer des prêts.' });
  }
  
  try {
    const { employee_id, from_atelier_id, to_atelier_id, start_date, end_date, reason } = req.body;
    
    // Validation des données
    if (!employee_id || !from_atelier_id || !to_atelier_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Vérifier que l'employé est bien un intérimaire
    const [employeeCheck] = await req.pool.execute(
      'SELECT id, type_contrat, atelier_id FROM employees WHERE id = ?',
      [employee_id]
    );
    
    if (employeeCheck.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    if (employeeCheck[0].type_contrat !== 'Intérimaire') {
      return res.status(400).json({ error: 'Seuls les intérimaires peuvent être prêtés' });
    }
    
    // Vérifier que l'employé n'est pas déjà en prêt
    const [existingLoan] = await req.pool.execute(
      'SELECT id FROM interim_loans WHERE employee_id = ? AND status = "active"',
      [employee_id]
    );
    
    if (existingLoan.length > 0) {
      return res.status(400).json({ error: 'Cet intérimaire est déjà en prêt' });
    }
    
    // Créer le prêt
    const [result] = await req.pool.execute(
      `INSERT INTO interim_loans (employee_id, from_atelier_id, to_atelier_id, start_date, end_date, reason, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [employee_id, from_atelier_id, to_atelier_id, start_date, end_date, reason, req.user.id]
    );
    
    console.log(`✅ Prêt créé avec succès, ID: ${result.insertId}`);
    
    // Retourner le prêt créé
    const [newLoan] = await req.pool.execute(
      'SELECT * FROM interim_loans WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newLoan[0]);
  } catch (err) {
    console.error('❌ Erreur création prêt:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création du prêt' });
  }
});

// PUT /api/interim-loans/:id - Modifier un prêt
router.put('/:id', async (req, res) => {
  const loanId = parseInt(req.params.id);
  console.log(`✏️ Modification prêt ${loanId} par ${req.user.name} (${req.user.role})`);
  
  // Vérifier les permissions (RH et Admin peuvent modifier des prêts)
  if (req.user.role !== 'rh' && req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les RH et administrateurs peuvent modifier des prêts.' });
  }
  
  try {
    const { status, end_date } = req.body;
    
    // Validation des données
    if (!status) {
      return res.status(400).json({ error: 'Le statut est requis' });
    }
    
    // Vérifier que le prêt existe
    const [loanCheck] = await req.pool.execute(
      'SELECT id, status FROM interim_loans WHERE id = ?',
      [loanId]
    );
    
    if (loanCheck.length === 0) {
      return res.status(404).json({ error: 'Prêt non trouvé' });
    }
    
    // Mettre à jour le prêt
    let query = 'UPDATE interim_loans SET status = ?, updated_at = CURRENT_TIMESTAMP';
    let params = [status];
    
    if (end_date) {
      query += ', end_date = ?';
      params.push(end_date);
    }
    
    query += ' WHERE id = ?';
    params.push(loanId);
    
    await req.pool.execute(query, params);
    
    console.log(`✅ Prêt ${loanId} mis à jour avec succès`);
    
    // Retourner le prêt mis à jour
    const [updatedLoan] = await req.pool.execute(
      'SELECT * FROM interim_loans WHERE id = ?',
      [loanId]
    );
    
    res.json(updatedLoan[0]);
  } catch (err) {
    console.error('❌ Erreur modification prêt:', err.message);
    res.status(500).json({ error: 'Erreur lors de la modification du prêt' });
  }
});

// DELETE /api/interim-loans/:id - Supprimer un prêt
router.delete('/:id', async (req, res) => {
  const loanId = parseInt(req.params.id);
  console.log(`🗑️ Suppression prêt ${loanId} par ${req.user.name} (${req.user.role})`);
  
  // Vérifier les permissions (Admin seulement pour la suppression)
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des prêts.' });
  }
  
  try {
    // Vérifier que le prêt existe
    const [loanCheck] = await req.pool.execute(
      'SELECT id FROM interim_loans WHERE id = ?',
      [loanId]
    );
    
    if (loanCheck.length === 0) {
      return res.status(404).json({ error: 'Prêt non trouvé' });
    }
    
    // Supprimer le prêt
    await req.pool.execute('DELETE FROM interim_loans WHERE id = ?', [loanId]);
    
    console.log(`✅ Prêt ${loanId} supprimé avec succès`);
    
    res.json({ success: true, message: 'Prêt supprimé' });
  } catch (err) {
    console.error('❌ Erreur suppression prêt:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du prêt' });
  }
});

module.exports = router; 