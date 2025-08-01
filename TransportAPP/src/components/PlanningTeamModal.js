import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const equipes = [
  { key: 'Soir', color: 'bg-purple-400', text: 'text-purple-900' },
  { key: 'Matin', color: 'bg-yellow-300', text: 'text-yellow-900' },
  { key: 'Nuit', color: 'bg-blue-400', text: 'text-blue-900' },
  { key: 'Normal', color: 'bg-green-300', text: 'text-green-900' },
];

const PlanningTeamModal = ({ open, onClose, semaine, annee, atelier_id, role, employes = [], affectations = {}, onAffectationChange }) => {
  const [selectedEquipe, setSelectedEquipe] = useState(equipes[0].key);

  const allAffectes = Object.entries(affectations).reduce((acc, [equipe, ids]) => {
    ids.forEach((id) => {
      acc[id] = equipe;
    });
    return acc;
  }, {});

  const employesEquipe = employes.filter((e) => {
    if (role === 'admin') return true;
    return e.atelier_id === atelier_id;
  });
  const employesForEquipe = employesEquipe.filter((e) => e.equipe === selectedEquipe);

  const handleToggle = (employeId) => {
    const dejaAffecte = allAffectes[employeId];
    if (dejaAffecte && dejaAffecte !== selectedEquipe) return; 
    const current = affectations[selectedEquipe] || [];
    let next;
    if (current.includes(employeId)) {
      next = current.filter((id) => id !== employeId);
    } else {
      next = [...current, employeId];
    }
    onAffectationChange({ ...affectations, [selectedEquipe]: next });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 relative"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={onClose}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Affectation des équipes – S{semaine} {annee}
            </h2>
            <div className="flex gap-2 mb-6">
              {equipes.map((eq) => (
                <button
                  key={eq.key}
                  className={clsx(
                    'px-4 py-2 rounded-full font-semibold transition',
                    eq.color,
                    eq.text,
                    selectedEquipe === eq.key ? 'ring-2 ring-offset-2 ring-blue-400 scale-105' : 'opacity-70 hover:opacity-100'
                  )}
                  onClick={() => setSelectedEquipe(eq.key)}
                >
                  {eq.key}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employesForEquipe.length === 0 && (
                <div className="text-gray-400 italic">Aucun employé dans cette équipe.</div>
              )}
              {employesForEquipe.map((e) => {
                const dejaAffecte = allAffectes[e.id];
                const checked = (affectations[selectedEquipe] || []).includes(e.id);
                return (
                  <label
                    key={e.id}
                    className={clsx(
                      'flex items-center gap-3 p-2 rounded transition',
                      checked ? 'bg-blue-100' : '',
                      dejaAffecte && dejaAffecte !== selectedEquipe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={checked}
                      disabled={dejaAffecte && dejaAffecte !== selectedEquipe}
                      onChange={() => handleToggle(e.id)}
                    />
                    <span className="font-medium text-gray-700">{e.nom}</span>
                    {dejaAffecte && dejaAffecte !== selectedEquipe && (
                      <span className="ml-2 text-xs text-gray-400">Déjà dans {dejaAffecte}</span>
                    )}
                  </label>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={() => onClose()}
              >
                Valider
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanningTeamModal; 