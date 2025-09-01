const express = require('express');
const router = express.Router();

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    const userId = token.replace('mock-jwt-token-', '');
    const [users] = await req.pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
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

// GET /api/ateliers - Liste des ateliers avec chefs et employés
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT 
        a.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'role', u.role
          )
        ) as chefs,
        COUNT(e.id) as nombre_employes
      FROM ateliers a
      LEFT JOIN atelier_chefs ac ON a.id = ac.atelier_id
      LEFT JOIN users u ON ac.user_id = u.id
      LEFT JOIN employees e ON a.id = e.atelier_id
      GROUP BY a.id
      ORDER BY a.nom
    `;
    
    const [rows] = await req.pool.query(query);
    
    // Parser les chefs JSON
    const ateliers = rows.map(row => ({
      ...row,
      chefs: row.chefs && row.chefs[0] ? JSON.parse(row.chefs) : []
    }));
    
    res.json(ateliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des ateliers" });
  }
});

// GET /api/ateliers/:id - Détails d'un atelier avec employés
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Récupérer l'atelier avec ses chefs
    const [atelierRows] = await req.pool.query(`
      SELECT 
        a.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'role', u.role
          )
        ) as chefs
      FROM ateliers a
      LEFT JOIN atelier_chefs ac ON a.id = ac.atelier_id
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (atelierRows.length === 0) {
      return res.status(404).json({ error: "Atelier non trouvé" });
    }
    
    // Récupérer les employés de cet atelier
    const [employeeRows] = await req.pool.query(`
      SELECT * FROM employees WHERE atelier_id = ? ORDER BY nom, prenom
    `, [id]);
    
    const atelier = {
      ...atelierRows[0],
      chefs: atelierRows[0].chefs && atelierRows[0].chefs[0] ? JSON.parse(atelierRows[0].chefs) : [],
      employees: employeeRows
    };
    
    res.json(atelier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'atelier" });
  }
});

// POST /api/ateliers - Créer un atelier
router.post('/', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent créer des ateliers
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: "Accès refusé. Seuls les administrateurs peuvent créer des ateliers." });
  }
  
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

// PUT /api/ateliers/:id - Mettre à jour un atelier
router.put('/:id', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent modifier des ateliers
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: "Accès refusé. Seuls les administrateurs peuvent modifier des ateliers." });
  }
  
  const { id } = req.params;
  const { nom, description, localisation, responsable } = req.body;
  
  if (!nom) {
    return res.status(400).json({ error: "Le nom de l'atelier est requis" });
  }
  
  try {
    const [result] = await req.pool.execute(
      'UPDATE ateliers SET nom = ?, description = ?, localisation = ?, responsable = ? WHERE id = ?',
      [nom, description, localisation, responsable, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Atelier non trouvé" });
    }
    
    const [rows] = await req.pool.query('SELECT * FROM ateliers WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'atelier" });
  }
});

// DELETE /api/ateliers/:id - Supprimer un atelier
router.delete('/:id', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent supprimer des ateliers
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: "Accès refusé. Seuls les administrateurs peuvent supprimer des ateliers." });
  }
  
  const { id } = req.params;
  
  try {
    // Vérifier s'il y a des employés dans cet atelier
    const [employeeCheck] = await req.pool.query(
      'SELECT COUNT(*) as count FROM employees WHERE atelier_id = ?',
      [id]
    );
    
    if (employeeCheck[0].count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer cet atelier. Il contient ${employeeCheck[0].count} employé(s).` 
      });
    }
    
    // Supprimer les assignations de chefs
    await req.pool.execute('DELETE FROM atelier_chefs WHERE atelier_id = ?', [id]);
    
    // Supprimer l'atelier
    const [result] = await req.pool.execute('DELETE FROM ateliers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Atelier non trouvé" });
    }
    
    res.json({ message: "Atelier supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de l'atelier" });
  }
});

// POST /api/ateliers/:id/chefs - Assigner des chefs à un atelier
router.post('/:id/chefs', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent assigner des chefs
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: "Accès refusé. Seuls les administrateurs peuvent assigner des chefs." });
  }
  
  const { id } = req.params;
  const { chef_ids } = req.body; // Array de user_ids
  
  if (!Array.isArray(chef_ids) || chef_ids.length === 0) {
    return res.status(400).json({ error: "Liste des chefs requise" });
  }
  
  if (chef_ids.length > 2) {
    return res.status(400).json({ error: "Un atelier ne peut avoir que 2 chefs maximum" });
  }
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'atelier existe
    const [atelierCheck] = await connection.query(
      'SELECT id FROM ateliers WHERE id = ?',
      [id]
    );
    
    if (atelierCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Atelier non trouvé" });
    }
    
    // Vérifier que tous les chefs existent et ont le bon rôle
    for (const chefId of chef_ids) {
      const [chefCheck] = await connection.query(
        'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
        [chefId]
      );
      
      if (chefCheck.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Chef avec ID ${chefId} non trouvé ou n'est pas un chef d'atelier` });
      }
      
      // Vérifier que ce chef n'est pas déjà assigné à un autre atelier
      const [existingAssign] = await connection.query(
        'SELECT atelier_id FROM atelier_chefs WHERE user_id = ? AND atelier_id != ?',
        [chefId, id]
      );
      
      if (existingAssign.length > 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Le chef avec ID ${chefId} est déjà assigné à un autre atelier` });
      }
    }
    
    // Supprimer les anciennes assignations pour cet atelier
    await connection.execute('DELETE FROM atelier_chefs WHERE atelier_id = ?', [id]);
    
    // Créer les nouvelles assignations
    for (const chefId of chef_ids) {
      await connection.execute(
        'INSERT INTO atelier_chefs (atelier_id, user_id) VALUES (?, ?)',
        [id, chefId]
      );
    }
    
    await connection.commit();
    
    // Récupérer l'atelier mis à jour
    const [updatedAtelier] = await connection.query(`
      SELECT 
        a.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'role', u.role
          )
        ) as chefs
      FROM ateliers a
      LEFT JOIN atelier_chefs ac ON a.id = ac.atelier_id
      LEFT JOIN users u ON ac.user_id = u.id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    const atelier = {
      ...updatedAtelier[0],
      chefs: updatedAtelier[0].chefs && updatedAtelier[0].chefs[0] ? JSON.parse(updatedAtelier[0].chefs) : []
    };
    
    res.json({
      message: "Chefs assignés avec succès",
      atelier
    });
    
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'assignation des chefs" });
  } finally {
    connection.release();
  }
});

module.exports = router; 