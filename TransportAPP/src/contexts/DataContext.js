import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

// Génération d'ID unique
let idCounter = Date.now();
const generateUniqueId = () => {
  return ++idCounter;
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
        loading: false
      };
    
    case 'SET_EMPLOYEES':
      return {
        ...state,
        employees: action.payload,
        loading: false
      };
    
    case 'SET_ATELIERS':
      return {
        ...state,
        ateliers: action.payload
      };
    
    case 'ADD_PLANNING':
      return {
        ...state,
        plannings: [...state.plannings, { ...action.payload, id: generateUniqueId() }]
      };
    
    case 'ADD_EMPLOYEE':
      return {
        ...state,
        employees: [...state.employees, action.payload]
      };
    
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id ? action.payload : emp
        )
      };
    
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    
    case 'ADD_BUS':
      return {
        ...state,
        buses: [...state.buses, { ...action.payload, id: generateUniqueId() }]
      };
    
    case 'ADD_CIRCUIT':
      return {
        ...state,
        circuits: [...state.circuits, { ...action.payload, id: generateUniqueId() }]
      };
    
    case 'ADD_ATELIER':
      return {
        ...state,
        ateliers: [...state.ateliers, { ...action.payload, id: generateUniqueId() }]
      };
    
    case 'UPDATE_PLANNING':
      return {
        ...state,
        plannings: state.plannings.map(p => 
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };
    
    case 'DELETE_PLANNING':
      return {
        ...state,
        plannings: state.plannings.filter(p => p.id !== action.payload)
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

const initialState = {
  loading: false,
  plannings: [],
  employees: [],
  buses: [],
  circuits: [],
  ateliers: [],
  pickupPoints: [],
  teams: ['Matin', 'Soir', 'Nuit', 'Normal'],
  users: []
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Charger les données depuis localStorage au démarrage (sauf employés)
  useEffect(() => {
    const savedData = localStorage.getItem('transportData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // Charger tout sauf les employés (qui viennent de l'API)
        const { employees, ...otherData } = data;
        dispatch({ type: 'LOAD_DATA', payload: otherData });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
  }, []);

  // Charger les employés uniquement si l'utilisateur est authentifié
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 Utilisateur authentifié, chargement des employés...');
      fetchEmployees();
    } else if (!isAuthenticated) {
      // Pas authentifié, vider les employés
      dispatch({ type: 'SET_EMPLOYEES', payload: [] });
    }
  }, [isAuthenticated, user]);

  // Sauvegarder dans localStorage à chaque changement (sauf employés)
  useEffect(() => {
    if (!state.loading) {
      const { employees, ...dataToSave } = state;
      localStorage.setItem('transportData', JSON.stringify(dataToSave));
    }
  }, [state]);

  // API calls pour les employés
  const fetchEmployees = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('authToken');
      

      
      const response = await fetch('http://localhost:3001/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const employees = await response.json();

        dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      } else if (response.status === 401) {
        console.error('Token invalide - veuillez vous reconnecter');
        dispatch({ type: 'SET_EMPLOYEES', payload: [] });
      } else {
        console.error('Erreur lors de la récupération des employés');
        const errorData = await response.json();
        console.error('Détail de l\'erreur:', errorData.error);
        dispatch({ type: 'SET_EMPLOYEES', payload: [] });
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      dispatch({ type: 'SET_EMPLOYEES', payload: [] });
    }
  };

  // Actions pour gérer les plannings
  const addPlanning = (planning) => {
    dispatch({ type: 'ADD_PLANNING', payload: planning });
  };

  const updatePlanning = (planning) => {
    dispatch({ type: 'UPDATE_PLANNING', payload: planning });
  };

  const deletePlanning = (id) => {
    dispatch({ type: 'DELETE_PLANNING', payload: id });
  };

  // Actions pour gérer les employés
  const addEmployee = async (employee) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: employee.nom,
          prenom: employee.prenom,
          email: employee.email || null,
          telephone: employee.telephone || null,
          equipe: employee.equipe || null,
          // accept either atelier_id or atelier name
          atelier_id: employee.atelier_id || undefined,
          atelier: employee.atelier || undefined,
          point_ramassage: employee.pointRamassage || employee.point_ramassage || null,
          circuit_affecte: employee.circuit || employee.circuit_affecte || null,
          date_embauche: employee.dateEmbauche || employee.date_embauche || null,
          type_contrat: employee.type_contrat || employee.typeContrat || 'CDI'
        }),
      });
      
      if (response.ok) {
        const newEmployee = await response.json();
        // Refresh from API to keep state consistent
        await fetchEmployees();
        return newEmployee;
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de l\'ajout de l\'employé:', errorData.error);
        return null;
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return null;
    }
  };

  const updateEmployee = async (id, employee) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom: employee.nom,
          prenom: employee.prenom,
          email: employee.email || null,
          telephone: employee.telephone || null,
          equipe: employee.equipe || null,
          atelier_id: employee.atelier_id || undefined,
          atelier: employee.atelier || undefined,
          point_ramassage: employee.pointRamassage || employee.point_ramassage || null,
          circuit_affecte: employee.circuit || employee.circuit_affecte || null,
          date_embauche: employee.dateEmbauche || employee.date_embauche || null,
          type_contrat: employee.type_contrat || employee.typeContrat || 'CDI'
        }),
      });
      
      if (response.ok) {
        const updatedEmployee = await response.json();
        await fetchEmployees();
        return updatedEmployee;
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la modification de l\'employé:', errorData.error);
        return null;
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return null;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
        return true;
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la suppression de l\'employé:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return false;
    }
  };

  // Actions pour gérer les bus
  const addBus = (bus) => {
    dispatch({ type: 'ADD_BUS', payload: bus });
  };

  // Actions pour gérer les circuits
  const addCircuit = (circuit) => {
    dispatch({ type: 'ADD_CIRCUIT', payload: circuit });
  };

  // Actions pour gérer les ateliers
  const addAtelier = (atelier) => {
    dispatch({ type: 'ADD_ATELIER', payload: atelier });
  };

  // Récupérer les ateliers depuis l'API
  const fetchAteliers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/ateliers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const ateliers = await response.json();
        dispatch({ type: 'SET_ATELIERS', payload: ateliers });
        return ateliers;
      } else {
        console.error('Erreur lors de la récupération des ateliers');
        return [];
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return [];
    }
  };

  // Statistiques calculées
  const getStats = () => {
    return {
      totalPlannings: state.plannings.length,
      totalEmployees: state.employees.length,
      totalBuses: state.buses.length,
      totalCircuits: state.circuits.length,
      activePlannings: state.plannings.filter(p => p.status === 'actif').length,
      availableBuses: state.buses.filter(b => !b.assigned).length,
      employeesByTeam: state.teams.map(team => ({
        team,
        count: state.employees.filter(e => e.team === team).length
      }))
    };
  };

  const value = {
    ...state,
    addPlanning,
    updatePlanning,
    deletePlanning,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addBus,
    addCircuit,
    addAtelier,
    getStats,
    fetchEmployees,
    fetchAteliers
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 