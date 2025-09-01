import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiBell, FiUser, FiLogOut, FiSettings, FiChevronDown, FiX, FiCheck, FiClock, FiEye, FiEdit, FiSave, FiInfo, FiMail, FiPhone, FiExternalLink, FiCode, FiZap } from 'react-icons/fi';

const Header = () => {
  const { user, token, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const isAdminOrRH = user?.role === 'administrateur' || user?.role === 'rh';

  const mapPersonalNotifs = (rows) => {
    const systemTypesToHide = new Set(['reopen_request','employee_request','general_request']);
    return rows
      .filter(n => !(isAdminOrRH && systemTypesToHide.has(n.type)))
      .map(n => ({
        id: `notif-${n.id}`,
        title: n.type === 'reopen_approved' ? 'Réouverture approuvée' : n.type === 'employee_approved' ? "Demande d'employés approuvée" : (n.type || 'Notification'),
        message: n.message || '',
        time: n.created_at ? new Date(n.created_at).toLocaleString() : '',
        read: !!n.read_at,
        type: 'info',
        action: null,
        createdByName: 'Système'
      }));
  };

  const fetchReopenRequests = async () => {
    try {
      setLoadingNotifs(true);
      const list = [];

      // Admin/RH pending items
      if (isAdminOrRH) {
        const [reopenResp, reqResp] = await Promise.all([
          fetch('http://localhost:3001/api/weekly-plannings/reopen-requests', { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/requests/pending', { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (reopenResp.ok) {
          const rows = await reopenResp.json();
          rows.forEach(r => list.push({
            id: `reopen-${r.id}`,
            title: `Demande de réouverture S${r.week_number} / ${r.year}`,
            message: r.reopen_reason ? `Raison: ${r.reopen_reason}` : 'Raison non fournie',
            time: r.reopen_requested_at ? new Date(r.reopen_requested_at).toLocaleString() : '',
            read: false,
            type: 'warning',
            planningId: r.id,
            createdByName: r.created_by_name,
            action: 'reopen'
          }));
        }
        if (reqResp.ok) {
          const rows = await reqResp.json();
          rows.forEach(r => list.push({
            id: `req-${r.id}`,
            title: r.type === 'employee' ? `Demande d'employés` : 'Demande générale',
            message: r.type === 'employee' && Array.isArray(r.employees)
              ? `Employés: ${r.employees.map(e=>`${e.nom} ${e.prenom}`).join(', ')}`
              : (r.message || ''),
            time: r.requested_at ? new Date(r.requested_at).toLocaleString() : '',
            read: false,
            type: 'info',
            requestId: r.id,
            createdByName: r.requested_by_name,
            action: 'request'
          }));
        }
      }

      // Personal notifications for all roles
      const personalResp = await fetch('http://localhost:3001/api/notifications?limit=50', { credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
      if (personalResp.ok) {
        const personalRows = await personalResp.json();
        list.push(...mapPersonalNotifs(personalRows));
      }

      setNotifications(list);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchReopenRequests();
    const i = setInterval(fetchReopenRequests, 30000);
    return () => clearInterval(i);
  }, [isAdminOrRH, token]);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: user?.role === 'chef' ? 'Atelier' : user?.role === 'rh' ? 'Ressources Humaines' : 'Administration'
  });

  const [settingsData, setSettingsData] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'fr',
    timezone: 'Europe/Paris'
  });

  const getRoleColor = () => {
    switch (user?.role) {
      case 'chef': return 'role-chef';
      case 'rh': return 'role-rh';
      case 'administrateur': return 'role-admin';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'chef': return '🔧';
      case 'rh': return '👥';
      case 'administrateur': return '⚙️';
      default: return '👤';
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'chef': return 'Chef d\'Atelier';
      case 'rh': return 'Ressources Humaines';
      case 'administrateur': return 'Administrateur';
      default: return 'Utilisateur';
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const approveFromNotif = async (item) => {
    try {
      let url = '';
      if (item.action === 'reopen' && item.planningId) {
        url = `http://localhost:3001/api/weekly-plannings/${item.planningId}/approve-reopen`;
      } else if (item.action === 'request' && item.requestId) {
        url = `http://localhost:3001/api/requests/${item.requestId}/approve`;
      } else {
        return alert('Type de notification inconnu');
      }
      const resp = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Authorization': `Bearer ${token}` } });
      if (!resp.ok) {
        let bodyText = await resp.text();
        try {
          const parsed = JSON.parse(bodyText);
          bodyText = parsed?.error || bodyText;
        } catch {}
        const norm = (bodyText || '').toLowerCase();
        const isAlreadyHandled = norm.includes('déjà') || norm.includes('deja') || norm.includes('already') || norm.includes('introuvable');
        if (isAlreadyHandled) {
          await fetchReopenRequests();
          alert('ℹ️ Cette demande a déjà été traitée.');
          return;
        }
        alert(`Échec approbation: ${bodyText}`);
        return;
      }
      await fetchReopenRequests();
      alert(item.action === 'reopen' ? '✅ Réouverture approuvée' : '✅ Demande approuvée');
    } catch (e) {
      alert('Erreur approbation');
    }
  };

  const dismissNotif = async (item) => {
    try {
      if (!item.id?.startsWith('notif-')) return; // only personal notif
      const notifId = item.id.split('notif-')[1];
      await fetch(`http://localhost:3001/api/notifications/${notifId}/read`, { method:'POST', credentials:'include', headers: { 'Authorization': `Bearer ${token}` } });
      await fetchReopenRequests();
    } catch {}
  };

  const clearAllNotifs = async () => {
    try {
      await fetch('http://localhost:3001/api/notifications/read-all', { method:'POST', credentials:'include', headers: { 'Authorization': `Bearer ${token}` } });
      await fetchReopenRequests();
    } catch {}
  };

  const markNotificationAsRead = (id) => {
    // Logique pour marquer comme lu (à implémenter avec le backend)
    console.log('Notification marquée comme lue:', id);
  };

  const handleProfileSave = () => {
    // Logique pour sauvegarder le profil (à implémenter avec le backend)
    console.log('Profil sauvegardé:', profileData);
    setShowProfile(false);
  };

  const handleSettingsSave = () => {
    // Logique pour sauvegarder les paramètres (à implémenter avec le backend)
    console.log('Paramètres sauvegardés:', settingsData);
    setShowSettings(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Tableau de Bord - {user?.name || getRoleLabel()}
              </h1>
            </div>

            {/* Actions et profil utilisateur */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <FiBell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </motion.button>

                {/* Dropdown notifications */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="space-x-3">
                          <button onClick={fetchReopenRequests} className="text-xs text-blue-600 hover:underline">Rafraîchir</button>
                          <button onClick={clearAllNotifs} className="text-xs text-red-600 hover:underline" title="Marquer toutes comme lues">Tout effacer</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotifs && (
                          <div className="p-4 text-sm text-gray-500">Chargement...</div>
                        )}
                        {!loadingNotifs && notifications.filter(n => !n.read).length === 0 && (
                          <div className="p-4 text-sm text-gray-500">Aucune notification</div>
                        )}
                        {notifications.filter(n => !n.read).map((n) => (
                          <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{n.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Par: {n.createdByName || 'Chef'}</p>
                                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{n.message}</p>
                                {n.time && <p className="text-xs text-gray-500 mt-2">{n.time}</p>}
                              </div>
                              <div className="flex items-center space-x-2 ml-3">
                                {/* Approve only for actionable items */}
                                {isAdminOrRH && (n.action === 'reopen' || n.action === 'request') && (
                                  <button 
                                    onClick={() => approveFromNotif(n)}
                                    className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg text-xs"
                                    title={n.action==='reopen'?"Approuver la réouverture":"Approuver la demande"}
                                  >
                                    <FiCheck className="h-4 w-4" />
                                  </button>
                                )}
                                {/* Dismiss personal notifications */}
                                {n.id?.startsWith('notif-') && (
                                  <button onClick={() => dismissNotif(n)} className="p-2 text-gray-500 hover:text-red-600" title="Ignorer">
                                    ✖
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Menu utilisateur */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 ${getRoleColor()} rounded-lg flex items-center justify-center text-white text-sm font-medium`}>
                    {getRoleIcon()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel()}</p>
                  </div>
                  <FiChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showUserMenu ? 'transform rotate-180' : ''}`} />
                </motion.button>

                {/* Menu déroulant */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setShowProfile(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <FiUser className="mr-3 h-4 w-4" />
                        Mon Profil
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowSettings(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <FiSettings className="mr-3 h-4 w-4" />
                        Paramètres
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowAbout(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <FiInfo className="mr-3 h-4 w-4" />
                        À propos
                      </button>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <FiLogOut className="mr-3 h-4 w-4" />
                          Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {(showUserMenu || showNotifications) && (
          <div className="fixed inset-0 z-40" onClick={() => { setShowUserMenu(false); setShowNotifications(false); }} />
        )}
      </header>

      {/* Modal Profil */}
      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Mon Profil</h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="input-field"
                    placeholder="+212 6 XX XX XX XX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <input
                    type="text"
                    value={profileData.department}
                    className="input-field bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowProfile(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProfileSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSave className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Paramètres */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notifications push</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsData.notifications}
                          onChange={(e) => setSettingsData({...settingsData, notifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notifications email</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsData.emailNotifications}
                          onChange={(e) => setSettingsData({...settingsData, emailNotifications: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Mode sombre</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData.darkMode}
                        onChange={(e) => setSettingsData({...settingsData, darkMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                  <select
                    value={settingsData.language}
                    onChange={(e) => setSettingsData({...settingsData, language: e.target.value})}
                    className="input-field"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSettingsSave}
                  className="btn-primary flex items-center space-x-2"
                >
                  <FiSave className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal À propos */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">À propos de l'application</h2>
                <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md">
                    <motion.div
                      className="absolute inset-0"
                      animate={{ backgroundPosition: ['0% 50%','100% 50%','0% 50%'] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      style={{ backgroundImage: 'linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)', backgroundSize: '200% 200%' }}
                    />
                    <motion.div
                      className="absolute inset-0"
                      animate={{ x: ['0px','1.5px','-1.5px','0px'] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ mixBlendMode: 'overlay', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 2px)' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative font-bold text-white text-lg leading-none select-none">
                        <motion.span
                          className="absolute -left-1"
                          style={{ color: '#22d3ee', textShadow: '0 0 6px rgba(34,211,238,0.6)' }}
                          animate={{ x: ['0px','2px','-2px','0px'], opacity: [0.85,1,0.8,0.85] }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                        >{'</>'}</motion.span>
                        <motion.span
                          className="absolute left-1"
                          style={{ color: '#f472b6', textShadow: '0 0 6px rgba(244,114,182,0.5)' }}
                          animate={{ x: ['0px','-2px','2px','0px'], opacity: [0.85,0.8,1,0.85] }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
                        >{'</>'}</motion.span>
                        <motion.span
                          className="relative"
                          animate={{ x: ['0px','0.6px','-0.6px','0px'] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.02 }}
                        >{'</>'}</motion.span>
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border border-indigo-200">CS</span>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">Youssef Dirgham</div>
                    <div className="text-sm text-gray-500">Développeur de l'application</div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  Plateforme interne de gestion du transport pour SONOCO : création et suivi des plannings hebdomadaires, gestion des employés/chefs, circuits et ateliers, avec un module unifié de tickets et de notifications (demandes d’employés, réouvertures). Si vous constatez un bug ou un comportement anormal, veuillez me contacter.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-gray-200">
                    <div className="text-xs uppercase text-gray-500 mb-1">Email</div>
                    <div className="flex items-center text-sm text-gray-800"><FiMail className="mr-2" /> youssefdirgham5@gmail.com</div>
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200">
                    <div className="text-xs uppercase text-gray-500 mb-1">Téléphone</div>
                    <div className="flex items-center text-sm text-gray-800"><FiPhone className="mr-2" /> +212703912986</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-gray-200">
                  <div className="text-xs uppercase text-gray-500 mb-1">Lien</div>
                  <a href="https://www.linkedin.com/in/youssef-dirgham-21274aab/" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline"><FiExternalLink className="mr-2" /> LinkedIn - Youssef Dirgham</a>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowAbout(false)} className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200">Fermer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header; 