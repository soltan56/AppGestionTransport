const express = require('express');
const router = express.Router();

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Mock JWT validation (remplacez par une vraie validation JWT en production)
  if (token.startsWith('mock-jwt-token-')) {
    const userId = parseInt(token.replace('mock-jwt-token-', ''));
    
    // Récupérer les infos utilisateur
    req.pool.query('SELECT * FROM users WHERE id = ?', [userId])
      .then(([rows]) => {
        if (rows.length === 0) {
          return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }
        
        req.user = rows[0];
        next();
      })
      .catch(err => {
        console.error('Erreur auth:', err);
        res.status(500).json({ error: 'Erreur d\'authentification' });
      });
  } else {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// GET /api/plannings - Récupérer les plannings selon le rôle
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT p.*, u.name as created_by_name, u.role as created_by_role
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
    `;
    
    const params = [];
    
    // Si c'est un chef, ne voir que ses propres plannings
    if (req.user.role === 'chef') {
      query += ' WHERE p.created_by = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [rows] = await req.pool.query(query, params);
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
router.post('/', authenticate, async (req, res) => {
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
    status = 'actif',
    employeeIds = [],
    targetChefId  // Nouveau paramètre pour les admins
  } = req.body;

  if (!nom || !equipe || !atelier || !dateDebut || !heureDebut) {
    return res.status(400).json({ 
      error: 'Champs manquants',
      required: ['nom', 'equipe', 'atelier', 'dateDebut', 'heureDebut']
    });
  }

  try {
    let actualCreatedBy = req.user.id;

    // Si l'admin veut créer un planning pour un chef spécifique
    if (targetChefId && req.user.role === 'administrateur') {
      // Vérifier que le chef cible existe et a le bon rôle
      const [chefCheck] = await req.pool.query(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [targetChefId, 'chef']
      );
      
      if (chefCheck.length === 0) {
        return res.status(400).json({ error: 'Chef cible introuvable ou invalide' });
      }
      
      actualCreatedBy = targetChefId;
    }
    // Vérifier que le chef ne crée des plannings que pour son atelier
    else if (req.user.role === 'chef') {
      const [atelierCheck] = await req.pool.query(
        'SELECT nom FROM ateliers WHERE id = ? AND responsable = ?',
        [req.user.atelier_id, req.user.name]
      );
      
      if (atelierCheck.length === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez créer des plannings que pour votre atelier' });
      }
    }

    const [result] = await req.pool.execute(`
      INSERT INTO plannings (
        nom, point_ramassage, circuit, equipe, atelier, 
        date_debut, date_fin, heure_debut, heure_fin, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nom, pointRamassage, circuit, equipe, atelier, 
      dateDebut, dateFin, heureDebut, heureFin, status, actualCreatedBy
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
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    let baseQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        equipe,
        COUNT(DISTINCT circuit) as circuits_count,
        COUNT(DISTINCT atelier) as ateliers_count
      FROM plannings 
    `;
    
    const params = [];
    
    // Si c'est un chef, voir seulement ses plannings
    if (req.user.role === 'chef') {
      baseQuery += ' WHERE created_by = ?';
      params.push(req.user.id);
    }
    
    baseQuery += ' GROUP BY status, equipe';
    
    const [rows] = await req.pool.query(baseQuery, params);
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

// GET /api/plannings/export/csv - Export CSV des plannings (Admin seulement)
router.get('/export/csv', authenticate, async (req, res) => {
  try {
    // Vérifier que c'est un admin
    if (req.user.role !== 'administrateur') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    // Récupérer tous les plannings avec les détails des chefs et employés
    const [plannings] = await req.pool.query(`
      SELECT 
        p.id as planning_id,
        p.nom as planning_nom,
        p.date_debut,
        p.date_fin,
        p.heure_debut,
        p.heure_fin,
        p.equipe,
        p.atelier,
        p.point_ramassage,
        p.circuit,
        p.status,
        p.created_at as planning_cree_le,
        u.name as chef_nom,
        u.email as chef_email,
        a.nom as atelier_nom,
        a.description as atelier_description
      FROM plannings p 
      LEFT JOIN users u ON p.created_by = u.id 
      LEFT JOIN ateliers a ON u.atelier_id = a.id
      ORDER BY p.created_at DESC, u.name ASC
    `);

    // Récupérer les employés associés à chaque chef
    const [employees] = await req.pool.query(`
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.equipe as employee_equipe,
        e.atelier as employee_atelier,
        e.point_ramassage as employee_point_ramassage,
        e.circuit_affecte as employee_circuit,
        e.type_contrat,
        e.atelier_chef_id,
        u.name as chef_nom
      FROM employees e
      LEFT JOIN users u ON e.atelier_chef_id = u.id
      WHERE e.atelier_chef_id IS NOT NULL
      ORDER BY u.name, e.nom, e.prenom
    `);

    // Créer le contenu CSV bien organisé
    let csvContent = '';
    
    // En-têtes CSV avec tous les détails
    const headers = [
      'Planning ID',
      'Nom du Planning',
      'Date Début',
      'Date Fin',
      'Heure Début',
      'Heure Fin',
      'Équipe Planning',
      'Atelier',
      'Point de Ramassage Planning',
      'Circuit Planning',
      'Statut',
      'Créé le',
      'Chef Responsable',
      'Email Chef',
      'Atelier Nom Complet',
      'Description Atelier',
      'Nombre Employés Affectés',
      'Liste Employés (Nom Prénom)',
      'Équipes Employés',
      'Circuits Employés',
      'Types Contrats'
    ];
    
    csvContent += headers.join(',') + '\n';
    
    // Traiter chaque planning
    plannings.forEach(planning => {
      // Trouver les employés de ce chef
      const chefEmployees = employees.filter(emp => emp.chef_nom === planning.chef_nom);
      
      // Préparer les listes d'employés
      const employeeNames = chefEmployees.map(emp => `${emp.nom} ${emp.prenom}`).join('; ');
      const employeeTeams = [...new Set(chefEmployees.map(emp => emp.employee_equipe))].join('; ');
      const employeeCircuits = [...new Set(chefEmployees.map(emp => emp.employee_circuit).filter(c => c))].join('; ');
      const contractTypes = [...new Set(chefEmployees.map(emp => emp.type_contrat).filter(c => c))].join('; ');
      
      // Créer la ligne CSV
      const row = [
        planning.planning_id || '',
        `"${(planning.planning_nom || '').replace(/"/g, '""')}"`,
        planning.date_debut || '',
        planning.date_fin || '',
        planning.heure_debut || '',
        planning.heure_fin || '',
        planning.equipe || '',
        planning.atelier || '',
        `"${(planning.point_ramassage || '').replace(/"/g, '""')}"`,
        planning.circuit || '',
        planning.status || '',
        planning.planning_cree_le ? new Date(planning.planning_cree_le).toLocaleDateString('fr-FR') : '',
        `"${(planning.chef_nom || '').replace(/"/g, '""')}"`,
        planning.chef_email || '',
        `"${(planning.atelier_nom || '').replace(/"/g, '""')}"`,
        `"${(planning.atelier_description || '').replace(/"/g, '""')}"`,
        chefEmployees.length,
        `"${employeeNames.replace(/"/g, '""')}"`,
        `"${employeeTeams.replace(/"/g, '""')}"`,
        `"${employeeCircuits.replace(/"/g, '""')}"`,
        `"${contractTypes.replace(/"/g, '""')}"`
      ];
      
      csvContent += row.join(',') + '\n';
    });

    // Ajouter un résumé à la fin
    csvContent += '\n--- RÉSUMÉ STATISTIQUES ---\n';
    csvContent += `Total Plannings,${plannings.length}\n`;
    csvContent += `Plannings Actifs,${plannings.filter(p => p.status === 'actif').length}\n`;
    csvContent += `Plannings Inactifs,${plannings.filter(p => p.status === 'inactif').length}\n`;
    csvContent += `Nombre de Chefs,${[...new Set(plannings.map(p => p.chef_nom))].length}\n`;
    csvContent += `Total Employés Assignés,${employees.length}\n`;
    csvContent += `Date Export,${new Date().toLocaleString('fr-FR')}\n`;

    // Configurer les en-têtes de réponse pour le téléchargement
    const fileName = `plannings_export_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Ajouter le BOM UTF-8 pour Excel
    res.write('\uFEFF');
    res.write(csvContent);
    res.end();
    
  } catch (err) {
    console.error('Erreur export CSV:', err);
    res.status(500).json({ error: 'Erreur lors de l\'export CSV' });
  }
});

// POST /api/plannings/merge-manual - Fusionner des weekly_plannings et renvoyer un CSV avec colonnes jours
router.post('/merge-manual', authenticate, async (req, res) => {
  try {
    const { planningIds, year, weekNumber } = req.body;
    if (!Array.isArray(planningIds) || planningIds.length < 2) {
      return res.status(400).json({ error: 'Au moins 2 plannings requis' });
    }
    if (!year || !weekNumber) {
      return res.status(400).json({ error: 'Année et semaine requis' });
    }

    // Charger les weekly_plannings à fusionner
    const placeholders = planningIds.map(() => '?').join(',');
    const [rows] = await req.pool.query(`
      SELECT * FROM weekly_plannings 
      WHERE id IN (${placeholders}) AND year = ? AND week_number = ? AND (is_consolidated = 0 OR is_consolidated IS NULL)
    `, [...planningIds, year, weekNumber]);

    if (rows.length !== planningIds.length) {
      return res.status(400).json({ error: 'Certains plannings sont introuvables ou déjà consolidés' });
    }

    const DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    const TEAM_KEYS = ['Matin','Soir','Nuit','Normal'];

    // Fusion des days
    const mergedDays = {};
    const mergedAssignments = {};
    const employeeDetails = new Map(); // employeeId -> { equipe, nom, prenom, circuit, point }

    for (const p of rows) {
      // assignments
      const asg = p.assignments ? (typeof p.assignments === 'string' ? JSON.parse(p.assignments) : p.assignments) : {};
      Object.entries(asg).forEach(([team, ids]) => {
        if (!Array.isArray(ids)) return;
        if (!mergedAssignments[team]) mergedAssignments[team] = [];
        ids.forEach(id => {
          if (!mergedAssignments[team].includes(id)) mergedAssignments[team].push(id);
        });
      });

      // day_assignments
      const da = p.day_assignments ? (typeof p.day_assignments === 'string' ? JSON.parse(p.day_assignments) : p.day_assignments) : {};
      DAYS.forEach(day => {
        const perDay = da?.[day] || {};
        if (!mergedDays[day]) mergedDays[day] = { Matin: [], Soir: [], Nuit: [], Normal: [] };
        TEAM_KEYS.forEach(team => {
          const arr = Array.isArray(perDay?.[team]) ? perDay[team] : [];
          arr.forEach(v => {
            const n = parseInt(v, 10);
            if (!mergedDays[day][team].includes(n)) mergedDays[day][team].push(n);
          });
        });
      });
    }

    // Charger détails employés pour enrichissement CSV
    const allIds = Array.from(new Set(Object.values(mergedAssignments).flat()))
      .map(v => parseInt(v, 10))
      .filter(v => Number.isFinite(v));
    if (allIds.length > 0) {
      const placeholdersEmp = allIds.map(() => '?').join(',');
      const [emps] = await req.pool.query(`
        SELECT id, nom, prenom, circuit_affecte, point_ramassage FROM employees WHERE id IN (${placeholdersEmp})
      `, allIds);
      emps.forEach(e => {
        employeeDetails.set(e.id, {
          nom: e.nom,
          prenom: e.prenom,
          circuit_affecte: e.circuit_affecte || 'N/A',
          point_ramassage: e.point_ramassage || 'N/A'
        });
      });
    }

    // Génération CSV: 4 colonnes + 7 jours
    let csvContent = '';
    csvContent += ['Équipe','Nom employé','Circuit','Point de ramassage (adresse)', ...DAYS].join(',') + '\n';

    Object.entries(mergedAssignments).forEach(([team, ids]) => {
      ids.forEach(id => {
        const info = employeeDetails.get(parseInt(id, 10)) || { nom: `Employé_${id}`, prenom: '', circuit_affecte: 'À définir', point_ramassage: 'À définir' };
        const base = [
          `"${team}"`,
          `"${(info.nom + ' ' + info.prenom).replace(/"/g, '""')}"`,
          `"${(info.circuit_affecte || 'N/A').replace(/"/g, '""')}"`,
          `"${(info.point_ramassage || 'N/A').replace(/"/g, '""')}"`
        ];
        const flags = DAYS.map(day => {
          const perDay = mergedDays?.[day] || {};
          const dayIds = (TEAM_KEYS.flatMap(t => Array.isArray(perDay?.[t]) ? perDay[t] : [])).map(v => parseInt(v, 10));
          return dayIds.includes(parseInt(id, 10)) ? '"✔"' : '""';
        });
        csvContent += [...base, ...flags].join(',') + '\n';
      });
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="merge_plannings_S${weekNumber}_${year}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.write('\uFEFF');
    res.write(csvContent);
    res.end();
  } catch (err) {
    console.error('Erreur merge-manual:', err);
    res.status(500).json({ error: 'Erreur lors du merge-manual' });
  }
});

// GET /api/plannings/chefs - Récupérer la liste des chefs (Admin seulement)
router.get('/chefs', authenticate, async (req, res) => {
  try {
    console.log('🧑‍💼 Requête GET /api/plannings/chefs reçue');
    console.log('👤 Utilisateur:', req.user.name, '- Rôle:', req.user.role);
    
    // Vérifier que c'est un admin
    if (req.user.role !== 'administrateur') {
      console.log('❌ Accès refusé - pas admin');
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const [chefs] = await req.pool.query(`
      SELECT id, name, email, atelier_id
      FROM users 
      WHERE role = 'chef'
      ORDER BY name ASC
    `);
    
    console.log('✅ Chefs trouvés:', chefs.length);
    chefs.forEach(chef => console.log(`  - ${chef.name} (${chef.email})`));
    
    res.json(chefs);
  } catch (err) {
    console.error('❌ Erreur route /chefs:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des chefs' });
  }
});

module.exports = router; 