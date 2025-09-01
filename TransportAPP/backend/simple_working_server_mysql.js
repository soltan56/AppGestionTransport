const express = require('express');
const cors = require('cors');
const path = require('path');

// Remplacer SQLite par MySQL
const { pool, initDatabase, insertTestUsers, testConnection } = require('./db-mysql');

// Import du service de consolidation
const consolidationService = require('./consolidation-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS configuré pour credentials
app.use(cors({
  origin: 'http://localhost:3000', // Frontend React
  credentials: true, // Autoriser les cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Middleware d'authentification simple
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  // Extraire l'ID utilisateur du token simple
  const userIdMatch = token.match(/mock-jwt-token-(\d+)/);
  if (!userIdMatch) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const userId = parseInt(userIdMatch[1]);
  
  // Récupérer l'utilisateur depuis MySQL
  pool.execute('SELECT * FROM users WHERE id = ?', [userId])
    .then(([rows]) => {
      if (rows.length > 0) {
        req.user = rows[0];
        req.pool = pool; // Ajouter le pool à la requête
        next();
      } else {
        res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
    })
    .catch(err => {
      console.error('❌ Erreur authentification:', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    });
};

// Route pour les employés
app.get('/api/employees', authenticate, async (req, res) => {
  console.log(`📊 Requête employés de ${req.user.name} (${req.user.role})`);
  console.log(`🔍 Paramètres de filtrage:`, req.query);
  
  let query = `
    SELECT e.*, a.nom as atelier_name, a.description as atelier_description,
           u.name as chef_name, u.email as chef_email
    FROM employees e
    LEFT JOIN ateliers a ON e.atelier_id = a.id
    LEFT JOIN users u ON e.atelier_chef_id = u.id
  `;
  let params = [];
  let whereConditions = [];
  
  // Si c'est un chef d'atelier, filtrer par son atelier
  if (req.user.role === 'chef_d_atelier') {
    whereConditions.push('e.atelier_id IN (SELECT atelier_id FROM atelier_chefs WHERE user_id = ?)');
    params.push(req.user.id);
  }
  
  // Filtre par type de contrat
  if (req.query.type_contrat) {
    whereConditions.push('e.type_contrat = ?');
    params.push(req.query.type_contrat);
  }
  
  // Filtre par équipe
  if (req.query.equipe) {
    whereConditions.push('e.equipe = ?');
    params.push(req.query.equipe);
  }
  
  // Filtre par atelier
  if (req.query.atelier_id) {
    whereConditions.push('e.atelier_id = ?');
    params.push(req.query.atelier_id);
  }
  
  // Appliquer les conditions WHERE si elles existent
  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }
  
  query += ' ORDER BY e.nom, e.prenom';
  
  try {
    const [rows] = await pool.execute(query, params);
    console.log(`✅ ${rows.length} employés trouvés pour ${req.user.name}`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête employés:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// POST /api/employees - Créer un employé (admin et RH)
app.post('/api/employees', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs et RH peuvent créer des employés.' });
  }
  try {
    const body = req.body || {};
    const nom = body.nom;
    const prenom = body.prenom;
    const email = body.email || null;
    const telephone = body.telephone || null;
    const equipe = body.equipe || null;
    const type_contrat = body.type_contrat || body.typeContrat || null;
    const date_embauche = body.date_embauche || body.dateEmbauche || null;
    const point_ramassage = body.point_ramassage || body.pointRamassage || null;
    const circuit_affecte = body.circuit_affecte || body.circuit || null;

    if (!nom || !prenom) {
      return res.status(400).json({ error: 'Champs requis: nom, prenom' });
    }

    // Atelier: accepter soit atelier_id soit atelier (nom)
    let atelier_id = body.atelier_id || null;
    let atelierNom = null;
    if (!atelier_id && body.atelier) {
      const [aRows] = await pool.execute('SELECT id, nom FROM ateliers WHERE nom = ?', [body.atelier]);
      if (aRows.length === 0) {
        return res.status(400).json({ error: `Atelier '${body.atelier}' introuvable` });
      }
      atelier_id = aRows[0].id;
      atelierNom = aRows[0].nom;
    } else if (atelier_id) {
      const [aRows] = await pool.execute('SELECT nom FROM ateliers WHERE id = ?', [atelier_id]);
      if (aRows.length === 0) {
        return res.status(400).json({ error: `Atelier avec id ${atelier_id} introuvable` });
      }
      atelierNom = aRows[0].nom;
    }

    const [result] = await pool.execute(
      `INSERT INTO employees (nom, prenom, email, telephone, equipe, atelier, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, equipe, atelierNom, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte]
    );
    const [row] = await pool.execute('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    res.status(201).json(row[0]);
  } catch (err) {
    console.error('❌ Erreur création employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
});

// Enhance PUT /api/employees/:id to accept alternate field names
app.put('/api/employees/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'chef_d_atelier' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs, chefs d\'atelier et RH peuvent modifier des employés.' });
  }
  
  const { id } = req.params;
  const body = req.body || {};
  const nom = body.nom;
  const prenom = body.prenom;
  const email = body.email || null;
  const telephone = body.telephone || null;
  const equipe = body.equipe || null;
  const type_contrat = body.type_contrat || body.typeContrat || null;
  const date_embauche = body.date_embauche || body.dateEmbauche || null;
  const point_ramassage = body.point_ramassage || body.pointRamassage || null;
  const circuit_affecte = body.circuit_affecte || body.circuit || null;

  try {
    // Atelier mapping
    let atelier_id = body.atelier_id || null;
    let atelierNom = null;
    if (body.atelier === null) {
      atelier_id = null;
      atelierNom = null;
    } else if (!atelier_id && body.atelier) {
      const [aRows] = await pool.execute('SELECT id, nom FROM ateliers WHERE nom = ?', [body.atelier]);
      if (aRows.length === 0) {
        return res.status(400).json({ error: `Atelier '${body.atelier}' introuvable` });
      }
      atelier_id = aRows[0].id;
      atelierNom = aRows[0].nom;
    } else if (atelier_id) {
      const [aRows] = await pool.execute('SELECT nom FROM ateliers WHERE id = ?', [atelier_id]);
      if (aRows.length === 0) {
        return res.status(400).json({ error: `Atelier avec id ${atelier_id} introuvable` });
      }
      atelierNom = aRows[0].nom;
    }

    const [result] = await pool.execute(
      `UPDATE employees SET 
         nom = ?, prenom = ?, email = ?, telephone = ?, equipe = ?,
         type_contrat = ?, date_embauche = ?, point_ramassage = ?, circuit_affecte = ?,
         atelier_id = ?, atelier = ?
       WHERE id = ?`,
      [
        nom, prenom, email, telephone, equipe,
        type_contrat, date_embauche, point_ramassage, circuit_affecte,
        atelier_id, atelierNom,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    const [updated] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('❌ Erreur mise à jour employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

// DELETE /api/employees/:id - Supprimer un employé
app.delete('/api/employees/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs et RH peuvent supprimer des employés.' });
  }
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
});

// PUT /api/employees/:id/assign-chef - Assigner/désassigner un employé à un chef (via atelier du chef)
app.put('/api/employees/:id/assign-chef', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { id } = req.params;
  const { chef_id } = req.body; // null pour désassigner

  try {
    let newAtelierId = null;
    let newAtelierNom = null;

    if (chef_id) {
      const [atelierRows] = await pool.execute(
        `SELECT a.id, a.nom
         FROM atelier_chefs ac
         JOIN ateliers a ON a.id = ac.atelier_id
         WHERE ac.user_id = ?
         LIMIT 1`,
        [chef_id]
      );
      if (atelierRows.length === 0) {
        return res.status(400).json({ error: 'Ce chef n\'a pas d\'atelier assigné' });
      }
      newAtelierId = atelierRows[0].id;
      newAtelierNom = atelierRows[0].nom;
    }

    const [result] = await pool.execute(
      'UPDATE employees SET atelier_id = ?, atelier = ?, atelier_chef_id = ? WHERE id = ?',[
        newAtelierId, newAtelierNom, chef_id || null, id
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    const [updated] = await pool.execute('SELECT * FROM employees WHERE id = ?', [id]);
    res.json({ success: true, employee: updated[0] });
  } catch (err) {
    console.error('❌ Erreur assignation employé->chef:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'assignation' });
  }
});

// POST /api/chefs/:id/assign-employees - Assigner plusieurs employés à l'atelier d'un chef
app.post('/api/chefs/:id/assign-employees', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { id } = req.params; // chef id
  const { employee_ids } = req.body; // array
  if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
    return res.status(400).json({ error: 'Liste des employés requise' });
  }
  try {
    const [atelierRows] = await pool.execute(
      `SELECT a.id, a.nom FROM atelier_chefs ac JOIN ateliers a ON a.id = ac.atelier_id WHERE ac.user_id = ? LIMIT 1`,
      [id]
    );
    if (atelierRows.length === 0) {
      return res.status(400).json({ error: 'Ce chef n\'a pas d\'atelier assigné' });
    }
    const atelierId = atelierRows[0].id;
    const atelierNom = atelierRows[0].nom;

    const [result] = await pool.execute(
      `UPDATE employees SET atelier_id = ?, atelier = ?, atelier_chef_id = ? WHERE id IN (${employee_ids.map(()=>'?').join(',')})`,
      [atelierId, atelierNom, parseInt(id), ...employee_ids]
    );
    res.json({ success: true, updated: result.affectedRows });
  } catch (err) {
    console.error('❌ Erreur assignation multiple:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de plusieurs employés' });
  }
});

// Route pour les plannings
app.get('/api/plannings', authenticate, async (req, res) => {
  console.log(`📅 Requête plannings de ${req.user.name} (${req.user.role})`);
  
  let query = 'SELECT p.*, u.name as created_by_name FROM plannings p LEFT JOIN users u ON p.created_by = u.id';
  let params = [];
  
  // Si c'est un chef, filtrer par ses plannings
  if (req.user.role === 'chef') {
    query += ' WHERE p.created_by = ?';
    params.push(req.user.id);
  }
  
  query += ' ORDER BY p.created_at DESC';
  
  try {
    const [rows] = await pool.execute(query, params);
    console.log(`✅ ${rows.length} plannings trouvés pour ${req.user.name}`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête plannings:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des plannings' });
  }
});

// Route export CSV des plannings hebdomadaires avec style professionnel
app.get('/api/plannings/export/csv', authenticate, async (req, res) => {
  console.log(`📊 Export CSV plannings hebdomadaires avec style professionnel demandé par ${req.user.name} (${req.user.role})`);
  
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  try {
    // Récupérer tous les plannings avec les détails des chefs
    const [plannings] = await pool.execute(`
      SELECT wp.*, u.name as chef_name, u.email as chef_email
      FROM weekly_plannings wp
      LEFT JOIN users u ON wp.created_by = u.id
      ORDER BY wp.year DESC, wp.week_number ASC, u.name ASC
    `);

    // Récupérer tous les employés assignés
    const [employees] = await pool.execute(`
      SELECT e.id, e.nom, e.prenom, e.equipe, e.circuit_affecte, e.point_ramassage, e.atelier
      FROM employees e
      ORDER BY e.nom, e.prenom
    `);

    // Créer le contenu CSV avec style professionnel
    let csvContent = '';
    
    // En-têtes CSV avec style professionnel (4 colonnes principales)
    const headers = [
      'Équipe',
      'Nom Employé', 
      'Circuit',
      'Point de Ramassage'
    ];
    
    // Ajouter les en-têtes avec formatage professionnel
    csvContent += headers.join(',') + '\n';
    
    // Traiter chaque planning pour extraire les employés assignés
    for (const planning of plannings) {
      try {
        if (planning.assignments) {
          const assignments = JSON.parse(planning.assignments);
          
          // Pour chaque équipe dans le planning
          Object.entries(assignments).forEach(([teamName, employeeIds]) => {
            if (!Array.isArray(employeeIds)) return;
            
            // Récupérer les détails des employés
            employeeIds.forEach(empId => {
              const employee = employees.find(emp => emp.id === empId);
              if (employee) {
                const row = [
                  `"${teamName}"`,
                  `"${employee.nom} ${employee.prenom}"`,
                  `"${employee.circuit_affecte || 'N/A'}"`,
                  `"${employee.point_ramassage || 'N/A'}"`
                ];
                csvContent += row.join(',') + '\n';
              }
            });
          });
        }
      } catch (parseError) {
        console.warn(`⚠️ Erreur parsing assignments planning ${planning.id}:`, parseError.message);
      }
    }



    // Configurer les en-têtes de réponse pour le téléchargement
    const fileName = `plannings_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Ajouter le BOM UTF-8 pour Excel
    res.write('\uFEFF');
    res.write(csvContent);
    res.end();
    
    console.log(`✅ Export CSV professionnel généré: ${fileName} (${plannings.length} plannings, ${employees.length} employés)`);
    
  } catch (err) {
    console.error('❌ Erreur export CSV professionnel:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'export CSV professionnel' });
  }
});

// Route pour le merge manuel des plannings non consolidés
app.post('/api/plannings/merge-manual', authenticate, async (req, res) => {
  console.log(`🔄 Merge manuel des plannings demandé par ${req.user.name} (${req.user.role})`);
  
  // Permettre aux administrateurs ET aux RH
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs et RH' });
  }

  const { planningIds, year, weekNumber } = req.body;
  
  if (!Array.isArray(planningIds) || planningIds.length < 2) {
    return res.status(400).json({ error: 'Au moins 2 plannings doivent être sélectionnés pour le merge' });
  }

  if (!year || !weekNumber) {
    return res.status(400).json({ error: 'Année et numéro de semaine requis' });
  }

  try {
    // 1. Vérifier que tous les plannings existent et sont de la même semaine
    const [plannings] = await pool.execute(`
      SELECT wp.*, u.name as chef_name, u.email as chef_email
      FROM weekly_plannings wp
      LEFT JOIN users u ON wp.created_by = u.id
      WHERE wp.id IN (${planningIds.map(() => '?').join(',')})
        AND wp.year = ? AND wp.week_number = ?
        AND wp.is_consolidated = FALSE
    `, [...planningIds, year, weekNumber]);

    if (plannings.length !== planningIds.length) {
      return res.status(400).json({ error: 'Certains plannings sélectionnés sont introuvables ou déjà consolidés' });
    }

    // 2. Récupérer tous les employés assignés dans ces plannings
    const employeeDetails = [];
    const mergedData = {};
    const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    const TEAM_KEYS = ['Matin','Soir','Nuit','Normal'];
    const mergedDays = {}; // { day: { team: [ids] } }
    
    for (const planning of plannings) {
      try {
        // Parser les assignments JSON du planning
        const assignments = planning.assignments ? JSON.parse(planning.assignments) : {};
        // Parser day_assignments pour le merge des jours
        const dayAssign = planning.day_assignments ? (typeof planning.day_assignments === 'string' ? JSON.parse(planning.day_assignments) : planning.day_assignments) : {};
        
        // Pour chaque équipe dans le planning
        Object.entries(assignments).forEach(([teamName, employeeIds]) => {
          if (!Array.isArray(employeeIds)) return;
          
          if (!mergedData[teamName]) {
            mergedData[teamName] = [];
          }
          
          // Récupérer les détails des employés depuis la base
          employeeIds.forEach(empId => {
            // Vérifier si l'employé n'est pas déjà dans la liste (éviter les doublons)
            const existingEmployee = employeeDetails.find(emp => 
              emp.employee_id === empId && emp.equipe === teamName
            );
            
            if (!existingEmployee) {
              // Récupérer les détails de l'employé depuis la base
              employeeDetails.push({
                employee_id: empId,
                equipe: teamName,
                nom: `Employé_${empId}`, // Valeur par défaut
                circuit_affecte: 'À définir', // Valeur par défaut
                point_ramassage: 'À définir', // Valeur par défaut
                chef: planning.chef_name || 'N/A'
              });
              
              mergedData[teamName].push(empId);
            }
          });
        });
        
        // Fusionner les jours par équipe
        DAYS.forEach(day => {
          const perDay = dayAssign?.[day] || {};
          TEAM_KEYS.forEach(team => {
            const src = Array.isArray(perDay?.[team]) ? perDay[team] : [];
            if (src.length === 0) return;
            if (!mergedDays[day]) mergedDays[day] = { Matin: [], Soir: [], Nuit: [], Normal: [] };
            const set = new Set(mergedDays[day][team]);
            src.forEach(v => set.add(parseInt(v, 10)));
            mergedDays[day][team] = Array.from(set);
          });
        });
      } catch (parseError) {
        console.warn(`⚠️ Erreur parsing JSON pour planning ${planning.id}:`, parseError.message);
      }
    }
    
    // 3. Enrichir avec les vraies données des employés depuis la base
    if (employeeDetails.length > 0) {
      const employeeIds = employeeDetails.map(emp => emp.employee_id);
      const [employeesData] = await pool.execute(`
        SELECT id, nom, prenom, circuit_affecte, point_ramassage, atelier
        FROM employees 
        WHERE id IN (${employeeIds.map(() => '?').join(',')})
      `, employeeIds);
      
      // Mettre à jour les détails des employés avec les vraies données
      employeeDetails.forEach(emp => {
        const realEmployee = employeesData.find(e => e.id === emp.employee_id);
        if (realEmployee) {
          emp.nom = realEmployee.nom;
          emp.prenom = realEmployee.prenom;
          emp.circuit_affecte = realEmployee.circuit_affecte || 'N/A';
          emp.point_ramassage = realEmployee.point_ramassage || 'N/A';
        }
      });
    }
    
    // 4. Générer le CSV fusionné avec style professionnel
    let csvContent = '';
    
    // En-têtes CSV: 4 colonnes + 7 colonnes jours
    const headers = [
      'Équipe', 'Nom employé', 'Circuit', 'Point de ramassage (adresse)',
      ...DAYS
    ];
    csvContent += headers.join(',') + '\n';
    
    // Données fusionnées - Respecter l'ordre exact des colonnes
    employeeDetails.forEach(emp => {
      const base = [
        `"${emp.equipe || 'N/A'}"`,
        `"${(emp.nom + ' ' + emp.prenom).replace(/"/g, '""')}"`,
        `"${(emp.circuit_affecte || 'N/A').replace(/"/g, '""')}"`,
        `"${(emp.point_ramassage || 'N/A').replace(/"/g, '""')}"`
      ];
      const flags = DAYS.map(day => {
        const perDay = mergedDays?.[day] || {};
        const allIds = (TEAM_KEYS.flatMap(t => Array.isArray(perDay?.[t]) ? perDay[t] : [])).map(v => parseInt(v, 10));
        return allIds.includes(parseInt(emp.employee_id, 10)) ? '"✔"' : '""';
      });
      csvContent += [...base, ...flags].join(',') + '\n';
    });
    
    // Configurer les en-têtes de réponse pour le téléchargement
    const fileName = `merge_plannings_S${weekNumber}_${year}_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Ajouter le BOM UTF-8 pour Excel
    res.write('\uFEFF');
    res.write(csvContent);
    res.end();
    
    console.log(`✅ Merge manuel réussi: ${plannings.length} plannings fusionnés pour semaine ${weekNumber}/${year}`);
    
  } catch (err) {
    console.error('❌ Erreur merge manuel:', err.message);
    res.status(500).json({ error: 'Erreur lors du merge manuel des plannings' });
  }
});

// Route pour l'authentification
app.post('/api/auth/login', async (req, res) => {
  const rawEmail = (req.body.email || '').trim();
  const password = req.body.password || '';
  const requestedRole = req.body.role; // optionnel

  if (!rawEmail || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email et mot de passe requis' 
    });
  }

  const email = rawEmail.toLowerCase();
  console.log(`🔐 Tentative de connexion: ${email}${requestedRole ? ` (role demandé: ${requestedRole})` : ''}`);

  try {
    // Rechercher par email sans sensibilité à la casse
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', 
      [email]
    );

    if (rows.length === 0) {
      console.log('❌ Auth: utilisateur non trouvé');
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const user = rows[0];

    // Comparaison du mot de passe (bcrypt si hash détecté)
    let passwordOk = false;
    const stored = user.password || '';
    const looksHashed = typeof stored === 'string' && stored.startsWith('$2');

    if (looksHashed) {
      try {
        const bcrypt = require('bcryptjs');
        passwordOk = await bcrypt.compare(password, stored);
      } catch (e) {
        console.warn('⚠️ bcrypt non disponible, comparaison en clair ignorée pour hash');
        passwordOk = false;
      }
    } else {
      passwordOk = stored === password;
    }

    if (!passwordOk) {
      console.log('❌ Auth: mot de passe invalide');
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    // Si un rôle est fourni, il doit correspondre exactement au rôle de l'utilisateur
    if (requestedRole && requestedRole !== user.role) {
      console.log(`❌ Auth: rôle demandé (${requestedRole}) ne correspond pas au rôle utilisateur (${user.role})`);
      return res.status(403).json({ success: false, message: 'Rôle incorrect pour ce compte' });
    }

    // Créer un token simple
    const token = `mock-jwt-token-${user.id}`;
    console.log(`✅ Connexion réussie: ${user.name} (ID: ${user.id}, role: ${user.role})`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('❌ Erreur authentification:', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Routes pour weekly-plannings
app.get('/api/weekly-plannings', authenticate, async (req, res) => {
  const { year = new Date().getFullYear(), createdBy } = req.query;
  console.log(`📅 Requête weekly-plannings année ${year} de ${req.user.name} (createdBy=${createdBy || 'auto'})`);
  
  let query = `
    SELECT wp.*, u.name as created_by_name,
           CASE 
             WHEN wp.is_consolidated = TRUE THEN 'Consolidé'
             WHEN wp.status = 'completed' THEN 'Terminé'
             WHEN wp.status = 'draft' THEN 'Brouillon'
             ELSE wp.status
           END as status_label
    FROM weekly_plannings wp 
    LEFT JOIN users u ON wp.created_by = u.id 
    WHERE wp.year = ?
  `;
  
  const params = [year];
  const isChef = req.user.role === 'chef_d_atelier';
  const isAdmin = req.user.role === 'administrateur';
  
  if (isChef) {
    query += ' AND (wp.created_by = ? OR wp.is_consolidated = TRUE)';
    params.push(req.user.id);
  }
  
  if (isAdmin && createdBy) {
    query += ' AND wp.created_by = ?';
    params.push(parseInt(createdBy));
  }
  
  query += ' ORDER BY wp.week_number ASC, wp.is_consolidated DESC, wp.created_at DESC';
  
  try {
    const [rows] = await pool.execute(query, params);
    console.log(`✅ ${rows.length} weekly-plannings trouvés`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête weekly-plannings:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des plannings' });
  }
});

// GET /api/weekly-plannings/:year/:week
app.get('/api/weekly-plannings/:year/:week', authenticate, async (req, res) => {
  const { year, week } = req.params;
  // Permettre à l'admin de cibler un chef précis
  const createdByParam = req.query.createdBy ? parseInt(req.query.createdBy) : null;
  console.log(`📅 Requête planning semaine ${week}/${year} de ${req.user.name} (createdBy=${createdByParam || 'self/auto'})`);
  
  let query = 'SELECT * FROM weekly_plannings WHERE year = ? AND week_number = ?';
  const params = [year, week];
  
  const isChef = req.user.role === 'chef_d_atelier';
  const isAdmin = req.user.role === 'administrateur';

  // Chef: forcer son propre planning uniquement
  if (isChef) {
    query += ' AND created_by = ?';
    params.push(req.user.id);
  }
  
  // Admin: possibilité de cibler un chef
  if (isAdmin && createdByParam) {
    query += ' AND created_by = ?';
    params.push(createdByParam);
  }

  try {
    const [rows] = await pool.execute(query, params);
    
    if (rows.length > 0) {
      console.log(`✅ Planning semaine ${week}/${year} trouvé (${rows.length})`);
      const planning = rows[0];

      // Ajouter la liste des employés pour le chef
      if (isChef) {
        const [empRows] = await pool.execute(
          `SELECT e.* FROM employees e
           WHERE e.atelier_id IN (SELECT atelier_id FROM atelier_chefs WHERE user_id = ?)
           ORDER BY e.nom, e.prenom`,
          [req.user.id]
        );
        return res.json({ ...planning, employees: empRows });
      }

      // Admin: renvoyer aussi tous les employés pour faciliter la planification
      if (isAdmin) {
        const [empRows] = await pool.execute('SELECT * FROM employees ORDER BY nom, prenom');
        return res.json({ ...planning, employees: empRows });
      }

      res.json(planning);
    } else {
      res.status(404).json({ error: 'Planning non trouvé' });
    }
  } catch (err) {
    console.error('❌ Erreur requête planning spécifique:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du planning' });
  }
});

// POST /api/weekly-plannings
app.post('/api/weekly-plannings', authenticate, async (req, res) => {
  const { year, week_number, teams, assignments, targetChefId, day_assignments } = req.body;
  
  console.log(`💾 Sauvegarde planning semaine ${week_number}/${year} par ${req.user.name}`);
  
  // Déterminer qui est le créateur
  let createdBy = req.user.id;
  if (req.user.role === 'administrateur' && targetChefId) {
    createdBy = targetChefId;
    console.log(`📋 Planning créé par admin pour chef ID: ${targetChefId}`);
  }

  try {
    // Vérifier l'existence et le statut du planning
    const [existingRows] = await pool.execute(
      `SELECT id, status FROM weekly_plannings WHERE year = ? AND week_number = ? AND created_by = ?`,
      [year, week_number, createdBy]
    );

    if (existingRows.length > 0 && existingRows[0].status && existingRows[0].status !== 'draft') {
      return res.status(403).json({ error: 'Planning non modifiable (statut non-draft)' });
    }

    const [result] = await pool.execute(
      `INSERT INTO weekly_plannings (year, week_number, teams, assignments, day_assignments, created_by, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       teams = VALUES(teams), 
       assignments = VALUES(assignments), 
       day_assignments = VALUES(day_assignments),
       updated_at = NOW()`,
      [
        year,
        week_number,
        JSON.stringify(teams),
        JSON.stringify(assignments),
        JSON.stringify(day_assignments || {}),
        createdBy
      ]
    );

    console.log(`✅ Planning sauvegardé (ID: ${result.insertId || 'mise à jour'})`);
    res.json({ 
      success: true, 
      message: 'Planning sauvegardé avec succès',
      id: result.insertId || existingRows?.[0]?.id || null
    });
  } catch (err) {
    console.error('❌ Erreur sauvegarde planning:', err.message);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// DELETE /api/weekly-plannings/:year/:week
app.delete('/api/weekly-plannings/:year/:week', authenticate, async (req, res) => {
  const { year, week } = req.params;
  const createdByParam = req.query.createdBy ? parseInt(req.query.createdBy) : null;
  const includeConsolidated = req.query.includeConsolidated === 'true';
  console.log(`🗑️  Suppression planning semaine ${week}/${year} par ${req.user.name} (createdBy=${createdByParam || 'any'}, includeConsolidated=${includeConsolidated})`);
  
  let query = 'DELETE FROM weekly_plannings WHERE year = ? AND week_number = ?';
  const params = [year, week];
  
  const isChef = req.user.role === 'chef_d_atelier';
  const isAdmin = req.user.role === 'administrateur';
  const isRH = req.user.role === 'rh';
  
  try {
    if (isChef) {
      // Un chef ne peut supprimer QUE son propre planning non consolidé
      query += ' AND created_by = ? AND (is_consolidated IS NULL OR is_consolidated = FALSE)';
      params.push(req.user.id);
    } else if (isAdmin || isRH) {
      // Admin et RH: peuvent cibler un chef précis
      if (createdByParam) {
        query += ' AND created_by = ?';
        params.push(createdByParam);
      }
      // Admin et RH: par défaut on ne supprime pas le consolidé, sauf si explicitement demandé
      if (!includeConsolidated) {
        query += ' AND (is_consolidated IS NULL OR is_consolidated = FALSE)';
      }
    } else {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const [result] = await pool.execute(query, params);
    
    if (result.affectedRows > 0) {
      console.log(`✅ Planning(s) semaine ${week}/${year} supprimé(s): ${result.affectedRows}`);
      res.json({ success: true, message: 'Planning(s) supprimé(s) avec succès', deleted: result.affectedRows });
    } else {
      res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
  } catch (err) {
    console.error('❌ Erreur suppression planning:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Route pour marquer un planning comme terminé (déclencheur de consolidation)
app.post('/api/weekly-plannings/:id/complete', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    let query = `SELECT id, status, created_by FROM weekly_plannings WHERE id = ?`;
    const params = [id];
    if (req.user.role !== 'administrateur') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }
    const [rows] = await pool.execute(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
    const planning = rows[0];
    if (planning.status === 'completed') {
      return res.json({ success: true, status: 'completed' });
    }
    await pool.execute(
      `UPDATE weekly_plannings SET status = 'completed', updated_at = NOW() WHERE id = ?`,
      [planning.id]
    );
    res.json({ success: true, status: 'completed' });
  } catch (err) {
    console.error('❌ Erreur finalisation planning:', err.message);
    res.status(500).json({ error: 'Erreur lors de la finalisation' });
  }
});

// Route pour déclencher manuellement la consolidation (admin et RH)
app.post('/api/weekly-plannings/consolidate/:year/:week', authenticate, async (req, res) => {
  const { year, week } = req.params;
  
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé - Admin ou RH requis' });
  }
  
  console.log(`🔄 Consolidation manuelle semaine ${week}/${year} par ${req.user.name}`);
  
  try {
    const result = await consolidationService.consolidateWeeklyPlanning(parseInt(year), parseInt(week));
    res.json({
      success: true,
      message: 'Consolidation effectuée avec succès',
      ...result
    });
  } catch (err) {
    console.error('❌ Erreur consolidation manuelle:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route pour vérifier le statut de consolidation
app.get('/api/weekly-plannings/consolidation-status/:year/:week', authenticate, async (req, res) => {
  const { year, week } = req.params;
  
  try {
    const readiness = await consolidationService.checkConsolidationReadiness(parseInt(year), parseInt(week));
    res.json(readiness);
  } catch (err) {
    console.error('❌ Erreur vérification consolidation:', err.message);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Route pour lancer la consolidation automatique de toutes les semaines prêtes
app.post('/api/weekly-plannings/auto-consolidate', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  
  const { year = new Date().getFullYear() } = req.body;
  console.log(`🔄 Consolidation automatique année ${year} par ${req.user.name}`);
  
  try {
    const consolidations = await consolidationService.autoConsolidateAllReadyWeeks(year);
    res.json({
      success: true,
      message: `${consolidations.length} semaines consolidées`,
      consolidations
    });
  } catch (err) {
    console.error('❌ Erreur consolidation auto:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Modifier la route GET /api/weekly-plannings pour inclure les plannings consolidés
app.get('/api/weekly-plannings', authenticate, async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  console.log(`📅 Requête weekly-plannings année ${year} de ${req.user.name}`);
  
  let query = `
    SELECT wp.*, u.name as created_by_name,
           CASE 
             WHEN wp.is_consolidated = TRUE THEN 'Consolidé'
             WHEN wp.status = 'completed' THEN 'Terminé'
             WHEN wp.status = 'draft' THEN 'Brouillon'
             ELSE wp.status
           END as status_label
    FROM weekly_plannings wp 
    LEFT JOIN users u ON wp.created_by = u.id 
    WHERE wp.year = ?
  `;
  
  let params = [year];
  
  // Si c'est un chef, ne montrer que ses plannings + les consolidés
  if (req.user.role === 'chef_d_atelier') {
    query += ' AND (wp.created_by = ? OR wp.is_consolidated = TRUE)';
    params.push(req.user.id);
  }
  
  query += ' ORDER BY wp.week_number ASC, wp.is_consolidated DESC, wp.created_at DESC';
  
  try {
    const [rows] = await pool.execute(query, params);
    console.log(`✅ ${rows.length} weekly-plannings trouvés`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête weekly-plannings:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des plannings' });
  }
});

// Route pour récupérer les chefs
app.get('/api/chefs', authenticate, async (req, res) => {
  console.log(`👨‍💼 Requête chefs de ${req.user.name} (${req.user.role})`);
  
  // Admin et RH peuvent voir tous les chefs
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  try {
    // Récupérer tous les chefs avec leurs ateliers assignés ET le nombre d'employés
    const [rows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.role,
             GROUP_CONCAT(DISTINCT a.nom) as atelier_names,
             GROUP_CONCAT(DISTINCT a.id) as atelier_ids,
             COALESCE(COUNT(DISTINCT e.id), 0) as employee_count
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      LEFT JOIN employees e ON a.id = e.atelier_id
      WHERE u.role = 'chef_d_atelier'
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY u.name
    `);
    
    // Transformer les résultats pour inclure les ateliers et le compteur d'employés
    const chefsWithAteliers = rows.map(chef => {
      const ateliers = [];
      if (chef.atelier_names && chef.atelier_ids) {
        const names = chef.atelier_names.split(',');
        const ids = chef.atelier_ids.split(',').map(id => parseInt(id));
        ateliers.push(...names.map((name, index) => ({ id: ids[index], nom: name })));
      }
      
      return {
        ...chef,
        ateliers: ateliers,
        employee_count: chef.employee_count || 0
      };
    });
    
    console.log(`✅ ${chefsWithAteliers.length} chefs trouvés avec compteurs d'employés`);
    res.json(chefsWithAteliers);
  } catch (err) {
    console.error('❌ Erreur requête chefs:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des chefs' });
  }
});

// Route pour récupérer les employés d'un chef spécifique (pour admin/RH planning)
app.get('/api/chefs/:chefId/employees', authenticate, async (req, res) => {
  const { chefId } = req.params;
  console.log(`👥 Requête employés du chef ${chefId} de ${req.user.name} (${req.user.role})`);
  
  // Admin et RH peuvent voir les employés des chefs
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  try {
    // Récupérer les employés du chef via la relation atelier_chefs → ateliers → employees
    const [rows] = await pool.execute(`
      SELECT DISTINCT e.*, a.nom as atelier_name
      FROM employees e
      JOIN ateliers a ON e.atelier_id = a.id
      JOIN atelier_chefs ac ON a.id = ac.atelier_id
      WHERE ac.user_id = ?
      ORDER BY e.nom, e.prenom
    `, [chefId]);
    
    // Récupérer les informations du chef pour context
    const [chefRows] = await pool.execute(`
      SELECT u.id, u.name, u.email,
             GROUP_CONCAT(DISTINCT a.nom) as atelier_names,
             GROUP_CONCAT(DISTINCT a.id) as atelier_ids
      FROM users u
      LEFT JOIN atelier_chefs ac ON u.id = ac.user_id
      LEFT JOIN ateliers a ON ac.atelier_id = a.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [chefId]);
    
    const chef = chefRows[0] || { id: chefId, name: 'Chef inconnu' };
    
    res.json({ chef, employees: rows });
  } catch (err) {
    console.error('❌ Erreur employés du chef:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés du chef' });
  }
});

// Route pour créer un nouveau chef (admin et RH)
app.post('/api/users', authenticate, async (req, res) => {
  console.log(`👤 Création d'un nouvel utilisateur par ${req.user.name} (${req.user.role})`);
  
  // Vérifier que c'est un admin ou RH
  if (req.user.role !== 'administrateur' && req.user.role !== 'rh') {
    console.log('❌ Accès refusé - pas admin/RH');
    return res.status(403).json({ error: 'Accès réservé aux administrateurs/RH' });
  }

  const { name, email, password, role, atelier_id } = req.body;

  // Validation des champs requis
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants (name, email, password)' });
  }

  // Forcer le rôle à 'chef_d_atelier'
  const userRole = 'chef_d_atelier';
  
  console.log(`📝 Création d'un chef: ${name} (${email})`);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que l'email n'existe pas déjà
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Si un atelier_id est fourni, vérifier qu'il existe et qu'il n'a pas déjà 2 chefs
    if (atelier_id) {
      const [atelierCheck] = await connection.execute('SELECT nom FROM ateliers WHERE id = ?', [atelier_id]);
      
      if (atelierCheck.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Atelier non trouvé' });
      }

      const [chefsCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM atelier_chefs WHERE atelier_id = ?',
        [atelier_id]
      );

      if (chefsCount[0].count >= 2) {
        await connection.rollback();
        return res.status(400).json({ error: 'Cet atelier a déjà 2 chefs assignés' });
      }
    }

    // Créer le nouvel utilisateur (sans atelier_id dans la table users)
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, userRole]
    );

    const userId = result.insertId;

    // Si un atelier_id est fourni, créer l'assignation dans atelier_chefs
    if (atelier_id) {
      await connection.execute(
        'INSERT INTO atelier_chefs (atelier_id, user_id) VALUES (?, ?)',
        [atelier_id, userId]
      );
    }

    await connection.commit();

    res.status(201).json({ success: true, user: { id: userId, name, email, role: userRole } });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Erreur création chef:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création du chef' });
  } finally {
    connection.release();
  }
});

// PUT /api/users/:id - Modifier un chef
app.put('/api/users/:id', authenticate, async (req, res) => {
  console.log(`📝 Modification du chef ${req.params.id} par ${req.user.name}`);
  
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const { id } = req.params;
  const { name, email, password, atelier_id } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email sont requis' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que l'utilisateur existe et est un chef
    const [userCheck] = await connection.execute(
      'SELECT id FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );

    if (userCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Chef non trouvé' });
    }

    // Mettre à jour les informations de base
    let updateQuery = 'UPDATE users SET name = ?, email = ?';
    let updateParams = [name, email];

    if (password) {
      updateQuery += ', password = ?';
      updateParams.push(password);
    }

    updateQuery += ' WHERE id = ?';
    updateParams.push(id);

    await connection.execute(updateQuery, updateParams);

    // Gérer l'assignation d'atelier si fournie
    if (atelier_id !== undefined) {
      // Supprimer l'ancienne assignation
      await connection.execute('DELETE FROM atelier_chefs WHERE user_id = ?', [id]);

      // Si un nouvel atelier est spécifié
      if (atelier_id) {
        // Vérifier que l'atelier existe
        const [atelierCheck] = await connection.execute('SELECT nom FROM ateliers WHERE id = ?', [atelier_id]);
        
        if (atelierCheck.length === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Atelier non trouvé' });
        }

        // Vérifier que l'atelier n'a pas déjà 2 chefs
        const [chefsCount] = await connection.execute(
          'SELECT COUNT(*) as count FROM atelier_chefs WHERE atelier_id = ?',
          [atelier_id]
        );

        if (chefsCount[0].count >= 2) {
          await connection.rollback();
          return res.status(400).json({ error: 'Cet atelier a déjà 2 chefs assignés' });
        }

        // Créer la nouvelle assignation
        await connection.execute(
          'INSERT INTO atelier_chefs (atelier_id, user_id) VALUES (?, ?)',
          [atelier_id, id]
        );
      }
    }

    await connection.commit();
    console.log(`✅ Chef ${id} mis à jour`);

    // Retourner l'utilisateur mis à jour
    const [updatedUser] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Chef mis à jour avec succès',
      user: updatedUser[0]
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Erreur modification chef:', err.message);
    res.status(500).json({ error: 'Erreur lors de la modification du chef' });
  } finally {
    connection.release();
  }
});

// DELETE /api/users/:id - Supprimer un chef
app.delete('/api/users/:id', authenticate, async (req, res) => {
  console.log(`🗑️ Suppression du chef ${req.params.id} par ${req.user.name}`);
  
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Vérifier que l'utilisateur existe et est un chef
    const [userCheck] = await connection.execute(
      'SELECT name FROM users WHERE id = ? AND role = "chef_d_atelier"',
      [id]
    );

    if (userCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Chef non trouvé' });
    }

    // Supprimer les assignations d'atelier
    await connection.execute('DELETE FROM atelier_chefs WHERE user_id = ?', [id]);

    // Supprimer l'utilisateur
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    await connection.commit();
    console.log(`✅ Chef ${userCheck[0].name} supprimé`);

    res.json({
      success: true,
      message: 'Chef supprimé avec succès'
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Erreur suppression chef:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du chef' });
  } finally {
    connection.release();
  }
});

// Nouvelles routes pour ateliers
app.get('/api/ateliers', authenticate, async (req, res) => {
  console.log(`🏭 Requête ateliers de ${req.user.name} (${req.user.role})`);
  
  try {
    // Récupérer d'abord tous les ateliers avec leurs comptes
    const ateliersQuery = `
      SELECT a.*, 
             COUNT(DISTINCT ac.user_id) as nombre_chefs,
             COUNT(DISTINCT e.id) as nombre_employes
      FROM ateliers a
      LEFT JOIN atelier_chefs ac ON a.id = ac.atelier_id
      LEFT JOIN employees e ON a.id = e.atelier_id
      GROUP BY a.id
      ORDER BY a.nom
    `;
    
    const [ateliers] = await pool.execute(ateliersQuery);
    
    // Pour chaque atelier, récupérer les détails des chefs assignés
    const ateliersWithChefs = await Promise.all(ateliers.map(async (atelier) => {
      const [chefs] = await pool.execute(`
        SELECT u.id, u.name, u.email
        FROM atelier_chefs ac
        JOIN users u ON ac.user_id = u.id
        WHERE ac.atelier_id = ?
        ORDER BY u.name
      `, [atelier.id]);
      
      return {
        ...atelier,
        chefs: chefs || [],
        nombre_chefs: chefs.length
      };
    }));
    
    console.log(`✅ ${ateliersWithChefs.length} ateliers trouvés avec leurs chefs`);
    res.json(ateliersWithChefs);
  } catch (err) {
    console.error('❌ Erreur requête ateliers:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des ateliers' });
  }
});

app.post('/api/ateliers', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { nom, description, localisation, responsable } = req.body;
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO ateliers (nom, description, localisation, responsable) VALUES (?, ?, ?, ?)',
      [nom, description, localisation, responsable]
    );
    
    const [newAtelier] = await pool.execute('SELECT * FROM ateliers WHERE id = ?', [result.insertId]);
    res.status(201).json(newAtelier[0]);
  } catch (err) {
    console.error('❌ Erreur création atelier:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de l\'atelier' });
  }
});

