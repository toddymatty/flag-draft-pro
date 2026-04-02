import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DraftContext = createContext();

export const useDraft = () => useContext(DraftContext);

const DRAFT_SEQUENCE = [0, 1, 2, 3, 3, 2, 1, 0, 0, 1, 2, 3, 3, 2, 1, 0];
const MAX_PICKS = DRAFT_SEQUENCE.length;

export const DraftProvider = ({ children }) => {
  // Try loading from localStorage
  const loadState = (key, defaultVal) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [teams, setTeams] = useState(() => loadState('draft_teams', [
    { id: uuidv4(), name: 'Bears' },
    { id: uuidv4(), name: 'Lions' },
    { id: uuidv4(), name: 'Tigers' },
    { id: uuidv4(), name: 'Wolves' }
  ]));

  const [players, setPlayers] = useState(() => loadState('draft_players', []));
  const [pickHistory, setPickHistory] = useState(() => loadState('draft_history', []));

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('draft_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('draft_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('draft_history', JSON.stringify(pickHistory));
  }, [pickHistory]);

  const currentPickIndex = pickHistory.length;
  const isDraftComplete = currentPickIndex >= MAX_PICKS;
  const currentTeamIndex = !isDraftComplete ? DRAFT_SEQUENCE[currentPickIndex] : null;
  const currentTeam = currentTeamIndex !== null ? teams[currentTeamIndex] : null;

  // Actions
  const updateTeamName = (index, newName) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
    setTeams(newTeams);
  };

  const addPlayer = (playerData) => {
    // Calcul score global = (Vitesse + Mains + Flag + QI) / 4 (sur 10)
    const { speed, hands, flag, iq } = playerData;
    const globalScore = (parseFloat(speed) + parseFloat(hands) + parseFloat(flag) + parseFloat(iq)) / 4;
    
    setPlayers(prev => [...prev, {
      ...playerData,
      id: uuidv4(),
      globalScore: globalScore.toFixed(1),
      isDrafted: false
    }]);
  };

  const deletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayer = (id, updatedData) => {
    const { speed, hands, flag, iq } = updatedData;
    const globalScore = (parseFloat(speed) + parseFloat(hands) + parseFloat(flag) + parseFloat(iq)) / 4;
    
    setPlayers(prev => prev.map(p => p.id === id ? { 
      ...p, ...updatedData, 
      globalScore: globalScore.toFixed(1) 
    } : p));
  };

  const draftPlayer = (playerId) => {
    if (isDraftComplete) return;

    // Ajouter à l'historique
    setPickHistory(prev => [...prev, {
      pickNumber: prev.length + 1,
      teamId: currentTeam.id,
      playerId: playerId
    }]);

    // Marquer la joueuse comme draftée
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, isDrafted: true, draftedBy: currentTeam.id } : p
    ));
  };

  const undoLastPick = () => {
    if (pickHistory.length === 0) return;

    const lastPick = pickHistory[pickHistory.length - 1];
    
    // Remettre le joueur comme disponible
    setPlayers(prev => prev.map(p => 
      p.id === lastPick.playerId ? { ...p, isDrafted: false, draftedBy: null } : p
    ));

    // Supprimer le dernier choix
    setPickHistory(prev => prev.slice(0, -1));
  };

  const resetDraft = () => {
    if (window.confirm("Êtes-vous sûr de vouloir tout réinitialiser ? Cela gardera les joueuses mais effacera le statut du repêchage.")) {
      setPickHistory([]);
      setPlayers(prev => prev.map(p => ({ ...p, isDrafted: false, draftedBy: null })));
    }
  };
  
  const resetAll = () => {
     if (window.confirm("Tout supprimer (Joueuses incluses) ? Action irréversible.")) {
      setPickHistory([]);
      setPlayers([]);
      setTeams([
        { id: uuidv4(), name: 'Bears' },
        { id: uuidv4(), name: 'Lions' },
        { id: uuidv4(), name: 'Tigers' },
        { id: uuidv4(), name: 'Wolves' }
      ]);
     }
  }

  // Derived state
  const availablePlayers = players.filter(p => !p.isDrafted).sort((a, b) => b.globalScore - a.globalScore);

  const value = {
    teams,
    players,
    availablePlayers,
    pickHistory,
    currentPickIndex,
    isDraftComplete,
    currentTeam,
    updateTeamName,
    addPlayer,
    deletePlayer,
    updatePlayer,
    draftPlayer,
    undoLastPick,
    resetDraft,
    resetAll,
    DRAFT_SEQUENCE,
    MAX_PICKS
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
};
