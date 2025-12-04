import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectedMatch,
  selectedPlayers,
  isSuccessful,
  currentActionType,
  cometsSide
} from '../../data/signals';
import './SetPieceAction.css';

function SetPieceAction() {
  const navigate = useNavigate();

  // Local state for form fields
  const [setPieceType, setSetPieceType] = useState('');
  const [playerOnBall, setPlayerOnBall] = useState('');
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [shotTaken, setShotTaken] = useState('');
  const [zoneTaken, setZoneTaken] = useState(null);
  const [accuracy, setAccuracy] = useState('');
  const [result, setResult] = useState('');
  const [passesToResult, setPassesToResult] = useState('');

  // Available players - all 16 from selectedPlayers signal
  const availablePlayers = selectedPlayers.value;

  // Filter out already selected players for "Other Players"
  const getAvailableOtherPlayers = () => {
    return availablePlayers.filter(p => p !== playerOnBall);
  };

  // Handle Other Players selection (3-5 players required)
  const handleOtherPlayerToggle = (player) => {
    if (otherPlayers.includes(player)) {
      setOtherPlayers(otherPlayers.filter(p => p !== player));
    } else if (otherPlayers.length < 5) {
      setOtherPlayers([...otherPlayers, player]);
    }
  };

  // Validate Other Players count (3-5)
  const isOtherPlayersValid = () => {
    return otherPlayers.length >= 3 && otherPlayers.length <= 5;
  };

  // Calculate success based on Shot Taken and Accuracy
  const calculateSuccess = () => {
    // Set Piece is successful if Shot Taken = "Yes" AND Accuracy = "On"
    return shotTaken === 'Yes' && accuracy === 'On';
  };

  // Check if form is valid
  const isFormValid = () => {
    const baseValid =
      setPieceType &&
      playerOnBall &&
      isOtherPlayersValid() &&
      shotTaken &&
      passesToResult !== '';

    // If shot was taken, additional fields required
    if (shotTaken === 'Yes') {
      return baseValid && zoneTaken !== null && accuracy && result;
    }

    return baseValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    // Calculate success based on Shot Taken and Accuracy
    const isSuccessfulSetPiece = calculateSuccess();

    const actionData = {
      "Match": selectedMatch.value,
      "Action Type": "Set Piece",
      "Successful": isSuccessfulSetPiece,
      "Set Piece Type": setPieceType,
      "Player on Ball": playerOnBall,
      "Other Players": otherPlayers, // Array of 3-5 players
      "Shot Taken": shotTaken,
      "Passes to Result": parseInt(passesToResult, 10),
    };

    // Only add shot-related fields if shot was taken
    if (shotTaken === 'Yes') {
      actionData["Zone Taken"] = zoneTaken;
      actionData["Accuracy"] = accuracy;
      actionData["Result"] = result;
    }

    console.log('Submitting Set Piece Action:', actionData);

    // POST to MongoDB via backend
    try {
      const response = await fetch('http://localhost:3001/api/setpieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      const resultData = await response.json();

      if (resultData.success) {
        console.log('✅ Set Piece action saved to MongoDB:', resultData.insertedId);
      } else {
        console.error('❌ Error saving set piece action:', resultData.error);
        alert('Failed to save set piece action. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Could not connect to server. Make sure the backend is running on port 3001.');
      return;
    }

    // Clear current action signals (NO previous action tracking for Set Pieces)
    currentActionType.value = '';
    isSuccessful.value = false;

    // Navigate back to data collection
    navigate('/data-collection');
  };

  const handleCancel = () => {
    navigate('/data-collection');
  };

  // Calculate success for display
  const displaySuccess = calculateSuccess();

  return (
    <div className="setpiece-action-container">
      <div className="setpiece-action-content">
        <h1 className="action-title">Set Piece Action</h1>

        <div className="action-header-info">
          <span className={`success-badge ${displaySuccess ? 'success' : 'fail'}`}>
            {displaySuccess ? 'Successful' : 'Unsuccessful'}
          </span>
        </div>

        {/* Scrollable Form Content */}
        <div className="form-scrollable">
          {/* Set Piece Type Section */}
          <div className="form-section">
            <h3>Set Piece Type</h3>
            <div className="button-group">
              <button
                className={`option-button ${setPieceType === 'TOTB' ? 'active' : ''}`}
                onClick={() => setSetPieceType('TOTB')}
              >
                TOTB
              </button>
              <button
                className={`option-button ${setPieceType === '3 Lines Restart' ? 'active' : ''}`}
                onClick={() => setSetPieceType('3 Lines Restart')}
              >
                3 Lines Restart
              </button>
              <button
                className={`option-button ${setPieceType === 'Corner Right' ? 'active' : ''}`}
                onClick={() => setSetPieceType('Corner Right')}
              >
                Corner Right
              </button>
              <button
                className={`option-button ${setPieceType === 'Corner Left' ? 'active' : ''}`}
                onClick={() => setSetPieceType('Corner Left')}
              >
                Corner Left
              </button>
              <button
                className={`option-button ${setPieceType === 'Shootout' ? 'active' : ''}`}
                onClick={() => setSetPieceType('Shootout')}
              >
                Shootout
              </button>
              <button
                className={`option-button ${setPieceType === 'Penalty' ? 'active' : ''}`}
                onClick={() => setSetPieceType('Penalty')}
              >
                Penalty
              </button>
            </div>
          </div>

          {/* Player on Ball Section */}
          <div className="form-section">
            <h3>Player on Ball</h3>
            <select
              className="player-dropdown"
              value={playerOnBall}
              onChange={(e) => setPlayerOnBall(e.target.value)}
            >
              <option value="">Select player...</option>
              {availablePlayers.map((player, index) => (
                <option key={index} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>

          {/* Other Players Section */}
          <div className="form-section">
            <h3>Other Players (Select 3-5)</h3>
            <div className="player-count">
              Selected: {otherPlayers.length}/5 {!isOtherPlayersValid() && '(minimum 3)'}
            </div>
            <div className="checkbox-grid">
              {getAvailableOtherPlayers().map((player, index) => {
                const isSelected = otherPlayers.includes(player);
                const isDisabled = !isSelected && otherPlayers.length >= 5;

                return (
                  <label
                    key={index}
                    className={`checkbox-label ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleOtherPlayerToggle(player)}
                      disabled={isDisabled}
                    />
                    <span className="checkbox-player-name">{player}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Shot Taken Section */}
          <div className="form-section">
            <h3>Shot Taken</h3>
            <div className="button-group">
              <button
                className={`option-button ${shotTaken === 'Yes' ? 'active' : ''}`}
                onClick={() => setShotTaken('Yes')}
              >
                Yes
              </button>
              <button
                className={`option-button ${shotTaken === 'No' ? 'active' : ''}`}
                onClick={() => setShotTaken('No')}
              >
                No
              </button>
            </div>
          </div>

          {/* Conditional Fields - Only show if Shot Taken = Yes */}
          {shotTaken === 'Yes' && (
            <>
              {/* Zone Taken Section */}
              <div className="form-section">
                <h3>Zone Taken</h3>
                <div className={`field-container ${cometsSide.value === 'right' ? 'field-rotated' : ''}`}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((zone) => (
                    <button
                      key={zone}
                      className={`zone-button zone-${zone} ${zoneTaken === zone ? 'active' : ''}`}
                      onClick={() => setZoneTaken(zone)}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accuracy Section */}
              <div className="form-section">
                <h3>Accuracy</h3>
                <div className="button-group">
                  <button
                    className={`option-button ${accuracy === 'On' ? 'active' : ''}`}
                    onClick={() => setAccuracy('On')}
                  >
                    On
                  </button>
                  <button
                    className={`option-button ${accuracy === 'Off' ? 'active' : ''}`}
                    onClick={() => setAccuracy('Off')}
                  >
                    Off
                  </button>
                  <button
                    className={`option-button ${accuracy === 'Block' ? 'active' : ''}`}
                    onClick={() => setAccuracy('Block')}
                  >
                    Block
                  </button>
                </div>
              </div>

              {/* Result Section */}
              <div className="form-section">
                <h3>Result</h3>
                <div className="button-group">
                  <button
                    className={`option-button ${result === 'Goal' ? 'active' : ''}`}
                    onClick={() => setResult('Goal')}
                  >
                    Goal
                  </button>
                  <button
                    className={`option-button ${result === 'Save' ? 'active' : ''}`}
                    onClick={() => setResult('Save')}
                  >
                    Save
                  </button>
                  <button
                    className={`option-button ${result === 'Boards Ball Kept' ? 'active' : ''}`}
                    onClick={() => setResult('Boards Ball Kept')}
                  >
                    Boards Ball Kept
                  </button>
                  <button
                    className={`option-button ${result === 'Boards Ball Lost' ? 'active' : ''}`}
                    onClick={() => setResult('Boards Ball Lost')}
                  >
                    Boards Ball Lost
                  </button>
                  <button
                    className={`option-button ${result === 'Out of Bounds' ? 'active' : ''}`}
                    onClick={() => setResult('Out of Bounds')}
                  >
                    Out of Bounds
                  </button>
                  <button
                    className={`option-button ${result === 'Block Ball Kept' ? 'active' : ''}`}
                    onClick={() => setResult('Block Ball Kept')}
                  >
                    Block Ball Kept
                  </button>
                  <button
                    className={`option-button ${result === 'Block Ball Lost' ? 'active' : ''}`}
                    onClick={() => setResult('Block Ball Lost')}
                  >
                    Block Ball Lost
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Passes to Result Section */}
          <div className="form-section">
            <h3>Passes to Result</h3>
            <div className="button-group">
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  className={`option-button number-button ${passesToResult === num.toString() ? 'active' : ''}`}
                  onClick={() => setPassesToResult(num.toString())}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Submit Action
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetPieceAction;
