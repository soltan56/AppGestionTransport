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

// GET /api/chefs - Liste des chefs avec leurs ateliers
router.get('/', authenticate, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'nom', a.nom,
            'description', a.description,
            'localisation', a.localisation
          )
        ) as ateliers,
        COUNT(e.id) as nombre_employes
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      LEFT JOIN employees e ON a.id = e.atelier_id
      WHERE u.role = 'chef_d_atelier'
      GROUP BY u.id
      ORDER BY u.name
    `;
    
    const [rows] = await req.pool.query(query);
    
    // Parser les ateliers JSON
    const chefs = rows.map(row => ({
      ...row,
      ateliers: row.ateliers && row.ateliers[0] ? JSON.parse(row.ateliers) : []
    }));
    
    res.json(chefs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des chefs' });
  }
});

// GET /api/chefs/:id - Détails d'un chef avec son atelier et employés
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Récupérer le chef avec son atelier
    const [chefRows] = await req.pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'nom', a.nom,
            'description', a.description,
            'localisation', a.localisation
          )
        ) as ateliers
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      WHERE u.id = ? AND u.role = 'chef_d_atelier'
      GROUP BY u.id
    `, [id]);
    
    if (chefRows.length === 0) {
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    // Récupérer les employés de cet atelier
    const [employeeRows] = await req.pool.query(`
      SELECT e.* 
      FROM employees e
      INNER JOIN atelier_chefs ac ON e.atelier_id = ac.atelier_id
      WHERE ac.user_id = ?
      ORDER BY e.nom, e.prenom
    `, [id]);
    
    const chef = {
      ...chefRows[0],
      ateliers: chefRows[0].ateliers && chefRows[0].ateliers[0] ? JSON.parse(chefRows[0].ateliers) : [],
      employees: employeeRows
    };
    
    res.json(chef);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du chef' });
  }
});

// POST /api/chefs - Créer un chef avec assignation d'atelier
router.post('/', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent créer des chefs
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent créer des chefs.' });
  }
  
  const { name, email, password, atelier_id } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants (name, email, password)' });
  }
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'email n'existe pas déjà
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Créer l'utilisateur chef
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, 'chef_d_atelier']
    );
    
    const chefId = userResult.insertId;
    
    // Assigner l'atelier si fourni
    if (atelier_id) {
      // Vérifier que l'atelier existe
      const [atelierCheck] = await connection.query(
        'SELECT id FROM ateliers WHERE id = ?',
        [atelier_id]
      );
      
      if (atelierCheck.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Atelier spécifié non trouvé' });
      }
      
      // Vérifier que l'atelier n'a pas déjà 2 chefs
      const [chefCount] = await connection.query(
        'SELECT COUNT(*) as count FROM atelier_chefs WHERE atelier_id = ?',
        [atelier_id]
      );
      
      if (chefCount[0].count >= 2) {
        await connection.rollback();
        return res.status(400).json({ error: 'Cet atelier a déjà 2 chefs assignés' });
      }
      
      // Créer l'assignation
      await connection.execute(
        'INSERT INTO atelier_chefs (atelier_id, user_id) VALUES (?, ?)',
        [atelier_id, chefId]
      );
    }
    
    await connection.commit();
    
    // Récupérer le chef créé avec ses détails
    const [chefRows] = await connection.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'nom', a.nom,
            'description', a.description,
            'localisation', a.localisation
          )
        ) as ateliers
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [chefId]);
    
    const chef = {
      ...chefRows[0],
      ateliers: chefRows[0].ateliers && chefRows[0].ateliers[0] ? JSON.parse(chefRows[0].ateliers) : []
    };
    
    res.status(201).json(chef);
    
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du chef' });
  } finally {
    connection.release();
  }
});

// PUT /api/chefs/:id - Mettre à jour un chef
router.put('/:id', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent modifier des chefs
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent modifier des chefs.' });
  }
  
  const { id } = req.params;
  const { name, email, password } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Champs requis manquants (name, email)' });
  }
  
  try {
    // Vérifier que l'utilisateur existe et est un chef
    const [existingUser] = await req.pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const [emailCheck] = await req.pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, id]
    );
    
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Mettre à jour le chef
    let query = 'UPDATE users SET name = ?, email = ?';
    let params = [name, email];
    
    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    const [result] = await req.pool.execute(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    // Récupérer le chef mis à jour
    const [chefRows] = await req.pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'nom', a.nom,
            'description', a.description,
            'localisation', a.localisation
          )
        ) as ateliers
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);
    
    const chef = {
      ...chefRows[0],
      ateliers: chefRows[0].ateliers && chefRows[0].ateliers[0] ? JSON.parse(chefRows[0].ateliers) : []
    };
    
    res.json(chef);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du chef' });
  }
});

