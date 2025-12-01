import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectedMatch,
  currentPlayer,
  currentActionType,
  isSuccessful,
  previousActionType,
  previousActionSuccess,
  previousActionPlayer,
  currentString,
  submitString
} from '../../data/signals';
import './DribbleAction.css';

function DribbleAction() {
  const navigate = useNavigate();

  // Local state for form fields
  const [zoneStarted, setZoneStarted] = useState(null);
  const [zoneEnded, setZoneEnded] = useState(null);
  const [direction, setDirection] = useState('');
  const [beatPlayer, setBeatPlayer] = useState('');

  // Calculate previous action display
  const getPreviousActionDisplay = () => {
    if (!previousActionType.value) {
      return 'Beginning of Play';
    }
    if (previousActionSuccess.value) {
      return previousActionType.value;
    }
    return 'Ball Won';
  };

  // Check if form is valid
  const isFormValid = () => {
    return zoneStarted !== null && zoneEnded !== null && direction && beatPlayer;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    const actionData = {
      "Match": selectedMatch.value,
      "Action Type": "Dribble",
      "Successful": isSuccessful.value,
      "Player": currentPlayer.value,
      "Previous Action": getPreviousActionDisplay(),
      "Zone Started": zoneStarted,
      "Zone Ended": zoneEnded,
      "Direction": direction,
      "Beat Player": beatPlayer,
    };

    console.log('Submitting Dribble Action:', actionData);

    // POST to MongoDB via backend
    try {
      const response = await fetch('http://localhost:3001/api/dribbles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Dribble action saved to MongoDB:', result.insertedId);

        // STRING TRACKING LOGIC
        if (isSuccessful.value) {
          // Successful dribble - add to current string
          currentString.value = [...currentString.value, "Dribble"];
          console.log('📊 String updated (added Dribble):', currentString.value);
        } else {
          // Unsuccessful dribble - submit current string and reset
          await submitString(selectedMatch.value, "Dribble");
          console.log('📊 String submitted and reset (unsuccessful Dribble)');
        }
      } else {
        console.error('❌ Error saving dribble action:', result.error);
        alert('Failed to save dribble action. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Could not connect to server. Make sure the backend is running on port 3001.');
      return;
    }

    // Update previous action signals
    previousActionType.value = 'Dribble';
    previousActionSuccess.value = isSuccessful.value;
    previousActionPlayer.value = currentPlayer.value;

    // Clear current action signals
    currentPlayer.value = '';
    currentActionType.value = '';
    isSuccessful.value = false;

    // Navigate back to data collection
    navigate('/data-collection');
  };

  const handleCancel = () => {
    navigate('/data-collection');
  };

  return (
    <div className="dribble-action-container">
      <div className="dribble-action-content">
        <h1 className="action-title">Dribble Action</h1>
        <div className="action-header-info">
          <span className="player-name">Player: {currentPlayer.value}</span>
          <span className={`success-badge ${isSuccessful.value ? 'success' : 'fail'}`}>
            {isSuccessful.value ? 'Successful' : 'Unsuccessful'}
          </span>
        </div>

        {/* Previous Action Display */}
        <div className="previous-action-row">
          <h3>Previous Action:</h3>
          <div className="previous-action-display">{getPreviousActionDisplay()}</div>
        </div>

        <div className="form-main">
          {/* Left Column: Zones */}
          <div className="zones-column">
            <div className="zone-section">
              <h3>Zone Started</h3>
              <div className="field-container">
                {[...Array(14)].map((_, index) => (
                  <button
                    key={index}
                    className={`zone-button zone-${index + 1} ${zoneStarted === index + 1 ? 'active' : ''}`}
                    onClick={() => setZoneStarted(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="zone-section">
              <h3>Zone Ended</h3>
              <div className="field-container">
                {[...Array(14)].map((_, index) => (
                  <button
                    key={index}
                    className={`zone-button zone-${index + 1} ${zoneEnded === index + 1 ? 'active' : ''}`}
                    onClick={() => setZoneEnded(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: All Options */}
          <div className="options-column">
            {/* Direction */}
            <div className="form-section">
              <h3>Direction</h3>
              <div className="button-group">
                {['Forward', 'Sideways', 'Backward'].map((dir) => (
                  <button
                    key={dir}
                    className={`option-button ${direction === dir ? 'active' : ''}`}
                    onClick={() => setDirection(dir)}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* Beat Player */}
            <div className="form-section">
              <h3>Beat Player</h3>
              <div className="button-group">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    className={`option-button ${beatPlayer === option ? 'active' : ''}`}
                    onClick={() => setBeatPlayer(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
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

export default DribbleAction;
