import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { defaultPlayers } from '../data/defaultPlayers';

const DraftContext = createContext();

export const useDraft = () => useContext(DraftContext);


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

  const [draftSettings, setDraftSettings] = useState(() => loadState('draft_settings', {
    numTeams: 4,
    numRounds: 10,
    maxRookiesTotal: 5
  }));

  const [players, setPlayers] = useState(() => loadState('draft_players', defaultPlayers));
  const [pickHistory, setPickHistory] = useState(() => loadState('draft_history', []));

  // Analyst Simulation Mode State
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [savedRealState, setSavedRealState] = useState(null);

  // Calculate projected ranks based on globalScore
  // Only for players who are not captains and are available
  const [projectedRanks, setProjectedRanks] = useState({});

  useEffect(() => {
    // Computes ranks on players change if not in simulation mode
    if (!isSimulationMode) {
      const nonCaptains = players.filter(p => !p.isCaptain);
      const sorted = [...nonCaptains].sort((a, b) => parseFloat(b.globalScore) - parseFloat(a.globalScore));
      
      const ranks = {};
      sorted.forEach((p, index) => {
        ranks[p.id] = index + 1; // Rank starts at 1
      });
      setProjectedRanks(ranks);
    }
  }, [players, isSimulationMode]);

  // Save to localStorage whenever state changes (only if NOT in simulation mode)
  useEffect(() => {
    if(!isSimulationMode) localStorage.setItem('draft_teams', JSON.stringify(teams));
  }, [teams, isSimulationMode]);

  useEffect(() => {
    if(!isSimulationMode) localStorage.setItem('draft_players', JSON.stringify(players));
  }, [players, isSimulationMode]);

  useEffect(() => {
    if(!isSimulationMode) localStorage.setItem('draft_history', JSON.stringify(pickHistory));
  }, [pickHistory, isSimulationMode]);

  useEffect(() => {
    if(!isSimulationMode) localStorage.setItem('draft_settings', JSON.stringify(draftSettings));
  }, [draftSettings, isSimulationMode]);

  const generateSnakeDraft = (nTeams, nRounds) => {
    const sequence = [];
    if (nTeams <= 0 || nRounds <= 0) return sequence;
    for (let r = 0; r < nRounds; r++) {
      const roundSeq = [];
      for (let t = 0; t < nTeams; t++) {
        roundSeq.push(t);
      }
      // Les rondes impaires (index 1, 3, 5...) sont inversées
      if (r % 2 !== 0) {
        roundSeq.reverse();
      }
      sequence.push(...roundSeq);
    }
    return sequence;
  };

  const DRAFT_SEQUENCE = generateSnakeDraft(draftSettings.numTeams, draftSettings.numRounds);
  const MAX_PICKS = DRAFT_SEQUENCE.length;

  const currentPickIndex = pickHistory.length;
  const isDraftComplete = currentPickIndex >= MAX_PICKS;
  const currentTeamIndex = !isDraftComplete ? DRAFT_SEQUENCE[currentPickIndex] : null;
  const currentTeam = currentTeamIndex !== null ? teams[currentTeamIndex] : null;

  // Actions
  const updateDraftSettings = (newSettings) => {
    setDraftSettings(prev => ({ ...prev, ...newSettings }));
    
    // Ajuster le nombre d'équipes si on le change
    if (newSettings.numTeams && newSettings.numTeams !== teams.length) {
      const newTeams = [...teams];
      if (newSettings.numTeams > teams.length) {
        for (let i = teams.length; i < newSettings.numTeams; i++) {
          newTeams.push({ id: uuidv4(), name: `Équipe ${i + 1}` });
        }
      } else {
        newTeams.length = newSettings.numTeams; // Coupe le tableau
      }
      setTeams(newTeams);
    }
  };

  const updateTeamName = (index, newName) => {
    const newTeams = [...teams];
    newTeams[index].name = newName;
    setTeams(newTeams);
  };

  const addPlayer = (playerData) => {
    // Calcul score global = (Vitesse + Mains + Flag + QI + Esprit Sportif) / 5 (sur 10)
    const { speed, hands, flag, iq, sportsmanship } = playerData;
    // Si la stat n'existe pas dans les vielles données, on met 5 par défaut
    const sp = sportsmanship ? parseFloat(sportsmanship) : 5;
    const globalScore = (parseFloat(speed) + parseFloat(hands) + parseFloat(flag) + parseFloat(iq) + sp) / 5;
    
    setPlayers(prev => [...prev, {
      ...playerData,
      sportsmanship: sp,
      id: uuidv4(),
      globalScore: globalScore.toFixed(1),
      isDrafted: false
    }]);
  };

  const deletePlayer = (id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayer = (id, updatedData) => {
    const { speed, hands, flag, iq, sportsmanship } = updatedData;
    const sp = sportsmanship ? parseFloat(sportsmanship) : 5;
    const globalScore = (parseFloat(speed) + parseFloat(hands) + parseFloat(flag) + parseFloat(iq) + sp) / 5;
    
    setPlayers(prev => prev.map(p => p.id === id ? { 
      ...p, ...updatedData, 
      sportsmanship: sp,
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
      setPlayers(prev => prev.map(p => {
        if (p.isCaptain) {
          return { ...p, isDrafted: true, draftedBy: p.captainTeamId };
        }
        return { ...p, isDrafted: false, draftedBy: null };
      }));
    }
  };
  
  const assignCaptain = (teamId, slot, playerId) => {
    setPlayers(prev => prev.map(p => {
      let newP = { ...p };
      
      // Libérer l'ancienne capitaine de ce slot spécifique pour cette équipe
      if (newP.isCaptain && newP.captainTeamId === teamId && newP.captainSlot === slot) {
        newP.isCaptain = false;
        newP.captainTeamId = null;
        newP.captainSlot = null;
        newP.isDrafted = false;
        newP.draftedBy = null;
      }
      
      // Assigner la nouvelle capitaine si un ID est fourni
      if (playerId && newP.id === playerId) {
        newP.isCaptain = true;
        newP.captainTeamId = teamId;
        newP.captainSlot = slot;
        newP.isDrafted = true; // Empêche d'être repêchée dans le Live Draft
        newP.draftedBy = teamId; // L'assigne à l'équipe pour les Rosters
      }
      
      return newP;
    }));
  };
  
  const resetAll = () => {
     if (window.confirm("Tout supprimer (Joueuses incluses) ? Action irréversible.")) {
      setPickHistory([]);
      
      // On remet la lites des joueuses aux valeurs d'origine pour éviter le vide total
      const freshDefaults = defaultPlayers.map(p => ({...p, id: uuidv4()}));
      setPlayers(freshDefaults);
      
      setTeams([
        { id: uuidv4(), name: 'Bears' },
        { id: uuidv4(), name: 'Lions' },
        { id: uuidv4(), name: 'Tigers' },
        { id: uuidv4(), name: 'Wolves' }
      ]);
     }
  };

  const importData = (importedData) => {
    if (importedData.teams) setTeams(importedData.teams);
    if (importedData.players) setPlayers(importedData.players);
    if (importedData.pickHistory) setPickHistory(importedData.pickHistory);
    if (importedData.draftSettings) setDraftSettings(importedData.draftSettings);
  };

  // ---------------- SIMULATION ENGINE ---------------- //
  const enterSimulationMode = () => {
    setSavedRealState({
      pickHistory: [...pickHistory],
      players: JSON.parse(JSON.stringify(players))
    });
    setIsSimulationMode(true);
  };

  const exitSimulationMode = () => {
    if (savedRealState) {
      setPickHistory(savedRealState.pickHistory);
      setPlayers(savedRealState.players);
    }
    setIsSimulationMode(false);
    setSavedRealState(null);
  };

  const autoDraftPick = () => {
    if (isDraftComplete) return;

    // Calculer la limite de recrues pour respecter les règles dans la simulation
    const draftedRookiesCount = pickHistory.reduce((acc, pick) => {
        const p = players.find(player => player.id === pick.playerId);
        return p && p.isRookie ? acc + 1 : acc;
    }, 0);

    const isGlobalRookieLimitReached = draftedRookiesCount >= draftSettings.maxRookiesTotal;

    const currentAvailable = players.filter(p => !p.isDrafted);
    const validPlayers = isGlobalRookieLimitReached
      ? currentAvailable.filter(p => !p.isRookie)
      : currentAvailable;

    // BPA (Best Player Available)
    const sortedValidPlayers = validPlayers.sort((a, b) => b.globalScore - a.globalScore);

    if (sortedValidPlayers.length > 0) {
      const bpa = sortedValidPlayers[0];
      draftPlayer(bpa.id);
    }
  };

  const getPickGrade = (playerId, overallPickNumber) => {
    const projRank = projectedRanks[playerId];
    if (!projRank) return null;
    
    // Un nombre positif = Sélectionné plus tard que prévu (Steal)
    // Un nombre négatif = Sélectionné plus tôt que prévu (Reach)
    const diff = overallPickNumber - projRank;
    
    if (diff < -3) return { status: 'REACH', label: '🔴 REACH', diff };
    if (diff > 3) return { status: 'STEAL', label: '🟢 STEAL', diff };
    return { status: 'NORMAL', label: '⚪ PAIR', diff };
  };

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
    importData,
    assignCaptain,
    draftSettings,
    updateDraftSettings,
    DRAFT_SEQUENCE,
    MAX_PICKS,
    isSimulationMode,
    enterSimulationMode,
    exitSimulationMode,
    autoDraftPick,
    projectedRanks,
    getPickGrade
  };

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  );
};
