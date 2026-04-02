import React from 'react';
import { useDraft } from '../context/DraftContext';
import { Save, Trash2, RotateCcw } from 'lucide-react';

const SetupView = () => {
  const { teams, updateTeamName, resetDraft, resetAll } = useDraft();

  const handleNameChange = (index, value) => {
    updateTeamName(index, value);
  };

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl mb-4 text-neon">Paramètres ⚙️</h2>
      
      <div className="glass-card mb-4">
        <h3 className="mb-2">Noms des Équipes</h3>
        <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>
          L'ordre du draft sera déterminé selon ces équipes : 1-2-3-4-4-3-2-1...
        </p>

        {teams.map((team, index) => (
          <div key={team.id} className="form-group">
            <label>Position {index + 1}</label>
            <input 
              type="text" 
              className="input-field" 
              value={team.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder={`Équipe ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="glass-card mb-4">
        <h3 className="mb-2" style={{color: 'var(--danger)'}}>Zone Danger</h3>
        <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>
          Réinitialisation des données.
        </p>

        <div className="flex flex-col gap-2">
          <button onClick={resetDraft} className="btn-secondary" style={{width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)'}}>
            <RotateCcw size={18} />
            Recommencer le Draft (Garder les joueuses)
          </button>

          <button onClick={resetAll} className="btn-danger" style={{width: '100%', padding: '1rem', marginTop: '0.5rem', fontWeight: "bold", display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
            <Trash2 size={18} />
            Effacer toutes les données (Joueuses + Draft)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupView;