app.delete('/api/ateliers/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { id } = req.params;
  
  try {
    // Vérifier s'il y a des employés dans cet atelier
    const [employees] = await pool.execute('SELECT COUNT(*) as count FROM employees WHERE atelier_id = ?', [id]);
    if (employees[0].count > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer un atelier qui contient des employés' });
    }
    
    // Vérifier s'il y a des chefs assignés à cet atelier
    const [chefs] = await pool.execute('SELECT COUNT(*) as count FROM atelier_chefs WHERE atelier_id = ?', [id]);
    if (chefs[0].count > 0) {
      return res.status(400).json({ error: 'Impossible de supprimer un atelier qui a des chefs assignés' });
    }
    
    const [result] = await pool.execute('DELETE FROM ateliers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    
    res.json({ message: 'Atelier supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression atelier:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'atelier' });
  }
});

// POST /api/ateliers/:id/chefs - Assigner des chefs à un atelier
app.post('/api/ateliers/:id/chefs', authenticate, async (req, res) => {
  console.log(`👥 Assignation de chefs à l'atelier ${req.params.id} par ${req.user.name}`);
  
  // Seuls les administrateurs peuvent assigner des chefs
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent assigner des chefs.' });
  }
  
  const { id } = req.params;
  const { chef_ids } = req.body; // Array de user_ids
  
  if (!Array.isArray(chef_ids)) {
    return res.status(400).json({ error: 'Liste des chefs requise (array)' });
  }
  
  if (chef_ids.length > 2) {
    return res.status(400).json({ error: 'Un atelier ne peut avoir que 2 chefs maximum' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Vérifier que l'atelier existe
    const [atelierCheck] = await connection.execute(
      'SELECT id FROM ateliers WHERE id = ?',
      [id]
    );
    
    if (atelierCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    
    // Vérifier que tous les chefs existent et ont le bon rôle
    for (const chefId of chef_ids) {
      const [chefCheck] = await connection.execute(
        'SELECT id, name FROM users WHERE id = ? AND role = "chef_d_atelier"',
        [chefId]
      );
      
      if (chefCheck.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Chef avec ID ${chefId} non trouvé ou n'est pas un chef d'atelier` });
      }
      
      // Vérifier que ce chef n'est pas déjà assigné à un autre atelier
      const [existingAssign] = await connection.execute(
        'SELECT a.nom FROM atelier_chefs ac JOIN ateliers a ON ac.atelier_id = a.id WHERE ac.user_id = ? AND ac.atelier_id != ?',
        [chefId, id]
      );
      
      if (existingAssign.length > 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: `Le chef ${chefCheck[0].name} est déjà assigné à l'atelier ${existingAssign[0].nom}` 
        });
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
    console.log(`✅ ${chef_ids.length} chef(s) assigné(s) à l'atelier ${id}`);
    
    // Récupérer l'atelier mis à jour avec ses chefs
    const [updatedAtelier] = await pool.execute(`
      SELECT a.*, 
             COUNT(DISTINCT e.id) as nombre_employes
      FROM ateliers a
      LEFT JOIN employees e ON a.id = e.atelier_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    // Récupérer les chefs assignés
    const [chefs] = await pool.execute(`
      SELECT u.id, u.name, u.email
      FROM atelier_chefs ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.atelier_id = ?
    `, [id]);
    
    const atelier = {
      ...updatedAtelier[0],
      chefs: chefs || [],
      nombre_chefs: chefs.length
    };
    
    res.json({
      message: 'Chefs assignés avec succès',
      atelier
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('❌ Erreur lors de l\'assignation des chefs:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'assignation des chefs' });
  } finally {
    connection.release();
  }
});

// PUT /api/ateliers/:id - Mettre à jour un atelier
app.put('/api/ateliers/:id', authenticate, async (req, res) => {
  console.log(`📝 Modification de l'atelier ${req.params.id} par ${req.user.name}`);
  
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent modifier des ateliers.' });
  }
  
  const { id } = req.params;
  const { nom, description, localisation, responsable } = req.body;
  
  if (!nom) {
    return res.status(400).json({ error: 'Le nom de l\'atelier est requis' });
  }
  
  try {
    const [result] = await pool.execute(
      'UPDATE ateliers SET nom = ?, description = ?, localisation = ?, responsable = ? WHERE id = ?',
      [nom, description || null, localisation || null, responsable || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    
    // Récupérer l'atelier mis à jour avec ses chefs
    const [updatedAtelier] = await pool.execute('SELECT * FROM ateliers WHERE id = ?', [id]);
    
    // Récupérer les chefs assignés
    const [chefs] = await pool.execute(`
      SELECT u.id, u.name, u.email
      FROM atelier_chefs ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.atelier_id = ?
    `, [id]);
    
    const atelier = {
      ...updatedAtelier[0],
      chefs: chefs || []
    };
    
    console.log(`✅ Atelier ${nom} mis à jour avec succès`);
    res.json(atelier);
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour de l\'atelier:', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'atelier' });
  }
});

// GET /api/ateliers/:id/employes - Récupérer les employés d'un atelier
app.get('/api/ateliers/:id/employes', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE atelier_id = ? ORDER BY nom, prenom',
      [id]
    );
    
    res.json(employees);
  } catch (err) {
    console.error('❌ Erreur récupération employés:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// POST /api/ateliers/:id/employes - Ajouter un employé à un atelier
app.post('/api/ateliers/:id/employes', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'chef_d_atelier') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { id } = req.params;
  const { nom, prenom, email, telephone, equipe, type_contrat, date_embauche, point_ramassage, circuit_affecte } = req.body;
  
  if (!nom || !prenom) {
    return res.status(400).json({ error: 'Nom et prénom sont requis' });
  }
  
  try {
    // Vérifier que l'atelier existe
    const [atelierCheck] = await pool.execute('SELECT nom FROM ateliers WHERE id = ?', [id]);
    if (atelierCheck.length === 0) {
      return res.status(404).json({ error: 'Atelier non trouvé' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO employees (nom, prenom, email, telephone, equipe, atelier, atelier_id, type_contrat, date_embauche, point_ramassage, circuit_affecte) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, equipe, atelierCheck[0].nom, id, type_contrat, date_embauche, point_ramassage, circuit_affecte]
    );
    
    const [newEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [result.insertId]);
    
    console.log(`✅ Employé ${nom} ${prenom} ajouté à l'atelier ${id}`);
    res.status(201).json(newEmployee[0]);
  } catch (err) {
    console.error('❌ Erreur création employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
});

// PUT /api/ateliers/:atelierId/employes/:employeId - Modifier un employé
app.put('/api/ateliers/:atelierId/employes/:employeId', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur' && req.user.role !== 'chef_d_atelier') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { atelierId, employeId } = req.params;
  const { nom, prenom, email, telephone, equipe, type_contrat, date_embauche, point_ramassage, circuit_affecte, atelier_id } = req.body;
  
  try {
    // Si on change d'atelier, vérifier que le nouvel atelier existe
    let newAtelierId = atelierId;
    let newAtelierNom = null;
    
    if (atelier_id && atelier_id !== atelierId) {
      const [newAtelier] = await pool.execute('SELECT nom FROM ateliers WHERE id = ?', [atelier_id]);
      if (newAtelier.length === 0) {
        return res.status(404).json({ error: 'Nouvel atelier non trouvé' });
      }
      newAtelierId = atelier_id;
      newAtelierNom = newAtelier[0].nom;
    } else {
      const [currentAtelier] = await pool.execute('SELECT nom FROM ateliers WHERE id = ?', [atelierId]);
      if (currentAtelier.length > 0) {
        newAtelierNom = currentAtelier[0].nom;
      }
    }
    
    const [result] = await pool.execute(
      `UPDATE employees SET 
        nom = ?, prenom = ?, email = ?, telephone = ?, equipe = ?, 
        atelier = ?, atelier_id = ?, type_contrat = ?, date_embauche = ?, 
        point_ramassage = ?, circuit_affecte = ?
       WHERE id = ?`,
      [nom, prenom, email, telephone, equipe, newAtelierNom, newAtelierId, type_contrat, date_embauche, point_ramassage, circuit_affecte, employeId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    const [updatedEmployee] = await pool.execute('SELECT * FROM employees WHERE id = ?', [employeId]);
    
    console.log(`✅ Employé ${employeId} mis à jour`);
    res.json(updatedEmployee[0]);
  } catch (err) {
    console.error('❌ Erreur mise à jour employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

// DELETE /api/ateliers/:atelierId/employes/:employeId - Supprimer un employé
app.delete('/api/ateliers/:atelierId/employes/:employeId', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  
  const { employeId } = req.params;
  
  try {
    const [result] = await pool.execute('DELETE FROM employees WHERE id = ?', [employeId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    console.log(`✅ Employé ${employeId} supprimé`);
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression employé:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
});

// Nouvelles routes pour circuits
app.get('/api/circuits', authenticate, async (req, res) => {
  console.log(`🛣️  Requête circuits de ${req.user.name} (${req.user.role})`);
  
  try {
    const [rows] = await pool.execute('SELECT * FROM circuits ORDER BY nom');
    console.log(`✅ ${rows.length} circuits trouvés`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête circuits:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des circuits' });
  }
});

// Circuits CRUD
app.post('/api/circuits', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  try {
    const body = req.body || {};
    const nom = body.nom;
    const description = body.description || null;
    const distance = body.distance || null;
    const duree_estimee = body.duree_estimee || null;
    const status = body.status || 'actif';
    const points_arret = Array.isArray(body.points_arret || body.pointsArret) ? JSON.stringify(body.points_arret || body.pointsArret) : JSON.stringify([]);
    if (!nom) return res.status(400).json({ error: 'Le nom du circuit est requis' });

    const [result] = await pool.execute(
      `INSERT INTO circuits (nom, description, distance, duree_estimee, points_arret, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, description, distance, duree_estimee, points_arret, status]
    );
    const [rows] = await pool.execute('SELECT * FROM circuits WHERE id = ?', [result.insertId]);
    // Parse points_arret when returning
    const circuit = rows[0];
    try { circuit.points_arret = JSON.parse(circuit.points_arret || '[]'); } catch {}
    res.status(201).json(circuit);
  } catch (err) {
    console.error('❌ Erreur création circuit:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création du circuit' });
  }
});

app.put('/api/circuits/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { id } = req.params;
  try {
    const body = req.body || {};
    const nom = body.nom;
    const description = body.description || null;
    const distance = body.distance || null;
    const duree_estimee = body.duree_estimee || null;
    const status = body.status || 'actif';
    const points_arret = Array.isArray(body.points_arret || body.pointsArret) ? JSON.stringify(body.points_arret || body.pointsArret) : JSON.stringify([]);
    if (!nom) return res.status(400).json({ error: 'Le nom du circuit est requis' });

    const [result] = await pool.execute(
      `UPDATE circuits SET nom = ?, description = ?, distance = ?, duree_estimee = ?, points_arret = ?, status = ? WHERE id = ?`,
      [nom, description, distance, duree_estimee, points_arret, status, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Circuit non trouvé' });
    const [rows] = await pool.execute('SELECT * FROM circuits WHERE id = ?', [id]);
    const circuit = rows[0];
    try { circuit.points_arret = JSON.parse(circuit.points_arret || '[]'); } catch {}
    res.json(circuit);
  } catch (err) {
    console.error('❌ Erreur mise à jour circuit:', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du circuit' });
  }
});

app.delete('/api/circuits/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM circuits WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Circuit non trouvé' });
    res.json({ success: true, message: 'Circuit supprimé avec succès' });
  } catch (err) {
    console.error('❌ Erreur suppression circuit:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du circuit' });
  }
});

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur MySQL fonctionnel', 
    database: 'MySQL',
    timestamp: new Date() 
  });
});

// Ensure weekly_plannings schema is compatible (add columns if missing, fix unique key)
async function ensureWeeklyPlanningsSchema() {
  try {
    // Check columns
    const [cols] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'weekly_plannings'`
    );
    const colSet = new Set(cols.map(c => c.COLUMN_NAME));

    if (!colSet.has('teams')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN teams TEXT NULL AFTER week_number`);
      console.log('✅ weekly_plannings: colonne teams ajoutée');
    }
    if (!colSet.has('assignments')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN assignments TEXT NULL AFTER teams`);
      console.log('✅ weekly_plannings: colonne assignments ajoutée');
    }
    if (!colSet.has('status')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN status VARCHAR(20) DEFAULT 'draft' AFTER assignments`);
      console.log('✅ weekly_plannings: colonne status ajoutée');
    }
    if (!colSet.has('is_consolidated')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN is_consolidated BOOLEAN DEFAULT FALSE AFTER status`);
      console.log('✅ weekly_plannings: colonne is_consolidated ajoutée');
    }
    if (!colSet.has('consolidated_from')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN consolidated_from JSON NULL AFTER is_consolidated`);
      console.log('✅ weekly_plannings: colonne consolidated_from ajoutée');
    }
    if (!colSet.has('consolidated_at')) {
      await pool.execute(`ALTER TABLE weekly_plannings ADD COLUMN consolidated_at TIMESTAMP NULL DEFAULT NULL AFTER consolidated_from`);
      console.log('✅ weekly_plannings: colonne consolidated_at ajoutée');
    }

    // Ensure unique key is (year, week_number, created_by)
    const [indexes] = await pool.execute(
      `SHOW INDEX FROM weekly_plannings`
    );
    const hasUniqueYearWeekCreatedBy = indexes.some(i => i.Non_unique === 0 && i.Key_name.includes('unique') && i.Column_name === 'year');

    // Drop old unique index on (year, week_number) if exists
    const toDrop = indexes.filter(i => i.Non_unique === 0 && (i.Key_name === 'unique_year_week' || i.Key_name === 'unique_planning'));
    if (toDrop.length > 0) {
      const uniqueNames = [...new Set(toDrop.map(i => i.Key_name))];
      for (const name of uniqueNames) {
        try {
          await pool.execute(`ALTER TABLE weekly_plannings DROP INDEX ${name}`);
          console.log(`ℹ️ weekly_plannings: index unique ${name} supprimé`);
        } catch {}
      }
    }

    // Create correct unique constraint
    await pool.execute(`ALTER TABLE weekly_plannings ADD UNIQUE KEY unique_planning (year, week_number, created_by)`);
    console.log('✅ weekly_plannings: contrainte unique (year, week_number, created_by) assurée');
  } catch (e) {
    console.warn('⚠️ Vérification schéma weekly_plannings: ', e.message);
  }
}

// Initialiser la base et démarrer le serveur
async function startServer() {
  try {
    console.log('🚀 Démarrage serveur MySQL...');
    
    // Tester la connexion MySQL
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Impossible de se connecter à MySQL');
      console.log('📋 Vérifiez:');
      console.log('   - MySQL est démarré');
      console.log('   - Mot de passe correct dans mysql-config.js');
      console.log('   - Base de données accessible');
      process.exit(1);
    }
    
    // Initialiser la base de données
    await initDatabase();
    await insertTestUsers();
    await ensureWeeklyPlanningsSchema(); // Call the new function here
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur MySQL démarré sur http://localhost:${PORT}`);
      console.log('📋 Routes disponibles:');
      console.log('   POST /api/auth/login');
      console.log('   GET /api/employees (authentifié)');
      console.log('   GET /api/chefs (authentifié)');
      console.log('   POST /api/users (authentifié)');
      console.log('   GET /api/ateliers (authentifié)');
      console.log('   POST /api/ateliers (admin)');
      console.log('   GET /api/circuits (authentifié)');
      console.log('   GET /api/plannings (authentifié)');
      console.log('   GET /api/plannings/export/csv (authentifié)');
      console.log('   GET /api/weekly-plannings (authentifié)');
      console.log('   GET /api/weekly-plannings/:year/:week (authentifié)');
      console.log('   POST /api/weekly-plannings (authentifié)');
      console.log('   DELETE /api/weekly-plannings/:year/:week (authentifié)');
      console.log('   GET /api/weekly-plannings/consolidation-status/:year/:week (authentifié)');
      console.log('   POST /api/weekly-plannings/consolidate/:year/:week (authentifié)');
      console.log('   POST /api/weekly-plannings/auto-consolidate (authentifié)');
      console.log('   POST /api/weekly-plannings/:id/complete (authentifié)');
      console.log('   GET /api/health');
      console.log('\n💾 Base de données: MySQL');
    });
    
  } catch (err) {
    console.error('❌ Erreur démarrage serveur:', err.message);
    process.exit(1);
  }
}

// Gérer l'arrêt propre du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});

// Route pour marquer un planning comme terminé (version simplifiée)
app.post('/api/weekly-plannings/complete-direct', authenticate, async (req, res) => {
  const { planningId, weekNumber, year } = req.body;
  console.log(`✅ Marquage planning ${planningId} comme terminé par ${req.user.name}`);
  
  try {
    // 1. Vérifier que le planning appartient au chef connecté (sauf admin)
    let planningQuery = `
      SELECT wp.id, wp.status, wp.created_by, u.name as chef_name
      FROM weekly_plannings wp 
      LEFT JOIN users u ON wp.created_by = u.id
      WHERE wp.id = ?
    `;
    let queryParams = [planningId];
    
    if (req.user.role !== 'administrateur') {
      planningQuery += ' AND wp.created_by = ?';
      queryParams.push(req.user.id);
    }
    
    const [planningRows] = await pool.execute(planningQuery, queryParams);
    
    if (planningRows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
    
    const planning = planningRows[0];
    
    const wasAlreadyCompleted = planning.status === 'completed';
    
    if (!wasAlreadyCompleted) {
      // 2. Marquer comme terminé seulement si pas déjà terminé
      const [updateResult] = await pool.execute(`
        UPDATE weekly_plannings 
        SET status = 'completed', updated_at = NOW()
        WHERE id = ?
      `, [planningId]);
      
      if (updateResult.affectedRows === 0) {
        return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
      }
    }
    
    // 3. Vérifier si consolidation possible
    const [totalChefs] = await pool.execute(`
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u 
      JOIN atelier_chefs ac ON u.id = ac.user_id 
      WHERE u.role = 'chef_d_atelier'
    `);
    
    const [completedChefs] = await pool.execute(`
      SELECT COUNT(DISTINCT created_by) as completed
      FROM weekly_plannings 
      WHERE year = ? AND week_number = ? AND status = 'completed' AND is_consolidated = FALSE
    `, [year, weekNumber]);
    
    const total = totalChefs[0].total;
    const completed = completedChefs[0].completed;
    
    let consolidationMessage = '';
    
    // Appel au service de consolidation si tous les chefs ont terminé
    let readiness = null;
    let consolidation = null;
    try {
      readiness = await consolidationService.checkConsolidationReadiness(parseInt(year), parseInt(weekNumber));
      if (readiness.ready) {
        console.log(`🚀 Déclenchement consolidation automatique semaine ${weekNumber}/${year}`);
        consolidation = await consolidationService.consolidateWeeklyPlanning(parseInt(year), parseInt(weekNumber));
      }
    } catch (e) {
      console.warn('⚠️ Consolidation non effectuée:', e.message);
    }
    
    if (completed === total) {
      // Vérifier si consolidation déjà faite
      const [consolidated] = await pool.execute(`
        SELECT COUNT(*) as count FROM weekly_plannings 
        WHERE year = ? AND week_number = ? AND is_consolidated = TRUE
      `, [year, weekNumber]);
      
      if (consolidated[0].count === 0) {
        consolidationMessage = `🚀 TOUS LES CHEFS ONT TERMINÉ ! Consolidation automatique pour semaine ${weekNumber}.`;
      } else {
        consolidationMessage = `✅ Planning consolidé déjà existant pour semaine ${weekNumber}.`;
      }
    } else {
      const remaining = total - completed;
      consolidationMessage = `📊 ${completed}/${total} chefs ont terminé. En attente de ${remaining} chef(s).`;
    }
    
    res.json({
      success: true,
      message: wasAlreadyCompleted ? `Planning de ${planning.chef_name} déjà terminé (vérification consolidation effectuée)` : `Planning de ${planning.chef_name} marqué comme terminé`,
      consolidationMessage,
      progression: { completed, total },
      readiness,
      consolidation,
      alreadyCompleted: wasAlreadyCompleted
    });
    
  } catch (err) {
    console.error('❌ Erreur marquage planning terminé:', err.message);
    res.status(500).json({ error: 'Erreur lors du marquage du planning' });
  }
});

// DELETE précis par ID — ne supprime qu'un seul planning
app.delete('/api/weekly-plannings/id/:id', authenticate, async (req, res) => {
  const planningId = parseInt(req.params.id);
  const includeConsolidated = req.query.includeConsolidated === 'true';
  console.log(`🗑️  Suppression par ID ${planningId} par ${req.user.name} (includeConsolidated=${includeConsolidated})`);

  if (Number.isNaN(planningId)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    // 0) Vérifier existence et droits
    const [rows] = await pool.execute(
      `SELECT id, created_by, is_consolidated FROM weekly_plannings WHERE id = ?`,
      [planningId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning introuvable' });
    }
    const row = rows[0];

    // Les chefs ne peuvent supprimer que leurs propres plannings
    // Les admins et RH peuvent supprimer n'importe quel planning
    if (req.user.role === 'chef_d_atelier' && row.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres plannings' });
    }

    if (row.is_consolidated && !includeConsolidated) {
      return res.status(403).json({ error: 'Planning consolidé protégé (utiliser includeConsolidated=true en admin/RH)' });
    }

    // 1) Supprimer
    let query = 'DELETE FROM weekly_plannings WHERE id = ?';
    const params = [planningId];

    // Les chefs doivent avoir la contrainte created_by
    // Les admins et RH peuvent supprimer sans contrainte
    if (req.user.role === 'chef_d_atelier') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.execute(query, params);

    console.log(`🧾 DELETE result: affectedRows=${result.affectedRows}`);

    if (result.affectedRows > 0) {
      console.log(`✅ Planning ID ${planningId} supprimé`);
      return res.json({ success: true, message: 'Planning supprimé', deleted: 1 });
    }

    return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
  } catch (err) {
    console.error('❌ Erreur suppression par ID:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ========================================
// ROUTES POUR LES PRÊTS D'INTÉRIMAIRES
// ========================================

// GET /api/interim-loans - Récupérer les prêts d'intérimaires
app.get('/api/interim-loans', authenticate, async (req, res) => {
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
    
    const [rows] = await pool.execute(query, params);
    console.log(`✅ ${rows.length} prêts trouvés pour ${req.user.name}`);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur requête prêts:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des prêts' });
  }
});

// POST /api/interim-loans - Créer un nouveau prêt
app.post('/api/interim-loans', authenticate, async (req, res) => {
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
    const [employeeCheck] = await pool.execute(
      'SELECT id, type_contrat, atelier_id, nom, prenom FROM employees WHERE id = ?',
      [employee_id]
    );
    
    if (employeeCheck.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    if (employeeCheck[0].type_contrat !== 'Intérimaire') {
      return res.status(400).json({ error: 'Seuls les intérimaires peuvent être prêtés' });
    }
    
    // Vérifier que l'employé n'est pas déjà en prêt
    const [existingLoan] = await pool.execute(
      'SELECT id FROM interim_loans WHERE employee_id = ? AND status = "active"',
      [employee_id]
    );
    
    if (existingLoan.length > 0) {
      return res.status(400).json({ error: 'Cet intérimaire est déjà en prêt' });
    }
    
    // Vérifier que l'atelier de destination existe
    const [atelierCheck] = await pool.execute(
      'SELECT id, nom FROM ateliers WHERE id = ?',
      [to_atelier_id]
    );
    
    if (atelierCheck.length === 0) {
      return res.status(404).json({ error: 'Atelier de destination introuvable' });
    }
    
    // 1. Créer le prêt
    const [result] = await pool.execute(
      `INSERT INTO interim_loans (employee_id, from_atelier_id, to_atelier_id, start_date, end_date, reason, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [employee_id, from_atelier_id, to_atelier_id, start_date, end_date, reason, req.user.id]
    );
    
    // 2. Mettre à jour l'employé pour qu'il apparaisse dans l'atelier de destination
    await pool.execute(
      'UPDATE employees SET atelier = ?, atelier_id = ? WHERE id = ?',
      [atelierCheck[0].nom, to_atelier_id, employee_id]
    );
    
    console.log(`✅ Prêt créé avec succès, ID: ${result.insertId}`);
    console.log(`🔧 Intérimaire ${employeeCheck[0].nom} ${employeeCheck[0].prenom} prêté à ${atelierCheck[0].nom}`);
    
    // Retourner le prêt créé
    const [newLoan] = await pool.execute(
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
app.put('/api/interim-loans/:id', authenticate, async (req, res) => {
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
    const [loanCheck] = await pool.execute(
      'SELECT id, status, employee_id, from_atelier_id FROM interim_loans WHERE id = ?',
      [loanId]
    );
    
    if (loanCheck.length === 0) {
      return res.status(404).json({ error: 'Prêt non trouvé' });
    }
    
    // Si on termine le prêt, remettre l'employé dans son atelier d'origine
    if (status === 'completed' && loanCheck[0].status === 'active') {
      // Récupérer le nom de l'atelier d'origine
      const [fromAtelier] = await pool.execute(
        'SELECT nom FROM ateliers WHERE id = ?',
        [loanCheck[0].from_atelier_id]
      );
      
      if (fromAtelier.length > 0) {
        // Remettre l'employé dans son atelier d'origine
        await pool.execute(
          'UPDATE employees SET atelier = ?, atelier_id = ? WHERE id = ?',
          [fromAtelier[0].nom, loanCheck[0].from_atelier_id, loanCheck[0].employee_id]
        );
        
        console.log(`🔧 Prêt terminé: Employé ID ${loanCheck[0].employee_id} retourne à ${fromAtelier[0].nom}`);
      }
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
    
    await pool.execute(query, params);
    
    console.log(`✅ Prêt ${loanId} mis à jour avec succès`);
    
    // Retourner le prêt mis à jour
    const [updatedLoan] = await pool.execute(
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
app.delete('/api/interim-loans/:id', authenticate, async (req, res) => {
  const loanId = parseInt(req.params.id);
  console.log(`🗑️ Suppression prêt ${loanId} par ${req.user.name} (${req.user.role})`);
  
  // Vérifier les permissions (Admin seulement pour la suppression)
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des prêts.' });
  }
  
  try {
    // Vérifier que le prêt existe
    const [loanCheck] = await pool.execute(
      'SELECT id FROM interim_loans WHERE id = ?',
      [loanId]
    );
    
    if (loanCheck.length === 0) {
      return res.status(404).json({ error: 'Prêt non trouvé' });
    }
    
    // Supprimer le prêt
    await pool.execute('DELETE FROM interim_loans WHERE id = ?', [loanId]);
    
    console.log(`✅ Prêt ${loanId} supprimé avec succès`);
    
    res.json({ success: true, message: 'Prêt supprimé' });
  } catch (err) {
    console.error('❌ Erreur suppression prêt:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du prêt' });
  }
});

// POST /api/weekly-plannings/:id/request-reopen - Demander la réouverture
app.post('/api/weekly-plannings/:id/request-reopen', authenticate, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  try {
    let query = `SELECT id, status, created_by FROM weekly_plannings WHERE id = ?`;
    const params = [id];
    if (req.user.role !== 'administrateur') {
      query += ' AND created_by = ?';
      params.push(req.user.id);
    }
    const [rows] = await pool.execute(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé ou non autorisé' });
    }
    const planning = rows[0];
    if (planning.status !== 'completed') {
      return res.status(400).json({ error: 'Seuls les plannings terminés peuvent être demandés en réouverture' });
    }
    await pool.execute(
      `UPDATE weekly_plannings 
       SET reopen_requested = 1, reopen_reason = ?, reopen_requested_by = ?, reopen_requested_at = NOW() 
       WHERE id = ?`,
      [reason || null, req.user.id, planning.id]
    );

    // Notify RH/Admin
    const [admins] = await pool.execute(`SELECT id FROM users WHERE role IN ('rh','administrateur')`);
    await Promise.all(admins.map(a => createNotification(a.id, 'reopen_request', `Demande de réouverture planning #${planning.id}`, { planningId: planning.id, reason: reason || '' })));

    res.json({ success: true, requested: true });
  } catch (err) {
    console.error('❌ Erreur demande réouverture:', err.message);
    res.status(500).json({ error: 'Erreur lors de la demande de réouverture' });
  }
});

// Modify approve-reopen to allow reopen without pending flag and notify chef
app.post('/api/weekly-plannings/:id/approve-reopen', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const [rows] = await pool.execute(
      `SELECT id, status, reopen_requested, created_by, year, week_number FROM weekly_plannings WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }
    const planning = rows[0];
    if (planning.status !== 'completed') {
      return res.status(400).json({ error: 'Planning non terminé' });
    }
    await pool.execute(
      `UPDATE weekly_plannings 
       SET status = 'draft', reopen_requested = 0, reopened_by = ?, reopened_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [req.user.id, planning.id]
    );

    // Notify chef
    if (planning.created_by) {
      await createNotification(planning.created_by, 'reopen_approved', `Réouverture approuvée pour S${planning.week_number}/${planning.year}`, { planningId: planning.id });
    }

    res.json({ success: true, status: 'draft' });
  } catch (err) {
    console.error('❌ Erreur approbation réouverture:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de réouverture' });
  }
});

// GET /api/weekly-plannings/reopen-requests - Liste des demandes de réouverture (RH/Admin)
app.get('/api/weekly-plannings/reopen-requests', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const [rows] = await pool.execute(`
      SELECT wp.id, wp.year, wp.week_number, wp.reopen_reason, wp.reopen_requested_at, wp.created_by,
             u.name as created_by_name
      FROM weekly_plannings wp
      LEFT JOIN users u ON wp.created_by = u.id
      WHERE wp.reopen_requested = 1 AND wp.status = 'completed'
      ORDER BY wp.reopen_requested_at DESC, wp.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur liste demandes réouverture:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

// Requests API

// Search/Filter/Paginate tickets (requests + reopen)
app.get('/api/tickets/search', authenticate, async (req, res) => {
  try {
    if (!['rh','administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const { sort = 'date_desc', statut = '', type = '', chef = '', from = '', to = '', page = '1', pageSize = '50' } = req.query;

    const p = parseInt(page) > 0 ? parseInt(page) : 1;
    const ps = Math.min(Math.max(parseInt(pageSize) || 50, 10), 200);

    const wantsReopenOnly = type === 'reopen';
    const wantsRequestsOnly = type && type !== 'reopen';

    // Fetch requests subset
    let requestsItems = [];
    if (!wantsReopenOnly) {
      const reqWhere = ['1=1'];
      const reqParams = [];
      if (statut) { reqWhere.push('r.status = ?'); reqParams.push(statut); }
      if (wantsRequestsOnly) { reqWhere.push('r.type = ?'); reqParams.push(type); }
      if (chef) { reqWhere.push('u.name LIKE ?'); reqParams.push(`%${chef}%`); }
      if (from) { reqWhere.push('r.requested_at >= ?'); reqParams.push(from); }
      if (to) { reqWhere.push('r.requested_at <= ?'); reqParams.push(to); }
      const [rows] = await pool.execute(
        `SELECT r.*, u.name as requested_by_name
         FROM requests r
         LEFT JOIN users u ON u.id = r.requested_by
         WHERE ${reqWhere.join(' AND ')}
         ORDER BY r.requested_at DESC
         LIMIT 500`,
        reqParams
      );
      // enrich employees
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (r.type === 'employee') {
          const [emps] = await pool.execute(
            'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ? ORDER BY e.nom, e.prenom',
            [r.id]
          );
          rows[i].employees = emps;
          rows[i].employee_count = emps.length;
        }
      }
      requestsItems = rows.map(r => ({
        id: r.id,
        type: r.type, // 'employee' | 'general'
        status: r.status,
        requested_at: r.requested_at,
        requested_by_name: r.requested_by_name,
        employees: r.employees || [],
        employee_count: r.employee_count || 0,
        subject: r.subject || null,
        message: r.message || null,
        source: 'requests'
      }));
    }

    // Fetch reopen subset
    let reopenItems = [];
    if (!wantsRequestsOnly) {
      const repWhere = ["wp.reopen_requested = 1"];
      const repParams = [];
      if (chef) { repWhere.push('u.name LIKE ?'); repParams.push(`%${chef}%`); }
      if (from) { repWhere.push('wp.reopen_requested_at >= ?'); repParams.push(from); }
      if (to) { repWhere.push('wp.reopen_requested_at <= ?'); repParams.push(to); }
      const [rows] = await pool.execute(
        `SELECT wp.id, wp.year, wp.week_number, wp.reopen_reason, wp.reopen_requested_at, wp.reopened_at, wp.reopen_requested, wp.status as planning_status, u.name as created_by_name
         FROM weekly_plannings wp
         LEFT JOIN users u ON wp.created_by = u.id
         WHERE (${repWhere.join(' AND ')}) OR (wp.reopened_at IS NOT NULL)
         ORDER BY COALESCE(wp.reopen_requested_at, wp.reopened_at) DESC
         LIMIT 500`,
        repParams
      );
      reopenItems = rows.map(r => {
        const isPending = r.reopen_requested === 1 && r.planning_status === 'completed';
        const reopenedAt = (r.reopened_at && r.reopened_at !== '0000-00-00 00:00:00') ? r.reopened_at : null;
        const isResolved = !!reopenedAt;
        const status = isPending ? 'pending' : isResolved ? 'resolved' : 'pending';
        const requestedAt = isPending ? r.reopen_requested_at : (reopenedAt || r.reopen_requested_at);
        return ({
          id: r.id,
          type: 'reopen',
          status,
          requested_at: requestedAt,
          requested_by_name: r.created_by_name,
          employees: [],
          employee_count: 0,
          subject: `Réouverture S${r.week_number}/${r.year}`,
          message: r.reopen_reason || null,
          source: 'reopen'
        });
      });
    }

    // Combine + sort + filter by statut/type if needed
    let items = [...requestsItems, ...reopenItems];
    if (statut) items = items.filter(it => it.status === statut);
    if (type) items = items.filter(it => it.type === type);

    const cmpDate = (a, b) => new Date(a.requested_at) - new Date(b.requested_at);
    const cmpChef = (a, b) => (a.requested_by_name || '').localeCompare(b.requested_by_name || '');
    const cmpType = (a, b) => (a.type || '').localeCompare(b.type || '');
    const cmpStatut = (a, b) => (a.status || '').localeCompare(b.status || '');
    const cmpPriority = (a, b) => 0; // placeholder

    if (sort === 'date_asc') items.sort(cmpDate);
    else if (sort === 'chef') items.sort((a,b)=> cmpChef(a,b) || -cmpDate(a,b));
    else if (sort === 'type') items.sort((a,b)=> cmpType(a,b) || -cmpDate(a,b));
    else if (sort === 'statut') items.sort((a,b)=> cmpStatut(a,b) || -cmpDate(a,b));
    else if (sort === 'priority') items.sort((a,b)=> cmpPriority(a,b) || -cmpDate(a,b));
    else items.sort((a,b)=> -cmpDate(a,b)); // date_desc par défaut

    const total = items.length;
    const start = (p - 1) * ps;
    const end = start + ps;
    const pageItems = items.slice(start, end);

    res.json({ total, page: p, pageSize: ps, items: pageItems });
  } catch (err) {
    console.error('❌ Erreur recherche tickets:', err.message);
    res.status(500).json({ error: 'Erreur lors de la recherche tickets' });
  }
});

// Ticket detail for reopen
app.get('/api/tickets/reopen/:id', authenticate, async (req, res) => {
  try {
    if (!['rh','administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT wp.id, wp.year, wp.week_number, wp.reopen_reason, wp.reopen_requested_at, wp.reopened_at, wp.reopen_requested, wp.status as planning_status, u.name as created_by_name
       FROM weekly_plannings wp
       LEFT JOIN users u ON wp.created_by = u.id
       WHERE wp.id = ?
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Demande introuvable' });
    const r = rows[0];
    const reopenedAt = (r.reopened_at && r.reopened_at !== '0000-00-00 00:00:00') ? r.reopened_at : null;
    const isPending = r.reopen_requested === 1 && r.planning_status === 'completed';
    // Priorité au pending: si une demande est en cours, on l'affiche pending
    const status = isPending ? 'pending' : (reopenedAt ? 'resolved' : 'pending');
    res.json({
      id: r.id,
      type: 'reopen',
      status,
      requested_at: r.reopen_requested_at || reopenedAt,
      requested_by_name: r.created_by_name,
      subject: `Réouverture S${r.week_number}/${r.year}`,
      message: r.reopen_reason || null
    });
  } catch (err) {
    console.error('❌ Erreur détail reopen:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du ticket reopen' });
  }
});

// Search/Filter/Paginate requests
app.get('/api/requests/search', authenticate, async (req, res) => {
  try {
    if (!['rh','administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const {
      q = '',
      sort = 'date_desc',
      statut = '',
      type = '',
      chef = '',
      from = '',
      to = '',
      page = '1',
      pageSize = '50'
    } = req.query;

    const p = parseInt(page) > 0 ? parseInt(page) : 1;
    const ps = Math.min(Math.max(parseInt(pageSize) || 50, 10), 200);
    const offset = (p - 1) * ps;

    const where = ['1=1'];
    const params = [];

    if (statut) { where.push('r.status = ?'); params.push(statut); }
    if (type) { where.push('r.type = ?'); params.push(type); }
    if (chef) { where.push('u.name LIKE ?'); params.push(`%${chef}%`); }
    if (from) { where.push('r.requested_at >= ?'); params.push(from); }
    if (to) { where.push('r.requested_at <= ?'); params.push(to); }

    let orderBy = 'r.requested_at DESC';
    if (sort === 'date_asc') orderBy = 'r.requested_at ASC';
    if (sort === 'chef') orderBy = 'u.name ASC, r.requested_at DESC';
    if (sort === 'type') orderBy = 'r.type ASC, r.requested_at DESC';
    if (sort === 'statut') orderBy = 'r.status ASC, r.requested_at DESC';
    if (sort === 'priority') orderBy = 'r.priority ASC, r.requested_at DESC';

    const likeQ = (q || '').trim();
    if (likeQ) {
      where.push(`(
        r.id LIKE ? OR
        r.message LIKE ? OR
        r.subject LIKE ? OR
        u.name LIKE ? OR
        EXISTS (
          SELECT 1 FROM request_employees re
          JOIN employees e ON e.id = re.employee_id
          WHERE re.request_id = r.id AND (e.nom LIKE ? OR e.prenom LIKE ?)
        )
      )`);
      const wildcard = `%${likeQ}%`;
      params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    const baseSql = `
      FROM requests r
      LEFT JOIN users u ON u.id = r.requested_by
      WHERE ${where.join(' AND ')}
    `;

    const [countRows] = await pool.execute(`SELECT COUNT(*) as cnt ${baseSql}`, params);
    const total = countRows[0]?.cnt || 0;

    const [rows] = await pool.execute(
      `SELECT r.*, u.name as requested_by_name ${baseSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, ps, offset]
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.type === 'employee') {
        const [emps] = await pool.execute(
          'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ? ORDER BY e.nom, e.prenom',
          [r.id]
        );
        rows[i].employees = emps;
        rows[i].employee_count = emps.length;
      }
    }

    res.json({ total, page: p, pageSize: ps, items: rows });
  } catch (err) {
    console.error('❌ Erreur recherche demandes:', err.message);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

app.get('/api/requests/pending', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const [rows] = await pool.execute(`
      SELECT r.*, u.name as requested_by_name
      FROM requests r
      LEFT JOIN users u ON u.id = r.requested_by
      WHERE r.status = 'pending'
      ORDER BY r.requested_at DESC
    `);

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.type === 'employee') {
        const [emps] = await pool.execute(
          `SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ? ORDER BY e.nom, e.prenom`,
          [r.id]
        );
        rows[i].employees = emps;
        rows[i].employee_count = emps.length;
      }
    }

    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur liste demandes (pending):', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
});

app.get('/api/requests/mine', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM request_employees re WHERE re.request_id = r.id) as employee_count
      FROM requests r
      WHERE r.requested_by = ?
      ORDER BY r.requested_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur liste demandes (mine):', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos demandes' });
  }
});

// GET /api/requests/:id - détail d'une demande
app.get('/api/requests/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT r.*, u.name as requested_by_name
       FROM requests r
       LEFT JOIN users u ON u.id = r.requested_by
       WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Demande introuvable' });

    const request = rows[0];
    if (request.type === 'employee') {
      const [emps] = await pool.execute(
        `SELECT e.id, e.nom, e.prenom
         FROM request_employees re
         JOIN employees e ON e.id = re.employee_id
         WHERE re.request_id = ?
         ORDER BY e.nom, e.prenom`,
        [id]
      );
      request.employees = emps;
      request.employee_count = emps.length;
    }

    res.json(request);
  } catch (err) {
    console.error('❌ Erreur détail demande:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
  }
});

app.post('/api/requests', authenticate, async (req, res) => {
  try {
    const { type, message, employee_ids, target_role } = req.body || {};
    if (!type || !['employee','general'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide' });
    }
    if (type === 'employee' && (!Array.isArray(employee_ids) || employee_ids.length === 0)) {
      return res.status(400).json({ error: 'Aucun employé sélectionné' });
    }

    const contentJson = type === 'general' ? JSON.stringify({}) : JSON.stringify({ employee_ids });

    const [ins] = await pool.execute(
      `INSERT INTO requests (type, message, content, target_role, requested_by, requested_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, message || null, contentJson, target_role || null, req.user.id]
    );
    const requestId = ins.insertId;

    if (type === 'employee') {
      const values = (employee_ids || []).map(empId => [requestId, empId]);
      if (values.length > 0) {
        const placeholders = values.map(() => '(?, ?)').join(',');
        await pool.execute(
          `INSERT INTO request_employees (request_id, employee_id) VALUES ${placeholders}`,
          values.flat()
        );
      }
    }

    // Notify Admin/RH with employee names included
    let names = '';
    let empIds = [];
    if (type === 'employee') {
      const [empRows] = await pool.execute(
        `SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?`,
        [requestId]
      );
      names = (empRows || []).map(e => `${e.nom} ${e.prenom}`).join(', ');
      empIds = (empRows || []).map(e => e.id);
    }
    const [admins] = await pool.execute(`SELECT id FROM users WHERE role IN ('rh','administrateur')`);
    await Promise.all(admins.map(a => createNotification(
      a.id,
      type === 'employee' ? 'employee_request' : 'general_request',
      type === 'employee' ? `Demande d'employés: ${names} (par ${req.user.name})` : (message || 'Demande générale'),
      type === 'employee' ? { requestId, employeeIds: empIds, employeeNames: names, requestedByName: req.user.name } : { requestId }
    )));

    res.status(201).json({ success: true, id: requestId });
  } catch (err) {
    console.error('❌ Erreur création demande:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la demande' });
  }
});

app.post('/api/requests/:id/approve', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const { id } = req.params;

    // Récupérer la demande et les employés liés
    const [reqRows] = await pool.execute(`SELECT * FROM requests WHERE id = ? AND status = 'pending'`, [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée' });
    }
    const request = reqRows[0];

    if (request.type === 'employee') {
      const [chefAtelier] = await pool.execute(
        `SELECT atelier_id FROM atelier_chefs WHERE user_id = ? LIMIT 1`,
        [request.requested_by]
      );
      if (chefAtelier.length === 0 || !chefAtelier[0].atelier_id) {
        return res.status(400).json({ error: "Le chef demandeur n'est pas assigné à un atelier" });
      }
      const targetAtelierId = chefAtelier[0].atelier_id;

      const [empRows] = await pool.execute(
        `SELECT re.employee_id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?`,
        [id]
      );
      const empIds = empRows.map(r => r.employee_id);
      if (empIds.length > 0) {
        const placeholders = empIds.map(() => '?').join(',');
        await pool.execute(
          `UPDATE employees SET atelier_id = ? WHERE id IN (${placeholders})`,
          [targetAtelierId, ...empIds]
        );
      }

      // Notify chef about approval with names
      const names = empRows.map(e => `${e.nom} ${e.prenom}`).join(', ');
      await createNotification(request.requested_by, 'employee_approved', `Demande d'employés approuvée: ${names}`, { requestId: id, employeeIds: empIds });
    }

    await pool.execute(
      `UPDATE requests SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ success: true, status: 'approved' });
  } catch (err) {
    console.error('❌ Erreur approbation demande:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'approbation' });
  }
});

// Mark in progress
app.post('/api/requests/:id/in-progress', authenticate, async (req, res) => {
  try {
    if (!['rh','administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const { id } = req.params;
    const [upd] = await pool.execute(
      `UPDATE requests SET status = 'in_progress', approved_by = ?, approved_at = NOW() WHERE id = ? AND status IN ('pending','approved')`,
      [req.user.id, id]
    );
    if (upd.affectedRows === 0) return res.status(404).json({ error: 'Mise à jour impossible' });
    res.json({ success: true, status: 'in_progress' });
  } catch (err) {
    console.error('❌ Erreur in-progress:', err.message);
    res.status(500).json({ error: 'Erreur in-progress' });
  }
});

// Resolve
app.post('/api/requests/:id/resolve', authenticate, async (req, res) => {
  try {
    if (!['rh','administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const { id } = req.params;
    const [upd] = await pool.execute(
      `UPDATE requests SET status = 'resolved', approved_by = ?, approved_at = NOW() WHERE id = ? AND status IN ('in_progress','approved','pending')`,
      [req.user.id, id]
    );
    if (upd.affectedRows === 0) return res.status(404).json({ error: 'Mise à jour impossible' });
    res.json({ success: true, status: 'resolved' });
  } catch (err) {
    console.error('❌ Erreur resolve:', err.message);
    res.status(500).json({ error: 'Erreur resolve' });
  }
});

app.post('/api/requests/:id/reject', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const { id } = req.params;
    const [upd] = await pool.execute(
      `UPDATE requests SET status = 'rejected', approved_by = ?, approved_at = NOW() WHERE id = ? AND status = 'pending'`,
      [req.user.id, id]
    );
    if (upd.affectedRows === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée' });
    }
    res.json({ success: true, status: 'rejected' });
  } catch (err) {
    console.error('❌ Erreur rejet demande:', err.message);
    res.status(500).json({ error: 'Erreur lors du rejet' });
  }
});

// Tous les employés (pour demandes) - accessible à chef/rh/admin
app.get('/api/employees/all', authenticate, async (req, res) => {
  try {
    if (!['administrateur','rh','chef_d_atelier'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const [rows] = await pool.execute(`
      SELECT e.* FROM employees e ORDER BY e.nom, e.prenom
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur liste tous employés:', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// Helper to insert a notification
async function createNotification(recipientUserId, type, message, payload = null) {
  try {
    await pool.execute(
      `INSERT INTO notifications (recipient_user_id, type, message, payload, created_at) VALUES (?, ?, ?, ?, NOW())`,
      [recipientUserId, type, message || null, payload ? JSON.stringify(payload) : null]
    );
  } catch (e) {
    console.warn('⚠️ Notification non enregistrée:', e.message);
  }
}

// GET notifications for current user
app.get('/api/notifications', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [rows] = await pool.execute(
      `SELECT * FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Enrichment: for employee_request, attach employee names from related request
    const enriched = await Promise.all((rows || []).map(async (n) => {
      try {
        if (n.type === 'employee_request' && n.payload) {
          const payload = JSON.parse(n.payload);
          const reqId = payload?.requestId;
          if (reqId) {
            const [emps] = await pool.execute(
              `SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?`,
              [reqId]
            );
            const names = (emps || []).map(e => `${e.nom} ${e.prenom}`).join(', ');
            if (names) {
              n.message = n.message && n.message.length > 0
                ? `${n.message} | Employés: ${names}`
                : `Demande d'employés: ${names}`;
              n.payload = JSON.stringify({ ...(payload || {}), employeeNames: names, employeeIds: (emps || []).map(e => e.id) });
            }
          }
        }
      } catch {}
      return n;
    }));

    res.json(enriched);
  } catch (e) {
    console.error('❌ Erreur notifications:', e.message);
    res.status(500).json({ error: 'Erreur notifications' });
  }
});

// Mark notification as read
app.post('/api/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      `UPDATE notifications SET read_at = NOW() WHERE id = ? AND recipient_user_id = ?`,
      [id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Erreur mark read:', e.message);
    res.status(500).json({ error: 'Erreur mark read' });
  }
});

// Mark all notifications as read for current user
app.post('/api/notifications/read-all', authenticate, async (req, res) => {
  try {
    await pool.execute(
      `UPDATE notifications SET read_at = NOW() WHERE recipient_user_id = ? AND read_at IS NULL`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Erreur mark all read:', e.message);
    res.status(500).json({ error: 'Erreur mark all read' });
  }
});

startServer();