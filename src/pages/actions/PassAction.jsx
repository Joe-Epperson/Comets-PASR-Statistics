import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectedMatch,
  currentPlayer,
  currentActionType,
  isSuccessful,
  previousActionType,
  previousActionSuccess,
  previousActionPlayer
} from '../../data/signals';
import './PassAction.css';

function PassAction() {
  const navigate = useNavigate();

  // Local state for form fields
  const [zoneStarted, setZoneStarted] = useState(null);
  const [zoneEnded, setZoneEnded] = useState(null);
  const [direction, setDirection] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [resultIfBad, setResultIfBad] = useState('');

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

  // Check if Result if Bad should be shown
  const showResultIfBad = accuracy === 'Clearance' || accuracy === 'Out of Bounds';

  // Check if form is valid
  const isFormValid = () => {
    const baseValid = zoneStarted !== null && zoneEnded !== null && direction && accuracy;
    if (showResultIfBad) {
      return baseValid && resultIfBad;
    }
    return baseValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    const actionData = {
      "Match": selectedMatch.value,
      "Action Type": "Pass",
      "Successful": isSuccessful.value,
      "Player": currentPlayer.value,
      "Previous Action": getPreviousActionDisplay(),
      "Zone Started": zoneStarted,
      "Zone Ended": zoneEnded,
      "Direction": direction,
      "Accuracy": accuracy,
    };

    // Only add Result if Bad if applicable
    if (showResultIfBad) {
      actionData["Result if Bad"] = resultIfBad;
    }

    console.log('Submitting Pass Action:', actionData);

    // POST to MongoDB via backend
    try {
      const response = await fetch('http://localhost:3001/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Pass action saved to MongoDB:', result.insertedId);
      } else {
        console.error('❌ Error saving pass action:', result.error);
        alert('Failed to save pass action. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Could not connect to server. Make sure the backend is running on port 3001.');
      return;
    }

    // Update previous action signals
    previousActionType.value = 'Pass';
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
    <div className="pass-action-container">
      <div className="pass-action-content">
        <h1 className="action-title">Pass Action</h1>
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

            {/* Accuracy */}
            <div className="form-section">
              <h3>Accuracy</h3>
              <div className="button-group">
                {['Complete', 'Incomplete', 'Intercepted', 'Clearance', 'Out of Bounds'].map((acc) => (
                  <button
                    key={acc}
                    className={`option-button ${accuracy === acc ? 'active' : ''}`}
                    onClick={() => {
                      setAccuracy(acc);
                      // Clear Result if Bad if accuracy changes to non-applicable value
                      if (acc !== 'Clearance' && acc !== 'Out of Bounds') {
                        setResultIfBad('');
                      }
                    }}
                  >
                    {acc}
                  </button>
                ))}
              </div>
            </div>

            {/* Result if Bad (Conditional) */}
            {showResultIfBad && (
              <div className="form-section">
                <h3>Result if Bad</h3>
                <div className="button-group">
                  {['Top of the Box', '3 Lines Restart', 'Side Kick In'].map((result) => (
                    <button
                      key={result}
                      className={`option-button ${resultIfBad === result ? 'active' : ''}`}
                      onClick={() => setResultIfBad(result)}
                    >
                      {result}
                    </button>
                  ))}
                </div>
              </div>
            )}
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

export default PassAction;
