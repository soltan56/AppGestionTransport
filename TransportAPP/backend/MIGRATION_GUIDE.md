# Guide de Migration SQLite vers MySQL

## 📋 Étapes de Migration

### 1. Prérequis
- **MySQL Server** installé et démarré
- **Node.js** avec les dépendances (`mysql2` déjà installé)
- **Droits d'accès** MySQL (utilisateur root ou dédié)

### 2. Configuration MySQL

1. **Modifier le mot de passe** dans `backend/mysql-config.js`:
```javascript
password: 'VOTRE_MOT_DE_PASSE_MYSQL', // Changez ceci !
```

2. **Créer la base de données** (optionnel - sera créée automatiquement):
```sql
CREATE DATABASE transport_db;
```

### 3. Migration des Données

```bash
# Arrêter le serveur SQLite actuel
Ctrl+C

# Lancer la migration
cd backend
node migrate-sqlite-to-mysql.js
```

### 4. Démarrer avec MySQL

```bash
# Nouveau serveur MySQL
node simple_working_server_mysql.js
```

## 🔧 Fichiers Modifiés

| Fichier | Rôle |
|---------|------|
| `db-mysql.js` | Configuration et schéma MySQL |
| `mysql-config.js` | Paramètres de connexion MySQL |
| `migrate-sqlite-to-mysql.js` | Script de migration des données |
| `simple_working_server_mysql.js` | Serveur backend MySQL |

## 🔍 Vérifications

### Test de Connexion
```bash
node -e "require('./db-mysql').testConnection()"
```

### Vérifier les Données
```sql
USE transport_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM employees;
```

## 🚀 Avantages MySQL vs SQLite

| Aspect | SQLite | MySQL |
|--------|--------|-------|
| **Performance** | Bonne pour <100 utilisateurs | Excellente pour >100 utilisateurs |
| **Concurrence** | Limitée | Excellent support multi-utilisateurs |
| **Scalabilité** | Fichier unique | Serveur dédié |
| **Backup** | Copie de fichier | mysqldump + stratégies avancées |
| **Sécurité** | Basique | Utilisateurs, rôles, chiffrement |
| **Monitoring** | Minimal | Outils professionnels |

## 🛠️ Fonctionnalités Identiques

- ✅ **Authentification** (admin/chef/rh)
- ✅ **Gestion des employés**
- ✅ **Plannings hebdomadaires**
- ✅ **Export CSV**
- ✅ **Création de chefs**
- ✅ **Toutes les API** endpoints

## 🔒 Sécurité Améliorée

- **Clés étrangères** avec contraintes
- **Index** sur les champs fréquents
- **UTF8MB4** pour l'unicode complet
- **InnoDB** pour les transactions ACID

## 🚨 Troubleshooting

### "Can't connect to MySQL"
```bash
# Vérifier MySQL démarré
sudo systemctl status mysql
# ou sur Windows
net start mysql
```

### "Access denied for user"
```bash
# Réinitialiser mot de passe MySQL
sudo mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
```

### "Database doesn't exist"
- La base sera créée automatiquement
- Vérifiez les permissions de l'utilisateur MySQL

## 📈 Performance MySQL

- **Connection pooling** (10 connexions max)
- **Prepared statements** pour sécurité
- **Index** sur colonnes fréquentes
- **Auto-increment** optimisé

## 🔄 Retour vers SQLite (si nécessaire)

Si vous voulez revenir à SQLite:
```bash
# Utiliser l'ancien serveur
node simple_working_server.js
```

Les données SQLite restent intactes dans `transport.db`.