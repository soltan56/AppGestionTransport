import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DebugChefs = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [chefs, setChefs] = useState([]);

  const testChefs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      setDebugInfo(prev => prev + `🔑 Token: ${token ? token.substring(0, 20) + '...' : 'AUCUN'}\n`);
      setDebugInfo(prev => prev + `👤 User: ${user?.name} (${user?.role})\n`);
      
      const response = await fetch('http://localhost:3001/api/chefs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      setDebugInfo(prev => prev + `📡 Status: ${response.status}\n`);
      
      if (response.ok) {
        const chefsData = await response.json();
        setDebugInfo(prev => prev + `✅ Chefs reçus: ${chefsData.length}\n`);
        setChefs(chefsData);
        
        chefsData.forEach((chef, index) => {
          setDebugInfo(prev => prev + `   ${index + 1}. ${chef.name} (ID: ${chef.id})\n`);
        });
      } else {
        const errorText = await response.text();
        setDebugInfo(prev => prev + `❌ Erreur: ${errorText}\n`);
      }
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Exception: ${error.message}\n`);
    }
  };

  useEffect(() => {
    testChefs();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #007bff', 
      padding: '15px',
      zIndex: 9999,
      fontSize: '12px',
      width: '400px',
      height: '300px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>🔧 Debug Chefs</h4>
      <pre style={{ margin: 0, fontSize: '11px' }}>{debugInfo}</pre>
      
      {chefs.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Select test:</strong>
          <select style={{ width: '100%', marginTop: '5px' }}>
            <option value="">Sélectionner un chef...</option>
            {chefs.map(chef => (
              <option key={chef.id} value={chef.id}>
                {chef.name} (ID: {chef.id})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <button 
        onClick={() => { setDebugInfo(''); testChefs(); }}
        style={{ 
          marginTop: '10px', 
          padding: '5px 10px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Retester
      </button>
    </div>
  );
};

export default DebugChefs;