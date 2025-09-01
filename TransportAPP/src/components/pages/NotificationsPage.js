import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterChef, setFilterChef] = useState('');
  const [sortKey, setSortKey] = useState('created_at');

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const resp = await fetch('http://localhost:3001/api/notifications?limit=100', { credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
      if (!resp.ok) return setItems([]);
      const rows = await resp.json();
      setItems(rows);
    } catch(e) { setItems([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:3001/api/notifications/${id}/read`, { method:'POST', credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
      load();
    } catch(e) {}
  };

  const formatType = (t) => ({
    reopen_request: "Demande de réouverture",
    reopen_approved: "Réouverture approuvée",
    employee_request: "Demande d'employés",
    employee_approved: "Demande d'employés approuvée"
  }[t] || t);

  const parsedItems = useMemo(() => items.map(n => {
    let payload = null;
    try { payload = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload; } catch {}
    return { ...n, _payload: payload, _requestedBy: payload?.requestedByName || '' };
  }), [items]);

  const filteredSorted = useMemo(() => {
    let list = parsedItems;
    if (filterChef) {
      list = list.filter(n => (n._requestedBy || '').toLowerCase().includes(filterChef.toLowerCase()));
    }
    if (sortKey === 'created_at') {
      list = [...list].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (sortKey === 'by_chef') {
      list = [...list].sort((a,b) => (a._requestedBy||'').localeCompare(b._requestedBy||''));
    }
    return list;
  }, [parsedItems, filterChef, sortKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Notifications</h1>
        <button onClick={load} className="text-sm text-blue-600 hover:underline">Rafraîchir</button>
      </div>

      <div className="flex items-center space-x-3">
        <input value={filterChef} onChange={e=>setFilterChef(e.target.value)} placeholder="Filtrer par chef (nom)" className="border rounded px-2 py-1 text-sm" />
        <select value={sortKey} onChange={e=>setSortKey(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="created_at">Tri par date</option>
          <option value="by_chef">Tri par chef</option>
        </select>
      </div>

      <div className="card">
        {loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
        {!loading && filteredSorted.length === 0 && <div className="p-4 text-sm text-gray-500">Aucune notification</div>}
        <div className="space-y-3">
          {filteredSorted.map(n => {
            const reqId = n._payload?.requestId;
            const requestedBy = n._payload?.requestedByName;
            return (
              <div key={n.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center"><FiBell /></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatType(n.type)} {reqId ? (<>
                        <span className="mx-1">—</span>
                        <Link to={`/dashboard/tickets/${reqId}`} className="text-blue-600 hover:underline">#{reqId}</Link>
                      </>) : null}
                    </div>
                    {requestedBy && (
                      <div className="text-xs text-gray-600">Par: <span className="font-medium">{requestedBy}</span></div>
                    )}
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{n.message}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1"><FiClock className="h-3 w-3 mr-1" />{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!n.read_at && (<button onClick={()=>markRead(n.id)} className="px-2 py-1 bg-green-600 text-white rounded inline-flex items-center space-x-1"><FiCheck className="h-4 w-4" /><span>Marquer comme lu</span></button>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 