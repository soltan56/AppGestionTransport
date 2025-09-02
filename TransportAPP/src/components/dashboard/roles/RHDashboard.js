import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUserPlus,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiUsers,
  FiDownload,
  FiEye,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiBriefcase,
  FiShuffle
} from 'react-icons/fi';

// Composant principal RH Dashboard
const RHHome = () => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Employés Totaux', value: '147', icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100', change: '+5%' },
    { label: 'Intérimaires Actifs', value: '12', icon: FiUserPlus, color: 'text-red-600', bg: 'bg-red-100', change: '+12%' },
    { label: 'Prêts Actifs', value: '3', icon: FiShuffle, color: 'text-purple-600', bg: 'bg-purple-100', change: '+2' },
    { label: 'Coût Mensuel', value: '€78,500', icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100', change: '+3%' }
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord RH</h1>
          <p className="text-gray-600">Gestion des ressources humaines et suivi des coûts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/rh/interim')}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <FiUserPlus className="h-4 w-4" />
          <span>Gérer les Intérimaires</span>
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
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change !== '0%' && (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <FiUsers className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Gestion Employés</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gérez tous les employés, ajoutez de nouveaux collaborateurs et suivez leurs informations.
          </p>
          <button
            onClick={() => navigate('/dashboard/rh/employees')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Accéder à la Gestion
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <FiShuffle className="h-8 w-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Gestion des Prêts</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gérez les prêts d'intérimaires entre ateliers et suivez leur statut.
          </p>
          <button
            onClick={() => navigate('/dashboard/rh/interim')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Gérer les Prêts
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <FiCalendar className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Gestion Complète des Plannings</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Gérez tous les plannings, fusionnez-les, exportez les données et générez des rapports complets.
          </p>
          <button
            onClick={() => navigate('/dashboard/rh/plannings/management')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Gérer les Plannings
          </button>
        </motion.div>

        {/* Nouvelle carte: Gestion des Tickets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <FiFileText className="h-8 w-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Gestion des Tickets</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Suivez et traitez les demandes, résolutions et notifications de tickets.
          </p>
          <button
            onClick={() => navigate('/dashboard/notifications/tickets')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Gérer les Tickets
          </button>
        </motion.div>
      </div>

      {/* Rapports rapides */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rapports Rapides</h3>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
            <FiEye className="h-4 w-4 mr-1" />
            Voir tous
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Effectifs par Équipe', description: 'Répartition matin/soir/nuit', type: 'PDF' },
            { title: 'Liste Intérimaires', description: 'Contrats temporaires actifs', type: 'EXCEL' },
            { title: 'Prêts Actifs', description: 'Intérimaires en prêt', type: 'PDF' }
          ].map((report, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{report.title}</h4>
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                  {report.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center">
                <FiDownload className="h-4 w-4 mr-1" />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Page de gestion des intérimaires
const InterimPage = () => {
  const InterimManagement = React.lazy(() => import('../../pages/InterimManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <InterimManagement />
    </React.Suspense>
  );
};

// Page de gestion des employés pour RH
const EmployeesPage = () => {
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

// Page de consultation des plannings pour RH
const PlanningsPage = () => {
  const RHPlanningConsultation = React.lazy(() => import('../../pages/RHPlanningConsultation'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <RHPlanningConsultation />
    </React.Suspense>
  );
};

// Page de gestion complète des plannings pour RH (avec merge et toutes les fonctionnalités)
const PlanningsManagementPage = () => {
  const RHPlanningListView = React.lazy(() => import('../../pages/RHPlanningListView'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <RHPlanningListView />
    </React.Suspense>
  );
};

// Page de gestion des chefs (reuse Admin UserManagement)
const UsersPage = () => {
  const UserManagement = React.lazy(() => import('../../pages/UserManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <UserManagement />
    </React.Suspense>
  );
};

const ReportsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Rapports RH</h2>
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <p className="text-gray-600">Génération et téléchargement de rapports (à développer)</p>
    </div>
  </div>
);

const FinancePage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Suivi Financier</h2>
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <p className="text-gray-600">Analyse des coûts et simulations (à développer)</p>
    </div>
  </div>
);

const RHDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<RHHome />} />
      <Route path="/interim" element={<InterimPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/plannings" element={<PlanningsPage />} />
      <Route path="/plannings/management" element={<PlanningsManagementPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="*" element={<Navigate to="/dashboard/rh" replace />} />
    </Routes>
  );
};

export default RHDashboard; 