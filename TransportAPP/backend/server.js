const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Mets ton mot de passe si besoin
  database: 'transport' // Même nom que db.js
};

const pool = mysql.createPool(dbConfig);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Frontend React
  credentials: true
}));

// Limitation du taux de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour ajouter le pool MySQL aux requêtes
app.use((req, res, next) => {
  req.pool = pool;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plannings', require('./routes/plannings'));
app.use('/api/weekly-plannings', require('./routes/weeklyPlannings'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/circuits', require('./routes/circuits'));
app.use('/api/ateliers', require('./routes/ateliers'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Gestionnaire d'erreur global
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Plus besoin d'initDatabase, les tables doivent être créées dans phpMyAdmin
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
      console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  // Plus besoin de db.close avec MySQL pool
  process.exit(0);
});

startServer(); 