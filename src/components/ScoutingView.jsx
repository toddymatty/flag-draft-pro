import React, { useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { Plus, Trash2, Search, Zap, Hand, Flag, Brain, Save, Pencil, Heart } from 'lucide-react';

const ScoutingView = () => {
  const { players, addPlayer, deletePlayer, updatePlayer } = useDraft();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    position: 'Polyvalente',
    speed: 5,
    hands: 5,
    flag: 5,
    iq: 5,
    sportsmanship: 5,
    notes: ''
  });

  const handleOpenEdit = (player) => {
    setFormData({
      name: player.name,
      position: player.position,
      speed: player.speed,
      hands: player.hands,
      flag: player.flag,
      iq: player.iq,
      sportsmanship: player.sportsmanship || 5,
      notes: player.notes || ''
    });
    setEditingId(player.id);
    setShowAddForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: '', position: 'Polyvalente', speed: 5, hands: 5, flag: 5, iq: 5, sportsmanship: 5, notes: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    if (editingId) {
      updatePlayer(editingId, formData);
    } else {
      addPlayer(formData);
    }
    
    resetForm();
  };

  const filteredPlayers = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.globalScore - a.globalScore);

  return (
    <div className="animate-slide-up">
      <div className="flex-between mb-4">
        <h2 className="text-2xl text-neon">Scouting 📋</h2>
        <button className="btn-secondary" onClick={() => { if(showAddForm) resetForm(); else setShowAddForm(true); }}>
          <Plus size={20} />
          {showAddForm ? 'Fermer' : 'Ajouter'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card mb-4 animate-slide-up" style={{border: '1px solid var(--accent-neon)'}}>
          <h3 className="mb-2">{editingId ? 'Modifier la joueuse' : 'Nouvelle Joueuse'}</h3>
          
          <div className="form-group">
            <label>Nom complet</label>
            <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Sarah Connor" required />
          </div>

          <div className="form-group">
            <label>Position principale</label>
            <select className="input-field" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
              <option>Polyvalente</option>
              <option>Capitaine</option>
              <option>Quarterback (QB)</option>
              <option>Receveuse (WR)</option>
              <option>Demi Défensif (DB)</option>
              <option>Rusher (R)</option>
              <option>Centre (C)</option>
            </select>
          </div>

          <div className="mb-4">
            <h4 className="mb-2 text-muted">Évaluations (/10)</h4>
            <div className="grid grid-cols-2 gap-2" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              
              <div className="form-group">
                <label className="flex items-center gap-1"><Zap size={14}/> Vitesse</label>
                <input type="number" min="1" max="10" className="input-field" value={formData.speed} onChange={e => setFormData({...formData, speed: e.target.value})} required/>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Hand size={14}/> Mains (Attrape)</label>
                <input type="number" min="1" max="10" className="input-field" value={formData.hands} onChange={e => setFormData({...formData, hands: e.target.value})} required/>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Flag size={14}/> Retrait Flag</label>
                <input type="number" min="1" max="10" className="input-field" value={formData.flag} onChange={e => setFormData({...formData, flag: e.target.value})} required/>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Brain size={14}/> QI Football</label>
                <input type="number" min="1" max="10" className="input-field" value={formData.iq} onChange={e => setFormData({...formData, iq: e.target.value})} required/>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-1"><Heart size={14}/> Esprit Sportif</label>
                <input type="number" min="1" max="10" className="input-field" value={formData.sportsmanship} onChange={e => setFormData({...formData, sportsmanship: e.target.value})} required/>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Notes (Optionnel)</label>
            <input type="text" className="input-field" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Rapide mais petite..." />
          </div>

          <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>
            <Save size={20} />
            {editingId ? 'Mettre à jour' : 'Enregistrer Joueuse'}
          </button>
        </form>
      )}

      <div className="form-group mb-4 relative">
        <label>Rechercher dans la base ({players.length} joueuses)</label>
        <div style={{position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
          <input 
            type="text" 
            className="input-field" 
            style={{paddingLeft: '2.5rem'}}
            placeholder="Nom de la joueuse..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="players-list">
        {filteredPlayers.length === 0 ? (
          <div className="text-center text-muted mt-4 p-4 glass-card">
            Aucune joueuse trouvée. Ajoutez-en une !
          </div>
        ) : (
          filteredPlayers.map(player => (
            <div key={player.id} className={`player-card ${player.isDrafted ? 'is-drafted' : ''}`}>
              <div style={{flex: 1}}>
                <div className="flex items-center gap-2 mb-1" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{fontWeight: 800, fontSize: '1.1rem'}}>{player.name}</span>
                  <span className={`score-badge ${player.globalScore >= 8.5 ? 'elite' : player.globalScore >= 7.0 ? 'high' : player.globalScore >= 5.5 ? 'med' : ''}`}>
                    ⭐ {player.globalScore}
                  </span>
                  {player.isDrafted && (
                    <span style={{fontSize: '0.7rem', background: '#ef4444', padding: '2px 6px', borderRadius: '4px', color:'white'}}>DRAFTÉE</span>
                  )}
                </div>
                <div className="text-muted" style={{fontSize: '0.8rem'}}>Pos: {player.position} {player.notes ? `• ${player.notes}` : ''}</div>
                
                <div className="stats-grid">
                  <div className="stat-item">VIT <span>{player.speed}</span></div>
                  <div className="stat-item">ATT <span>{player.hands}</span></div>
                  <div className="stat-item">FLG <span>{player.flag}</span></div>
                  <div className="stat-item">QI <span>{player.iq}</span></div>
                  <div className="stat-item">ESP <span>{player.sportsmanship || 5}</span></div>
                </div>
              </div>

              {!player.isDrafted && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '0.5rem'}}>
                  <button className="btn-icon" onClick={() => handleOpenEdit(player)} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                    <Pencil size={18} />
                  </button>
                  <button className="btn-icon" onClick={() => deletePlayer(player.id)} style={{background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', borderRadius: '8px'}}>
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoutingView;
