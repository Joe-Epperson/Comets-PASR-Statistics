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
  submitString,
  cometsSide,
  lastSuccessfulZoneEnded
} from '../../data/signals';
import './ShotAction.css';

function ShotAction() {
  const navigate = useNavigate();

  // Local state for form fields
  const [zoneTaken, setZoneTaken] = useState(lastSuccessfulZoneEnded.value);
  const [accuracy, setAccuracy] = useState('');
  const [result, setResult] = useState('');

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

  // Determine if we should include Previous Action Player
  const shouldIncludePreviousPlayer = () => {
    return previousActionType.value && previousActionSuccess.value;
  };

  // Check if form is valid
  const isFormValid = () => {
    return zoneTaken !== null && accuracy && result;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    const actionData = {
      "Match": selectedMatch.value,
      "Action Type": "Shot",
      "Successful": isSuccessful.value,
      "Player": currentPlayer.value,
      "Previous Action": getPreviousActionDisplay(),
      "Zone Taken": zoneTaken,
      "Accuracy": accuracy,
      "Result": result,
    };

    // Only add Previous Action Player if previous action was successful
    if (shouldIncludePreviousPlayer()) {
      actionData["Previous Action Player"] = previousActionPlayer.value;
    }

    console.log('Submitting Shot Action:', actionData);

    // POST to MongoDB via backend
    try {
      const response = await fetch('http://localhost:3001/api/shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      const resultData = await response.json();

      if (resultData.success) {
        console.log('✅ Shot action saved to MongoDB:', resultData.insertedId);

        // STRING TRACKING LOGIC
        // All shots (successful or unsuccessful) are added to the string and then submitted
        currentString.value = [...currentString.value, "Shot"];
        console.log('📊 String updated (added Shot):', currentString.value);

        // Determine Last Action based on result
        let lastAction;
        if (result === "Goal") {
          lastAction = "Goal";
        } else if (result === "Save") {
          lastAction = "Shot Saved";
        } else {
          lastAction = "Shot";
        }

        // All shots end the string
        await submitString(selectedMatch.value, lastAction);
        console.log(`📊 String submitted and reset (${lastAction})`);
      } else {
        console.error('❌ Error saving shot action:', resultData.error);
        alert('Failed to save shot action. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Could not connect to server. Make sure the backend is running on port 3001.');
      return;
    }

    // Update previous action signals
    previousActionType.value = 'Shot';
    previousActionSuccess.value = isSuccessful.value;
    previousActionPlayer.value = currentPlayer.value;

    // Update lastSuccessfulZoneEnded if shot was successful
    if (isSuccessful.value) {
      lastSuccessfulZoneEnded.value = zoneTaken;
    } else {
      lastSuccessfulZoneEnded.value = null;
    }

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
    <div className="shot-action-container">
      <div className="shot-action-content">
        <h1 className="action-title">Shot Action</h1>

        <div className="action-header-info">
          <span className="player-name">{currentPlayer.value}</span>
          <span className={`success-badge ${isSuccessful.value ? 'success' : 'fail'}`}>
            {isSuccessful.value ? 'Successful' : 'Unsuccessful'}
          </span>
        </div>

        {/* Previous Action Display */}
        <div className="previous-action-row">
          <h3>Previous Action:</h3>
          <div className="previous-action-display">
            {getPreviousActionDisplay()}
          </div>
        </div>

        {/* Previous Action Player Display - Only show if applicable */}
        {shouldIncludePreviousPlayer() && (
          <div className="previous-action-row">
            <h3>Previous Action Player:</h3>
            <div className="previous-action-display">
              {previousActionPlayer.value}
            </div>
          </div>
        )}

        <div className="form-main">
          {/* Left Column - Single Zone Taken Field */}
          <div className="zone-section">
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

          {/* Right Column - Options in 2-column grid */}
          <div className="options-column">
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

export default ShotAction;
