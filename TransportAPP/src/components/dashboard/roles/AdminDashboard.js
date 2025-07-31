import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlanningCreation from '../../pages/PlanningCreation';
import {
  FiUsers,
  FiSettings,
  FiActivity,
  FiShield,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiX
} from 'react-icons/fi';

// Composant principal Admin Dashboard
const AdminHome = () => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Utilisateurs Actifs', value: '24', icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-100', change: '+2' },
    { label: 'Groupes & Ateliers', value: '8', icon: FiSettings, color: 'text-blue-600', bg: 'bg-blue-100', change: '0' },
    { label: 'Connexions Aujour\'hui', value: '156', icon: FiActivity, color: 'text-green-600', bg: 'bg-green-100', change: '+23' },
    { label: 'Alertes Sécurité', value: '3', icon: FiShield, color: 'text-red-600', bg: 'bg-red-100', change: '-1' }
  ];

  const recentActivities = [
    { action: 'Utilisateur créé', details: 'Nouveau chef d\'atelier - Zone Nord', time: 'Il y a 30min', type: 'user', status: 'success' },
    { action: 'Groupe modifié', details: 'Atelier Sud - Permissions mises à jour', time: 'Il y a 1h', type: 'group', status: 'success' },
    { action: 'Tentative de connexion', details: 'Échec d\'authentification (IP: 192.168.1.45)', time: 'Il y a 2h', type: 'security', status: 'warning' },
    { action: 'Audit généré', details: 'Rapport d\'activités - Janvier 2024', time: 'Il y a 3h', type: 'audit', status: 'success' }
  ];

  const systemHealth = {
    server: { status: 'online', load: '65%' },
    database: { status: 'online', load: '42%' },
    backup: { status: 'online', lastBackup: 'Il y a 6h' },
    security: { status: 'warning', threats: '3 détectées' }
  };

  const activeUsers = [
    { name: 'Marie Dubois', role: 'Chef', status: 'online', lastActivity: 'Il y a 5min' },
    { name: 'Pierre Martin', role: 'RH', status: 'online', lastActivity: 'Il y a 12min' },
    { name: 'Sophie Bernard', role: 'Chef', status: 'away', lastActivity: 'Il y a 35min' },
    { name: 'Jean Dupont', role: 'RH', status: 'offline', lastActivity: 'Il y a 2h' }
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600">Administration système et gestion des accès</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <FiPlus className="h-4 w-4" />
          <span>Nouvel Utilisateur</span>
        </motion.button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change !== '0' && (
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} cette semaine
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/admin/users')}
          className="card cursor-pointer border border-indigo-200 hover:border-indigo-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestion Utilisateurs</h3>
            <p className="text-sm text-gray-600">Créer et gérer les comptes</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/admin/groups')}
          className="card cursor-pointer border border-blue-200 hover:border-blue-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiSettings className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Groupes & Ateliers</h3>
            <p className="text-sm text-gray-600">Configuration organisationnelle</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/admin/audit')}
          className="card cursor-pointer border border-green-200 hover:border-green-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiActivity className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Audit Activités</h3>
            <p className="text-sm text-gray-600">Logs et historiques</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/admin/security')}
          className="card cursor-pointer border border-red-200 hover:border-red-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiShield className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sécurité</h3>
            <p className="text-sm text-gray-600">Paramètres et alertes</p>
          </div>
        </motion.div>
      </div>

      {/* État du système */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">État du Système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Serveur</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-600">Charge: {systemHealth.server.load}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Base de données</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-600">Charge: {systemHealth.database.load}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sauvegarde</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-600">{systemHealth.backup.lastBackup}</p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Sécurité</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-600">{systemHealth.security.threats}</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activités récentes */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'user' ? 'bg-indigo-100 text-indigo-600' :
                  activity.type === 'group' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'security' ? 'bg-red-100 text-red-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {activity.type === 'user' ? <FiUsers className="h-5 w-5" /> :
                   activity.type === 'group' ? <FiSettings className="h-5 w-5" /> :
                   activity.type === 'security' ? <FiShield className="h-5 w-5" /> :
                   <FiActivity className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {activity.status === 'success' ? (
                    <FiCheck className="h-4 w-4 text-green-500" />
                                     ) : activity.status === 'warning' ? (
                     <FiAlertCircle className="h-4 w-4 text-yellow-500" />
                   ) : (
                    <FiX className="h-4 w-4 text-red-500" />
                  )}
                  <div className="text-xs text-gray-500 flex items-center">
                    <FiClock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilisateurs actifs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilisateurs Actifs</h3>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
              <FiEye className="h-4 w-4 mr-1" />
              Voir tous
            </button>
          </div>
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm ${
                  user.role === 'Chef' ? 'role-chef' :
                  user.role === 'RH' ? 'role-rh' : 'role-admin'
                }`}>
                  {user.role === 'Chef' ? '🔧' :
                   user.role === 'RH' ? '👥' : '⚙️'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'online' ? 'bg-green-500' :
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <p className="text-sm text-gray-600">{user.role} - {user.lastActivity}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pages héritées du chef (pour admin)
const PlanningPage = () => {
  return <PlanningCreation />;
};

const CircuitsPage = () => {
  const CircuitManagement = React.lazy(() => import('../../pages/CircuitManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <CircuitManagement />
    </React.Suspense>
  );
};

const StatsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
    <div className="card">
      <p className="text-gray-600">Graphiques et analyses (à développer)</p>
    </div>
  </div>
);

const ManagementPage = () => {
  const EmployeeManagement = React.lazy(() => import('../../pages/EmployeeManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <EmployeeManagement />
    </React.Suspense>
  );
};

// Pages individuelles admin
const UsersPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
    <div className="card">
      <p className="text-gray-600">Interface de gestion des utilisateurs et permissions (à développer)</p>
    </div>
  </div>
);

const GroupsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Groupes & Ateliers</h2>
    <div className="card">
      <p className="text-gray-600">Configuration des groupes et ateliers (à développer)</p>
    </div>
  </div>
);

const AuditPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Audit des Activités</h2>
    <div className="card">
      <p className="text-gray-600">Historique et logs d'activités (à développer)</p>
    </div>
  </div>
);

const SecurityPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Paramètres de Sécurité</h2>
    <div className="card">
      <p className="text-gray-600">Configuration de la sécurité système (à développer)</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      {/* Routes héritées du chef */}
      <Route path="/planning" element={<PlanningPage />} />
      <Route path="/circuits" element={<CircuitsPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/management" element={<ManagementPage />} />
      {/* Routes spécifiques admin */}
      <Route path="/users" element={<UsersPage />} />
      <Route path="/groups" element={<GroupsPage />} />
      <Route path="/audit" element={<AuditPage />} />
      <Route path="/security" element={<SecurityPage />} />
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  );
};

export default AdminDashboard; 