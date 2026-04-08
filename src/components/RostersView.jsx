import React from 'react';
import { useDraft } from '../context/DraftContext';
import { Users, Shield, Leaf } from 'lucide-react';

const RostersView = () => {
  const { teams, players } = useDraft();

  return (
    <div className="animate-slide-up">
      <h2 className="text-2xl mb-4 text-neon">Alignements 🏈</h2>
      
      <div className="grid gap-4" style={{display: 'grid', gap: '1rem'}}>
        {teams.map(team => {
          const teamPlayers = players.filter(p => p.draftedBy === team.id);
          const averageScore = teamPlayers.length > 0 
            ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.globalScore), 0) / teamPlayers.length).toFixed(1)
            : 0;

          return (
            <div key={team.id} className="glass-card">
              <div className="flex-between mb-2 pb-2" style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                <h3 className="flex items-center gap-2" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Shield size={20} className="text-neon" />
                  {team.name}
                </h3>
                <div className="text-muted" style={{fontSize: '0.8rem', textAlign: 'right'}}>
                  <div>Note: <strong className="text-neon">{averageScore}</strong></div>
                  <div style={{color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '2px'}}>
                    <Leaf size={12} /> {teamPlayers.filter(p => p.isRookie).length} recrue(s)
                  </div>
                </div>
              </div>

              {teamPlayers.length === 0 ? (
                <div className="text-center text-muted p-2" style={{fontSize: '0.8rem'}}>
                  Aucune joueuse réclamée.
                </div>
              ) : (
                <>
                  <ul style={{listStyle: 'none', padding: 0, marginBottom: '1rem'}}>
                    {teamPlayers.map((player, idx) => (
                      <li key={player.id} style={{fontSize: '0.9rem', padding: '0.5rem 0', borderBottom: idx !== teamPlayers.length - 1 ? '1px dashed rgba(255,255,255,0.05)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <span><strong>{idx + 1}.</strong> {player.name}</span>
                          {player.isRookie && <Leaf size={14} color="#4ade80" title="Recrue" />}
                        </div>
                        <span className="text-muted" style={{fontSize: '0.8rem'}}>{player.position}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div style={{background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '1px'}}>Moyenne de l'équipe</div>
                    <div className="stats-grid">
                      <div className="stat-item">VIT <span>{teamPlayers.length > 0 ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.speed), 0) / teamPlayers.length).toFixed(1) : 0}</span></div>
                      <div className="stat-item">ATT <span>{teamPlayers.length > 0 ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.hands), 0) / teamPlayers.length).toFixed(1) : 0}</span></div>
                      <div className="stat-item">FLG <span>{teamPlayers.length > 0 ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.flag), 0) / teamPlayers.length).toFixed(1) : 0}</span></div>
                      <div className="stat-item">QI <span>{teamPlayers.length > 0 ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.iq), 0) / teamPlayers.length).toFixed(1) : 0}</span></div>
                      <div className="stat-item">ESP <span>{teamPlayers.length > 0 ? (teamPlayers.reduce((acc, p) => acc + parseFloat(p.sportsmanship || 5), 0) / teamPlayers.length).toFixed(1) : 0}</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RostersView;
