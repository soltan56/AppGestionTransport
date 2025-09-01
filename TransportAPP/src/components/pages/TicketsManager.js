import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { FiX, FiChevronRight, FiChevronLeft, FiCheck, FiX as FiXIcon } from 'react-icons/fi';
import TicketDetailPage from './TicketDetailPage';

const StatusDot = ({ status }) => {
  const s = status === 'approved' ? 'resolved' : status;
  const color = s === 'resolved' ? 'bg-green-500' : s === 'rejected' ? 'bg-red-500' : s === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400';
  return <span className={`inline-block w-2 h-2 rounded-full ${color} mr-2`} aria-hidden />;
};

const TicketRow = ({ item, active }) => {
  return (
    <Link to={`/dashboard/notifications/tickets/${item.source}-${item.id}`} className={`block px-3 py-2 rounded-md border ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900 flex items-center"><StatusDot status={item.status} />#{item.id} — {item.type === 'employee' ? "Demande d'employés" : item.type === 'reopen' ? 'Réouverture planning' : 'Demande générale'}</div>
        <div className="text-xs text-gray-500">{new Date(item.requested_at).toLocaleDateString()}</div>
      </div>
      <div className="text-xs text-gray-600">Chef: {item.requested_by_name || '—'} • Statut: {item.status}</div>
      {item.type === 'employee' && item.employees?.length > 0 && (
        <div className="text-xs text-gray-700 truncate">Employés: {item.employees.map(e=>`${e.nom} ${e.prenom}`).join(', ')}</div>
      )}
    </Link>
  );
};

const ReopenDetail = ({ id }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`http://localhost:3001/api/tickets/reopen/${id}`, { credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
      if (!resp.ok) {
        const t = await resp.text();
        setError(t || 'Erreur de chargement');
        setData(null);
        return;
      }
      const row = await resp.json();
      setData(row);
    } catch (e) {
      setError('Erreur réseau');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const approve = async () => {
    try {
      setBusy(true);
      const token = localStorage.getItem('authToken');
      const resp = await fetch(`http://localhost:3001/api/weekly-plannings/${id}/approve-reopen`, { method:'POST', credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
      if (!resp.ok) {
        const t = await resp.text();
        alert(`Erreur: ${t}`);
        return;
      }
      setData(prev => prev ? { ...prev, status: 'resolved', requested_at: new Date().toISOString() } : prev);
      window.dispatchEvent(new Event('tickets:refresh'));
    } catch (e) {
      alert('Erreur approbation');
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    alert('Refus non implémenté côté backend. Souhaites-tu ajouter un endpoint /reject-reopen ?');
  };

  const canApprove = data && data.status !== 'resolved';

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-gray-500">Chargement...</div>}
      {error && !loading && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && data && (
        <div className="space-y-2">
          <div className="text-lg font-semibold text-gray-900">{data.subject || 'Réouverture planning'}</div>
          <div className="text-sm text-gray-700">Demandeur: {data.requested_by_name || '—'}</div>
          <div className="text-sm text-gray-700">Raison: {data.message || '—'}</div>
          <div className="text-xs text-gray-500">Demandé le: {data.requested_at ? new Date(data.requested_at).toLocaleString() : ''}</div>
          <div className="text-sm text-gray-700">Statut: <span className="font-medium">{data.status}</span></div>
          <div className="pt-2 flex items-center gap-2">
            {canApprove && (
              <button disabled={busy} onClick={approve} className="px-3 py-1.5 rounded bg-green-600 text-white text-sm inline-flex items-center"><FiCheck className="mr-1"/> Approuver</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TicketsList = ({ selectedId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sort = searchParams.get('sort') || 'date_desc';
  const chef = searchParams.get('chef') || '';
  const statut = searchParams.get('statut') || '';
  const type = searchParams.get('type') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const qs = new URLSearchParams({ sort, chef, statut, type, from, to, page: String(page), pageSize: String(pageSize) });
      const resp = await fetch(`http://localhost:3001/api/tickets/search?${qs.toString()}`, { credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
      if (!resp.ok) {
        const t = await resp.text();
        setError(t || 'Erreur de chargement');
        setItems([]);
        setTotal(0);
        return;
      }
      const data = await resp.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError('Erreur réseau');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [sort, chef, statut, type, from, to, page, pageSize]);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener('tickets:refresh', onRefresh);
    return () => window.removeEventListener('tickets:refresh', onRefresh);
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value == null) next.delete(key); else next.set(key, value);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const resetAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm">
            <span className="text-xs text-gray-600 mr-2">Chef</span>
            <input value={chef} onChange={e=>updateParam('chef', e.target.value)} placeholder="Nom chef" className="text-sm outline-none placeholder-gray-400" />
            {chef && <button onClick={()=>updateParam('chef','')} className="ml-1 text-gray-400 hover:text-gray-600"><FiX /></button>}
          </div>
          <select value={sort} onChange={e=>updateParam('sort', e.target.value)} className="border rounded-full px-3 py-1 bg-white shadow-sm text-sm">
            <option value="date_desc">Date (desc)</option>
            <option value="date_asc">Date (asc)</option>
            <option value="chef">Chef</option>
            <option value="type">Type</option>
            <option value="statut">Statut</option>
            <option value="priority">Priorité</option>
          </select>
          <button onClick={resetAll} className="ml-auto text-xs text-gray-600 hover:text-gray-800">Réinitialiser</button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm">
            <span className="text-xs text-gray-600 mr-2">Statut</span>
            <select value={statut} onChange={e=>updateParam('statut', e.target.value)} className="text-sm outline-none bg-transparent">
              <option value="">Tous</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="rejected">Rejeté</option>
            </select>
            {statut && <button onClick={()=>updateParam('statut','')} className="ml-1 text-gray-400 hover:text-gray-600"><FiX /></button>}
          </div>
          <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm">
            <span className="text-xs text-gray-600 mr-2">Type</span>
            <select value={type} onChange={e=>updateParam('type', e.target.value)} className="text-sm outline-none bg-transparent">
              <option value="">Tous</option>
              <option value="employee">Demande employés</option>
              <option value="reopen">Réouverture planning</option>
              <option value="general">Général</option>
            </select>
            {type && <button onClick={()=>updateParam('type','')} className="ml-1 text-gray-400 hover:text-gray-600"><FiX /></button>}
          </div>
          <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm">
            <span className="text-xs text-gray-600 mr-2">De</span>
            <input type="date" value={from} onChange={e=>updateParam('from', e.target.value)} className="text-sm outline-none" />
            {from && <button onClick={()=>updateParam('from','')} className="ml-1 text-gray-400 hover:text-gray-600"><FiX /></button>}
          </div>
          <div className="flex items-center border rounded-full px-2 py-1 bg-white shadow-sm">
            <span className="text-xs text-gray-600 mr-2">À</span>
            <input type="date" value={to} onChange={e=>updateParam('to', e.target.value)} className="text-sm outline-none" />
            {to && <button onClick={()=>updateParam('to','')} className="ml-1 text-gray-400 hover:text-gray-600"><FiX /></button>}
          </div>
          <div className="text-xs text-gray-500 ml-auto">{total} résultats</div>
        </div>
      </div>

      <div className="flex-1 overflow-auto divide-y divide-gray-100">
        {loading && <div className="p-3 text-sm text-gray-500">Chargement...</div>}
        {error && !loading && <div className="p-3 text-sm text-red-600">{error}</div>}
        {!loading && !error && items.length === 0 && <div className="p-3 text-sm text-gray-500">Aucun résultat</div>}
        {!loading && !error && items.map((it) => (
          <TicketRow key={it.source + '-' + it.id} item={it} active={String(selectedId?.split('-')[1]) === String(it.id)} />
        ))}
      </div>

      <div className="py-2 flex items-center justify-between">
        <button disabled={page<=1} onClick={()=>updateParam('page', String(Math.max(page-1,1)))} className={`px-2 py-1 rounded border ${page<=1?'text-gray-400 border-gray-200':'text-gray-700 border-gray-300 hover:bg-gray-50'}`}><FiChevronLeft className="inline" /> Préc.</button>
        <div className="text-xs text-gray-500">Page {page} / {Math.max(Math.ceil(total / pageSize), 1)}</div>
        <button disabled={page>=Math.max(Math.ceil(total / pageSize), 1)} onClick={()=>updateParam('page', String(page+1))} className={`px-2 py-1 rounded border ${page>=Math.max(Math.ceil(total / pageSize), 1)?'text-gray-400 border-gray-200':'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Suiv. <FiChevronRight className="inline" /></button>
      </div>
    </div>
  );
};

const TicketsManager = () => {
  const params = useParams();
  const selected = params.id || '';
  const [source, rawId] = selected.split('-');

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:h-[calc(100vh-10rem)]">
      <div className="md:col-span-6 bg-white rounded-xl shadow p-3 overflow-hidden">
        <TicketsList selectedId={selected} />
      </div>
      <div className="md:col-span-6 bg-white rounded-xl shadow p-3 overflow-auto">
        {selected ? (
          source === 'reopen' ? <ReopenDetail id={rawId} /> : <TicketDetailPage />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">Sélectionnez un ticket dans la liste</div>
        )}
      </div>
    </div>
  );
};

export default TicketsManager; 