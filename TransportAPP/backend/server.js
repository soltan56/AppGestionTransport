const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'transport' 
};

const pool = mysql.createPool(dbConfig);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/plannings', require('./routes/plannings'));
app.use('/api/weekly-plannings', require('./routes/weeklyPlannings'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/circuits', require('./routes/circuits'));
app.use('/api/ateliers', require('./routes/ateliers'));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(` Serveur backend démarré sur http://localhost:${PORT}`);
      console.log(` API disponible sur http://localhost:${PORT}/api`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  process.exit(0);
});

startServer(); 