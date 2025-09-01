import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiSettings,
  FiActivity,
  FiShield,
  FiEye,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiTool,
  FiCalendar
} from 'react-icons/fi';

// Composant principal Admin Dashboard
const AdminHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState([
    { label: 'Chefs d\'Atelier', value: '0', icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Employés', value: '0', icon: FiActivity, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Ateliers', value: '0', icon: FiTool, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Plannings (année)', value: '0', icon: FiCalendar, color: 'text-purple-600', bg: 'bg-purple-100' }
  ]);

  const [chefs, setChefs] = useState([]);
  const [recentPlannings, setRecentPlannings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [reopenRequests, setReopenRequests] = useState([]);

        const token = localStorage.getItem('authToken');
  const currentYear = new Date().getFullYear();

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [chefsResp, empResp, atlResp, planResp, reqResp, reopenResp] = await Promise.all([
        fetch('http://localhost:3001/api/chefs', { credentials: 'include', headers }),
        fetch('http://localhost:3001/api/employees', { credentials: 'include', headers }),
        fetch('http://localhost:3001/api/ateliers', { credentials: 'include', headers }),
        fetch(`http://localhost:3001/api/weekly-plannings?year=${currentYear}`, { credentials: 'include', headers }),
        fetch('http://localhost:3001/api/requests/pending', { credentials: 'include', headers }),
        fetch('http://localhost:3001/api/weekly-plannings/reopen-requests', { credentials: 'include', headers })
      ]);

      const chefsData = chefsResp.ok ? await chefsResp.json() : [];
      const employees = empResp.ok ? await empResp.json() : [];
      const ateliers = atlResp.ok ? await atlResp.json() : [];
      const plannings = planResp.ok ? await planResp.json() : [];
      const requests = reqResp.ok ? await reqResp.json() : [];
      const reopens = reopenResp.ok ? await reopenResp.json() : [];

      setChefs(chefsData);
      setPendingRequests(requests);
      setReopenRequests(reopens);

      // Recent plannings (top 5 by updated_at or created_at)
      const recent = [...plannings]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5)
        .map(p => ({
          week: p.week_number,
          year: p.year,
          status: p.status,
          updated_at: p.updated_at || p.created_at
        }));
      setRecentPlannings(recent);

        setStats([
        { label: 'Chefs d\'Atelier', value: chefsData.length.toString(), icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Employés', value: employees.length.toString(), icon: FiActivity, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Ateliers', value: ateliers.length.toString(), icon: FiTool, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: `Plannings (${currentYear})`, value: plannings.length.toString(), icon: FiCalendar, color: 'text-purple-600', bg: 'bg-purple-100' }
      ]);
    } catch (e) {
      console.warn('Erreur chargement admin home:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const approveRequest = async (item) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      if (item.type === 'employee') {
        await fetch(`http://localhost:3001/api/requests/${item.id}/approve`, { method: 'POST', credentials: 'include', headers });
      } else if (item.type === 'reopen') {
        await fetch(`http://localhost:3001/api/weekly-plannings/${item.id}/approve-reopen`, { method: 'POST', credentials: 'include', headers });
      }
      await fetchData();
    } catch (e) {
      alert('Échec approbation');
    }
  };

  const rejectRequest = async (item) => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      if (item.type === 'employee') {
        await fetch(`http://localhost:3001/api/requests/${item.id}/reject`, { method: 'POST', credentials: 'include', headers });
      }
      await fetchData();
    } catch (e) {
      alert('Échec rejet');
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600">Administration système et gestion des accès</p>
        </div>
        <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Rafraîchir</button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
        <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/dashboard/admin/users')} className="card cursor-pointer border border-indigo-200 hover:border-indigo-300 transition-colors">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestion Chef</h3>
            <p className="text-sm text-gray-600">Créer et gérer les comptes</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/dashboard/admin/ateliers')} className="card cursor-pointer border border-green-200 hover:border-green-300 transition-colors">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiTool className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestion Ateliers</h3>
            <p className="text-sm text-gray-600">Administrer les ateliers</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/dashboard/admin/planning')} className="card cursor-pointer border border-purple-200 hover:border-purple-300 transition-colors">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Plannings</h3>
            <p className="text-sm text-gray-600">Consulter et gérer les plannings</p>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/dashboard/admin/stats')} className="card cursor-pointer border border-blue-200 hover:border-blue-300 transition-colors">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FiActivity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Statistiques</h3>
            <p className="text-sm text-gray-600">Rapports et indicateurs</p>
          </div>
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demandes en attente */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Demandes en attente</h3>
            <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">Rafraîchir</button>
          </div>
          <div className="space-y-3">
            {pendingRequests.length === 0 && reopenRequests.length === 0 && (
              <div className="text-sm text-gray-500">Aucune demande</div>
            )}
            {pendingRequests.map((r) => (
              <div key={`req-${r.id}`} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Demande d'employés • Par {r.requested_by_name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {Array.isArray(r.employees) && r.employees.length > 0
                      ? r.employees.map(e => `${e.nom} ${e.prenom}`).join(', ')
                      : 'Employés non listés'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(r.requested_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => approveRequest({ id: r.id, type: 'employee' })} className="px-2 py-1 bg-green-600 text-white rounded">Approuver</button>
                  <button onClick={() => rejectRequest({ id: r.id, type: 'employee' })} className="px-2 py-1 bg-red-600 text-white rounded">Rejeter</button>
                </div>
              </div>
            ))}
            {reopenRequests.map((r) => (
              <div key={`rop-${r.id}`} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Réouverture Planning • S{r.week_number}/{r.year}</p>
                  <p className="text-sm text-gray-600 mt-1">{r.reopen_reason || 'Sans raison'}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(r.reopen_requested_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => approveRequest({ id: r.id, type: 'reopen' })} className="px-2 py-1 bg-green-600 text-white rounded">Approuver</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chefs d'Atelier */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chefs d'Atelier</h3>
            <button onClick={()=>navigate('/dashboard/admin/users')} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
              <FiEye className="h-4 w-4 mr-1" />
              Voir tous
            </button>
          </div>
          <div className="space-y-3">
            {chefs.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 role-chef rounded-lg flex items-center justify-center text-white text-sm">🔧</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-sm text-gray-600">{(c.atelier_names || '').split(',').filter(Boolean).join(', ') || '—'}</div>
                </div>
                <div className="text-sm text-gray-600">{c.employee_count || 0} employés</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activités Récentes</h3>
        <div className="space-y-3">
          {recentPlannings.length === 0 && (
            <div className="text-sm text-gray-500">Aucune activité récente</div>
          )}
          {recentPlannings.map((a, idx) => (
            <div key={`${a.year}-${a.week}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">S{a.week}</div>
                <div>
                  <div className="font-medium text-gray-900">Planning semaine {a.week}/{a.year}</div>
                  <div className="text-sm text-gray-600">Statut: {a.status || 'draft'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <FiClock className="h-3 w-3 mr-1" />
                {new Date(a.updated_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pages héritées du chef (pour admin)
const PlanningPage = () => {
  const PlanningListView = React.lazy(() => import('../../pages/PlanningListView'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <PlanningListView />
    </React.Suspense>
  );
};

const PlanningCreationPage = () => {
  const PlanningCreation = React.lazy(() => import('../../pages/PlanningCreation'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <PlanningCreation />
    </React.Suspense>
  );
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

const StatsPage = () => {
  const RealStatsPage = React.lazy(() => import('../../pages/StatsPage'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RealStatsPage />
    </React.Suspense>
  );
};

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

const AdminAteliers = () => {
  const AdminAteliersComponent = React.lazy(() => import('../../pages/AdminAteliers'));
  
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    }>
      <AdminAteliersComponent />
    </React.Suspense>
  );
};

// Pages supprimées : GroupsPage, AuditPage, SecurityPage

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      {/* Routes héritées du chef */}
      <Route path="/planning" element={<PlanningPage />} />
      <Route path="/planning-creation" element={<PlanningCreationPage />} />
      <Route path="/circuits" element={<CircuitsPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/management" element={<ManagementPage />} />
      {/* Routes spécifiques admin */}
      <Route path="/users" element={<UsersPage />} />
      <Route path="/ateliers" element={<AdminAteliers />} />
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  );
};

export default AdminDashboard; 