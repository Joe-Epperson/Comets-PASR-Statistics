import { useNavigate } from 'react-router-dom';
import { selectedMatch, selectedPlayers } from '../data/signals';
import { matches } from '../data/matches';
import { players } from '../data/players';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const handleMatchChange = (e) => {
    selectedMatch.value = e.target.value;
  };

  const handlePlayerToggle = (player) => {
    console.log('Toggling player:', player);
    const currentPlayers = selectedPlayers.value;
    const isSelected = currentPlayers.includes(player);

    if (isSelected) {
      // Remove player
      selectedPlayers.value = currentPlayers.filter(p => p !== player);
      console.log('Removed player, new list:', selectedPlayers.value);
    } else {
      // Add player only if less than 16 selected
      if (currentPlayers.length < 16) {
        selectedPlayers.value = [...currentPlayers, player];
        console.log('Added player, new list:', selectedPlayers.value);
      }
    }
  };

  const handleClearAll = () => {
    selectedPlayers.value = [];
  };

  const isStartMatchEnabled = () => {
    return selectedMatch.value && selectedPlayers.value.length === 16;
  };

  const handleStartMatch = () => {
    if (isStartMatchEnabled()) {
      navigate('/data-collection');
    }
  };

  const handleAnalyzeData = () => {
    navigate('/analyze-data');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="app-title">KC Comets</h1>
        <h2 className="app-subtitle">Statistics Tracker</h2>

        <div className="home-grid">
          {/* Player Selection Section */}
          <div className="player-selection-section">
            <div className="section-header">
              <h3 className="section-title">Select Players</h3>
              <button
                className="clear-button"
                onClick={handleClearAll}
                disabled={selectedPlayers.value.length === 0}
              >
                Clear All
              </button>
            </div>

            <div className="player-counter">
              <span className={selectedPlayers.value.length === 16 ? 'complete' : ''}>
                Selected: {selectedPlayers.value.length}/16
              </span>
            </div>

            <div className="player-list">
              {players.map((player, index) => (
                <label
                  key={index}
                  className={`player-checkbox-label ${
                    selectedPlayers.value.length >= 16 && !selectedPlayers.value.includes(player) ? 'disabled' : ''
                  } ${
                    selectedPlayers.value.includes(player) ? 'selected' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlayers.value.includes(player)}
                    onChange={() => handlePlayerToggle(player)}
                    disabled={selectedPlayers.value.length >= 16 && !selectedPlayers.value.includes(player)}
                    className="player-checkbox"
                  />
                  <span className="player-name">{player}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Match Selection Section */}
          <div className="match-selection-section">
            <div className="match-selector-box">
              <h3 className="section-title">Select Match</h3>

              <select
                id="match-select"
                className="match-dropdown"
                value={selectedMatch}
                onChange={handleMatchChange}
              >
                <option value="">-- Select a Match --</option>
                {matches.map((match, index) => (
                  <option key={index} value={match}>
                    {match}
                  </option>
                ))}
              </select>

              {!isStartMatchEnabled() && (
                <div className="validation-message">
                  {!selectedMatch.value && <p>Please select a match</p>}
                  {selectedPlayers.value.length !== 16 && (
                    <p>Please select exactly 16 players ({selectedPlayers.value.length}/16)</p>
                  )}
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                className="primary-button"
                onClick={handleStartMatch}
                disabled={!isStartMatchEnabled()}
              >
                Start Match
              </button>

              <button
                className="secondary-button"
                onClick={handleAnalyzeData}
              >
                Analyze Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