// DELETE /api/chefs/:id - Supprimer un chef
router.delete('/:id', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent supprimer des chefs
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des chefs.' });
  }
  
  const { id } = req.params;
  
  try {
    // Vérifier que l'utilisateur existe et est un chef
    const [existingUser] = await req.pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    const connection = await req.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Supprimer les assignations d'atelier
      await connection.execute('DELETE FROM atelier_chefs WHERE user_id = ?', [id]);
      
      // Supprimer l'utilisateur
      const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Chef non trouvé' });
      }
      
      await connection.commit();
      res.json({ message: 'Chef supprimé avec succès' });
      
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du chef' });
  }
});

// POST /api/chefs/:id/assign-atelier - Assigner un atelier à un chef
router.post('/:id/assign-atelier', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent assigner des ateliers
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent assigner des ateliers.' });
  }
  
  const { id } = req.params;
  const { atelier_id } = req.body;
  
  if (!atelier_id) {
    return res.status(400).json({ error: 'atelier_id est requis' });
  }
  
  const connection = await req.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'utilisateur existe et est un chef
    const [chefCheck] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );
    
    if (chefCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    // Vérifier que l'atelier existe
    const [atelierCheck] = await connection.query(
      'SELECT id FROM ateliers WHERE id = ?',
      [atelier_id]
    );
    
    if (atelierCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    
    // Vérifier que ce chef n'est pas déjà assigné à un autre atelier
    const [existingAssign] = await connection.query(
      'SELECT atelier_id FROM atelier_chefs WHERE user_id = ? AND atelier_id != ?',
      [id, atelier_id]
    );
    
    if (existingAssign.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Ce chef est déjà assigné à un autre atelier' });
    }
    
    // Vérifier que l'atelier n'a pas déjà 2 chefs
    const [chefCount] = await connection.query(
      'SELECT COUNT(*) as count FROM atelier_chefs WHERE atelier_id = ?',
      [atelier_id]
    );
    
    if (chefCount[0].count >= 2) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cet atelier a déjà 2 chefs assignés' });
    }
    
    // Supprimer l'ancienne assignation si elle existe
    await connection.execute('DELETE FROM atelier_chefs WHERE user_id = ?', [id]);
    
    // Créer la nouvelle assignation
    await connection.execute(
      'INSERT INTO atelier_chefs (atelier_id, user_id) VALUES (?, ?)',
      [atelier_id, id]
    );
    
    await connection.commit();
    
    // Récupérer le chef mis à jour
    const [chefRows] = await connection.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'nom', a.nom,
            'description', a.description,
            'localisation', a.localisation
          )
        ) as ateliers
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [id]);
    
    const chef = {
      ...chefRows[0],
      ateliers: chefRows[0].ateliers && chefRows[0].ateliers[0] ? JSON.parse(chefRows[0].ateliers) : []
    };
    
    res.json({
      message: 'Atelier assigné avec succès',
      chef
    });
    
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de l\'atelier' });
  } finally {
    connection.release();
  }
});

// DELETE /api/chefs/:id/unassign-atelier - Retirer l'assignation d'atelier d'un chef
router.delete('/:id/unassign-atelier', authenticate, async (req, res) => {
  // Seuls les administrateurs peuvent retirer des assignations
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent retirer des assignations.' });
  }
  
  const { id } = req.params;
  
  try {
    // Vérifier que l'utilisateur existe et est un chef
    const [chefCheck] = await req.pool.query(
      'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );
    
    if (chefCheck.length === 0) {
      return res.status(404).json({ error: 'Chef non trouvé' });
    }
    
    // Supprimer l'assignation
    const [result] = await req.pool.execute('DELETE FROM atelier_chefs WHERE user_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aucune assignation trouvée pour ce chef' });
    }
    
    res.json({ message: 'Assignation retirée avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors du retrait de l\'assignation' });
  }
});

module.exports = router; 