import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ChefDashboard from './roles/ChefDashboard';
import RHDashboard from './roles/RHDashboard';
import AdminDashboard from './roles/AdminDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleComponent = () => {
    switch (user?.role) {
      case 'chef':
        return <ChefDashboard />;
      case 'rh':
        return <RHDashboard />;
      case 'administrateur':
        return <AdminDashboard />;
      default:
        return <div className="text-center py-12">Rôle non reconnu</div>;
    }
  };

  const getDefaultRoute = () => {
    switch (user?.role) {
      case 'chef':
        return '/dashboard/chef';
      case 'rh':
        return '/dashboard/rh';
      case 'administrateur':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-6 py-8"
          >
            <Routes>
              <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
              <Route path="/chef/*" element={user?.role === 'chef' ? <ChefDashboard /> : <Navigate to="/" replace />} />
              <Route path="/rh/*" element={user?.role === 'rh' ? <RHDashboard /> : <Navigate to="/" replace />} />
              <Route path="/admin/*" element={user?.role === 'administrateur' ? <AdminDashboard /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 