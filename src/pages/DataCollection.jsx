import { useNavigate } from 'react-router-dom';
import { selectedMatch, selectedPlayers, currentPlayer, currentActionType, isSuccessful } from '../data/signals';
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

  return (
    <div className="data-collection-container">
      <div className="data-collection-content">
        <h1 className="page-title">Data Collection</h1>
        <p className="match-info">Match: {selectedMatch.value || 'No match selected'}</p>

        <div className="data-collection-grid">
          {/* Player Selection - Left Column */}
          <div className="player-selection-section">
            <h3 className="section-title">Select Player</h3>
            <div className="player-list">
              {selectedPlayers.value.length === 0 ? (
                <p className="no-players-message">No players selected. Please return to home and select 16 players.</p>
              ) : (
                selectedPlayers.value.map((player, index) => (
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

        <button className="back-button" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default DataCollection;
