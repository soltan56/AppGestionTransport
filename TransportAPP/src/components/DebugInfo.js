import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('authToken');
  
  const testAPI = async () => {
    try {
      console.log('🧪 Test API depuis frontend...');
      console.log('🔑 Token:', token);
      console.log('👤 User:', user);
      
      const response = await fetch('http://localhost:3001/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const employees = await response.json();
        console.log('✅ Employés reçus:', employees.length);
        console.log('👥 Premiers employés:', employees.slice(0, 3));
      } else {
        const error = await response.text();
        console.log('❌ Erreur API:', error);
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>🔧 Debug Info</h4>
      <p><strong>User:</strong> {user?.name} ({user?.role})</p>
      <p><strong>User ID:</strong> {user?.id}</p>
      <p><strong>Token:</strong> {token?.substring(0, 20)}...</p>
      <button onClick={testAPI} style={{ 
        padding: '5px 10px', 
        background: '#007bff', 
        color: 'white', 
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer'
      }}>
        Test API
      </button>
    </div>
  );
};

export default DebugInfo;