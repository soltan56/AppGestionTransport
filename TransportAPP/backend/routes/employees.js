const express = require('express');
const router = express.Router();

// Middleware d'authentification simple
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis les headers
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    
    // Extraire l'ID utilisateur du token mock
    const userId = token.replace('mock-jwt-token-', '');
    
    // Récupérer les informations utilisateur
    const [users] = await req.pool.query(
      'SELECT id, name, email, role, atelier_id FROM users WHERE id = ?',
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

// GET /api/employees
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT e.*, a.nom as atelier_nom 
      FROM employees e 
      LEFT JOIN ateliers a ON e.atelier_id = a.id
    `;
    let params = [];
    
    // Si l'utilisateur est un chef d'atelier, filtrer par son atelier
    if (req.user.role === 'chef_d_atelier') {
      query += `
        INNER JOIN atelier_chefs ac ON a.id = ac.atelier_id 
        WHERE ac.user_id = ?
      `;
      params.push(req.user.id);
    }
    // L'administrateur et RH voient tous les employés
    
    query += ' ORDER BY e.nom, e.prenom';
    
    const [rows] = await req.pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// POST /api/employees
router.post('/', authenticate, async (req, res) => {
  const { nom, prenom, email, telephone, equipe, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte } = req.body;

  if (!nom || !prenom || !equipe) {
    return res.status(400).json({ error: 'Champs requis manquants (nom, prenom, equipe)' });
  }

  try {
    // Déterminer atelier_id selon le rôle
    let final_atelier_id = atelier_id;
    
    if (req.user.role === 'chef_d_atelier') {
      // Si c'est un chef, récupérer son atelier
      const [atelierChef] = await req.pool.query(
        'SELECT atelier_id FROM atelier_chefs WHERE user_id = ?',
        [req.user.id]
      );
      
      if (atelierChef.length === 0) {
        return res.status(403).json({ error: 'Vous devez être assigné à un atelier pour créer des employés' });
      }
      
      final_atelier_id = atelierChef[0].atelier_id;
    } else if (req.user.role === 'administrateur') {
      // Admin peut spécifier l'atelier
      if (!atelier_id) {
        return res.status(400).json({ error: 'atelier_id est requis pour les administrateurs' });
      }
      
      // Vérifier que l'atelier existe
      const [atelierCheck] = await req.pool.query(
        'SELECT id FROM ateliers WHERE id = ?',
        [atelier_id]
      );
      
      if (atelierCheck.length === 0) {
        return res.status(400).json({ error: 'Atelier spécifié non trouvé' });
      }
    } else {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs et chefs peuvent créer des employés.' });
    }

    const [result] = await req.pool.execute(
      'INSERT INTO employees (nom, prenom, email, telephone, equipe, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, telephone, equipe, final_atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte]
    );
    
    const [rows] = await req.pool.query(`
      SELECT e.*, a.nom as atelier_nom 
      FROM employees e 
      LEFT JOIN ateliers a ON e.atelier_id = a.id 
      WHERE e.id = ?
    `, [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création de l'employé" });
  }
});

// PUT /api/employees/:id
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, equipe, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte } = req.body;

  if (!nom || !prenom || !equipe) {
    return res.status(400).json({ error: 'Champs requis manquants (nom, prenom, equipe)' });
  }

  try {
    // Vérifier les permissions : un chef ne peut modifier que les employés de son atelier
    if (req.user.role === 'chef_d_atelier') {
      const [existingEmployee] = await req.pool.query(`
        SELECT e.atelier_id 
        FROM employees e
        INNER JOIN atelier_chefs ac ON e.atelier_id = ac.atelier_id
        WHERE e.id = ? AND ac.user_id = ?
      `, [id, req.user.id]);
      
      if (existingEmployee.length === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez modifier que les employés de votre atelier' });
      }
      
      // Un chef ne peut pas changer l'atelier d'un employé
      if (atelier_id && atelier_id !== existingEmployee[0].atelier_id) {
        return res.status(403).json({ error: 'Vous ne pouvez pas changer l\'atelier d\'un employé' });
      }
    } else if (req.user.role === 'administrateur') {
      // Admin peut tout faire, mais vérifier que l'atelier existe si fourni
      if (atelier_id) {
        const [atelierCheck] = await req.pool.query(
          'SELECT id FROM ateliers WHERE id = ?',
          [atelier_id]
        );
        
        if (atelierCheck.length === 0) {
          return res.status(400).json({ error: 'Atelier spécifié non trouvé' });
        }
      }
    } else {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs et chefs peuvent modifier des employés.' });
    }

    const [result] = await req.pool.execute(
      'UPDATE employees SET nom = ?, prenom = ?, email = ?, telephone = ?, equipe = ?, atelier_id = ?, type_contrat = ?, date_embauche = ?, point_ramassage = ?, circuit_affecte = ? WHERE id = ?',
      [nom, prenom, email, telephone, equipe, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    const [rows] = await req.pool.query(`
      SELECT e.*, a.nom as atelier_nom 
      FROM employees e 
      LEFT JOIN ateliers a ON e.atelier_id = a.id 
      WHERE e.id = ?
    `, [id]);
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la modification de l'employé" });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Vérifier les permissions : un chef ne peut supprimer que les employés de son atelier
    if (req.user.role === 'chef_d_atelier') {
      const [existingEmployee] = await req.pool.query(`
        SELECT e.atelier_id 
        FROM employees e
        INNER JOIN atelier_chefs ac ON e.atelier_id = ac.atelier_id
        WHERE e.id = ? AND ac.user_id = ?
      `, [id, req.user.id]);
      
      if (existingEmployee.length === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que les employés de votre atelier' });
      }
    } else if (req.user.role !== 'administrateur') {
      return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs et chefs peuvent supprimer des employés.' });
    }

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

// PUT /api/employees/:id/assign-chef - Assigner un employé à un chef (admin/RH)
router.put('/:id/assign-chef', authenticate, async (req, res) => {
  const { id } = req.params;
  const { chef_id } = req.body;

  console.log('🔍 Tentative d\'assignation par:', req.user.role, req.user.email);
  console.log('📋 Employé ID:', id, 'Chef ID:', chef_id);

  // Seuls les administrateurs et RH peuvent réassigner les employés
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    console.log('❌ Accès refusé pour le rôle:', req.user.role);
    return res.status(403).json({ error: 'Seuls les administrateurs et RH peuvent assigner les employés aux chefs' });
  }

  console.log('✅ Permissions validées pour:', req.user.role);

  try {
    // Vérifier que l'employé existe
    const [existingEmployee] = await req.pool.query(
      'SELECT id, nom, prenom FROM employees WHERE id = ?',
      [id]
    );
    
    if (existingEmployee.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Si chef_id est fourni, vérifier que le chef existe
    if (chef_id !== null) {
      const [existingChef] = await req.pool.query(
        'SELECT id, name FROM users WHERE id = ? AND role = "chef"',
        [chef_id]
      );
      
      if (existingChef.length === 0) {
        return res.status(404).json({ error: 'Chef non trouvé' });
      }
    }

    // Mettre à jour l'assignation
    const [result] = await req.pool.execute(
      'UPDATE employees SET atelier_chef_id = ? WHERE id = ?',
      [chef_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Récupérer l'employé mis à jour avec les infos du chef
    const [updatedEmployee] = await req.pool.query(`
      SELECT e.*, u.name as chef_name 
      FROM employees e 
      LEFT JOIN users u ON e.atelier_chef_id = u.id 
      WHERE e.id = ?
    `, [id]);

    res.json({
      message: 'Assignation mise à jour avec succès',
      employee: updatedEmployee[0]
    });
  } catch (err) {
    console.error('Erreur lors de l\'assignation:', err);
    res.status(500).json({ error: "Erreur lors de l'assignation de l'employé" });
  }
});

module.exports = router; 