import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiUser, FiCheck, FiX, FiPlay, FiFlag } from 'react-icons/fi';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const extractId = () => {
    if (!id) return '';
    const parts = String(id).split('-');
    return parts.length > 1 ? parts[1] : id;
  };

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const numericId = extractId();
      const resp = await fetch(`http://localhost:3001/api/requests/${numericId}`, { credentials:'include', headers:{ 'Authorization': `Bearer ${token}` }});
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

  const act = async (action) => {
    try {
      setBusy(true);
      const token = localStorage.getItem('authToken');
      const numericId = extractId();
      const endpoints = {
        approve: `http://localhost:3001/api/requests/${numericId}/approve`,
        reject: `http://localhost:3001/api/requests/${numericId}/reject`,
        in_progress: `http://localhost:3001/api/requests/${numericId}/in-progress`,
        resolve: `http://localhost:3001/api/requests/${numericId}/resolve`
      };
      const resp = await fetch(endpoints[action], { method:'POST', credentials:'include', headers: { 'Authorization': `Bearer ${token}` } });
      if (!resp.ok) {
        const t = await resp.text();
        alert(`Erreur: ${t}`);
        return;
      }
      const nextStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'in_progress' ? 'in_progress' : 'resolved';
      setData(prev => prev ? { ...prev, status: nextStatus } : prev);
      window.dispatchEvent(new Event('tickets:refresh'));
    } catch (e) {
      alert('Erreur action');
    } finally {
      setBusy(false);
    }
  };

  const canApproveOrReject = data && data.status === 'pending';
  const canMarkInProgress = data && data.status === 'pending';
  const canResolve = data && data.status === 'in_progress';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline inline-flex items-center">
          <FiArrowLeft className="mr-2" /> Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Ticket #{extractId()}</h1>
        <div />
      </div>

      <div className="card p-4">
        {loading && <div className="text-sm text-gray-500">Chargement...</div>}
        {error && !loading && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-900 font-medium">
                {data.type === 'employee' ? "Demande d'employés" : 'Demande générale'}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <FiClock className="h-3 w-3 mr-1" /> {data.requested_at ? new Date(data.requested_at).toLocaleString() : ''}
              </div>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {data.message || '—'}
            </div>
            <div className="text-sm text-gray-700 flex items-center"><FiUser className="h-4 w-4 mr-2" /> Demandeur: {data.requested_by_name || '—'}</div>
            <div className="text-sm text-gray-700">Statut: <span className="font-medium">{data.status}</span></div>
            {data.type === 'employee' && (
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Employés concernés ({data.employee_count || 0})</div>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {(data.employees || []).map((e) => (
                    <li key={e.id}>{e.nom} {e.prenom}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="pt-2 flex items-center gap-2">
              {canApproveOrReject && (
                <>
                  <button disabled={busy} onClick={()=>act('approve')} className="px-3 py-1.5 rounded bg-green-600 text-white text-sm inline-flex items-center"><FiCheck className="mr-1"/> Accepter</button>
                  <button disabled={busy} onClick={()=>act('reject')} className="px-3 py-1.5 rounded bg-red-600 text-white text-sm inline-flex items-center"><FiX className="mr-1"/> Refuser</button>
                </>
              )}
              {canMarkInProgress && (
                <button disabled={busy} onClick={()=>act('in_progress')} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm inline-flex items-center"><FiPlay className="mr-1"/> En cours</button>
              )}
              {canResolve && (
                <button disabled={busy} onClick={()=>act('resolve')} className="px-3 py-1.5 rounded bg-indigo-600 text-white text-sm inline-flex items-center"><FiFlag className="mr-1"/> Résoudre</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailPage; 