const express = require('express');
const router = express.Router();


router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  console.log('Tentative de login avec :', email, password, role);
  
  try {
    const [rows] = await req.pool.query(
      'SELECT id, name, email, role FROM users WHERE email = ? AND password = ? AND role = ?',
      [email, password, role]
    );
    if (rows.length === 1) {
      const user = rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: `mock-jwt-token-${user.id}`,
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Identifiants incorrects ou rôle non correspondant',
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
    });
  }
});

module.exports = router; 