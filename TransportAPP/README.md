# 🚌 Application de Gestion de Transport

Interface d'administration moderne pour la gestion de transport avec authentification basée sur les rôles.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Interface de connexion moderne avec animations
- Gestion des rôles : Chef d'Atelier, RH, Administrateur
- Session persistante avec JWT

### 👤 Tableaux de Bord par Rôle

#### 🔧 Chef d'Atelier
- Créer et gérer les plannings
- Visualiser les circuits de transport
- Statistiques visuelles (employés, bus, circuits)
- Gestion des bus et employés

#### 👥 Ressources Humaines (RH)
- Ajouter des intérimaires
- Consulter les plannings (lecture seule)
- Générer des rapports RH
- Suivi de la charge financière

#### ⚙️ Administrateur
- Gestion des utilisateurs et accès
- Administration des groupes et ateliers
- Audit des activités
- Paramètres de sécurité

## 🛠️ Technologies Utilisées

- **Frontend**: React 18, TailwindCSS, Framer Motion
- **Routing**: React Router v6 avec protection des routes
- **Charts**: Chart.js avec React-Chartjs-2
- **Icons**: React Icons (Feather Icons)
- **Animations**: Framer Motion
- **Forms**: React Hook Form

## 📦 Installation

### Prérequis
- Node.js (v16+)
- npm ou yarn

### Étapes d'installation

1. **Frontend React**
   ```bash
   # Dans le dossier racine
   npm install
   npm start
   ```
   Frontend disponible sur `http://localhost:3000`

2. **Backend API (Nouveau !)**
   ```bash
   # Dans un nouveau terminal
   cd backend
   npm install
   npm run dev
   ```
   API disponible sur `http://localhost:3001`

### 🚀 Démarrage Rapide

1. **Démarrer le backend** (dans un terminal)
   ```bash
   cd backend && npm install && npm run dev
   ```

2. **Démarrer le frontend** (dans un autre terminal)
   ```bash
   npm install && npm start
   ```

3. **Accéder à l'application** : `http://localhost:3000`

## 👨‍💻 Comptes de Test

### Chef d'Atelier
- **Email**: `chef@test.com`
- **Mot de passe**: `chef123`
- **Rôle**: Chef d'Atelier

### RH
- **Email**: `rh@test.com`
- **Mot de passe**: `rh123`
- **Rôle**: Ressources Humaines

### Administrateur
- **Email**: `admin@test.com`
- **Mot de passe**: `admin123`
- **Rôle**: Administrateur

## 🎨 Design

- **Style**: Flat design moderne
- **Responsive**: Support mobile et desktop
- **Animations**: Transitions fluides avec Framer Motion
- **Couleurs**: Palette cohérente par rôle
  - 🔧 Chef: Vert (emerald)
  - 👥 RH: Rouge (red)
  - ⚙️ Admin: Violet (indigo)

## 📊 Fonctionnalités Avancées

### Statistiques & Graphiques
- Graphiques circulaires et en barres
- Heatmap des points de ramassage
- Suivi des effectifs par équipe
- Disponibilité des bus en temps réel

### Interface Utilisateur
- Sidebar collapsible
- Menu utilisateur avec profil
- Notifications en temps réel
- Messages d'erreur dynamiques

## 🔧 Structure du Projet

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.js
│   ├── dashboard/
│   │   ├── Dashboard.js
│   │   ├── Header.js
│   │   ├── Sidebar.js
│   │   └── roles/
│   │       ├── ChefDashboard.js
│   │       ├── RHDashboard.js
│   │       └── AdminDashboard.js
│   └── ui/
│       └── LoadingSpinner.js
├── contexts/
│   └── AuthContext.js
├── index.css
├── index.js
└── App.js
```

## 🆕 Nouvelles Fonctionnalités

### ✅ **Base de Données Intégrée**
- **SQLite** intégré avec API REST complète
- **Tables** : plannings, employés, bus, circuits, ateliers
- **Persistance** automatique des données

### ✅ **Formulaires Réels**
- **Formulaire de planning** avec validation complète
- **Champs requis** : Nom, Point ramassage, Circuit, Équipe, Atelier
- **Interface moderne** avec animations et validation

### ✅ **Gestion des Données**
- **Insertion manuelle** des données via formulaires
- **CRUD complet** pour tous les éléments
- **API REST** pour communication frontend/backend

### ✅ **Administrateur = Chef++**
- L'administrateur **hérite de tous les droits du chef**
- **Plus** les fonctions d'administration spécifiques
- **Menu unifié** avec toutes les fonctionnalités

## 🔄 Prochaines Étapes Suggérées

1. ✅ ~~Backend Integration~~ **TERMINÉ**
2. ✅ ~~Base de Données~~ **TERMINÉ**  
3. **Authentification JWT** réelle
4. **Export PDF/Excel** des rapports
5. **Notifications** temps réel
6. **Tests** unitaires et d'intégration

## 📝 Notes de Développement

- ✅ **Base de données** : SQLite intégrée avec API REST
- ✅ **Formulaires** : Insertion manuelle des données réelles  
- ✅ **Authentification** : Comptes de test fonctionnels
- ✅ **Interface** : Responsive avec données dynamiques
- ✅ **Architecture** : Frontend/Backend séparés et communicants

## 🎯 Guide d'Utilisation

### 1. **Première Connexion**
- Utilisez un compte de test (admin/chef/rh)
- L'interface s'adapte automatiquement à votre rôle

### 2. **Créer vos Données**
- **Administrateur** : Créez d'abord des ateliers et circuits
- **Chef/Admin** : Créez vos plannings avec le formulaire
- **RH** : Ajoutez des intérimaires (interface à venir)

### 3. **Données Persistantes**
- Toutes vos données sont sauvegardées automatiquement
- Base SQLite : `backend/database.sqlite`
- API REST pour toutes les opérations

### 4. **Personnalisation**
- Modifiez les points de ramassage dans `PlanningForm.js`
- Adaptez les équipes dans `DataContext.js`
- Ajoutez vos propres validations métier

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est développé pour un usage interne - Gestion de Transport. 