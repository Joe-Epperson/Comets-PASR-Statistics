import { useNavigate } from 'react-router-dom';
import { selectedMatch, selectedPlayers, currentPlayer, currentActionType, isSuccessful, currentString, submitString, cometsSide } from '../data/signals';
import './DataCollection.css';

function DataCollection() {
  const navigate = useNavigate();

  const handlePlayerSelect = (player) => {
    currentPlayer.value = player;
  };

  const handleActionClick = (actionType, successful) => {
    if (!currentPlayer.value) return;

    currentActionType.value = actionType;
    isSuccessful.value = successful;

    // Navigate to action-specific detail page
    const actionRoute = actionType.toLowerCase().replace(' ', '');
    navigate(`/action/${actionRoute}`);
  };

  const handleSetPieceClick = () => {
    currentActionType.value = 'SetPiece';
    navigate('/action/setpiece');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handlePlayEnded = async () => {
    // Submit current string before ending play
    await submitString(selectedMatch.value);
    console.log('📊 Play ended - string submitted and reset');

    // Show confirmation message
    if (currentString.value.length > 0 || selectedMatch.value) {
      alert('Play ended. String data has been saved.');
    } else {
      alert('Play ended. No string to save.');
    }
  };

  const handleFoul = async () => {
    // Submit current string with Foul as last action
    await submitString(selectedMatch.value, "Foul");
    console.log('📊 Foul - string submitted and reset');

    // Show confirmation message
    if (currentString.value.length > 0 || selectedMatch.value) {
      alert('Foul recorded. String data has been saved.');
    } else {
      alert('Foul recorded. No string to save.');
    }
  };

  // Sort players by jersey number
  const getSortedPlayers = () => {
    return [...selectedPlayers.value].sort((a, b) => {
      // Extract the number from "number - name" format
      const numA = parseInt(a.split(' - ')[0]);
      const numB = parseInt(b.split(' - ')[0]);
      return numA - numB;
    });
  };

  return (
    <div className="data-collection-container">
      <div className="data-collection-content">
        <div className="header-section">
          <button className="back-button-header" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1 className="page-title">Data Collection</h1>
            <p className="match-info">Match: {selectedMatch.value || 'No match selected'}</p>
          </div>
          <div className="header-buttons">
            <div className="comets-side-toggle">
              <label className="toggle-label">Comets Defending:</label>
              <div className="toggle-buttons">
                <button
                  className={`toggle-button ${cometsSide.value === 'left' ? 'active' : ''}`}
                  onClick={() => cometsSide.value = 'left'}
                >
                  Left
                </button>
                <button
                  className={`toggle-button ${cometsSide.value === 'right' ? 'active' : ''}`}
                  onClick={() => cometsSide.value = 'right'}
                >
                  Right
                </button>
              </div>
            </div>
            <button className="foul-button" onClick={handleFoul}>
              Foul
            </button>
            <button className="play-ended-button" onClick={handlePlayEnded}>
              Play Ended
            </button>
          </div>
        </div>

        <div className="data-collection-grid">
          {/* Player Selection - Left Column */}
          <div className="player-selection-section">
            <h3 className="section-title">Select Player</h3>
            <div className="player-list">
              {selectedPlayers.value.length === 0 ? (
                <p className="no-players-message">No players selected. Please return to home and select 16 players.</p>
              ) : (
                getSortedPlayers().map((player, index) => (
                  <button
                    key={index}
                    className={`player-button ${currentPlayer.value === player ? 'active' : ''}`}
                    onClick={() => handlePlayerSelect(player)}
                  >
                    {player}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons - Right Column */}
          <div className="action-buttons-section">
            <h3 className="section-title">Select Action</h3>

            {!currentPlayer.value && (
              <p className="instruction-message">Please select a player first</p>
            )}

            {/* 2x3 Action Button Grid */}
            <div className="action-grid">
              {/* Top Row - Successful Actions (+) */}
              <button
                className="action-button pass-success"
                onClick={() => handleActionClick('Pass', true)}
                disabled={!currentPlayer.value}
              >
                Pass +
              </button>
              <button
                className="action-button shot-success"
                onClick={() => handleActionClick('Shot', true)}
                disabled={!currentPlayer.value}
              >
                Shot +
              </button>
              <button
                className="action-button dribble-success"
                onClick={() => handleActionClick('Dribble', true)}
                disabled={!currentPlayer.value}
              >
                Dribble +
              </button>

              {/* Bottom Row - Unsuccessful Actions (-) */}
              <button
                className="action-button pass-fail"
                onClick={() => handleActionClick('Pass', false)}
                disabled={!currentPlayer.value}
              >
                Pass -
              </button>
              <button
                className="action-button shot-fail"
                onClick={() => handleActionClick('Shot', false)}
                disabled={!currentPlayer.value}
              >
                Shot -
              </button>
              <button
                className="action-button dribble-fail"
                onClick={() => handleActionClick('Dribble', false)}
                disabled={!currentPlayer.value}
              >
                Dribble -
              </button>
            </div>

            {/* Set Piece Button */}
            <button
              className="set-piece-button"
              onClick={handleSetPieceClick}
            >
              Set Piece
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataCollection;
