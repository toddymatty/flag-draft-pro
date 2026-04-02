import React, { useState } from 'react';
import { Settings, Users, Play, List } from 'lucide-react';
import SetupView from './components/SetupView';
import ScoutingView from './components/ScoutingView';
import LiveDraftView from './components/LiveDraftView';
import RostersView from './components/RostersView';

function App() {
  const [currentView, setCurrentView] = useState('draft'); // 'setup', 'scouting', 'draft', 'rosters'

  const renderView = () => {
    switch (currentView) {
      case 'setup': return <SetupView />;
      case 'scouting': return <ScoutingView />;
      case 'draft': return <LiveDraftView />;
      case 'rosters': return <RostersView />;
      default: return <LiveDraftView />;
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1 className="title-glow">FLAG DRAFT PRO</h1>
      </header>

      <main>
        {renderView()}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentView === 'setup' ? 'active' : ''}`}
          onClick={() => setCurrentView('setup')}
        >
          <Settings size={24} />
          <span>Setup</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'scouting' ? 'active' : ''}`}
          onClick={() => setCurrentView('scouting')}
        >
          <Users size={24} />
          <span>Scouting</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'draft' ? 'active' : ''}`}
          onClick={() => setCurrentView('draft')}
        >
          <Play size={24} />
          <span>Live Draft</span>
        </button>

        <button 
          className={`nav-item ${currentView === 'rosters' ? 'active' : ''}`}
          onClick={() => setCurrentView('rosters')}
        >
          <List size={24} />
          <span>Alignements</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
