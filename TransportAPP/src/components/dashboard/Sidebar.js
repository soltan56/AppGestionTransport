import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiCalendar,
  FiTruck,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiUserPlus,
  FiDollarSign,
  FiSettings,
  FiShield,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiEdit
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      { icon: FiHome, label: 'Accueil', path: '/dashboard' }
    ];

    switch (user?.role) {
      case 'chef':
        return [
          ...baseItems,
          { icon: FiCalendar, label: 'Plannings', path: '/dashboard/chef/planning' },
          { icon: FiTruck, label: 'Voir Circuits', path: '/dashboard/chef/circuits' },
                     { icon: FiBarChart2, label: 'Statistiques', path: '/dashboard/chef/stats' },
          { icon: FiUsers, label: 'Gestion Employés', path: '/dashboard/chef/management' }
        ];
      
      case 'rh':
        return [
          ...baseItems,
          { icon: FiUserPlus, label: 'Ajouter Intérimaire', path: '/dashboard/rh/interim' },
          { icon: FiCalendar, label: 'Consulter Planning', path: '/dashboard/rh/planning' },
          { icon: FiFileText, label: 'Rapports RH', path: '/dashboard/rh/reports' },
          { icon: FiDollarSign, label: 'Suivi Financier', path: '/dashboard/rh/finance' }
        ];
      
      case 'administrateur':
        return [
          ...baseItems,
          // Droits du chef d'atelier
          { icon: FiCalendar, label: 'Plannings', path: '/dashboard/admin/planning' },
          { icon: FiTruck, label: 'Voir Circuits', path: '/dashboard/admin/circuits' },
          { icon: FiBarChart2, label: 'Statistiques', path: '/dashboard/admin/stats' },
          { icon: FiUsers, label: 'Gestion Bus & Employés', path: '/dashboard/admin/management' },
          // Droits spécifiques admin
          { icon: FiUsers, label: 'Gestion Utilisateurs', path: '/dashboard/admin/users' },
          { icon: FiSettings, label: 'Groupes & Ateliers', path: '/dashboard/admin/groups' },
          { icon: FiActivity, label: 'Audit Activités', path: '/dashboard/admin/audit' },
          { icon: FiShield, label: 'Sécurité', path: '/dashboard/admin/security' }
        ];
      
      default:
        return baseItems;
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const menuItems = getMenuItems();

  return (
    <motion.div
      initial={{ width: isCollapsed ? 64 : 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-lg border-r border-gray-200 flex flex-col h-full"
    >
      {/* Header de la sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🚌</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Transport</h2>
                <p className="text-xs text-gray-500">Administration</p>
              </div>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <FiChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <FiChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-700'}`}
                >
                  {item.label}
                </motion.span>
              )}
              
              {isActive && !isCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 bg-primary-600 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer avec rôle utilisateur */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-4 border-t border-gray-200"
        >
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${
              user?.role === 'chef' ? 'role-chef' :
              user?.role === 'rh' ? 'role-rh' :
              user?.role === 'administrateur' ? 'role-admin' : 'bg-gray-500'
            }`}>
              {user?.role === 'chef' ? '🔧' :
               user?.role === 'rh' ? '👥' :
               user?.role === 'administrateur' ? '⚙️' : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role === 'chef' ? 'Chef d\'Atelier' :
                 user?.role === 'rh' ? 'RH' :
                 user?.role === 'administrateur' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar; 