const express = require('express');
const router = express.Router();

// Middleware d'authentification (copié de employees.js)
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return res.status(401).json({ error: 'Token d\'authentification requis' });
    }
    const userId = token.replace('mock-jwt-token-', '');
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

// GET /api/requests/pending - RH/Admin
router.get('/pending', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const [rows] = await req.pool.execute(
      `SELECT r.*, u.name as requested_by_name
       FROM requests r
       LEFT JOIN users u ON u.id = r.requested_by
       WHERE r.status = 'pending'
       ORDER BY r.requested_at DESC`
    );

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.type === 'employee') {
        const [emps] = await req.pool.execute(
          'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ? ORDER BY e.nom, e.prenom',
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

// GET /api/requests/mine - demandes de l'utilisateur
router.get('/mine', authenticate, async (req, res) => {
  try {
    const [rows] = await req.pool.execute(
      `SELECT r*, 
              (SELECT COUNT(*) FROM request_employees re WHERE re.request_id = r.id) as employee_count
       FROM requests r
       WHERE r.requested_by = ?
       ORDER BY r.requested_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Erreur liste demandes (mine):', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos demandes' });
  }
});

// GET /api/requests/:id - détail d'une demande
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await req.pool.execute(
      'SELECT r.*, u.name as requested_by_name FROM requests r LEFT JOIN users u ON u.id = r.requested_by WHERE r.id = ?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Demande introuvable' });

    const request = rows[0];
    if (request.type === 'employee') {
      const [emps] = await req.pool.execute(
        'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ? ORDER BY e.nom, e.prenom',
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

// POST /api/requests - créer une demande
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, message, employee_ids, target_role } = req.body || {};
    if (!type || !['employee','general'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide' });
    }
    if (type === 'employee' && (!Array.isArray(employee_ids) || employee_ids.length === 0)) {
      return res.status(400).json({ error: 'Aucun employé sélectionné' });
    }

    const contentJson = type === 'general' ? JSON.stringify({}) : JSON.stringify({ employee_ids });

    const [ins] = await req.pool.execute(
      `INSERT INTO requests (type, message, content, target_role, requested_by, requested_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type, message || null, contentJson, target_role || null, req.user.id]
    );
    const requestId = ins.insertId;

    if (type === 'employee') {
      const values = (employee_ids || []).map(empId => [requestId, empId]);
      if (values.length > 0) {
        const placeholders = values.map(() => '(?, ?)').join(',');
        await req.pool.execute(
          `INSERT INTO request_employees (request_id, employee_id) VALUES ${placeholders}`,
          values.flat()
        );
      }
    }

    // Notifications RH/Admin
    let names = '';
    let empIds = [];
    if (type === 'employee') {
      const [empRows] = await req.pool.execute(
        'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?',
        [requestId]
      );
      names = (empRows || []).map(e => `${e.nom} ${e.prenom}`).join(', ');
      empIds = (empRows || []).map(e => e.id);
    }
    const [admins] = await req.pool.execute('SELECT id FROM users WHERE role IN (\'rh\',\'administrateur\')');
    await Promise.all(admins.map(a => createNotification(
      req.pool,
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

// POST /api/requests/:id/approve - approbation RH/Admin
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const { id } = req.params;

    const [reqRows] = await req.pool.execute('SELECT * FROM requests WHERE id = ? AND status = \'pending\'', [id]);
    if (reqRows.length === 0) {
      return res.status(404).json({ error: 'Demande introuvable ou déjà traitée' });
    }
    const request = reqRows[0];

    if (request.type === 'employee') {
      const [chefAtelier] = await req.pool.execute(
        'SELECT atelier_id FROM atelier_chefs WHERE user_id = ? LIMIT 1',
        [request.requested_by]
      );
      if (chefAtelier.length === 0 || !chefAtelier[0].atelier_id) {
        return res.status(400).json({ error: "Le chef demandeur n'est pas assigné à un atelier" });
      }
      const targetAtelierId = chefAtelier[0].atelier_id;

      const [empRows] = await req.pool.execute(
        'SELECT re.employee_id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?',
        [id]
      );
      const empIds = empRows.map(r => r.employee_id);
      if (empIds.length > 0) {
        const placeholders = empIds.map(() => '?').join(',');
        await req.pool.execute(
          `UPDATE employees SET atelier_id = ? WHERE id IN (${placeholders})`,
          [targetAtelierId, ...empIds]
        );
      }

      const names = empRows.map(e => `${e.nom} ${e.prenom}`).join(', ');
      await createNotification(req.pool, request.requested_by, 'employee_approved', `Demande d'employés approuvée: ${names}`, { requestId: id, employeeIds: empIds });
    }

    await req.pool.execute(
      'UPDATE requests SET status = \'approved\', approved_by = ?, approved_at = NOW() WHERE id = ?',
      [req.user.id, id]
    );

    res.json({ success: true, status: 'approved' });
  } catch (err) {
    console.error('❌ Erreur approbation demande:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'approbation' });
  }
});

// POST /api/requests/:id/reject - rejet RH/Admin
router.post('/:id/reject', authenticate, async (req, res) => {
  try {
    if (!['rh', 'administrateur'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - RH/Admin requis' });
    }
    const { id } = req.params;
    const [upd] = await req.pool.execute(
      'UPDATE requests SET status = \'rejected\', approved_by = ?, approved_at = NOW() WHERE id = ? AND status = \'pending\'',
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

async function createNotification(pool, recipientUserId, type, message, payload = null) {
  try {
    await pool.execute(
      'INSERT INTO notifications (recipient_user_id, type, message, payload, created_at) VALUES (?, ?, ?, ?, NOW())',
      [recipientUserId, type, message || null, payload ? JSON.stringify(payload) : null]
    );
  } catch (e) {
    console.warn('⚠️ Notification non enregistrée:', e.message);
  }
}

module.exports = router; 