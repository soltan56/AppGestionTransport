# 🚌 Backend - Gestion Transport API

API REST pour l'application de gestion de transport avec base de données SQLite.

## 🚀 Installation

### Prérequis
- Node.js (v16+)
- npm

### Étapes d'installation

1. **Naviguer vers le dossier backend**
   ```bash
   cd backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm run dev  # Mode développement avec nodemon
   # ou
   npm start    # Mode production
   ```

4. **Vérifier que l'API fonctionne**
   ```bash
   curl http://localhost:3001/api/health
   ```

## 📊 Base de Données

L'application utilise **SQLite** avec les tables suivantes :

### 📝 Tables

| Table | Description | Champs principaux |
|-------|-------------|------------------|
| `users` | Utilisateurs du système | id, name, email, password, role |
| `plannings` | Plannings de transport | nom, point_ramassage, circuit, equipe, atelier |
| `employees` | Employés | nom, prenom, type_contrat, equipe, atelier |
| `buses` | Bus disponibles | numero, modele, capacite, status |
| `circuits` | Circuits de transport | nom, description, distance, points_arret |
| `ateliers` | Ateliers de travail | nom, description, localisation, responsable |

## 🔗 Endpoints API

### 🔐 Authentification
```
POST /api/auth/login
```

### 📋 Plannings
```
GET    /api/plannings           # Liste tous les plannings
POST   /api/plannings           # Créer un planning
GET    /api/plannings/:id       # Récupérer un planning
PUT    /api/plannings/:id       # Modifier un planning
DELETE /api/plannings/:id       # Supprimer un planning
GET    /api/plannings/stats/overview # Statistiques
```

### 👥 Employés
```
GET    /api/employees           # Liste tous les employés
POST   /api/employees           # Ajouter un employé
```

### 🚌 Bus
```
GET    /api/buses               # Liste tous les bus
POST   /api/buses               # Ajouter un bus
```

### 🛣️ Circuits
```
GET    /api/circuits            # Liste tous les circuits
POST   /api/circuits            # Ajouter un circuit
```

### 🏭 Ateliers
```
GET    /api/ateliers            # Liste tous les ateliers
POST   /api/ateliers            # Ajouter un atelier
```

## 📝 Exemple de Création de Planning

```bash
curl -X POST http://localhost:3001/api/plannings \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Planning Transport Zone Nord",
    "pointRamassage": "Centre Ville",
    "circuit": "Circuit Nord",
    "equipe": "Matin",
    "atelier": "Atelier Principal",
    "dateDebut": "2024-01-15",
    "heureDebut": "08:00",
    "heureFin": "17:00"
  }'
```

## 🗄️ Structure de la Base de Données

La base de données SQLite (`database.sqlite`) est créée automatiquement au premier démarrage du serveur.

### Exemple de données

```sql
-- Créer un atelier
INSERT INTO ateliers (nom, description, localisation) 
VALUES ('Atelier Principal', 'Atelier de production principal', 'Zone Industrielle Nord');

-- Créer un circuit
INSERT INTO circuits (nom, description, distance) 
VALUES ('Circuit Nord', 'Circuit desservant la zone nord', 15.5);

-- Créer un planning
INSERT INTO plannings (nom, point_ramassage, circuit, equipe, atelier, date_debut, heure_debut)
VALUES ('Planning Matin Nord', 'Centre Ville', 'Circuit Nord', 'Matin', 'Atelier Principal', '2024-01-15', '08:00');
```

## 🔧 Configuration

### Variables d'environnement (optionnel)

Créez un fichier `.env` :

```env
PORT=3001
NODE_ENV=development
```

### Sécurité

- **CORS** : Configuré pour accepter les requêtes du frontend (localhost:3000)
- **Rate Limiting** : 100 requêtes par 15 minutes par IP
- **Helmet** : Headers de sécurité activés

## 🔄 Scripts Disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement avec nodemon
npm run init-db    # Réinitialiser la base de données (à implémenter)
```

## 📊 Surveillance

- **Health Check** : `GET /api/health`
- **Logs** : Affichés dans la console
- **Base de données** : Fichier `database.sqlite` dans le dossier `backend/`

## 🚨 Notes Importantes

1. **Authentification** : Actuellement en mode simulation. Intégrez JWT pour la production.
2. **Base de données** : SQLite est parfait pour le développement. Migrez vers PostgreSQL/MySQL pour la production.
3. **Validation** : Ajoutez plus de validations selon vos besoins métier.
4. **Tests** : Ajoutez des tests unitaires et d'intégration.

## 🔗 Intégration Frontend

Le frontend React (port 3000) communique automatiquement avec cette API. Assurez-vous que les deux serveurs tournent :

1. **Backend** : `http://localhost:3001`
2. **Frontend** : `http://localhost:3000`

## 🛠️ Développement

Pour contribuer au backend :

1. Clonez le projet
2. Installez les dépendances
3. Modifiez les routes dans `routes/`
4. Testez avec Postman ou curl
5. Mettez à jour cette documentation

---

**🎯 L'API est maintenant prête ! Vous pouvez créer vos plannings, gérer vos employés et tous vos données de transport en toute sécurité.** 