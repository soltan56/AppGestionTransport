const express = require('express');
const router = express.Router();

// Middleware d'authentification (basé sur employees.js)
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

// GET /api/notifications - liste des notifications utilisateur courant
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const [rows] = await req.pool.execute(
      'SELECT * FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    // Enrichissement pour employee_request: ajouter noms employés et requestId
    const enriched = await Promise.all((rows || []).map(async (n) => {
      try {
        if (n.type === 'employee_request' && n.payload) {
          const payload = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
          const reqId = payload && payload.requestId;
          if (reqId) {
            const [emps] = await req.pool.execute(
              'SELECT e.id, e.nom, e.prenom FROM request_employees re JOIN employees e ON e.id = re.employee_id WHERE re.request_id = ?',
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
      } catch (_) {}
      return n;
    }));

    res.json(enriched);
  } catch (e) {
    console.error('❌ Erreur notifications:', e.message);
    res.status(500).json({ error: 'Erreur notifications' });
  }
});

// POST /api/notifications/:id/read - marquer comme lu
router.post('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await req.pool.execute(
      'UPDATE notifications SET read_at = NOW() WHERE id = ? AND recipient_user_id = ?',
      [id, req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Erreur mark read:', e.message);
    res.status(500).json({ error: 'Erreur mark read' });
  }
});

// POST /api/notifications/read-all - marquer toutes comme lues
router.post('/read-all', authenticate, async (req, res) => {
  try {
    await req.pool.execute(
      'UPDATE notifications SET read_at = NOW() WHERE recipient_user_id = ? AND read_at IS NULL',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error('❌ Erreur mark all read:', e.message);
    res.status(500).json({ error: 'Erreur mark all read' });
  }
});

module.exports = router; 