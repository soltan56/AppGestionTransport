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
  FiTrendingDown
} from 'react-icons/fi';

// Composant principal RH Dashboard
const RHHome = () => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Employés Totaux', value: '147', icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100', change: '+5%' },
    { label: 'Intérimaires Actifs', value: '23', icon: FiUserPlus, color: 'text-red-600', bg: 'bg-red-100', change: '+12%' },
    { label: 'Coût Mensuel', value: '€78,500', icon: FiDollarSign, color: 'text-green-600', bg: 'bg-green-100', change: '+3%' },
    { label: 'Plannings Actifs', value: '8', icon: FiCalendar, color: 'text-purple-600', bg: 'bg-purple-100', change: '0%' }
  ];

  const recentActivities = [
    { action: 'Intérimaire ajouté', details: 'Sophie Dubois - Équipe Matin', time: 'Il y a 1h', type: 'interim' },
    { action: 'Rapport généré', details: 'Effectifs par zone - Janvier', time: 'Il y a 2h', type: 'report' },
    { action: 'Consultation planning', details: 'Planning Soir Zone B', time: 'Il y a 3h', type: 'planning' },
    { action: 'Analyse financière', details: 'Coûts transport Q1', time: 'Il y a 5h', type: 'finance' }
  ];

  const pendingRequests = [
    { name: 'Marie Martin', poste: 'Superviseur', urgence: 'haute', date: 'Demain' },
    { name: 'Pierre Dupont', poste: 'Chauffeur', urgence: 'moyenne', date: 'Lundi' },
    { name: 'Lisa Bernard', poste: 'Agent logistique', urgence: 'basse', date: 'Mercredi' }
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
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <FiUserPlus className="h-4 w-4" />
          <span>Ajouter Intérimaire</span>
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
                <div className="flex items-center mt-1">
                  {stat.change.startsWith('+') ? (
                    <FiTrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : stat.change === '0%' ? null : (
                    <FiTrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${
                    stat.change.startsWith('+') ? 'text-green-600' :
                    stat.change === '0%' ? 'text-gray-500' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
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
          onClick={() => navigate('/dashboard/rh/interim')}
          className="card cursor-pointer border border-red-200 hover:border-red-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUserPlus className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ajouter Intérimaire</h3>
            <p className="text-sm text-gray-600">Nouvel employé temporaire</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/rh/planning')}
          className="card cursor-pointer border border-blue-200 hover:border-blue-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Consulter Planning</h3>
            <p className="text-sm text-gray-600">Vue d'ensemble des plannings</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/rh/reports')}
          className="card cursor-pointer border border-purple-200 hover:border-purple-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiFileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rapports RH</h3>
            <p className="text-sm text-gray-600">Analyses et exports</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/dashboard/rh/finance')}
          className="card cursor-pointer border border-green-200 hover:border-green-300 transition-colors"
        >
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Suivi Financier</h3>
            <p className="text-sm text-gray-600">Coûts et budgets</p>
          </div>
        </motion.div>
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
                  activity.type === 'interim' ? 'bg-red-100 text-red-600' :
                  activity.type === 'report' ? 'bg-purple-100 text-purple-600' :
                  activity.type === 'planning' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {activity.type === 'interim' ? <FiUserPlus className="h-5 w-5" /> :
                   activity.type === 'report' ? <FiFileText className="h-5 w-5" /> :
                   activity.type === 'planning' ? <FiCalendar className="h-5 w-5" /> :
                   <FiDollarSign className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <FiClock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demandes en attente */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Demandes en Attente</h3>
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {pendingRequests.length} en cours
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{request.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.urgence === 'haute' ? 'bg-red-100 text-red-800' :
                    request.urgence === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgence}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>👔 {request.poste}</div>
                  <div>📅 {request.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rapports rapides */}
      <div className="card">
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
            { title: 'Coûts Mensuels', description: 'Analyse financière détaillée', type: 'PDF' }
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

// Pages individuelles
const InterimPage = () => {
  const TempWorkerManagement = React.lazy(() => import('../../pages/TempWorkerManagement'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <TempWorkerManagement />
    </React.Suspense>
  );
};

const PlanningConsultPage = () => {
  const PlanningConsultation = React.lazy(() => import('../../pages/PlanningConsultation'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <PlanningConsultation />
    </React.Suspense>
  );
};

const ReportsPage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Rapports RH</h2>
    <div className="card">
      <p className="text-gray-600">Génération et téléchargement de rapports (à développer)</p>
    </div>
  </div>
);

const FinancePage = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900">Suivi Financier</h2>
    <div className="card">
      <p className="text-gray-600">Analyse des coûts et simulations (à développer)</p>
    </div>
  </div>
);

const RHDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<RHHome />} />
      <Route path="/interim" element={<InterimPage />} />
      <Route path="/planning" element={<PlanningConsultPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="*" element={<Navigate to="/dashboard/rh" replace />} />
    </Routes>
  );
};

export default RHDashboard; 