// Configuration MySQL pour l'application Transport
module.exports = {
  // Configuration de base - modifier selon votre environnement
  host: 'localhost',
  user: 'root',
  password: '', // CHANGEZ CECI avec votre mot de passe MySQL
  database: 'transport_db',
  
  // Options du pool de connexions
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Instructions d'installation :
// 1. Installer MySQL Server sur votre machine
// 2. Créer un utilisateur MySQL (ou utiliser root)
// 3. Modifier le mot de passe ci-dessus
// 4. La base de données 'transport_db' sera créée automatiquement