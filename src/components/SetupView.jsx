import React, { useRef } from 'react';
import { useDraft } from '../context/DraftContext';
import { Save, Trash2, RotateCcw, Download, Upload, RefreshCw } from 'lucide-react';

const SetupView = () => {
  const { teams, players, pickHistory, updateTeamName, resetDraft, resetAll, importData, draftSettings, updateDraftSettings, currentPickIndex, assignCaptain } = useDraft();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = {
      teams,
      players,
      pickHistory,
      exportDate: new Date().toISOString()
    };
    
    // Create a blob and trigger download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flag_draft_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNameChange = (index, value) => {
    updateTeamName(index, value);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (jsonData.teams || jsonData.players) {
          importData(jsonData);
          alert("Backup restauré avec succès !");
        } else {
           alert("Ce fichier de backup n'est pas valide.");
        }
      } catch (error) {
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const forceRefresh = () => {
    window.location.reload(true);
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-neon m-0">Paramètres ⚙️</h2>
        <button onClick={forceRefresh} className="btn-secondary" style={{padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
          <RefreshCw size={16} /> Forcer MÀJ
        </button>
      </div>
      
      <div className="glass-card mb-4">
        <h3 className="mb-2">Structure du Draft</h3>
        <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>
          Ces réglages sont bloqués une fois que le repêchage a commencé.
        </p>

        <div className="form-group">
          <label>Nombre d'équipes ({draftSettings.numTeams})</label>
          <input 
            type="range" 
            min="2" max="10" 
            value={draftSettings.numTeams}
            onChange={(e) => updateDraftSettings({ numTeams: parseInt(e.target.value) })}
            disabled={currentPickIndex > 0}
            className="w-full"
          />
        </div>

        <div className="form-group mt-4">
          <label>Joueuses par équipe / Rondes ({draftSettings.numRounds})</label>
          <input 
            type="range" 
            min="1" max="25" 
            value={draftSettings.numRounds}
            onChange={(e) => updateDraftSettings({ numRounds: parseInt(e.target.value) })}
            disabled={currentPickIndex > 0}
            className="w-full"
          />
        </div>

        <div className="form-group mt-4">
          <label>Max. Extérieur / Recrues (Total Ligue: {draftSettings.maxRookiesTotal})</label>
          <input 
            type="range" 
            min="0" max="50" 
            value={draftSettings.maxRookiesTotal}
            onChange={(e) => updateDraftSettings({ maxRookiesTotal: parseInt(e.target.value) })}
            disabled={currentPickIndex > 0}
            className="w-full"
          />
          <p className="text-muted mt-1" style={{fontSize: '0.75rem'}}>Dès que ce nombre de recrues est repêché au total, les autres deviennent bloquées.</p>
        </div>
      </div>

      <div className="glass-card mb-4">
        <h3 className="mb-2">Noms des Équipes</h3>
        <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>
          L'ordre du draft sera déterminé selon ces équipes : 1-2-3-4-4-3-2-1...
        </p>

        {teams.map((team, index) => {
          const captain1 = players.find(p => p.isCaptain && p.captainTeamId === team.id && p.captainSlot === 1);
          const captain2 = players.find(p => p.isCaptain && p.captainTeamId === team.id && p.captainSlot === 2);

          return (
            <div key={team.id} className="form-group" style={{marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: index < teams.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none'}}>
              <label>Position {index + 1} & Nom</label>
              <input 
                type="text" 
                className="input-field mb-2" 
                value={team.name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Équipe ${index + 1}`}
              />
              
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <div style={{flex: 1}}>
                  <select 
                    className="input-field" 
                    style={{fontSize: '0.8rem', padding: '0.5rem'}}
                    value={captain1 ? captain1.id : ''}
                    onChange={(e) => assignCaptain(team.id, 1, e.target.value)}
                    disabled={currentPickIndex > 0}
                  >
                    <option value="">-- Capitaine 1 --</option>
                    {players.map(p => {
                      if (!p.isDrafted || p.id === captain1?.id) {
                        return <option key={p.id} value={p.id}>{p.name} {p.isRookie ? '🌿' : ''}</option>;
                      }
                      return null;
                    })}
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <select 
                    className="input-field" 
                    style={{fontSize: '0.8rem', padding: '0.5rem'}}
                    value={captain2 ? captain2.id : ''}
                    onChange={(e) => assignCaptain(team.id, 2, e.target.value)}
                    disabled={currentPickIndex > 0}
                  >
                    <option value="">-- Capitaine 2 --</option>
                    {players.map(p => {
                      if (!p.isDrafted || p.id === captain2?.id) {
                        return <option key={p.id} value={p.id}>{p.name} {p.isRookie ? '🌿' : ''}</option>;
                      }
                      return null;
                    })}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card mb-4">
        <h3 className="mb-2" style={{color: 'var(--accent-neon)'}}>Sauvegarde</h3>
        <p className="text-muted mb-4" style={{fontSize: '0.875rem'}}>
          Exporte toutes tes données, ou restaure une ancienne sauvegarde.
        </p>

        <div className="flex flex-col gap-2">
          <button onClick={handleExport} className="btn-secondary" style={{width: '100%', borderColor: 'var(--accent-neon)', color: 'var(--text-main)'}}>
            <Download size={18} className="text-neon" />
            Exporter les données (Backup)
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            style={{display: 'none'}} 
          />
          <button onClick={() => fileInputRef.current.click()} className="btn-secondary" style={{width: '100%'}}>
            <Upload size={18} />
            Importer un fichier Backup (.json)
          </button>
        </div>
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
