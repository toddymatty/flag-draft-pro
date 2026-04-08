import React, { useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { Trophy, AlertCircle, ChevronLeft, UserPlus, Undo2, Search, Leaf, Lock } from 'lucide-react';

const LiveDraftView = () => {
  const { 
    teams, currentTeam, isDraftComplete, pickHistory, 
    players, availablePlayers, draftPlayer, undoLastPick,
    DRAFT_SEQUENCE, currentPickIndex, MAX_PICKS, draftSettings,
    isSimulationMode, enterSimulationMode, exitSimulationMode,
    autoDraftPick, getPickGrade
  } = useDraft();

  const [showSelector, setShowSelector] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('ia');

  if (isDraftComplete) {
    return (
      <div className="glass-card text-center animate-slide-up" style={{border: '1px solid var(--accent-neon)'}}>
        <Trophy size={64} className="text-neon mx-auto mb-4" style={{margin: '0 auto'}}/>
        <h2 className="text-2xl mb-2">Draft Terminé !</h2>
        <p className="text-muted mb-4">Les équipes sont maintenant complètes.</p>
        <button className="btn-secondary" onClick={undoLastPick}>
          <Undo2 size={18} /> Annuler le dernier choix
        </button>
      </div>
    );
  }

  // Next teams preview
  const nextPicks = DRAFT_SEQUENCE.slice(currentPickIndex + 1, currentPickIndex + 4)
    .map(idx => teams[idx]);

  const handleDraftPlayer = (playerId) => {
    draftPlayer(playerId);
    setShowSelector(false);
    setSearch('');
  };

  const draftedPlayers = players.filter(p => p.isDrafted);
  const rookiesDraftedCount = draftedPlayers.filter(p => p.isRookie).length;
  const maxRookiesReached = rookiesDraftedCount >= draftSettings.maxRookiesTotal;

  // --- MOTEUR INTELLIGENT DE RECOMMANDATION (ALGORITHME) ---
  // 1. Analyser l'alignement actuel de l'équipe "On the clock"
  const currentTeamRoster = players.filter(p => p.draftedBy === currentTeam?.id);
  const qbCount = currentTeamRoster.filter(p => p.position === 'Quarterback (QB)').length;
  const cCount = currentTeamRoster.filter(p => p.position === 'Centre (C)').length;
  const rCount = currentTeamRoster.filter(p => p.position === 'Rusher (R)').length;

  // 2. Assigner une note pénalisée ou bonifiée selon les besoins
  const getDynamicScore = (player) => {
    let score = parseFloat(player.globalScore);

    if (player.position === 'Quarterback (QB)') {
      if (qbCount > 0) score -= 6; // Pénalité extrême : n'a pas besoin de 2 QB
      else score += 2; // Bonus massif : très urgent
    }
    
    if (player.position === 'Centre (C)') {
      if (cCount > 0) score -= 3; // Pénalité : a déjà un centre
      else score += 0.5; // Bonus : besoin normal
    }

    if (player.position === 'Rusher (R)') {
      if (rCount > 0) score -= 3;
      else score += 0.5;
    }

    return score;
  };

  // 3. Appliquer la note dynamique et trier
  const dynamicAvailablePlayers = availablePlayers.map(p => ({
    ...p,
    dynamicScore: getDynamicScore(p),
    isUrgentNeed: getDynamicScore(p) > parseFloat(p.globalScore) // Si le score a été boosté
  })).sort((a, b) => {
    if (sortBy === 'ia') return b.dynamicScore - a.dynamicScore;
    if (sortBy === 'speed') return b.speed - a.speed;
    if (sortBy === 'hands') return b.hands - a.hands;
    if (sortBy === 'flag') return b.flag - a.flag;
    if (sortBy === 'iq') return b.iq - a.iq;
    if (sortBy === 'sportsmanship') return (b.sportsmanship || 5) - (a.sportsmanship || 5);
    return b.dynamicScore - a.dynamicScore;
  });

  const filteredAvailable = dynamicAvailablePlayers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Render Selector Modal
  if (showSelector) {
    return (
      <div className="animate-slide-up">
        <div className="flex-between mb-4">
          <button className="btn-secondary" onClick={() => setShowSelector(false)}>
            <ChevronLeft size={20} /> Retour
          </button>
          <span className="text-muted">Sélection pour <strong className="text-neon">{currentTeam.name}</strong></span>
        </div>

        <div className="search-bar mb-4" style={{display: 'flex', gap: '0.5rem', flexDirection: 'column'}}>
          <div style={{position: 'relative', width: '100%'}}>
            <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
            <input 
              type="text" 
              className="input-field" 
              style={{paddingLeft: '2.5rem', width: '100%'}}
              placeholder="Rechercher une joueuse..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'nowrap'}}>Trier :</span>
            <select 
              className="input-field" 
              style={{flex: 1, padding: '0.5rem', fontSize: '0.9rem'}}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="ia">✨ Reco IA (Besoins)</option>
              <option value="speed">⚡ Top Vitesse</option>
              <option value="hands">👐 Top Attrape</option>
              <option value="flag">🚩 Top Défalage</option>
              <option value="iq">🧠 Top QI Foot</option>
              <option value="sportsmanship">❤️ Top Esprit Sportif</option>
            </select>
          </div>
        </div>

        <div className="players-list">
          {filteredAvailable.length === 0 ? (
            <div className="text-center p-4 glass-card text-muted">
              Aucune joueuse disponible. Avez-vous ajouté des joueuses dans la section "Scouting" ?
            </div>
          ) : (
            filteredAvailable.map((player, index) => {
              const blokedAsRookie = player.isRookie && maxRookiesReached;
              
              return (
                <div key={player.id} className="player-card cursor-pointer" onClick={() => !blokedAsRookie && handleDraftPlayer(player.id)} style={{opacity: blokedAsRookie ? 0.5 : 1, filter: blokedAsRookie ? 'grayscale(100%)' : 'none', cursor: blokedAsRookie ? 'not-allowed' : 'pointer'}}>
                  <div style={{flex: 1}}>
                    <div className="flex items-center gap-2 mb-1" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      {index === 0 && search === '' && !blokedAsRookie && (
                        <span style={{fontSize: '0.7rem', background: player.isUrgentNeed ? '#ef4444' : 'var(--accent-neon)', color: player.isUrgentNeed ? '#fff' : '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
                          {player.isUrgentNeed ? '⚡ BESOIN URGENT' : 'RECOMMENDATION N°1'}
                        </span>
                      )}
                      {player.isRookie && (
                        <span style={{fontSize: '0.7rem', background: blokedAsRookie ? 'rgba(255, 255, 255, 0.2)' : 'rgba(34, 197, 94, 0.2)', padding: '2px 6px', borderRadius: '4px', color: blokedAsRookie ? '#bbb' : '#4ade80', display: 'flex', alignItems: 'center', gap: '2px', border: blokedAsRookie ? '1px solid #777' : '1px solid #4ade80'}}>
                          <Leaf size={10} /> RECRUE
                        </span>
                      )}
                      {blokedAsRookie && (
                        <span style={{fontSize: '0.7rem', background: '#ef4444', padding: '2px 6px', borderRadius: '4px', color:'white', display: 'flex', alignItems: 'center', gap: '2px'}}>
                          <Lock size={10} /> BLOQUÉE (LIMITE)
                        </span>
                      )}
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem'}}>
                      <span style={{fontWeight: 800, fontSize: '1.2rem'}}>{player.name}</span>
                      <span className={`score-badge ${player.globalScore >= 8.5 ? 'elite' : player.globalScore >= 7.0 ? 'high' : player.globalScore >= 5.5 ? 'med' : ''}`}>
                        ⭐ {player.globalScore}
                      </span>
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
                  
                  <button className="btn-icon" style={{color: blokedAsRookie ? '#777' : 'var(--accent-neon)', marginLeft: '0.5rem'}} disabled={blokedAsRookie}>
                    {blokedAsRookie ? <Lock size={24} /> : <UserPlus size={24} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Live Draft Board
  return (
    <div className="animate-slide-up">
      {/* ---------- ANALYST SIMULATION CONTROLS ---------- */}
      {isSimulationMode && (
        <div style={{background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem'}}>
          <h3 className="text-neon mb-2" style={{color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span>🧬</span> MODE SIMULATION ACTIF
          </h3>
          <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '1rem'}}>
            Vous êtes dans un bac-à-sable "Analyst Mock Draft". Rien ici n'affectera le vrai repêchage.
          </p>
          <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
            <button className="btn-primary" onClick={autoDraftPick} disabled={isDraftComplete} style={{flex: 1, minWidth: '120px', background: '#4ade80', color: 'black'}}>
              Auto-Pick (BPA)
            </button>
            <button className="btn-secondary" onClick={exitSimulationMode} style={{flex: 1, minWidth: '120px', borderColor: '#ef4444', color: '#ef4444'}}>
              Quitter
            </button>
          </div>
        </div>
      )}

      {!isSimulationMode && !isDraftComplete && (
         <div className="mb-4" style={{textAlign: currentPickIndex === 0 ? 'center' : 'right'}}>
            <button onClick={enterSimulationMode} style={{background: 'transparent', border: currentPickIndex === 0 ? '1px dashed #4ade80' : '1px dashed rgba(255,255,255,0.2)', padding: '0.5rem 1rem', color: currentPickIndex === 0 ? '#4ade80' : 'var(--text-muted)', fontSize: '0.8rem', borderRadius: '4px', width: currentPickIndex === 0 ? '100%' : 'auto'}}>
              🧬 {currentPickIndex === 0 ? 'Lancer une Simulation (Mock Draft)' : 'Simuler des scénarios'}
            </button>
         </div>
      )}
      {/* ------------------------------------------------ */}
      
      <div className="glass-card text-center mb-4 pulse-active" style={{border: '1px solid var(--accent-neon)', background: 'rgba(16, 185, 129, 0.05)'}}>
        <p className="text-muted font-bold text-sm" style={{textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem'}}>À qui le tour ?</p>
        <h2 className="title-glow" style={{fontSize: '3rem', marginBottom: '1rem', lineHeight: '1'}}>{currentTeam?.name}</h2>
        <p className="text-muted mb-4">Tour {currentPickIndex + 1} sur {MAX_PICKS}</p>
        
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
          <span style={{background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #4ade80'}}>
            <Leaf size={14} /> Recrues global: {rookiesDraftedCount} / {draftSettings.maxRookiesTotal}
          </span>
        </div>
        
        <button className="btn-primary" onClick={() => setShowSelector(true)}>
          <UserPlus size={24} />
          SELECTIONNER JOUEUSE
        </button>
      </div>

      {nextPicks.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm text-muted mb-2 uppercase" style={{fontSize: '0.8rem', letterSpacing: '1px'}}>Ordre à venir</h3>
          <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
            {nextPicks.map((team, idx) => (
              <div key={`${team.id}-${idx}`} className="glass-card" style={{padding: '0.75rem 1rem', minWidth: '120px', whiteSpace: 'nowrap'}}>
                <span className="text-muted" style={{fontSize: '0.7rem', display: 'block'}}>Choix {currentPickIndex + idx + 2}</span>
                <strong>{team.name}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {pickHistory.length > 0 && (
        <div className="glass-card">
          <div className="flex-between mb-4" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Historique des choix</h3>
            <button className="btn-secondary" onClick={undoLastPick} title="Annuler le dernier choix">
              <Undo2 size={16} />
            </button>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
             {[...pickHistory].reverse().slice(0, 5).map(pick => {
                const teamName = teams.find(t => t.id === pick.teamId)?.name || 'Anonyme';
                const playerInfo = players.find(p => p.id === pick.playerId);
                const grade = getPickGrade(pick.playerId, pick.pickNumber);
                
                return (
                  <div key={pick.pickNumber} className="player-card" style={{padding: '0.5rem 1rem'}}>
                    <div>
                      <div style={{fontSize: '0.75rem', color: 'var(--accent-neon)', fontWeight: 'bold'}}>CHOIX #{pick.pickNumber} • {teamName}</div>
                      <div style={{fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                        {playerInfo ? playerInfo.name : 'Joueuse retirée'}
                        
                        {/* Draft Grade Badge */}
                        {grade && grade.status !== 'NORMAL' && (
                          <span style={{
                            fontSize: '0.65rem', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            background: grade.status === 'STEAL' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: grade.status === 'STEAL' ? '#4ade80' : '#ef4444',
                            border: `1px solid ${grade.status === 'STEAL' ? '#4ade80' : '#ef4444'}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {grade.label} {grade.diff > 0 ? `(+${grade.diff})` : `(${grade.diff})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDraftView;
